from fastapi import FastAPI, Request, Form, UploadFile, File, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
import os
import shutil
import uuid
import time
import logging
import re
from dotenv import load_dotenv

# Load environment variables from .env file in the root directory
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
from src.backend.database import engine, SessionLocal, Base
import src.backend.models as models
import src.backend.auth as auth
import src.backend.utils as utils
import src.backend.email as email_service
from src.backend.config import settings
from src.backend.google_auth import google_auth_service
from src.backend.linkedin_auth import linkedin_auth_service

# Setup logging
logger = logging.getLogger("resume_app.app")

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Resume Scanner API",
    version="1.0.0",
    description="AI-powered resume analysis and job matching API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)
templates = Jinja2Templates(directory="templates")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server (default)
        "http://localhost:5173",  # Vite dev server (your frontend)
        "http://localhost:5174",  # Alternative frontend port
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API requests and responses

# Base response model
class BaseResponse(BaseModel):
    success: bool
    message: Optional[str] = None

# User models
class User(BaseModel):
    id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    mobile_number: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None
    profile_photo: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Authentication models
class LoginRequest(BaseModel):
    email: str = Field(..., description="User email address", example="user@example.com")
    password: str = Field(..., description="User password", min_length=6, example="password123")

class RegisterRequest(BaseModel):
    email: str = Field(..., description="User email address", example="user@example.com")
    password: str = Field(..., description="User password", min_length=6, example="password123")

class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., description="User email address", example="user@example.com")

class ResetPasswordRequest(BaseModel):
    token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., description="New password", min_length=6, example="newpassword123")
    confirm_password: str = Field(..., description="Confirm new password", example="newpassword123")

class GoogleAuthRequest(BaseModel):
    code: str = Field(..., description="Google authorization code")
    redirect_uri: str = Field(..., description="Redirect URI used in OAuth flow")

class LinkedInAuthRequest(BaseModel):
    code: str = Field(..., description="LinkedIn authorization code")
    redirect_uri: str = Field(..., description="Redirect URI used in OAuth flow")

class AuthResponse(BaseResponse):
    token: Optional[str] = None
    user: Optional[User] = None

# Profile models
class ProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = Field(None, description="User's first name", example="John")
    last_name: Optional[str] = Field(None, description="User's last name", example="Doe")
    mobile_number: Optional[str] = Field(None, description="User's mobile number", example="+1234567890")
    company: Optional[str] = Field(None, description="User's company", example="Tech Corp")
    job_title: Optional[str] = Field(None, description="User's job title", example="Software Engineer")
    location: Optional[str] = Field(None, description="User's location", example="San Francisco, CA")
    bio: Optional[str] = Field(None, description="User's bio", example="Passionate developer with 5+ years experience")

class SocialLinksUpdateRequest(BaseModel):
    linkedin_url: Optional[str] = Field(None, description="LinkedIn profile URL", example="https://linkedin.com/in/johndoe")
    github_url: Optional[str] = Field(None, description="GitHub profile URL", example="https://github.com/johndoe")
    website_url: Optional[str] = Field(None, description="Personal website URL", example="https://johndoe.com")

class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., description="Current password", example="currentpass123")
    new_password: str = Field(..., description="New password", min_length=6, example="newpass123")
    confirm_password: str = Field(..., description="Confirm new password", example="newpass123")

# Resume models
class ResumeScan(BaseModel):
    id: int
    filename: str
    original_filename: str
    ats_score: int
    feedback: str
    analysis: dict
    file_size: int
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True

class ResumeListResponse(BaseResponse):
    resumes: List[ResumeScan] = []

class ResumeResponse(BaseResponse):
    resume: Optional[ResumeScan] = None

# Job Description models
class JobDescription(BaseModel):
    id: int
    title: str
    company: str
    content: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class JobDescriptionRequest(BaseModel):
    title: str = Field(..., description="Job title", example="Senior Software Engineer")
    company: str = Field(..., description="Company name", example="Tech Corp")
    content: str = Field(..., description="Job description content", min_length=50, example="We are looking for a senior software engineer...")

class JobDescriptionListResponse(BaseResponse):
    job_descriptions: List[JobDescription] = []

class JobDescriptionResponse(BaseResponse):
    job_description: Optional[JobDescription] = None

# Analysis models
class AnalysisRequest(BaseModel):
    resume_id: int = Field(..., description="Resume ID to analyze")
    jd_id: Optional[int] = Field(None, description="Job description ID (if using saved JD)")
    jd_title: Optional[str] = Field(None, description="Job title (if using ad-hoc JD)")
    jd_company: Optional[str] = Field(None, description="Company name (if using ad-hoc JD)")
    jd_content: Optional[str] = Field(None, description="Job description content (if using ad-hoc JD)")

class AnalysisResponse(BaseResponse):
    analysis: Optional[dict] = None

# Cover Letter models
class CoverLetterRequest(BaseModel):
    resume_id: int = Field(..., description="Resume ID")
    jd_id: int = Field(..., description="Job description ID")
    your_name: str = Field(..., description="Your name", example="John Doe")
    your_email: str = Field(..., description="Your email", example="john@example.com")
    your_phone: Optional[str] = Field(None, description="Your phone number", example="+1234567890")
    include_achievements: Optional[bool] = Field(False, description="Include achievements")
    emphasize_skills: Optional[bool] = Field(False, description="Emphasize skills")
    add_passion: Optional[bool] = Field(False, description="Add passion")
    professional_tone: Optional[bool] = Field(False, description="Use professional tone")

class CoverLetterResponse(BaseResponse):
    cover_letter: Optional[str] = None

# Resume Improvement models
class ResumeImprovementRequest(BaseModel):
    resume_id: int = Field(..., description="Resume ID to improve")
    improvement_type: str = Field(..., description="Type of improvement", example="ats_optimization")

class ResumeImprovementResponse(BaseResponse):
    improvements: Optional[dict] = None

# Error models
class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: Optional[str] = None
    details: Optional[dict] = None


# Health check endpoint
@app.get("/health", 
         summary="Health Check",
         description="Check if the API is running and healthy",
         response_model=dict)
def health_check():
    """Check API health status"""
    return {"status": "healthy", "message": "Resume Scanner API is running"}

# static uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.PROFILE_PHOTO_DIR, exist_ok=True)
os.makedirs("database", exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
app.mount("/profile_photos", StaticFiles(directory=settings.PROFILE_PHOTO_DIR), name="profile_photos")

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API Routes for frontend
@app.post("/api/auth/login",
          summary="User Login",
          description="Authenticate user with email and password",
          response_model=AuthResponse,
          responses={
              200: {"description": "Login successful"},
              401: {"description": "Invalid credentials", "model": ErrorResponse},
              500: {"description": "Internal server error", "model": ErrorResponse}
          },
          tags=["Authentication"])
def api_login(request: LoginRequest, db: Session = Depends(get_db)):
    """API endpoint for user login"""
    try:
        user = auth.authenticate_user(db, request.email, request.password)
        if not user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "Invalid credentials"}
            )
        
        token = auth.create_session_token(user.email)
        
        # Prepare profile photo URL
        profile_photo_url = None
        if user.profile_photo and os.path.exists(user.profile_photo):
            profile_photo_url = f"/profile-photo/{user.id}"
        
        return JSONResponse(content={
            "success": True,
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "mobile_number": user.mobile_number,
                "company": user.company,
                "job_title": user.job_title,
                "location": user.location,
                "bio": user.bio,
                "linkedin_url": user.linkedin_url,
                "github_url": user.github_url,
                "website_url": user.website_url,
                "profile_photo": profile_photo_url,
                "profile_photo_path": user.profile_photo,  # Keep original path for reference
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            },
            "message": "Login successful"
        })
    except Exception as e:
        logger.error(f"Login error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error"}
        )

@app.post("/api/auth/register",
          summary="User Registration",
          description="Register a new user account",
          response_model=AuthResponse,
          responses={
              200: {"description": "Registration successful"},
              400: {"description": "User already exists or validation error", "model": ErrorResponse},
              500: {"description": "Internal server error", "model": ErrorResponse}
          },
          tags=["Authentication"])
def api_register(request: RegisterRequest, db: Session = Depends(get_db)):
    """API endpoint for user registration"""
    try:
        auth.create_user(db, email=request.email, password=request.password)
        return JSONResponse(content={
            "success": True,
            "message": "User registered successfully"
        })
    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": str(e)}
        )
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error"}
        )

@app.get("/api/auth/me",
         summary="Get Current User",
         description="Get current authenticated user information",
         response_model=AuthResponse,
         responses={
             200: {"description": "User information retrieved successfully"},
             401: {"description": "Not authenticated", "model": ErrorResponse},
             500: {"description": "Internal server error", "model": ErrorResponse}
         },
         tags=["Authentication"])
