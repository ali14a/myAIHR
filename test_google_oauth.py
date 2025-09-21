#!/usr/bin/env python3
"""
Test script to verify Google OAuth functionality
"""
import os
import sys
import requests
import json

# Add backend to path
sys.path.append('backend')

def test_google_oauth_setup():
    """Test Google OAuth configuration"""
    print("🔍 Testing Google OAuth Setup...")
    
    # Check environment variables
    client_id = os.getenv('VITE_GOOGLE_CLIENT_ID', 'Not set')
    client_secret = os.getenv('VITE_GOOGLE_CLIENT_SECRET', 'Not set')
    
    print(f"✅ Frontend Client ID: {client_id[:20]}..." if client_id != 'Not set' else "❌ Frontend Client ID: Not set")
    print(f"✅ Frontend Client Secret: {client_secret[:20]}..." if client_secret != 'Not set' else "❌ Frontend Client Secret: Not set")
    
    # Check backend environment
    backend_client_id = os.getenv('GOOGLE_CLIENT_ID', 'Not set')
    backend_client_secret = os.getenv('GOOGLE_CLIENT_SECRET', 'Not set')
    
    print(f"✅ Backend Client ID: {backend_client_id[:20]}..." if backend_client_id != 'Not set' else "❌ Backend Client ID: Not set")
    print(f"✅ Backend Client Secret: {backend_client_secret[:20]}..." if backend_client_secret != 'Not set' else "❌ Backend Client Secret: Not set")

def test_backend_health():
    """Test if backend is responding"""
    print("\n🔍 Testing Backend Health...")
    try:
        response = requests.get('http://localhost:8000/health', timeout=5)
        if response.status_code == 200:
            print("✅ Backend is responding")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not responding (Connection refused)")
        return False
    except Exception as e:
        print(f"❌ Backend error: {e}")
        return False

def test_google_oauth_endpoint():
    """Test Google OAuth endpoint"""
    print("\n🔍 Testing Google OAuth Endpoint...")
    try:
        # Test with invalid code (should return error)
        test_data = {
            "code": "invalid_test_code",
            "redirect_uri": "http://localhost:3000"
        }
        
        response = requests.post(
            'http://localhost:8000/api/auth/google',
            json=test_data,
            timeout=10
        )
        
        print(f"✅ Google OAuth endpoint is accessible (Status: {response.status_code})")
        print(f"   Response: {response.json()}")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Google OAuth endpoint not accessible (Backend not running)")
        return False
    except Exception as e:
        print(f"❌ Google OAuth endpoint error: {e}")
        return False

def test_frontend_google_auth_service():
    """Test frontend Google auth service"""
    print("\n🔍 Testing Frontend Google Auth Service...")
    
    # Check if the service file exists and is valid
    service_file = 'frontend/src/services/googleAuthService.ts'
    if os.path.exists(service_file):
        print("✅ Google Auth Service file exists")
        
        # Check if it has the required methods
        with open(service_file, 'r') as f:
            content = f.read()
            
        if 'signIn' in content:
            print("✅ signIn method found")
        else:
            print("❌ signIn method not found")
            
        if 'initializeGoogleAuth' in content:
            print("✅ initializeGoogleAuth method found")
        else:
            print("❌ initializeGoogleAuth method not found")
            
        return True
    else:
        print("❌ Google Auth Service file not found")
        return False

def main():
    """Main test function"""
    print("🚀 Google OAuth Test Suite")
    print("=" * 50)
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv('frontend/.env.local')
    load_dotenv('backend/.env')
    
    # Run tests
    test_google_oauth_setup()
    backend_healthy = test_backend_health()
    test_google_oauth_endpoint() if backend_healthy else None
    test_frontend_google_auth_service()
    
    print("\n" + "=" * 50)
    print("🎯 Test Summary:")
    print("1. Check your Google Cloud Console configuration")
    print("2. Ensure OAuth client is set to 'Web application'")
    print("3. Add authorized origins: http://localhost:3000")
    print("4. Add redirect URIs: http://localhost:3000")
    print("5. Update environment variables with correct credentials")
    print("6. Restart both frontend and backend servers")
    print("\n📖 For detailed setup instructions, see: GOOGLE_OAUTH_SETUP.md")

if __name__ == "__main__":
    main()

