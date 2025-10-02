from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    scan_count = Column(Integer, default=0)
    last_quota_reset = Column(DateTime(timezone=True), server_default=func.now())
    
    # Profile fields
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    mobile_number = Column(String(20), nullable=True)
    company = Column(String(200), nullable=True)
    job_title = Column(String(200), nullable=True)
    location = Column(String(200), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    profile_photo = Column(String(500), nullable=True)  # Path to profile photo
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    scans = relationship("ResumeScan", back_populates="user")
    job_descriptions = relationship("JobDescription", back_populates="user")

class ResumeScan(Base):
    __tablename__ = "resumescans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=True)   # uploaded original name
    file_size = Column(Integer, nullable=True)           # size in bytes
    file_type = Column(String, nullable=True)            # e.g. ".pdf" or "application/pdf"
    ats_score = Column(Integer, nullable=False, default=0)
    feedback = Column(String, nullable=True)
    analysis = Column(JSON, nullable=True)   # structured LLM result (stored as JSON/text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="scans")

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    company = Column(String, nullable=True)
    content = Column(Text, nullable=False)            # JD text content
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    user = relationship("User", back_populates="job_descriptions")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")