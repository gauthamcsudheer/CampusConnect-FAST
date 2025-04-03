from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum as SQLAlchemyEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.base import Base

class UserType(str, Enum):
    FACULTY = "faculty"
    STUDENT = "student"
    ADMIN = "admin"

# SQLAlchemy Model
class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String)
    password = Column(String)
    user_type = Column(String)  # "student", "faculty", or "admin"
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

# Pydantic Models
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    user_type: UserType

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("UserDB", back_populates="feedback")

UserDB.feedback = relationship("Feedback", back_populates="user") 