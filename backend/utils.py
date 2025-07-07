import os
import re
import pandas as pd
import numpy as np
from werkzeug.security import generate_password_hash, check_password_hash
from filelock import FileLock
import logging
import string

# Initialize logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Absolute path for user database
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_FILE = os.path.join(BASE_DIR, 'users.csv')
LOCK_FILE = CSV_FILE + '.lock'

# Strict email regex
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

def is_valid_email(email: str) -> bool:
    """Validate email format using strict regex."""
    return bool(EMAIL_REGEX.fullmatch(email.strip()))

def is_strong_password(password: str) -> bool:
    """Check for password length and complexity."""
    return (
        len(password) >= 8 and
        any(c.islower() for c in password) and
        any(c.isupper() for c in password) and
        any(c.isdigit() for c in password) and
        any(c in string.punctuation for c in password)
    )

def mask_email(email: str) -> str:
    """Mask part of the email for secure logging."""
    return re.sub(r'(?<=.).(?=[^@]*?@)', '*', email)

def load_users():
    """Safely load users from CSV with comprehensive error handling."""
    required_columns = ['name', 'email', 'password', 'is_logged_in']
    try:
        if not os.path.exists(CSV_FILE):
            return pd.DataFrame(columns=required_columns)
        
        with FileLock(LOCK_FILE):
            df = pd.read_csv(
                CSV_FILE,
                dtype={'name': str, 'email': str, 'password': str, 'is_logged_in': bool},
                on_bad_lines='skip'
            )

        # Validate structure
        for col in required_columns:
            if col not in df.columns:
                df[col] = np.nan

        # Clean data
        df = df.dropna(subset=['email']).drop_duplicates('email', keep='last')
        df['is_logged_in'] = df['is_logged_in'].fillna(False).astype(bool)

        return df

    except Exception as e:
        logger.error(f"Error loading users: {str(e)}")
        return pd.DataFrame(columns=required_columns)

def save_users(df):
    """Atomic save operation with backup and lock."""
    try:
        os.makedirs(os.path.dirname(CSV_FILE), exist_ok=True)

        with FileLock(LOCK_FILE):
            if os.path.exists(CSV_FILE):
                os.replace(CSV_FILE, CSV_FILE + ".bak")

            df.to_csv(CSV_FILE, index=False)
        return True

    except Exception as e:
        logger.critical(f"Failed to save users: {str(e)}")
        if os.path.exists(CSV_FILE + ".bak"):
            os.replace(CSV_FILE + ".bak", CSV_FILE)
        return False

def create_user(name, email, password):
    """Securely register a new user with validation."""
    try:
        email = email.strip().lower()
        name = name.strip()
        password = password.strip()

        if not all([name, email, password]):
            return False, 'All fields are required'

        if not is_valid_email(email):
            return False, 'Invalid email format'

        if not is_strong_password(password):
            return False, 'Password must be at least 8 characters and include upper/lowercase letters, digits, and symbols'

        df = load_users()

        if not df.empty and email.lower() in df['email'].str.lower().values:
            return False, 'Email already registered'

        hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)

        new_user = pd.DataFrame([{
            'name': name,
            'email': email,
            'password': hashed_password,
            'is_logged_in': False
        }])

        df = pd.concat([df, new_user], ignore_index=True)

        if not save_users(df):
            return False, 'Failed to save user data'

        logger.info(f"New user created: {mask_email(email)}")
        return True, 'Signup successful'

    except Exception as e:
        logger.error(f"Create user error: {str(e)}")
        return False, 'Internal server error'

def authenticate_user(email, password):
    """Secure authentication with brute-force protection."""
    try:
        email = email.strip().lower()
        password = password.strip()

        if not email or not password:
            return False, 'Email and password required'

        df = load_users()

        user_match = df[df['email'].str.lower() == email]
        if user_match.empty:
            return False, 'Invalid credentials'

        user = user_match.iloc[0]

        if not user['password'] or not check_password_hash(user['password'], password):
            return False, 'Invalid credentials'

        df.loc[df['email'].str.lower() == email, 'is_logged_in'] = True

        if not save_users(df):
            return False, 'Failed to update login status'

        logger.info(f"User logged in: {mask_email(email)}")
        return True, 'Login successful'

    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        return False, 'Internal server error'

def logout_user(email):
    """Securely handle logout with validation."""
    try:
        email = email.strip().lower()
        df = load_users()

        if df.empty:
            return False, 'No users found'

        user_match = df[df['email'].str.lower() == email]
        if user_match.empty:
            return False, 'User not found'

        df.loc[df['email'].str.lower() == email, 'is_logged_in'] = False

        if not save_users(df):
            return False, 'Failed to update logout status'

        logger.info(f"User logged out: {mask_email(email)}")
        return True, 'Logout successful'

    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return False, 'Internal server error'