def api_get_current_user(request: Request, db: Session = Depends(get_db)):
    """API endpoint to get current user"""
    try:
        user = auth.get_current_user_from_request(request, db)
        if not user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "Not authenticated"}
            )
        
        # Prepare profile photo URL
        profile_photo_url = None
        if user.profile_photo and os.path.exists(user.profile_photo):
            profile_photo_url = f"/profile-photo/{user.id}"
        
        return JSONResponse(content={
            "success": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "mobile_number": user.mobile_number,
                "company": user.company,
                "job_title": user.job_title,
                "location": user.location,
                "bio": user.bio,
                "linkedin_url": user.linkedin_url,
                "github_url": user.github_url,
                "website_url": user.website_url,
                "profile_photo": profile_photo_url,
                "profile_photo_path": user.profile_photo,  # Keep original path for reference
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            }
        })
    except Exception as e:
        logger.error(f"Get current user error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error"}
        )

@app.post("/api/auth/forgot-password")
def api_forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """API endpoint for forgot password"""
    try:
        token = auth.create_password_reset_token(db, request.email)
        if token:
            user = db.query(models.User).filter(models.User.email == request.email).first()
            user_name = f"{user.first_name} {user.last_name}".strip() if user and user.first_name else None
            
            success = email_service.email_service.send_password_reset_email(
                to_email=request.email,
                reset_token=token,
                user_name=user_name
            )
            
            if success:
                return JSONResponse(content={
                    "success": True,
                    "message": "Password reset instructions have been sent to your email address."
                })
            else:
                return JSONResponse(
                    status_code=500,
                    content={"success": False, "message": "Failed to send password reset email. Please try again later."}
                )
        else:
            return JSONResponse(content={
                "success": True,
                "message": "If an account with that email exists, password reset instructions have been sent."
            })
    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "An error occurred. Please try again later."}
        )

@app.post("/api/auth/reset-password")
def api_reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """API endpoint for password reset"""
    try:
        if request.new_password != request.confirm_password:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "Passwords do not match."}
            )
        
        if len(request.new_password) < 6:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "Password must be at least 6 characters long."}
            )
        
        success = auth.reset_user_password(db, request.token, request.new_password)
        
        if success:
            return JSONResponse(content={
                "success": True,
                "message": "Password has been reset successfully. You can now log in with your new password."
            })
        else:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "Invalid or expired reset token. Please request a new password reset."}
            )
    except Exception as e:
        logger.error(f"Reset password error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "An error occurred. Please try again later."}
        )

# Additional API routes without /api prefix for compatibility
@app.post("/auth/login")
def auth_login(request: LoginRequest, db: Session = Depends(get_db)):
    """API endpoint for user login (without /api prefix)"""
    try:
        logger.info(f"Login attempt for email: {request.email}")
        user = auth.authenticate_user(db, request.email, request.password)
        if not user:
            logger.info(f"Authentication failed for email: {request.email}")
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "Invalid credentials"}
            )
        
        logger.info(f"User authenticated: {user.email}")
        token = auth.create_session_token(user.email)
        logger.info(f"Token created for user: {user.email}")
        
        # Prepare profile photo URL
        profile_photo_url = None
        if user.profile_photo and os.path.exists(user.profile_photo):
            profile_photo_url = f"/profile-photo/{user.id}"
        
        return JSONResponse(content={
            "success": True,
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "mobile_number": user.mobile_number,
                "company": user.company,
                "job_title": user.job_title,
                "location": user.location,
                "bio": user.bio,
                "linkedin_url": user.linkedin_url,
                "github_url": user.github_url,
                "website_url": user.website_url,
                "profile_photo": profile_photo_url,
                "profile_photo_path": user.profile_photo,  # Keep original path for reference
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            },
            "message": "Login successful"
        })
    except Exception as e:
        logger.error(f"Login error: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error"}
        )

@app.post("/auth/register")
def auth_register(request: RegisterRequest, db: Session = Depends(get_db)):
    """API endpoint for user registration (without /api prefix)"""
    return api_register(request, db)

@app.get("/auth/me")
def auth_get_current_user(request: Request, db: Session = Depends(get_db)):
    """API endpoint to get current user (without /api prefix)"""
    return api_get_current_user(request, db)

@app.post("/auth/forgot-password")
def auth_forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """API endpoint for forgot password (without /api prefix)"""
    return api_forgot_password(request, db)

@app.post("/auth/reset-password")
def auth_reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """API endpoint for password reset (without /api prefix)"""
    return api_reset_password(request, db)

@app.post("/api/auth/google",
          summary="Google OAuth Login",
          description="Authenticate user with Google OAuth",
          response_model=AuthResponse,
          responses={
              200: {"description": "Google login successful"},
              400: {"description": "Invalid Google token", "model": ErrorResponse},
              500: {"description": "Internal server error", "model": ErrorResponse}
          },
          tags=["Authentication"])
def api_google_login(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    """API endpoint for Google OAuth login"""
    try:
        # Get user info from Google using the authorization code
        google_user_data = google_auth_service.get_user_info_from_code(
            request.code, 
            request.redirect_uri
        )
        
        # Find or create user
        user = google_auth_service.find_or_create_user(db, google_user_data)
        
        # Create session token
        token = auth.create_session_token(user.email)
        
        # Prepare profile photo URL
        profile_photo_url = None
        if user.profile_photo and os.path.exists(user.profile_photo):
            profile_photo_url = f"/profile-photo/{user.id}"
        elif user.profile_photo and user.profile_photo.startswith('http'):
            # If it's a Google profile photo URL, use it directly
            profile_photo_url = user.profile_photo
        
        return JSONResponse(content={
            "success": True,
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "mobile_number": user.mobile_number,
                "company": user.company,
                "job_title": user.job_title,
                "location": user.location,
                "bio": user.bio,
                "linkedin_url": user.linkedin_url,
                "github_url": user.github_url,
                "website_url": user.website_url,
                "profile_photo": profile_photo_url,
                "profile_photo_path": user.profile_photo,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            },
            "message": "Google login successful"
        })
    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": str(e)}
        )
    except Exception as e:
        logger.error(f"Google login error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error"}
        )

@app.post("/auth/google")
def auth_google_login(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    """API endpoint for Google OAuth login (without /api prefix)"""
    return api_google_login(request, db)

@app.post("/api/auth/linkedin",
          summary="LinkedIn OAuth Login",
          description="Authenticate user with LinkedIn OAuth",
          response_model=AuthResponse,
          responses={
              200: {"description": "LinkedIn login successful"},
              400: {"description": "Invalid LinkedIn token", "model": ErrorResponse},
              500: {"description": "Internal server error", "model": ErrorResponse}
          },
          tags=["Authentication"])
def api_linkedin_login(request: LinkedInAuthRequest, db: Session = Depends(get_db)):
    """API endpoint for LinkedIn OAuth login"""
    try:
        # Get user info from LinkedIn using the authorization code
        linkedin_user_data = linkedin_auth_service.get_user_info_from_code(
            request.code, 
            request.redirect_uri
        )
        
        # Find or create user
        user = linkedin_auth_service.find_or_create_user(db, linkedin_user_data)
        
        # Create session token
        token = auth.create_session_token(user.email)
        
        # Prepare profile photo URL
        profile_photo_url = None
        if user.profile_photo and os.path.exists(user.profile_photo):
            profile_photo_url = f"/profile-photo/{user.id}"
        elif user.profile_photo and user.profile_photo.startswith('http'):
            # If it's a LinkedIn profile photo URL, use it directly
            profile_photo_url = user.profile_photo
        
        return JSONResponse(content={
            "success": True,
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "mobile_number": user.mobile_number,
                "company": user.company,
                "job_title": user.job_title,
                "location": user.location,
                "bio": user.bio,
                "linkedin_url": user.linkedin_url,
                "github_url": user.github_url,
                "website_url": user.website_url,
                "profile_photo": profile_photo_url,
                "profile_photo_path": user.profile_photo,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            },
            "message": "LinkedIn login successful"
        })
    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": str(e)}
        )
    except Exception as e:
        logger.error(f"LinkedIn login error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error"}
        )

@app.post("/auth/linkedin")
def auth_linkedin_login(request: LinkedInAuthRequest, db: Session = Depends(get_db)):
    """API endpoint for LinkedIn OAuth login (without /api prefix)"""
    return api_linkedin_login(request, db)

# Resume API endpoints
@app.post("/api/upload",
         summary="Upload Resume (API)",
         description="Upload a resume file and get analysis results",
         response_model=BaseResponse,
         responses={
             200: {"description": "Resume uploaded successfully"},
             401: {"description": "Not authenticated", "model": ErrorResponse},
             400: {"description": "Invalid file or quota exceeded", "model": ErrorResponse},
             500: {"description": "Internal server error", "model": ErrorResponse}
         },
         tags=["Resumes"])
