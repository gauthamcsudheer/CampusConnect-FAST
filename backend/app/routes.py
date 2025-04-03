from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from sqlalchemy.orm import Session
from . import models, schemas, database
from typing import List
from datetime import datetime
from passlib.context import CryptContext
import os
import shutil
from pathlib import Path
import pytesseract
from PIL import Image
import io
from pdf2image import convert_from_bytes
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from app.utils.sentiment import analyze_feedback_batch

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "your-secret-key-here"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Get user from database
    user = get_user_by_email(db, email)
    if user is None:
        raise credentials_exception
    return user

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Create extracted_texts directory if it doesn't exist
EXTRACTED_TEXTS_DIR = Path("extracted_texts")
EXTRACTED_TEXTS_DIR.mkdir(exist_ok=True)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_email(db: Session, email: str):
    return db.query(models.UserDB).filter(models.UserDB.email == email).first()

def clean_text(text):
    """
    Clean the text while preserving paragraph structure.
    """
    # Split text into lines
    lines = text.split('\n')
    
    # Process each line
    processed_lines = []
    current_line = []
    
    for line in lines:
        # Skip empty lines
        if not line.strip():
            if current_line:
                # Join current paragraph and add it
                processed_lines.append(' '.join(current_line))
                current_line = []
            processed_lines.append('')  # Preserve paragraph break
            continue
            
        # Clean the line
        cleaned_line = line.strip()
        if cleaned_line:
            current_line.append(cleaned_line)
    
    # Add any remaining paragraph
    if current_line:
        processed_lines.append(' '.join(current_line))
    
    # Join lines with double newlines to preserve paragraph structure
    return '\n\n'.join(processed_lines)

@router.post("/upload/", response_model=dict)
async def upload_file(file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    try:
        # Read file content first
        file_content = await file.read()
        
        # Create a unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_path = UPLOAD_DIR / filename

        # Save the file using the content we already read
        with file_path.open("wb") as buffer:
            buffer.write(file_content)

        # Process the file for OCR
        text = ""
        
        if file.filename.lower().endswith('.pdf'):
            try:
                # Convert PDF to images using the content we already read
                pdf_images = convert_from_bytes(file_content, dpi=300)  # Increased DPI for better quality
                for i, pdf_image in enumerate(pdf_images):
                    try:
                        page_text = pytesseract.image_to_string(pdf_image, lang='eng')
                        text += f"\n\n--- Page {i+1} ---\n\n{page_text}"
                    except Exception as e:
                        print(f"Error processing page {i+1}: {str(e)}")
                        continue
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Error processing PDF: {str(e)}"
                )
        else:
            try:
                # Process image file using the content we already read
                image = Image.open(io.BytesIO(file_content))
                text = pytesseract.image_to_string(image, lang='eng')
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Error processing image: {str(e)}"
                )

        # Clean the text
        cleaned_text = clean_text(text)

        # Save extracted text to a file
        text_filename = f"{timestamp}_{file.filename.rsplit('.', 1)[0]}.txt"
        text_path = EXTRACTED_TEXTS_DIR / text_filename
        with text_path.open("w", encoding="utf-8") as f:
            f.write(cleaned_text)

        return {
            "message": "File uploaded and processed successfully",
            "filename": filename,
            "file_path": str(file_path),
            "text_filename": text_filename,
            "text_path": str(text_path)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.post("/login/", response_model=dict)
async def login(credentials: models.UserLogin, db: Session = Depends(database.get_db)):
    try:
        user = get_user_by_email(db, credentials.email)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        if not verify_password(credentials.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "full_name": user.full_name,
                "user_type": user.user_type
            }
        }
    except Exception as e:
        print(f"Login error: {str(e)}")  # For debugging
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/faculty/", response_model=List[models.User])
async def get_faculty(db: Session = Depends(database.get_db)):
    return db.query(models.UserDB).filter(models.UserDB.user_type == "faculty").all()

@router.get("/students/", response_model=List[models.User])
async def get_students(db: Session = Depends(database.get_db)):
    return db.query(models.UserDB).filter(models.UserDB.user_type == "student").all()

