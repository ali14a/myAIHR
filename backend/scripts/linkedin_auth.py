import os
import json
import requests
from sqlalchemy.orm import Session
from . import models, auth
from .config import settings
import logging

logger = logging.getLogger("resume_app.linkedin_auth")

class LinkedInAuthService:
    def __init__(self):
        self.client_id = os.getenv('LINKEDIN_CLIENT_ID')
        self.client_secret = os.getenv('LINKEDIN_CLIENT_SECRET')
        
        if not self.client_id or not self.client_secret:
            logger.warning("LinkedIn OAuth credentials not configured")
    
    def exchange_code_for_token(self, code: str, redirect_uri: str) -> dict:
        """
        Exchange authorization code for access token
        """
        # Check if credentials are configured
        if not self.client_id or not self.client_secret:
            logger.error("LinkedIn OAuth credentials not configured")
            raise ValueError("LinkedIn OAuth credentials not configured. Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in your environment variables.")
        
        if self.client_id == "REPLACE_WITH_YOUR_ACTUAL_LINKEDIN_CLIENT_ID" or self.client_secret == "REPLACE_WITH_YOUR_ACTUAL_LINKEDIN_CLIENT_SECRET":
            logger.error("LinkedIn OAuth credentials are still set to placeholder values")
            raise ValueError("LinkedIn OAuth credentials are not properly configured. Please replace the placeholder values with your actual LinkedIn OAuth credentials from LinkedIn Developer Portal.")
        
        try:
            token_url = "https://www.linkedin.com/oauth/v2/accessToken"
            data = {
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': redirect_uri,
                'client_id': self.client_id,
                'client_secret': self.client_secret
            }
            
            response = requests.post(token_url, data=data)
            response.raise_for_status()
            
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Failed to exchange LinkedIn code for token: {e}")
            if "400" in str(e):
                raise ValueError("Invalid LinkedIn OAuth credentials or authorization code. Please check your LinkedIn Developer Portal configuration.")
            raise ValueError("Failed to exchange authorization code")
    
    def get_user_info_from_token(self, access_token: str) -> dict:
        """
        Get user information from LinkedIn access token
        """
        try:
            # Get user information using the new LinkedIn API
            # For openid profile email scopes, we use the userinfo endpoint
            userinfo_url = "https://api.linkedin.com/v2/userinfo"
            headers = {'Authorization': f'Bearer {access_token}'}
            
            userinfo_response = requests.get(userinfo_url, headers=headers)
            userinfo_response.raise_for_status()
            user_data = userinfo_response.json()
            
            # Extract information from the response
            email = user_data.get('email', '')
            first_name = user_data.get('given_name', '')
            last_name = user_data.get('family_name', '')
            profile_picture = user_data.get('picture', '')
            linkedin_id = user_data.get('sub', '')  # sub is the user ID in OpenID Connect
            
            return {
                'id': linkedin_id,
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'name': f"{first_name} {last_name}".strip(),
                'picture': profile_picture,
                'linkedin_id': linkedin_id
            }
        except requests.RequestException as e:
            logger.error(f"Failed to get LinkedIn user info: {e}")
            raise ValueError("Failed to retrieve user information from LinkedIn")
        except Exception as e:
            logger.error(f"Unexpected error getting LinkedIn user info: {e}")
            raise ValueError("Failed to process LinkedIn user information")
    
    def get_user_info_from_code(self, code: str, redirect_uri: str) -> dict:
        """
        Get user information from authorization code
        """
        try:
            # Exchange code for token
            token_data = self.exchange_code_for_token(code, redirect_uri)
            access_token = token_data.get('access_token')
            
            if not access_token:
                raise ValueError("No access token received from LinkedIn")
            
            # Get user info from LinkedIn
            return self.get_user_info_from_token(access_token)
        except Exception as e:
            logger.error(f"Failed to get LinkedIn user info from code: {e}")
            raise
    
    def find_or_create_user(self, db: Session, linkedin_user_data: dict) -> models.User:
        """
        Find existing user or create new user from LinkedIn data
        """
        try:
            # Handle case where email might not be available
            email = linkedin_user_data.get('email')
            if not email:
                # Use LinkedIn ID as email if email is not available
                email = f"linkedin_{linkedin_user_data.get('linkedin_id', 'unknown')}@linkedin.local"
                logger.warning(f"No email available, using LinkedIn ID as email: {email}")
            
            # Try to find user by email first
            user = db.query(models.User).filter(models.User.email == email).first()
            
            if user:
                # Update existing user with LinkedIn data if needed
                if not user.first_name and linkedin_user_data.get('first_name'):
                    user.first_name = linkedin_user_data['first_name']
                if not user.last_name and linkedin_user_data.get('last_name'):
                    user.last_name = linkedin_user_data['last_name']
                if not user.profile_photo and linkedin_user_data.get('picture'):
                    user.profile_photo = linkedin_user_data['picture']
                if not user.linkedin_url:
                    user.linkedin_url = f"https://www.linkedin.com/in/{linkedin_user_data.get('linkedin_id', '')}"
                
                db.commit()
                db.refresh(user)
                return user
            
            # Create new user
            user = models.User(
                email=email,
                first_name=linkedin_user_data.get('first_name', ''),
                last_name=linkedin_user_data.get('last_name', ''),
                profile_photo=linkedin_user_data.get('picture'),
                linkedin_url=f"https://www.linkedin.com/in/{linkedin_user_data.get('linkedin_id', '')}",
                hashed_password="linkedin_oauth_user"  # Placeholder password for OAuth users
            )
            
            db.add(user)
            db.commit()
            db.refresh(user)
            
            logger.info(f"Created new user from LinkedIn: {user.email}")
            return user
            
        except Exception as e:
            logger.error(f"Failed to find or create user from LinkedIn data: {e}")
            db.rollback()
            raise ValueError("Failed to create or update user account")

# Create global instance
linkedin_auth_service = LinkedInAuthService()