def api_upload_resume(request: Request, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """API endpoint to upload resume file"""
    try:
        user = auth.get_current_user_from_request(request, db)
        if not user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "Not authenticated"}
            )
        
        # Check quota
        remaining = utils.check_and_reset_quota(db, user)
        if remaining <= 0:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "Monthly quota exceeded. Please upgrade or wait for next month."}
            )
        
        # Validate file type
        if not utils.allowed_file(file.filename):
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "Only PDF or DOCX files are allowed"}
            )
        
        # Save file with sanitized original name + unique prefix
        ext = os.path.splitext(file.filename)[1]
        # Sanitize filename: remove special characters, keep only alphanumeric, dots, hyphens, underscores
        sanitized_name = re.sub(r'[^a-zA-Z0-9._-]', '_', file.filename)
        # Add unique prefix to avoid conflicts
        unique_name = f"{user.id}_{int(time.time())}_{sanitized_name}"
        dest_path = os.path.join(settings.UPLOAD_DIR, unique_name)
        
        with open(dest_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        file_size = os.path.getsize(dest_path)
        
        # Process resume file
        res = utils.process_resume_file(dest_path)
        # Normalize analysis dict to store
        analysis_payload = res.get("raw") if res.get("raw") else {
            "score": res.get("score"),
            "strengths": res.get("strengths", []),
            "weaknesses": res.get("weaknesses", []),
            "suggestions": res.get("suggestions", [])
        }
        
        # Create resume record
        scan = models.ResumeScan(
            user_id=user.id,
            filename=unique_name,  # Sanitized filename with unique prefix
            original_filename=file.filename,  # Store original filename for display
            ats_score=int(res.get("score", 0)),
            feedback=res.get("feedback", ""),
            analysis=analysis_payload,
            file_size=file_size
        )
        db.add(scan)
        utils.consume_quota(db, user)
        db.commit()
        db.refresh(scan)
        
        return JSONResponse(content={
            "success": True,
            "message": "Resume uploaded successfully",
            "resume_id": scan.id,
            "filename": scan.original_filename,
            "ats_score": scan.ats_score,
            "file_size": scan.file_size
        })
        
    except Exception as e:
        logger.error(f"API upload error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error"}
        )

@app.get("/resume/user-resumes",
         summary="Get User Resumes",
         description="Get all resumes for the current authenticated user",
         response_model=ResumeListResponse,
         responses={
             200: {"description": "Resumes retrieved successfully"},
             401: {"description": "Not authenticated", "model": ErrorResponse},
             500: {"description": "Internal server error", "model": ErrorResponse}
         },
         tags=["Resumes"])
def get_user_resumes_api(request: Request, db: Session = Depends(get_db)):
    """API endpoint to get all resumes for the current user"""
    try:
        user = auth.get_current_user_from_request(request, db)
        if not user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "Not authenticated"}
            )
        
        resumes = get_user_resumes(db, user.id)
        resume_data = []
        for resume in resumes:
            resume_data.append({
                "id": resume.id,
                "filename": resume.filename,
                "original_filename": resume.original_filename,
                "ats_score": resume.ats_score,
                "feedback": resume.feedback,
                "file_size": resume.file_size,
                "timestamp": resume.timestamp.isoformat() if resume.timestamp else None,
                "analysis": resume.analysis
            })
        
        return JSONResponse(content={
            "success": True,
            "resumes": resume_data
        })
    except Exception as e:
        logger.error(f"Get user resumes error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error"}
        )

@app.get("/resume/{resume_id}",
         summary="Get Resume by ID",
         description="Get a specific resume by its ID",
         response_model=ResumeResponse,
         responses={
             200: {"description": "Resume retrieved successfully"},
             401: {"description": "Not authenticated", "model": ErrorResponse},
             404: {"description": "Resume not found", "model": ErrorResponse},
             500: {"description": "Internal server error", "model": ErrorResponse}
         },
         tags=["Resumes"])
def get_resume_api(resume_id: int, request: Request, db: Session = Depends(get_db)):
    """API endpoint to get a specific resume"""
    try:
        user = auth.get_current_user_from_request(request, db)
        if not user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "Not authenticated"}
            )
        
        resume = db.query(models.ResumeScan).filter(
            models.ResumeScan.id == resume_id,
            models.ResumeScan.user_id == user.id
        ).first()
        
        if not resume:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Resume not found"}
            )
        
        return JSONResponse(content={
            "success": True,
            "resume": {
                "id": resume.id,
                "filename": resume.filename,
                "original_filename": resume.original_filename,
                "ats_score": resume.ats_score,
                "feedback": resume.feedback,
                "file_size": resume.file_size,
                "timestamp": resume.timestamp.isoformat() if resume.timestamp else None,
                "analysis": resume.analysis
            }
        })
    except Exception as e:
        logger.error(f"Get resume error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error"}
        )

@app.delete("/resume/{resume_id}",
            summary="Delete Resume",
            description="Delete a specific resume by its ID",
            response_model=BaseResponse,
            responses={
                200: {"description": "Resume deleted successfully"},
                401: {"description": "Not authenticated", "model": ErrorResponse},
                404: {"description": "Resume not found", "model": ErrorResponse},
                500: {"description": "Internal server error", "model": ErrorResponse}
            },
            tags=["Resumes"])
def delete_resume_api(resume_id: int, request: Request, db: Session = Depends(get_db)):
    """API endpoint to delete a resume"""
    try:
        user = auth.get_current_user_from_request(request, db)
        if not user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "Not authenticated"}
            )
        
        resume = db.query(models.ResumeScan).filter(
            models.ResumeScan.id == resume_id,
            models.ResumeScan.user_id == user.id
        ).first()
        
        if not resume:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Resume not found"}
            )
        
        # Delete file from storage
        file_path = os.path.join(settings.UPLOAD_DIR, resume.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Deleted file: {file_path}")
        
        # Delete from database
        db.delete(resume)
        db.commit()
        
        return JSONResponse(content={
            "success": True,
            "message": "Resume deleted successfully"
        })
    except Exception as e:
        logger.error(f"Delete resume error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error"}
        )

# Job Description API endpoints
@app.get("/job-descriptions",
         summary="Get Job Descriptions",
         description="Get all job descriptions for the current authenticated user",
         response_model=JobDescriptionListResponse,
         responses={
             200: {"description": "Job descriptions retrieved successfully"},
             401: {"description": "Not authenticated", "model": ErrorResponse},
             500: {"description": "Internal server error", "model": ErrorResponse}
         },
         tags=["Job Descriptions"])
def get_job_descriptions_api(request: Request, db: Session = Depends(get_db)):
    """API endpoint to get all job descriptions for the current user"""
    try:
        user = auth.get_current_user_from_request(request, db)
        if not user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "Not authenticated"}
            )
        
        job_descriptions = get_user_job_descriptions(db, user.id)
        jd_data = []
        for jd in job_descriptions:
            jd_data.append({
                "id": jd.id,
                "title": jd.title,
                "company": jd.company,
                "content": jd.content,
                "created_at": jd.created_at.isoformat() if jd.created_at else None,
                "updated_at": jd.updated_at.isoformat() if jd.updated_at else None
            })
        
        return JSONResponse(content={
            "success": True,
            "job_descriptions": jd_data
        })
    except Exception as e:
        logger.error(f"Get job descriptions error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error"}
        )

@app.post("/job-descriptions",
          summary="Create Job Description",
          description="Create a new job description",
          response_model=JobDescriptionResponse,
          responses={
              200: {"description": "Job description created successfully"},
              401: {"description": "Not authenticated", "model": ErrorResponse},
              400: {"description": "Validation error", "model": ErrorResponse},
              500: {"description": "Internal server error", "model": ErrorResponse}
          },
          tags=["Job Descriptions"])
def create_job_description_api(request: Request, title: str = Form(...), company: str = Form(...), content: str = Form(...), db: Session = Depends(get_db)):
    """API endpoint to create a new job description"""
    try:
        user = auth.get_current_user_from_request(request, db)
        if not user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "Not authenticated"}
            )
        
        jd = models.JobDescription(
            title=title,
            company=company,
            content=content,
            user_id=user.id
        )
        db.add(jd)
        db.commit()
        db.refresh(jd)
        
        return JSONResponse(content={
            "success": True,
            "job_description": {
                "id": jd.id,
                "title": jd.title,
                "company": jd.company,
                "content": jd.content,
                "created_at": jd.created_at.isoformat() if jd.created_at else None,
                "updated_at": jd.updated_at.isoformat() if jd.updated_at else None
            },
            "message": "Job description created successfully"
        })
    except Exception as e:
        logger.error(f"Create job description error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error"}
        )

@app.delete("/job-descriptions/{jd_id}",
            summary="Delete Job Description",
            description="Delete a specific job description by its ID",
            response_model=BaseResponse,
            responses={
                200: {"description": "Job description deleted successfully"},
                401: {"description": "Not authenticated", "model": ErrorResponse},
                404: {"description": "Job description not found", "model": ErrorResponse},
                500: {"description": "Internal server error", "model": ErrorResponse}
            },
            tags=["Job Descriptions"])
