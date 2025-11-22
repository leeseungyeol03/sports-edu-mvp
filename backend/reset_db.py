import os
import sys

# Add the backend directory to the sys.path to allow importing app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'app')))

from app.database import Base, engine, SQLALCHEMY_DATABASE_URL # Changed DATABASE_URL to SQLALCHEMY_DATABASE_URL
import app.models # Import models to ensure they are registered with Base.metadata

def reset_db():
    print("Starting database reset process...")

    # Determine database file path for SQLite
    db_file_path = None
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite:///"):
        # Extract path relative to current working directory
        db_file_name = SQLALCHEMY_DATABASE_URL.replace("sqlite:///./", "")
        # Adjust path to be relative to the script's location or where it's run from
        db_file_path = os.path.join(os.path.dirname(__file__), db_file_name) # Assuming app.db is in backend/

    if db_file_path and os.path.exists(db_file_path):
        os.remove(db_file_path)
        print(f"Existing database file '{db_file_path}' deleted successfully.")
    else:
        print(f"No existing SQLite database file found at '{db_file_path}' or DATABASE_URL is not SQLite. Skipping deletion.")

    # Recreate all tables
    Base.metadata.create_all(bind=engine)
    print("New tables created successfully based on models.py schema.")

if __name__ == "__main__":
    reset_db()
