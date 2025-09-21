from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi import Request
from sqlalchemy.orm import Session
from . import models
from typing import Optional
from .config import settings
import secrets
import logging

logger = logging.getLogger("resume_app.auth")

# Prefer pbkdf2_sha256 for dev (no binary deps). bcrypt left as fallback.
pwd_ctx = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_ctx.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """
    Attempt to verify using passlib. If hash format unknown, raise UnknownHashError
    to be handled by caller (authenticate_user). Return True/False on normal verify.
    """
    try:
        return pwd_ctx.verify(plain, hashed)
    except UnknownHashError:
        # let caller handle migration/fallback
        raise

def create_user(db: Session, email: str, password: str):
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        raise ValueError("Email already registered")
    u = models.User(email=email, hashed_password=get_password_hash(password))
    db.add(u)
    db.commit()
    db.refresh(u)
    return u

def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    """
    Authenticate user. Handles UnknownHashError by attempting a plaintext comparison
    (useful if DB contains unhashed values from earlier mistakes). If plaintext
    matches, re-hash and update the DB to migrate the record.
    """
    u = db.query(models.User).filter(models.User.email == email).first()
    if not u:
        return None
    try:
        if verify_password(password, u.hashed_password):
            return u
        return None
    except UnknownHashError:
        # hashed value not recognized by passlib — maybe old plain text or corrupt.
        # Fallback: if stored value looks like plain text (no $ separator), compare directly.
        stored = u.hashed_password or ""
        if "$" not in stored and password == stored:
            # migrate: re-hash and store
            u.hashed_password = get_password_hash(password)
            db.add(u)
            db.commit()
            db.refresh(u)
            return u
        # otherwise fail authentication
        return None

def create_session_token(email: str, expires_days: int = None) -> str:
    if expires_days is None:
        expires_days = settings.ACCESS_TOKEN_EXPIRE_DAYS
    expire = datetime.now(timezone.utc) + timedelta(days=expires_days)
    to_encode = {"sub": email, "exp": int(expire.timestamp())}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_current_user_from_request(request: Request, db: Session) -> Optional[models.User]:
    # Try to get token from Authorization header first (Bearer token)
    auth_header = request.headers.get("Authorization")
    token = None
    
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    else:
        # Fallback to cookie-based authentication
        token = request.cookies.get(settings.SESSION_COOKIE)
    
    if not token:
        return None
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        if not email:
            return None
    except JWTError:
        return None
    user = db.query(models.User).filter(models.User.email == email).first()
    return user


def create_password_reset_token(db: Session, email: str) -> Optional[str]:
    """Create a password reset token for the given email"""
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return None
    
    # Generate a secure random token
    token = secrets.token_urlsafe(32)
    
    # Set expiration time
    expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.PASSWORD_RESET_TOKEN_EXPIRE_HOURS)
    
    # Create token record
    reset_token = models.PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )
    
    # Invalidate any existing tokens for this user
    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.user_id == user.id,
        models.PasswordResetToken.used == False
    ).update({"used": True})
    
    db.add(reset_token)
    db.commit()
    
    logger.info(f"Password reset token created for user {email}")
    return token


def verify_password_reset_token(db: Session, token: str) -> Optional[models.User]:
    """Verify a password reset token and return the associated user"""
    reset_token = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == token,
        models.PasswordResetToken.used == False,
        models.PasswordResetToken.expires_at > datetime.now(timezone.utc)
    ).first()
    
    if not reset_token:
        return None
    
    return reset_token.user


def use_password_reset_token(db: Session, token: str) -> bool:
    """Mark a password reset token as used"""
    reset_token = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == token,
        models.PasswordResetToken.used == False
    ).first()
    
    if not reset_token:
        return False
    
    reset_token.used = True
    db.commit()
    return True


def reset_user_password(db: Session, token: str, new_password: str) -> bool:
    """Reset a user's password using a valid token"""
    user = verify_password_reset_token(db, token)
    if not user:
        return False
    
    # Update password
    user.hashed_password = get_password_hash(new_password)
    
    # Mark token as used
    use_password_reset_token(db, token)
    
    db.commit()
    logger.info(f"Password reset successfully for user {user.email}")
    return True