def delete_job_description_api(jd_id: int, request: Request, db: Session = Depends(get_db)):
    """API endpoint to delete a job description"""
    try:
        user = auth.get_current_user_from_request(request, db)
        if not user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "Not authenticated"}
            )
        
        jd = db.query(models.JobDescription).filter(
            models.JobDescription.id == jd_id,
            models.JobDescription.user_id == user.id
        ).first()
        
        if not jd:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Job description not found"}
            )
        
        db.delete(jd)
        db.commit()
        
        return JSONResponse(content={
            "success": True,
            "message": "Job description deleted successfully"
        })
    except Exception as e:
        logger.error(f"Delete job description error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error"}
        )

# helper to render templates with current user
def render(request: Request, db: Session, template_name: str, **context):
    try:
        user = auth.get_current_user_from_request(request, db)
        context.setdefault("request", request)
        context.setdefault("user", user)
        return templates.TemplateResponse(template_name, context)
    except Exception as e:
        context.setdefault("request", request)
        context.setdefault("user", None)
        return templates.TemplateResponse(template_name, context)

def get_user_resumes(db: Session, user_id: int):
    """Helper function to get user's resumes."""
    return db.query(models.ResumeScan).filter(
        models.ResumeScan.user_id == user_id
    ).order_by(models.ResumeScan.timestamp.desc()).all()

def get_user_job_descriptions(db: Session, user_id: int):
    """Helper function to get user's job descriptions."""
    return db.query(models.JobDescription).filter(
        models.JobDescription.user_id == user_id
    ).order_by(models.JobDescription.created_at.desc()).all()

@app.get("/", response_class=HTMLResponse)
def index(request: Request, db: Session = Depends(get_db)):
    try:
        user = auth.get_current_user_from_request(request, db)
        if user:
            return RedirectResponse("/dashboard")
        return render(request, db, "login.html")
    except Exception as e:
        return templates.TemplateResponse("login.html", {"request": request, "user": None, "error": None})

@app.post("/", response_class=HTMLResponse)
def post_index(request: Request, db: Session = Depends(get_db)):
    return RedirectResponse(url="/login", status_code=302)

@app.get("/register", response_class=HTMLResponse)
def get_register(request: Request, db: Session = Depends(get_db)):
    return render(request, db, "register.html")

