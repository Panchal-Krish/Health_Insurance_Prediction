import requests
from config import Config

def send_transactional_email(to_email, subject, html_content, to_name=None):
    """
    Sends a transactional email using Brevo's v3 API.
    Returns True if successful, False otherwise.
    """
    if not Config.BREVO_API_KEY:
        print("BREVO_API_KEY is not set. Cannot send email.")
        return False

    url = "https://api.brevo.com/v3/smtp/email"
    
    headers = {
        "accept": "application/json",
        "api-key": Config.BREVO_API_KEY,
        "content-type": "application/json"
    }
    
    payload = {
        "sender": {
            "name": "Health Insurance Predictor",
            "email": Config.SENDER_EMAIL
        },
        "to": [
            {
                "email": to_email,
                "name": to_name or to_email.split('@')[0]
            }
        ],
        "subject": subject,
        "htmlContent": html_content
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in [201, 202, 200]:
            print(f"Email sent successfully to {to_email}")
            return True
        else:
            print(f"Failed to send email to {to_email}. Status code: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"Exception while sending email to {to_email}: {e}")
        return False
