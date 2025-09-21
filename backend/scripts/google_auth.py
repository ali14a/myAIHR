import os
import json
import requests
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy.orm import Session
from . import models, auth
from .config import settings
import logging

logger = logging.getLogger("resume_app.google_auth")

class GoogleAuthService:
    def __init__(self):
        self.client_id = os.getenv('GOOGLE_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        
        if not self.client_id or not self.client_secret:
            logger.warning("Google OAuth credentials not configured")
    
    def verify_google_token(self, token: str) -> dict:
        """
        Verify Google ID token and return user information
        """
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                self.client_id
            )
            
            # Verify the issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')
            
            return {
                'google_id': idinfo['sub'],
                'email': idinfo['email'],
                'name': idinfo.get('name', ''),
                'given_name': idinfo.get('given_name', ''),
                'family_name': idinfo.get('family_name', ''),
                'picture': idinfo.get('picture', ''),
                'email_verified': idinfo.get('email_verified', False)
            }
        except ValueError as e:
            logger.error(f"Google token verification failed: {e}")
            raise ValueError("Invalid Google token")
        except Exception as e:
            logger.error(f"Unexpected error during Google token verification: {e}")
            raise ValueError("Google authentication failed")
    
    def exchange_code_for_token(self, code: str, redirect_uri: str) -> dict:
        """
        Exchange authorization code for access token
        """
        # Check if credentials are configured
        if not self.client_id or not self.client_secret:
            logger.error("Google OAuth credentials not configured")
            raise ValueError("Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment variables.")
        
        if self.client_id == "REPLACE_WITH_YOUR_ACTUAL_CLIENT_ID" or self.client_secret == "REPLACE_WITH_YOUR_ACTUAL_CLIENT_SECRET":
            logger.error("Google OAuth credentials are still set to placeholder values")
            raise ValueError("Google OAuth credentials are not properly configured. Please replace the placeholder values with your actual Google OAuth credentials from Google Cloud Console.")
        
        try:
            token_url = "https://oauth2.googleapis.com/token"
            data = {
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': redirect_uri
            }
            
            response = requests.post(token_url, data=data)
            response.raise_for_status()
            
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Failed to exchange code for token: {e}")
            if "400" in str(e):
                raise ValueError("Invalid Google OAuth credentials or authorization code. Please check your Google Cloud Console configuration.")
            raise ValueError("Failed to exchange authorization code")
    
    def get_user_info_from_code(self, code: str, redirect_uri: str) -> dict:
        """
        Get user information from authorization code
        """
        try:
            # Exchange code for token
            token_data = self.exchange_code_for_token(code, redirect_uri)
            access_token = token_data.get('access_token')
            
            if not access_token:
                raise ValueError("No access token received")
            
            # Get user info from Google
            user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            headers = {'Authorization': f'Bearer {access_token}'}
            
            response = requests.get(user_info_url, headers=headers)
            response.raise_for_status()
            
            user_data = response.json()
            
            return {
                'google_id': user_data.get('id'),
                'email': user_data.get('email'),
                'name': user_data.get('name', ''),
                'given_name': user_data.get('given_name', ''),
                'family_name': user_data.get('family_name', ''),
                'picture': user_data.get('picture', ''),
                'email_verified': user_data.get('verified_email', False)
            }
        except requests.RequestException as e:
            logger.error(f"Failed to get user info from Google: {e}")
            raise ValueError("Failed to get user information from Google")
    
    def find_or_create_user(self, db: Session, google_user_data: dict) -> models.User:
        """
        Find existing user by email or create new user from Google data
        """
        try:
            # First, try to find user by email
            user = db.query(models.User).filter(
                models.User.email == google_user_data['email']
            ).first()
            
            if user:
                # Update user with Google data if needed
                if not user.first_name and google_user_data.get('given_name'):
                    user.first_name = google_user_data['given_name']
                if not user.last_name and google_user_data.get('family_name'):
                    user.last_name = google_user_data['family_name']
                if not user.profile_photo and google_user_data.get('picture'):
                    user.profile_photo = google_user_data['picture']
                
                db.commit()
                return user
            
            # Create new user
            # Generate a random password since Google users don't have passwords
            import secrets
            random_password = secrets.token_urlsafe(32)
            
            user = models.User(
                email=google_user_data['email'],
                hashed_password=auth.get_password_hash(random_password),
                first_name=google_user_data.get('given_name'),
                last_name=google_user_data.get('family_name'),
                profile_photo=google_user_data.get('picture')
            )
            
            db.add(user)
            db.commit()
            db.refresh(user)
            
            logger.info(f"Created new user from Google: {user.email}")
            return user
            
        except Exception as e:
            logger.error(f"Error finding or creating user: {e}")
            db.rollback()
            raise ValueError("Failed to create or find user")

# Global instance
google_auth_service = GoogleAuthService()