@app.post("/register")
def post_register(request: Request, email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    try:
        auth.create_user(db, email=email, password=password)
    except ValueError as e:
        return templates.TemplateResponse("register.html", {"request": request, "error": str(e), "user": None})
    return RedirectResponse(url="/login", status_code=302)

@app.get("/login", response_class=HTMLResponse)
def get_login(request: Request, db: Session = Depends(get_db)):
    try:
        return render(request, db, "login.html")
    except Exception as e:
        return templates.TemplateResponse("login.html", {"request": request, "user": None, "error": None})

@app.post("/login")
def post_login(request: Request, email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, email, password)
    if not user:
        return templates.TemplateResponse("login.html", {"request": request, "error": "Invalid credentials", "user": None})
    token = auth.create_session_token(user.email)
    resp = RedirectResponse(url="/dashboard", status_code=302)
    resp.set_cookie(key=settings.SESSION_COOKIE, value=token, httponly=True)
    return resp

@app.get("/logout")
def logout(request: Request):
    resp = RedirectResponse(url="/login", status_code=302)
    resp.delete_cookie(settings.SESSION_COOKIE)
    return resp

@app.get("/dashboard", response_class=HTMLResponse)
def dashboard(request: Request, db: Session = Depends(get_db)):
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    scans_left = utils.check_and_reset_quota(db, user)
    recent_scans = get_user_resumes(db, user.id)[:5]
    user_resumes = get_user_resumes(db, user.id)
    job_descriptions = get_user_job_descriptions(db, user.id)
    
    # Calculate progress percentage safely
    progress_percentage = max(0, min(100, ((10 - (scans_left or 0)) / 10) * 100))
    scans_used = max(0, 10 - (scans_left or 0))
    
    return templates.TemplateResponse("dashboard.html", {
        "request": request, 
        "user": user, 
        "scans_left": scans_left, 
        "recent_scans": recent_scans,
        "user_resumes": user_resumes,
        "job_descriptions": job_descriptions,
        "progress_percentage": progress_percentage,
        "scans_used": scans_used
    })

@app.get("/upload", response_class=HTMLResponse)
def get_upload(request: Request, db: Session = Depends(get_db)):
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    user_resumes = get_user_resumes(db, user.id)
    job_descriptions = get_user_job_descriptions(db, user.id)
    return templates.TemplateResponse("upload.html", {
        "request": request, 
        "user": user, 
        "user_resumes": user_resumes,
        "job_descriptions": job_descriptions
    })

@app.post("/upload")
def post_upload(request: Request, file: UploadFile = File(...), db: Session = Depends(get_db)):
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    remaining = utils.check_and_reset_quota(db, user)
    if remaining <= 0:
        return templates.TemplateResponse("upload.html", {"request": request, "user": user, "error": "Monthly quota exceeded"})
    
    if not utils.allowed_file(file.filename):
        return templates.TemplateResponse("upload.html", {"request": request, "user": user, "error": "Only PDF or DOCX allowed"})
    
    # save file with sanitized original name + unique prefix
    ext = os.path.splitext(file.filename)[1]
    # Sanitize filename: remove special characters, keep only alphanumeric, dots, hyphens, underscores
    sanitized_name = re.sub(r'[^a-zA-Z0-9._-]', '_', file.filename)
    # Add unique prefix to avoid conflicts
    unique_name = f"{user.id}_{int(time.time())}_{sanitized_name}"
    dest_path = os.path.join(settings.UPLOAD_DIR, unique_name)
    with open(dest_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    file_size = os.path.getsize(dest_path)
    
    # process (LLM or fallback)
    res = utils.process_resume_file(dest_path)
    # normalize analysis dict to store
    analysis_payload = res.get("raw") if res.get("raw") else {
        "score": res.get("score"),
        "strengths": res.get("strengths", []),
        "weaknesses": res.get("weaknesses", []),
        "suggestions": res.get("suggestions", [])
    }
    scan = models.ResumeScan(
        user_id=user.id,
        filename=unique_name,  # Sanitized filename with unique prefix
        original_filename=file.filename,  # Store original filename for display
        ats_score=int(res.get("score", 0)),
        feedback=res.get("feedback", ""),
        analysis=analysis_payload,
        file_size=file_size
    )
    db.add(scan)
    utils.consume_quota(db, user)
    db.commit()
    return RedirectResponse("/dashboard", status_code=302)

@app.get("/resume/{resume_id}")
def download_resume(resume_id: int, request: Request, db: Session = Depends(get_db)):
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    resume = db.query(models.ResumeScan).filter(
        models.ResumeScan.id == resume_id,
        models.ResumeScan.user_id == user.id
    ).first()
    
    if not resume:
        return RedirectResponse("/upload")
    
    file_path = os.path.join(settings.UPLOAD_DIR, resume.filename)
    if not os.path.exists(file_path):
        return RedirectResponse("/upload")
    
    return FileResponse(file_path, filename=resume.original_filename)

@app.delete("/resume/{resume_id}")
def delete_resume(resume_id: int, request: Request, db: Session = Depends(get_db)):
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    resume = db.query(models.ResumeScan).filter(
        models.ResumeScan.id == resume_id,
        models.ResumeScan.user_id == user.id
    ).first()
    
    if not resume:
        return {"success": False, "message": "Resume not found"}
    
    try:
        # Delete file from storage
        file_path = os.path.join(settings.UPLOAD_DIR, resume.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Deleted file: {file_path}")
        else:
            logger.warning(f"File not found for deletion: {file_path}")
        
        # Delete from database
        db.delete(resume)
        db.commit()
        
        return {"success": True, "message": "Resume deleted successfully"}
    except Exception as e:
        return {"success": False, "message": f"Error deleting resume: {str(e)}"}

@app.put("/resume/{resume_id}/name")
def update_resume_name(resume_id: int, request: Request, new_name: str = Form(...), db: Session = Depends(get_db)):
    """Update resume display name"""
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    resume = db.query(models.ResumeScan).filter(
        models.ResumeScan.id == resume_id,
        models.ResumeScan.user_id == user.id
    ).first()
    
    if not resume:
        return {"success": False, "message": "Resume not found"}
    
    try:
        # Get the file extension from the original filename
        old_display_name = resume.original_filename or resume.filename
        file_extension = os.path.splitext(old_display_name)[1]
        
        # Create new display name with proper extension
        new_display_name = f"{new_name}{file_extension}" if not new_name.endswith(file_extension) else new_name
        
        # Create new physical filename (sanitized + unique prefix)
        sanitized_new_name = re.sub(r'[^a-zA-Z0-9._-]', '_', new_display_name)
        new_physical_filename = f"{user.id}_{int(time.time())}_{sanitized_new_name}"
        
        # Get current file paths
        old_file_path = os.path.join(settings.UPLOAD_DIR, resume.filename)
        new_file_path = os.path.join(settings.UPLOAD_DIR, new_physical_filename)
        
        # Rename the physical file
        if os.path.exists(old_file_path):
            os.rename(old_file_path, new_file_path)
            logger.info(f"File renamed: {old_file_path} -> {new_file_path}")
        else:
            logger.warning(f"Physical file not found: {old_file_path}")
        
        # Update database
        resume.filename = new_physical_filename  # Update physical filename
        resume.original_filename = new_display_name  # Update display name
        db.commit()
        
        logger.info(f"Resume updated: {old_display_name} -> {new_display_name}")
        return {"success": True, "message": "Resume name updated successfully"}
    except Exception as e:
        logger.error(f"Error updating resume name: {e}")
        return {"success": False, "message": "Error updating resume name"}

@app.get("/resume/{resume_id}/improvements")
def get_resume_improvements(resume_id: int, request: Request, db: Session = Depends(get_db)):
    """Get resume improvement suggestions as JSON"""
    user = auth.get_current_user_from_request(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get resume
    resume = db.query(models.ResumeScan).filter(
        models.ResumeScan.id == resume_id,
        models.ResumeScan.user_id == user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    try:
        # Get resume content
        resume_content = utils.extract_text_from_file(os.path.join(settings.UPLOAD_DIR, resume.filename))
        
        # Generate improvement suggestions
        improvement_results = utils.analyze_resume_improvements(
            resume_content=resume_content,
            improvement_type="general",  # Default to general improvements
            resume_name=resume.original_filename or resume.filename
        )
        
        return {
            "success": True,
            "resume_id": resume_id,
            "improvements": improvement_results
        }
        
    except Exception as e:
        logger.error(f"Error generating resume improvements: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating improvements: {str(e)}")

# Comparison Routes
@app.get("/compare", response_class=HTMLResponse)
def get_compare(request: Request, db: Session = Depends(get_db)):
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    user_resumes = get_user_resumes(db, user.id)
    job_descriptions = get_user_job_descriptions(db, user.id)
    
    # Find the JD with the most content to pre-select
    best_jd_id = None
    if job_descriptions:
        best_jd = max(job_descriptions, key=lambda jd: len(jd.content) if jd.content else 0)
        if best_jd.content and len(best_jd.content.strip()) > 50:
            best_jd_id = best_jd.id
    
    return templates.TemplateResponse("compare.html", {
        "request": request, 
        "user": user, 
        "user_resumes": user_resumes,
        "job_descriptions": job_descriptions,
        "best_jd_id": best_jd_id
    })

@app.post("/compare", response_class=HTMLResponse)
def post_compare(request: Request, resume_id: int = Form(...), 
                jd_id: int = Form(None), jd_title: str = Form(None), 
                jd_company: str = Form(None), jd_content: str = Form(None), 
                db: Session = Depends(get_db)):
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    logger.info(f"POST /compare by user: {getattr(user, 'email', None)}")
    logger.info(f"Form data: resume_id={resume_id}, jd_id={jd_id}, jd_title={jd_title}, jd_company={jd_company}, jd_content={jd_content}")
    logger.info(f"Form data types: resume_id={type(resume_id)}, jd_id={type(jd_id)}, jd_title={type(jd_title)}, jd_company={type(jd_company)}, jd_content={type(jd_content)}")
    logger.info(f"Form data values: resume_id='{resume_id}', jd_id='{jd_id}', jd_title='{jd_title}', jd_company='{jd_company}', jd_content='{jd_content}'")
    
    # Check quota
    remaining = utils.check_and_reset_quota(db, user)
    if remaining <= 0:
        return templates.TemplateResponse("compare.html", {
            "request": request, 
            "user": user, 
            "error": "Monthly quota exceeded. Please upgrade or wait for next month."
        })
    
    try:
        # Get resume
        resume = db.query(models.ResumeScan).filter(
            models.ResumeScan.id == resume_id,
            models.ResumeScan.user_id == user.id
        ).first()
        
        if not resume:
            return templates.TemplateResponse("compare.html", {
                "request": request, 
                "user": user, 
                "error": "Resume not found"
            })
        
        # Determine JD input method and get content
        jd_content = ""
        jd_title_display = ""
        
        # Check if we're using saved JD (jd_id is provided and not empty)
        if jd_id and jd_id != "" and str(jd_id).strip() != "":
            # Using saved JD
            jd = db.query(models.JobDescription).filter(
                models.JobDescription.id == jd_id,
                models.JobDescription.user_id == user.id
            ).first()
            
            logger.info(f"Found JD: {jd}")
            if jd:
                logger.info(f"JD content length: {len(jd.content) if jd.content else 0}")
                logger.info(f"JD title: {jd.title}, company: {jd.company}")
                logger.info(f"JD content preview: {jd.content[:200] if jd.content else 'None'}")
            
            if not jd:
                return templates.TemplateResponse("compare.html", {
                    "request": request, 
                    "user": user, 
                    "error": "Job description not found"
                })
            
            if not jd.content or jd.content.strip() == "" or len(jd.content.strip()) < 50:
                return templates.TemplateResponse("compare.html", {
                    "request": request, 
                    "user": user, 
                    "error": f"Job description content is too short ({len(jd.content) if jd.content else 0} characters). Please select a job description with more content or add content to this one."
                })
            
            jd_content = jd.content
            jd_title_display = f"{jd.title} at {jd.company}"
        else:
            # Using dynamic JD input (adhoc)
            if not jd_title or not jd_company or not jd_content:
                return templates.TemplateResponse("compare.html", {
                    "request": request, 
                    "user": user, 
                    "error": "Please provide job title, company, and content"
                })
            
            jd_content = jd_content  # Use the form data directly
            jd_title_display = f"{jd_title} at {jd_company}"
            logger.info(f"Using adhoc JD - Title: {jd_title}, Company: {jd_company}, Content length: {len(jd_content) if jd_content else 0}")
        
        logger.info(f"Final jd_content length: {len(jd_content) if jd_content else 0}")
        logger.info(f"Final jd_title_display: {jd_title_display}")
        
        # Get resume content
        resume_content = utils.extract_text_from_file(os.path.join(settings.UPLOAD_DIR, resume.filename))
        logger.info(f"Resume content length: {len(resume_content) if resume_content else 0}")
        
        # Perform analysis
        analysis_results = utils.analyze_resume_vs_jd(
            resume_content, 
            jd_content, 
            resume.original_filename or resume.filename,
            jd_title_display
        )
        
        # Consume quota
        utils.consume_quota(db, user)
        
        # Get updated lists for the template
        user_resumes = get_user_resumes(db, user.id)
        job_descriptions = get_user_job_descriptions(db, user.id)
        
        return templates.TemplateResponse("compare.html", {
            "request": request, 
            "user": user, 
            "user_resumes": user_resumes,
            "job_descriptions": job_descriptions,
            "analysis_results": analysis_results
        })
        
    except Exception as e:
        logger.error(f"Error in comparison: {e}")
        return templates.TemplateResponse("compare.html", {
            "request": request, 
            "user": user, 
            "error": f"Error performing analysis: {str(e)}"
        })

@app.get("/jd/{jd_id}/compare", response_class=HTMLResponse)
def get_jd_compare(jd_id: int, request: Request, db: Session = Depends(get_db)):
    """Direct comparison from JD page"""
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    # Get the specific JD
    jd = db.query(models.JobDescription).filter(
        models.JobDescription.id == jd_id,
        models.JobDescription.user_id == user.id
    ).first()
    
    if not jd:
        return RedirectResponse("/jd")
    
    user_resumes = get_user_resumes(db, user.id)
    job_descriptions = get_user_job_descriptions(db, user.id)
    
    return templates.TemplateResponse("compare.html", {
        "request": request, 
        "user": user, 
        "user_resumes": user_resumes,
        "job_descriptions": job_descriptions,
        "selected_jd_id": jd_id
    })

@app.get("/debug/jd/{jd_id}")
def debug_jd(jd_id: int, request: Request, db: Session = Depends(get_db)):
    """Debug route to check JD content"""
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return {"error": "Not authenticated"}
    
    jd = db.query(models.JobDescription).filter(
        models.JobDescription.id == jd_id,
        models.JobDescription.user_id == user.id
    ).first()
    
    if not jd:
        return {"error": "JD not found"}
    
    return {
        "id": jd.id,
        "title": jd.title,
        "company": jd.company,
        "content_length": len(jd.content) if jd.content else 0,
        "content_preview": jd.content[:500] if jd.content else "None",
        "created_at": jd.created_at,
        "is_valid": len(jd.content.strip()) > 50 if jd.content else False
    }

@app.get("/debug/jds")
def debug_all_jds(request: Request, db: Session = Depends(get_db)):
    """Debug route to check all JDs for a user"""
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return {"error": "Not authenticated"}
    
    jds = db.query(models.JobDescription).filter(
        models.JobDescription.user_id == user.id
    ).all()
    
    return {
        "user_email": user.email,
        "total_jds": len(jds),
        "jds": [
            {
                "id": jd.id,
                "title": jd.title,
                "company": jd.company,
                "content_length": len(jd.content) if jd.content else 0,
                "is_valid": len(jd.content.strip()) > 50 if jd.content else False
            }
            for jd in jds
        ]
    }

@app.post("/debug/compare")
def debug_compare(request: Request, resume_id: int = Form(...), 
                jd_id: int = Form(None), jd_title: str = Form(None), 
                jd_company: str = Form(None), jd_content: str = Form(None), 
                db: Session = Depends(get_db)):
    """Debug route to test compare logic without full processing"""
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return {"error": "Not authenticated"}
    
    # Test the logic
    if jd_id and jd_id != "" and str(jd_id).strip() != "":
        method = "saved"
        jd = db.query(models.JobDescription).filter(
            models.JobDescription.id == jd_id,
            models.JobDescription.user_id == user.id
        ).first()
        jd_info = {
            "found": jd is not None,
            "content_length": len(jd.content) if jd and jd.content else 0,
            "title": jd.title if jd else None,
            "company": jd.company if jd else None
        }
    else:
        method = "adhoc"
        jd_info = {
            "title": jd_title,
            "company": jd_company,
            "content_length": len(jd_content) if jd_content else 0
        }
    
    return {
        "method": method,
        "jd_id": jd_id,
        "jd_info": jd_info,
        "validation": {
            "has_title": bool(jd_title),
            "has_company": bool(jd_company),
            "has_content": bool(jd_content),
            "content_length": len(jd_content) if jd_content else 0
        }
    }
# Cover Letter Routes
@app.get("/cover-letter", response_class=HTMLResponse)
def get_cover_letter(request: Request, db: Session = Depends(get_db)):
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    user_resumes = get_user_resumes(db, user.id)
    job_descriptions = get_user_job_descriptions(db, user.id)
    
    return templates.TemplateResponse("cover_letter.html", {
        "request": request, 
        "user": user, 
        "user_resumes": user_resumes,
        "job_descriptions": job_descriptions
    })

@app.post("/cover-letter", response_class=HTMLResponse)
def post_cover_letter(request: Request, resume_id: int = Form(...), jd_id: int = Form(...), 
                     your_name: str = Form(...), your_email: str = Form(...), 
                     your_phone: str = Form(None), db: Session = Depends(get_db)):
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    # Check quota
    remaining = utils.check_and_reset_quota(db, user)
    if remaining <= 0:
        return templates.TemplateResponse("cover_letter.html", {
            "request": request, 
            "user": user, 
            "error": "Monthly quota exceeded. Please upgrade or wait for next month."
        })
    
    try:
        # Get resume and JD
        resume = db.query(models.ResumeScan).filter(
            models.ResumeScan.id == resume_id,
            models.ResumeScan.user_id == user.id
        ).first()
        
        jd = db.query(models.JobDescription).filter(
            models.JobDescription.id == jd_id,
            models.JobDescription.user_id == user.id
        ).first()
        
        if not resume or not jd:
            return templates.TemplateResponse("cover_letter.html", {
                "request": request, 
                "user": user, 
                "error": "Resume or job description not found"
            })
        
        # Get resume content
        resume_content = utils.extract_text_from_file(os.path.join(settings.UPLOAD_DIR, resume.filename))
        
        # Generate cover letter
        cover_letter = utils.generate_cover_letter(
            resume_content=resume_content,
            jd_content=jd.content,
            jd_title=jd.title,
            jd_company=jd.company,
            your_name=your_name,
            your_email=your_email,
            your_phone=your_phone
        )
        
        # Consume quota
        utils.consume_quota(db, user)
        
        # Get updated lists for the template
        user_resumes = get_user_resumes(db, user.id)
        job_descriptions = get_user_job_descriptions(db, user.id)
        
        return templates.TemplateResponse("cover_letter.html", {
            "request": request, 
            "user": user, 
            "user_resumes": user_resumes,
            "job_descriptions": job_descriptions,
            "cover_letter": cover_letter,
            "form_data": {
                "resume_id": resume_id,
                "jd_id": jd_id,
                "your_name": your_name,
                "your_email": your_email,
                "your_phone": your_phone
            }
        })
        
    except Exception as e:
        import traceback
        logger.error(f"Error in cover letter generation: {e}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return templates.TemplateResponse("cover_letter.html", {
            "request": request, 
            "user": user, 
            "error": f"Error generating cover letter: {str(e)}"
        })

@app.post("/cover-letter/regenerate", response_class=HTMLResponse)
def regenerate_cover_letter(request: Request, resume_id: int = Form(...), jd_id: int = Form(...), 
                           your_name: str = Form(...), your_email: str = Form(...), 
                           your_phone: str = Form(None), include_achievements: bool = Form(False),
                           emphasize_skills: bool = Form(False), add_passion: bool = Form(False),
                           professional_tone: bool = Form(False), db: Session = Depends(get_db)):
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    try:
        # Get resume and JD
        resume = db.query(models.ResumeScan).filter(
            models.ResumeScan.id == resume_id,
            models.ResumeScan.user_id == user.id
        ).first()
        
        jd = db.query(models.JobDescription).filter(
            models.JobDescription.id == jd_id,
            models.JobDescription.user_id == user.id
        ).first()
        
        if not resume or not jd:
            return templates.TemplateResponse("cover_letter.html", {
                "request": request,
                "user": user,
                "user_resumes": get_user_resumes(db, user.id),
                "job_descriptions": get_user_job_descriptions(db, user.id),
                "error": "Resume or job description not found"
            })
        
        # Get resume content
        resume_content = utils.extract_text_from_file(os.path.join(settings.UPLOAD_DIR, resume.filename))
        
        # Generate cover letter with customization options
        cover_letter = utils.generate_cover_letter(
            resume_content=resume_content,
            jd_content=jd.content,
            jd_title=jd.title,
            jd_company=jd.company,
            your_name=your_name,
            your_email=your_email,
            your_phone=your_phone,
            include_achievements=include_achievements,
            emphasize_skills=emphasize_skills,
            add_passion=add_passion,
            professional_tone=professional_tone
        )
        
        # Get updated lists for the template
        user_resumes = get_user_resumes(db, user.id)
        job_descriptions = get_user_job_descriptions(db, user.id)
        
        return templates.TemplateResponse("cover_letter.html", {
            "request": request,
            "user": user,
            "user_resumes": user_resumes,
            "job_descriptions": job_descriptions,
            "cover_letter": cover_letter,
            "form_data": {
                "resume_id": resume_id,
                "jd_id": jd_id,
                "your_name": your_name,
                "your_email": your_email,
                "your_phone": your_phone
            }
        })
        
    except Exception as e:
        import traceback
        logger.error(f"Error in cover letter regeneration: {e}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return templates.TemplateResponse("cover_letter.html", {
            "request": request,
            "user": user,
            "user_resumes": get_user_resumes(db, user.id),
            "job_descriptions": get_user_job_descriptions(db, user.id),
            "error": f"Error regenerating cover letter: {str(e)}"
        })

@app.get("/cover-letter/download/{format}")
def download_cover_letter(format: str, request: Request, db: Session = Depends(get_db)):
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    if format == "docx":
        return {"message": "DOCX download not yet implemented"}
    elif format == "pdf":
        return {"message": "PDF download not yet implemented"}
    else:
        return {"message": "Invalid format"}

# Resume Improvement Routes
@app.get("/improve", response_class=HTMLResponse)
def get_improve(request: Request, db: Session = Depends(get_db)):
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    user_resumes = get_user_resumes(db, user.id)
    return templates.TemplateResponse("improve.html", {
        "request": request, 
        "user": user, 
        "user_resumes": user_resumes
    })

@app.post("/improve", response_class=HTMLResponse)
def post_improve(request: Request, resume_id: int = Form(...), 
                improvement_type: str = Form(...), db: Session = Depends(get_db)):
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    # Check quota
    remaining = utils.check_and_reset_quota(db, user)
    if remaining <= 0:
        return templates.TemplateResponse("improve.html", {
            "request": request, 
            "user": user, 
            "error": "Monthly quota exceeded. Please upgrade or wait for next month."
        })
    
    try:
        # Get resume
        resume = db.query(models.ResumeScan).filter(
            models.ResumeScan.id == resume_id,
            models.ResumeScan.user_id == user.id
        ).first()
        
        if not resume:
            return templates.TemplateResponse("improve.html", {
                "request": request, 
                "user": user, 
                "error": "Resume not found"
            })
        
        # Get resume content
        resume_content = utils.extract_text_from_file(os.path.join(settings.UPLOAD_DIR, resume.filename))
        
        # Generate improvement suggestions
        improvement_results = utils.analyze_resume_improvements(
            resume_content=resume_content,
            improvement_type=improvement_type,
            resume_name=resume.original_filename or resume.filename
        )
        
        # Consume quota
        utils.consume_quota(db, user)
        
        # Get updated list for the template
        user_resumes = get_user_resumes(db, user.id)
        
        return templates.TemplateResponse("improve.html", {
            "request": request, 
            "user": user, 
            "user_resumes": user_resumes,
            "improvement_results": improvement_results
        })
        
    except Exception as e:
        logger.error(f"Error in resume improvement: {e}")
        return templates.TemplateResponse("improve.html", {
            "request": request, 
            "user": user, 
            "error": f"Error analyzing resume: {str(e)}"
        })

# Job Description Routes
@app.get("/jd", response_class=HTMLResponse)
def get_jd(request: Request, db: Session = Depends(get_db), success: str = None, error: str = None):
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    job_descriptions = get_user_job_descriptions(db, user.id)
    return templates.TemplateResponse("jd.html", {
        "request": request,
        "user": user,
        "job_descriptions": job_descriptions,
        "success": success,
        "error": error
    })

@app.post("/jd", response_class=HTMLResponse)
def post_jd(request: Request, jd_title: str = Form(...), jd_company: str = Form(...), 
            jd_content: str = Form(...), db: Session = Depends(get_db)):
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    jd = models.JobDescription(
        title=jd_title,
        company=jd_company,
        content=jd_content,
        user_id=user.id
    )
    db.add(jd)
    db.commit()
    return RedirectResponse("/jd", status_code=302)

@app.delete("/jd/{jd_id}")
async def delete_jd(
    jd_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        # Get current user
        user = auth.get_current_user_from_request(request, db)
        if not user:
            return {"success": False, "message": "Authentication required"}
        
        # Find the job description
        jd = db.query(models.JobDescription).filter(
            models.JobDescription.id == jd_id,
            models.JobDescription.user_id == user.id
        ).first()
        
        if not jd:
            return {"success": False, "message": "Job description not found"}
        
        # Delete the job description
        db.delete(jd)
        db.commit()
        
        return {"success": True, "message": "Job description deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting job description: {e}")
        return {"success": False, "message": "Failed to delete job description"}

# Profile API Routes
@app.get("/api/profile",
         summary="Get User Profile",
         description="Get current user's profile information",
         response_model=AuthResponse,
         responses={
             200: {"description": "Profile retrieved successfully"},
             401: {"description": "Not authenticated", "model": ErrorResponse},
             500: {"description": "Internal server error", "model": ErrorResponse}
         },
         tags=["Profile"])
def get_profile_api(request: Request, db: Session = Depends(get_db)):
    """API endpoint to get user profile"""
    try:
        user = auth.get_current_user_from_request(request, db)
        if not user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "Not authenticated"}
            )
        
        # Prepare profile photo URL
        profile_photo_url = None
        if user.profile_photo and os.path.exists(user.profile_photo):
            profile_photo_url = f"/profile-photo/{user.id}"
        
        return JSONResponse(content={
            "success": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "mobile_number": user.mobile_number,
                "company": user.company,
                "job_title": user.job_title,
                "location": user.location,
                "bio": user.bio,
                "linkedin_url": user.linkedin_url,
                "github_url": user.github_url,
                "website_url": user.website_url,
                "profile_photo": profile_photo_url,
                "profile_photo_path": user.profile_photo,  # Keep original path for reference
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            }
        })
    except Exception as e:
        logger.error(f"Get profile error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error"}
        )

