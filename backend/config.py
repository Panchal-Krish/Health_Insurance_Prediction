import os
from dotenv import load_dotenv

# Load .env from backend/ or the project root
load_dotenv() 
if not os.getenv("BREVO_API_KEY"):
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_EXPIRATION_HOURS = 24
    MONGO_URI = os.getenv('MONGO_URI')
    MODEL_PATH = os.getenv('MODEL_PATH', 'insurance_extra_trees_model.pkl')
    BREVO_API_KEY = os.getenv('BREVO_API_KEY')
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    SENDER_EMAIL = os.getenv('SENDER_EMAIL', 'g16@ibmproject@gmail.com')
