import os
import re
import pandas as pd
from werkzeug.security import generate_password_hash, check_password_hash

# Path to the CSV file storing user data
CSV_FILE = 'users.csv'

# Regex pattern to validate email format
EMAIL_REGEX = re.compile(r"^[\w\.-]+@[\w\.-]+\.\w+$")

def is_valid_email(email: str) -> bool:
    """Validate email format using regex."""
    return EMAIL_REGEX.match(email) is not None

def load_users():
    """Load users from CSV, or return empty DataFrame if not found or empty."""
    if not os.path.exists(CSV_FILE):
        return pd.DataFrame(columns=['name', 'email', 'password', 'is_logged_in'])
    try:
        df = pd.read_csv(CSV_FILE)
        # Ensure required columns exist
        for col in ['name', 'email', 'password', 'is_logged_in']:
            if col not in df.columns:
                df[col] = None if col == 'is_logged_in' else ''
        return df
    except (pd.errors.EmptyDataError, pd.errors.ParserError):
        return pd.DataFrame(columns=['name', 'email', 'password', 'is_logged_in'])

def save_users(df):
    """Save users DataFrame to CSV."""
    # Ensure directory exists
    os.makedirs(os.path.dirname(CSV_FILE), exist_ok=True)
    df.to_csv(CSV_FILE, index=False)

def create_user(name, email, password):
    """Register a new user."""
    email = email.strip().lower()
    name = name.strip()

    if not is_valid_email(email):
        return False, 'Invalid email format'

    df = load_users()

    # Check if email exists (case-insensitive)
    if not df.empty and email in df['email'].str.lower().values:
        return False, 'Email already registered'

    hashed_password = generate_password_hash(password)
    new_user = {
        'name': name,
        'email': email,
        'password': hashed_password,
        'is_logged_in': False
    }

    # Handle empty DataFrame case
    if df.empty:
        df = pd.DataFrame([new_user])
    else:
        df = pd.concat([df, pd.DataFrame([new_user])], ignore_index=True)
        
    save_users(df)
    return True, 'Signup successful'

def authenticate_user(email, password):
    """Login an existing user."""
    email = email.strip().lower()
    df = load_users()

    # Handle empty DataFrame
    if df.empty:
        return False, 'User not found'

    user = df[df['email'].str.lower() == email]
    if user.empty:
        return False, 'User not found'

    stored_password = user.iloc[0]['password']
    if not stored_password or not check_password_hash(stored_password, password):
        return False, 'Incorrect password'

    df.loc[df['email'].str.lower() == email, 'is_logged_in'] = True
    save_users(df)
    return True, 'Login successful'

def logout_user(email):
    """Logout a user."""
    email = email.strip().lower()
    df = load_users()

    # Handle empty DataFrame
    if df.empty:
        return False, 'No users found'

    if email not in df['email'].str.lower().values:
        return False, 'Email not found'

    df.loc[df['email'].str.lower() == email, 'is_logged_in'] = False
    save_users(df)
    return True, 'Logout successful'