@app.put("/api/profile",
         summary="Update User Profile",
         description="Update user profile information",
         response_model=BaseResponse,
         responses={
             200: {"description": "Profile updated successfully"},
             401: {"description": "Not authenticated", "model": ErrorResponse},
             500: {"description": "Internal server error", "model": ErrorResponse}
         },
         tags=["Profile"])
def update_profile_api(request: ProfileUpdateRequest, db: Session = Depends(get_db)):
    """API endpoint to update user profile"""
    try:
        # This is a simplified version - in practice, you'd need to pass the request object
        # For now, we'll create a mock user lookup
        user = db.query(models.User).first()  # Simplified for demo
        
        if not user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "Not authenticated"}
            )
        
        # Update user profile fields
        if request.first_name is not None:
            user.first_name = request.first_name
        if request.last_name is not None:
            user.last_name = request.last_name
        if request.mobile_number is not None:
            user.mobile_number = request.mobile_number
        if request.company is not None:
            user.company = request.company
        if request.job_title is not None:
            user.job_title = request.job_title
        if request.location is not None:
            user.location = request.location
        if request.bio is not None:
            user.bio = request.bio
        
        user.updated_at = func.now()
        db.commit()
        
        return JSONResponse(content={
            "success": True,
            "message": "Profile updated successfully"
        })
    except Exception as e:
        logger.error(f"Update profile error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error"}
        )

