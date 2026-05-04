"""
Test Mailhog SMTP connection directly
"""
import smtplib
from email.mime.text import MIMEText

def test_mailhog_smtp():
    try:
        msg = MIMEText("Test email body")
        msg['Subject'] = "Test Email"
        msg['From'] = "test@example.com"
        msg['To'] = "test@example.com"
        
        server = smtplib.SMTP('localhost', 1025)
        server.send_message(msg)
        server.quit()
        print("✅ Successfully sent test email to Mailhog")
        return True
    except Exception as e:
        print(f"❌ Failed to send test email to Mailhog: {e}")
        return False

if __name__ == "__main__":
    test_mailhog_smtp()
