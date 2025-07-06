import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import ssl

load_dotenv()

EMAIL = os.getenv("EMAIL")
EMAIL_PASS = os.getenv("EMAIL_PASS")

def send_email(to_email, subject, body):
    if not EMAIL or not EMAIL_PASS:
        print("Error: EMAIL or EMAIL_PASS not set in .env")
        return False

    # Validate email format
    if "@" not in to_email or "." not in to_email.split("@")[1]:
        print(f"❌ Invalid recipient email: {to_email}")
        return False

    msg = MIMEMultipart()
    msg['From'] = EMAIL
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        # Create secure SSL context
        context = ssl.create_default_context()
        
        # Try with SMTP_SSL first (port 465)
        try:
            with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as server:
                server.login(EMAIL, EMAIL_PASS)
                server.sendmail(EMAIL, to_email, msg.as_string())
        except:
            # Fallback to STARTTLS (port 587)
            with smtplib.SMTP('smtp.gmail.com', 587) as server:
                server.ehlo()
                server.starttls(context=context)
                server.ehlo()
                server.login(EMAIL, EMAIL_PASS)
                server.sendmail(EMAIL, to_email, msg.as_string())
            
        print(f"✅ Email sent to {to_email}")
        return True
    except smtplib.SMTPAuthenticationError as auth_err:
        print("❌ Authentication error. Did you use an App Password?")
        print(auth_err)
        return False