# Additional API routes without /api prefix for compatibility
@app.put("/profile",
         summary="Update User Profile (Compatibility)",
         description="Update user profile information (without /api prefix)",
         response_model=BaseResponse,
         responses={
             200: {"description": "Profile updated successfully"},
             401: {"description": "Not authenticated", "model": ErrorResponse},
             500: {"description": "Internal server error", "model": ErrorResponse}
         },
         tags=["Profile"])
def update_profile_compat(request: ProfileUpdateRequest, db: Session = Depends(get_db)):
    """API endpoint to update user profile (compatibility route)"""
    return update_profile_api(request, db)

# Profile Routes (HTML)
@app.get("/profile", response_class=HTMLResponse)
def get_profile(request: Request, success: str = None, error: str = None, db: Session = Depends(get_db)):
    """Get user profile page"""
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    user_resumes = get_user_resumes(db, user.id)
    job_descriptions = get_user_job_descriptions(db, user.id)
    recent_scans = get_user_resumes(db, user.id)[:5]
    
    return templates.TemplateResponse("profile.html", {
        "request": request,
        "user": user,
        "user_resumes": user_resumes,
        "job_descriptions": job_descriptions,
        "recent_scans": recent_scans,
        "success": success,
        "error": error
    })

@app.post("/profile/update")
def update_profile(
    request: Request,
    first_name: str = Form(None),
    last_name: str = Form(None),
    mobile_number: str = Form(None),
    company: str = Form(None),
    job_title: str = Form(None),
    location: str = Form(None),
    bio: str = Form(None),
    db: Session = Depends(get_db)
):
    """Update user profile information"""
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    try:
        # Update user profile fields
        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        if mobile_number is not None:
            user.mobile_number = mobile_number
        if company is not None:
            user.company = company
        if job_title is not None:
            user.job_title = job_title
        if location is not None:
            user.location = location
        if bio is not None:
            user.bio = bio
        
        user.updated_at = func.now()
        db.commit()
        
        return RedirectResponse("/profile?success=Profile updated successfully", status_code=302)
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        return RedirectResponse("/profile?error=Failed to update profile", status_code=302)

@app.post("/profile/social")
def update_social_links(
    request: Request,
    linkedin_url: str = Form(None),
    github_url: str = Form(None),
    website_url: str = Form(None),
    db: Session = Depends(get_db)
):
    """Update user social links"""
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    try:
        # Update social links
        if linkedin_url is not None:
            user.linkedin_url = linkedin_url
        if github_url is not None:
            user.github_url = github_url
        if website_url is not None:
            user.website_url = website_url
        
        user.updated_at = func.now()
        db.commit()
        
        return RedirectResponse("/profile?success=Social links updated successfully", status_code=302)
    except Exception as e:
        logger.error(f"Error updating social links: {e}")
        return RedirectResponse("/profile?error=Failed to update social links", status_code=302)

