import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file in the root directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

class Settings:
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./database/resume.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_DAYS", "7"))
    SESSION_COOKIE: str = "session"
    
    # File uploads
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads/resumes")
    PROFILE_PHOTO_DIR: str = os.getenv("PROFILE_PHOTO_DIR", "uploads/profile_photos")
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB default
    ALLOWED_EXTENSIONS: set = {".pdf", ".docx"}
    ALLOWED_IMAGE_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".gif"}
    
    # Quota settings
    MAX_MONTHLY_SCANS: int = int(os.getenv("MAX_MONTHLY_SCANS", "10"))
    
    # Development settings
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Email settings
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "True").lower() == "true"
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "noreply@yourapp.com")
    FROM_NAME: str = os.getenv("FROM_NAME", "Resume Scanner")
    
    # Password reset settings
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = int(os.getenv("PASSWORD_RESET_TOKEN_EXPIRE_HOURS", "24"))
    PASSWORD_RESET_URL: str = os.getenv("PASSWORD_RESET_URL", "http://localhost:8000/reset-password")

settings = Settings()
