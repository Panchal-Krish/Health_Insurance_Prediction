import sys
import os

# Add the directory containing config.py and database.py to Python's sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from database import db

# Clear specific collections
try:
    db.drop_collection("premium_history")
    print("Dropped premium_history collection.")
    
    db.prediction_logs.delete_many({})
    print("Cleared prediction_logs collection.")
    
    db.support_tickets.delete_many({})
    print("Cleared support_tickets collection.")
    
except Exception as e:
    print(f"Error cleaning DB: {e}")