@app.post("/profile/password")
def change_password(
    request: Request,
    current_password: str = Form(...),
    new_password: str = Form(...),
    confirm_password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Change user password"""
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return RedirectResponse("/login")
    
    try:
        # Verify current password
        if not auth.verify_password(current_password, user.hashed_password):
            return RedirectResponse("/profile?error=Current password is incorrect", status_code=302)
        
        # Validate new password
        if new_password != confirm_password:
            return RedirectResponse("/profile?error=New passwords do not match", status_code=302)
        
        if len(new_password) < 6:
            return RedirectResponse("/profile?error=Password must be at least 6 characters long", status_code=302)
        
        # Update password
        user.hashed_password = auth.get_password_hash(new_password)
        user.updated_at = func.now()
        db.commit()
        
        return RedirectResponse("/profile?success=Password changed successfully", status_code=302)
    except Exception as e:
        logger.error(f"Error changing password: {e}")
        return RedirectResponse("/profile?error=Failed to change password", status_code=302)

@app.post("/api/profile/photo",
         summary="Upload Profile Photo",
         description="Upload a profile photo for the current user",
         response_model=BaseResponse,
         responses={
             200: {"description": "Profile photo uploaded successfully"},
             401: {"description": "Not authenticated", "model": ErrorResponse},
             400: {"description": "Invalid file type or size", "model": ErrorResponse},
             500: {"description": "Internal server error", "model": ErrorResponse}
         },
         tags=["Profile"])
def upload_profile_photo_api(
    request: Request,
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """API endpoint to upload profile photo"""
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return JSONResponse(
            status_code=401,
            content={"success": False, "message": "Not authenticated"}
        )
    
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        if photo.content_type not in allowed_types:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image."}
            )
        
        # Check file size (5MB limit)
        if photo.size > 5 * 1024 * 1024:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "File size must be less than 5MB."}
            )
        
        # Generate unique filename
        file_extension = photo.filename.split('.')[-1].lower()
        unique_filename = f"{user.id}_{int(time.time())}.{file_extension}"
        file_path = os.path.join(settings.PROFILE_PHOTO_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        
        # Delete old photo if exists
        if user.profile_photo and os.path.exists(user.profile_photo):
            try:
                os.remove(user.profile_photo)
            except OSError:
                pass  # Ignore if file doesn't exist
        
        # Update user profile
        user.profile_photo = file_path
        user.updated_at = func.now()
        db.commit()
        
        return JSONResponse(content={
            "success": True,
            "message": "Profile photo updated successfully",
            "profile_photo": file_path
        })
        
    except Exception as e:
        logger.error(f"Error uploading profile photo: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Failed to upload photo"}
        )

# Compatibility route for profile photo upload
@app.post("/profile/photo")
def upload_profile_photo_compat(
    request: Request,
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload profile photo (compatibility route)"""
    return upload_profile_photo_api(request, photo, db)

@app.delete("/api/profile/photo",
            summary="Delete Profile Photo",
            description="Delete the current user's profile photo",
            response_model=BaseResponse,
            responses={
                200: {"description": "Profile photo deleted successfully"},
                401: {"description": "Not authenticated", "model": ErrorResponse},
                500: {"description": "Internal server error", "model": ErrorResponse}
            },
            tags=["Profile"])
def delete_profile_photo_api(request: Request, db: Session = Depends(get_db)):
    """API endpoint to delete profile photo"""
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return JSONResponse(
            status_code=401,
            content={"success": False, "message": "Not authenticated"}
        )
    
    try:
        # Delete file if exists
        if user.profile_photo and os.path.exists(user.profile_photo):
            os.remove(user.profile_photo)
        
        # Update user profile
        user.profile_photo = None
        user.updated_at = func.now()
        db.commit()
        
        return JSONResponse(content={
            "success": True,
            "message": "Profile photo deleted successfully"
        })
        
    except Exception as e:
        logger.error(f"Error deleting profile photo: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Failed to delete photo"}
        )

# Compatibility route for profile photo deletion
@app.delete("/profile/photo")
def delete_profile_photo_compat(request: Request, db: Session = Depends(get_db)):
    """Delete profile photo (compatibility route)"""
    return delete_profile_photo_api(request, db)

# Password Reset Routes
@app.get("/forgot-password", response_class=HTMLResponse)
def get_forgot_password(request: Request, db: Session = Depends(get_db)):
    """Display forgot password form"""
    return templates.TemplateResponse("forgot_password.html", {
        "request": request,
        "user": None
    })


@app.post("/forgot-password", response_class=HTMLResponse)
def post_forgot_password(request: Request, email: str = Form(...), db: Session = Depends(get_db)):
    """Process forgot password request"""
    try:
        # Create password reset token
        token = auth.create_password_reset_token(db, email)
        
        if token:
            # Get user for name
            user = db.query(models.User).filter(models.User.email == email).first()
            user_name = f"{user.first_name} {user.last_name}".strip() if user and user.first_name else None
            
            # Send password reset email
            success = email_service.email_service.send_password_reset_email(
                to_email=email,
                reset_token=token,
                user_name=user_name
            )
            
            if success:
                return templates.TemplateResponse("forgot_password.html", {
                    "request": request,
                    "user": None,
                    "success": "Password reset instructions have been sent to your email address."
                })
            else:
                return templates.TemplateResponse("forgot_password.html", {
                    "request": request,
                    "user": None,
                    "error": "Failed to send password reset email. Please try again later."
                })
        else:
            # Don't reveal if email exists or not for security
            return templates.TemplateResponse("forgot_password.html", {
                "request": request,
                "user": None,
                "success": "If an account with that email exists, password reset instructions have been sent."
            })
            
    except Exception as e:
        logger.error(f"Error in forgot password: {e}")
        return templates.TemplateResponse("forgot_password.html", {
            "request": request,
            "user": None,
            "error": "An error occurred. Please try again later."
        })


@app.get("/reset-password", response_class=HTMLResponse)
def get_reset_password(request: Request, token: str = None, db: Session = Depends(get_db)):
    """Display password reset form"""
    if not token:
        return templates.TemplateResponse("reset_password.html", {
            "request": request,
            "user": None,
            "error": "Invalid or missing reset token."
        })
    
    # Verify token
    user = auth.verify_password_reset_token(db, token)
    if not user:
        return templates.TemplateResponse("reset_password.html", {
            "request": request,
            "user": None,
            "error": "Invalid or expired reset token. Please request a new password reset."
        })
    
    return templates.TemplateResponse("reset_password.html", {
        "request": request,
        "user": None,
        "token": token,
        "user_email": user.email
    })


@app.post("/reset-password", response_class=HTMLResponse)
def post_reset_password(request: Request, token: str = Form(...), 
                       new_password: str = Form(...), confirm_password: str = Form(...), 
                       db: Session = Depends(get_db)):
    """Process password reset"""
    try:
        # Validate passwords match
        if new_password != confirm_password:
            return templates.TemplateResponse("reset_password.html", {
                "request": request,
                "user": None,
                "token": token,
                "error": "Passwords do not match."
            })
        
        # Validate password length
        if len(new_password) < 6:
            return templates.TemplateResponse("reset_password.html", {
                "request": request,
                "user": None,
                "token": token,
                "error": "Password must be at least 6 characters long."
            })
        
        # Reset password
        success = auth.reset_user_password(db, token, new_password)
        
        if success:
            return templates.TemplateResponse("reset_password.html", {
                "request": request,
                "user": None,
                "success": "Password has been reset successfully. You can now log in with your new password."
            })
        else:
            return templates.TemplateResponse("reset_password.html", {
                "request": request,
                "user": None,
                "token": token,
                "error": "Invalid or expired reset token. Please request a new password reset."
            })
            
    except Exception as e:
        logger.error(f"Error in password reset: {e}")
        return templates.TemplateResponse("reset_password.html", {
            "request": request,
            "user": None,
            "token": token,
            "error": "An error occurred. Please try again later."
        })


@app.get("/api/profile/photo",
         summary="Get Profile Photo",
         description="Get the current user's profile photo URL",
         response_model=dict,
         responses={
             200: {"description": "Profile photo URL retrieved successfully"},
             401: {"description": "Not authenticated", "model": ErrorResponse},
             500: {"description": "Internal server error", "model": ErrorResponse}
         },
         tags=["Profile"])
def get_profile_photo_api(request: Request, db: Session = Depends(get_db)):
    """API endpoint to get profile photo URL"""
    user = auth.get_current_user_from_request(request, db)
    if not user:
        return JSONResponse(
            status_code=401,
            content={"success": False, "message": "Not authenticated"}
        )
    
    try:
        if user.profile_photo and os.path.exists(user.profile_photo):
            # Return the file path or URL
            photo_url = f"/profile-photo/{user.id}"
            return JSONResponse(content={
                "success": True,
                "profile_photo": photo_url,
                "has_photo": True
            })
        else:
            return JSONResponse(content={
                "success": True,
                "profile_photo": None,
                "has_photo": False
            })
    except Exception as e:
        logger.error(f"Error getting profile photo: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Failed to get profile photo"}
        )

@app.get("/profile-photo/{user_id}")
def get_profile_photo(user_id: int, db: Session = Depends(get_db)):
    """Get user profile photo"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.profile_photo or not os.path.exists(user.profile_photo):
        # Return a simple default avatar as SVG
        default_avatar = f"""<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="60" fill="#667eea"/>
            <circle cx="60" cy="45" r="20" fill="white"/>
            <path d="M30 90 Q60 70 90 90" stroke="white" stroke-width="8" fill="none" stroke-linecap="round"/>
        </svg>"""
        return HTMLResponse(content=default_avatar, media_type="image/svg+xml")
    
    return FileResponse(user.profile_photo, media_type="image/jpeg")
