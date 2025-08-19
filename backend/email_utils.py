import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import ssl

# Initialize logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Load environment variables
load_dotenv()

EMAIL = os.getenv("EMAIL")
EMAIL_PASS = os.getenv("EMAIL_PASS")

def send_email(to_email, subject, body):
    """
    Send email using Gmail SMTP with SSL/TLS fallback
    Returns True on success, False on failure
    """
    # Validate credentials
    if not EMAIL or not EMAIL_PASS:
        logger.error("Email credentials not configured. Set EMAIL and EMAIL_PASS in .env")
        return False

    # Validate recipient format
    if "@" not in to_email or "." not in to_email.split("@")[-1]:
        logger.error(f"Invalid recipient email format: {to_email}")
        return False

    # Create email message
    msg = MIMEMultipart()
    msg['From'] = EMAIL
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))
    
    context = ssl.create_default_context()
    
    # Try both SSL and TLS connection methods
    try:
        # Attempt 1: SMTP over SSL (port 465)
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as server:
            server.login(EMAIL, EMAIL_PASS)
            server.sendmail(EMAIL, to_email, msg.as_string())
            logger.info(f"Email sent via SSL to {to_email}")
            return True
            
    except Exception as ssl_error:
        logger.warning(f"SSL connection failed: {ssl_error}. Trying TLS...")
        try:
            # Attempt 2: SMTP with STARTTLS (port 587)
            with smtplib.SMTP('smtp.gmail.com', 587) as server:
                server.starttls(context=context)
                server.login(EMAIL, EMAIL_PASS)
                server.sendmail(EMAIL, to_email, msg.as_string())
                logger.info(f"Email sent via TLS to {to_email}")
                return True
                
        except smtplib.SMTPAuthenticationError:
            logger.error("SMTP Authentication Failed. Possible causes:\n"
                         "1. Less Secure Apps disabled in Gmail settings\n"
                         "2. 2FA enabled without app password\n"
                         "3. Incorrect credentials")
            return False
            
        except Exception as tls_error:
            logger.error(f"TLS connection failed: {tls_error}")
            return False