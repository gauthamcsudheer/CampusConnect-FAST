from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import Session
from app.models import UserDB
from app.base import Base

# Create SQLite database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./campusconnect.db"

# Create database engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user_by_email(db: Session, email: str):
    try:
        user = db.query(UserDB).filter(UserDB.email == email).first()
        if user:
            print(f"Found user: {user.email}, type: {user.user_type}")  # For debugging
        else:
            print(f"No user found with email: {email}")  # For debugging
        return user
    except Exception as e:
        print(f"Error in get_user_by_email: {str(e)}")  # For debugging
        raise 