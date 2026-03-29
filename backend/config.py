import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_EXPIRATION_HOURS = 24
    MONGO_URI = os.getenv('MONGO_URI')
    MODEL_PATH = os.getenv('MODEL_PATH', 'insurance_extra_trees_model.pkl')