@router.post("/faculty/", response_model=models.User)
async def create_faculty(user: models.UserCreate, db: Session = Depends(database.get_db)):
    # Check if email already exists
    if get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    db_user = models.UserDB(
        **user.dict(exclude={'password'}),
        password=pwd_context.hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/students/", response_model=models.User)
async def create_student(user: models.UserCreate, db: Session = Depends(database.get_db)):
    # Check if email already exists
    if get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    db_user = models.UserDB(
        **user.dict(exclude={'password'}),
        password=pwd_context.hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/users/{user_id}", response_model=models.User)
async def get_user(user_id: int, db: Session = Depends(database.get_db)):
    user = db.query(models.UserDB).filter(models.UserDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/documents/", response_model=List[dict])
async def list_documents():
    try:
        documents = []
        for file in EXTRACTED_TEXTS_DIR.glob("*.txt"):
            # Get the original filename without timestamp
            original_name = "_".join(file.stem.split("_")[1:])
            documents.append({
                "id": str(file.stem),
                "filename": original_name,
                "created_at": datetime.fromtimestamp(file.stat().st_mtime).isoformat(),
                "path": f"/extracted_texts/{file.name}"
            })
        return sorted(documents, key=lambda x: x["created_at"], reverse=True)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error listing documents: {str(e)}"
        )

@router.get("/document/{document_id}")
async def get_document(document_id: str):
    try:
        file_path = EXTRACTED_TEXTS_DIR / f"{document_id}.txt"
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Document not found")
        
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        return {"content": content}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error reading document: {str(e)}"
        )

@router.get("/documents/combined")
async def get_combined_documents():
    try:
        combined_text = ""
        for file in EXTRACTED_TEXTS_DIR.glob("*.txt"):
            with open(file, "r", encoding="utf-8") as f:
                content = f.read()
                combined_text += f"\n\n--- Document: {file.stem} ---\n\n{content}\n"
        return {"content": combined_text}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error combining documents: {str(e)}"
        )

@router.get("/feedback", response_model=dict)
async def get_feedback(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.user_type != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view feedback"
        )
    
    try:
        # Get all feedback
        feedback = db.query(models.Feedback).order_by(models.Feedback.created_at.desc()).all()
        
        # Convert to list of dictionaries for sentiment analysis
        feedback_list = [
            {
                'id': f.id,
                'message': f.message,
                'created_at': f.created_at,
                'user_id': f.user_id
            }
            for f in feedback
        ]
        
        # Perform sentiment analysis
        sentiment_results = analyze_feedback_batch(feedback_list)
        
        return {
            'feedback': feedback_list,
            'sentiment_analysis': sentiment_results
        }
    except Exception as e:
        print(f"Error in get_feedback: {str(e)}")  # For debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/feedback", response_model=schemas.Feedback)
async def create_feedback(
    feedback: schemas.FeedbackCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        db_feedback = models.Feedback(
            message=feedback.message,
            user_id=current_user.id
        )
        db.add(db_feedback)
        db.commit()
        db.refresh(db_feedback)
        return db_feedback
    except Exception as e:
        print(f"Error in create_feedback: {str(e)}")  # For debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check if user is admin
    if current_user.user_type != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete users"
        )
    
    # Get user to delete
    user = db.query(models.UserDB).filter(models.UserDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from deleting themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Delete user
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

# Add an endpoint to create the initial admin user
@router.post("/create-admin/", response_model=models.User)
async def create_admin_user(db: Session = Depends(database.get_db)):
    # Check if admin already exists
    admin = db.query(models.UserDB).filter(models.UserDB.email == "admin@campusconnect.com").first()
    if admin:
        raise HTTPException(status_code=400, detail="Admin user already exists")
    
    # Create admin user
    admin_user = models.UserDB(
        email="admin@campusconnect.com",
        username="admin",
        full_name="Administrator",
        password=pwd_context.hash("admin123"),
        user_type="admin"
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    return admin_user

@router.delete("/feedback/{feedback_id}")
async def delete_feedback(
    feedback_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Only admin users can delete feedback")
    
    feedback = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    try:
        db.delete(feedback)
        db.commit()
        return {"message": "Feedback deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e)) 