from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import router as api_router
from app.database import engine, SessionLocal
from app import models
from app.base import Base
from pathlib import Path
from app.models import UserDB
from app.routes import pwd_context

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CampusConnect API",
    description="Backend API for CampusConnect application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Mount static files directory for extracted texts
extracted_texts_dir = Path("extracted_texts")
extracted_texts_dir.mkdir(exist_ok=True)
app.mount("/extracted_texts", StaticFiles(directory="extracted_texts"), name="extracted_texts")

# Create necessary directories
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

EXTRACTED_TEXTS_DIR = Path("extracted_texts")
EXTRACTED_TEXTS_DIR.mkdir(exist_ok=True)

# Create admin user if it doesn't exist
def create_admin_user():
    db = SessionLocal()
    try:
        admin = db.query(UserDB).filter(UserDB.email == "admin@campusconnect.com").first()
        if not admin:
            admin_user = UserDB(
                email="admin@campusconnect.com",
                username="admin",
                full_name="Administrator",
                password=pwd_context.hash("admin123"),
                user_type="admin"
            )
            db.add(admin_user)
            db.commit()
            print("Admin user created successfully")
    except Exception as e:
        print(f"Error creating admin user: {e}")
    finally:
        db.close()

# Create admin user on startup
create_admin_user()

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to CampusConnect API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 