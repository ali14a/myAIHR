#!/bin/bash

# Google OAuth Setup Helper Script
# This script helps you configure Google OAuth credentials

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${PURPLE}[GOOGLE OAUTH SETUP]${NC} $1"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header "Google OAuth Setup Helper"
echo ""

print_status "This script will help you configure Google OAuth credentials."
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found. Please run 'yarn setup' first."
    exit 1
fi

print_status "Current Google OAuth configuration:"
echo ""
grep -E "GOOGLE_CLIENT|VITE_GOOGLE_CLIENT" .env || echo "No Google OAuth credentials found"
echo ""

print_warning "To fix the 'Failed to exchange authorization code' error, you need to:"
echo ""
echo "1. Go to Google Cloud Console: https://console.cloud.google.com/"
echo "2. Create a new project or select existing one"
echo "3. Enable Google+ API:"
echo "   - Go to 'APIs & Services' → 'Library'"
echo "   - Search for 'Google+ API' or 'Google Identity'"
echo "   - Click 'Enable'"
echo "4. Create OAuth 2.0 Credentials:"
echo "   - Go to 'APIs & Services' → 'Credentials'"
echo "   - Click 'Create Credentials' → 'OAuth 2.0 Client IDs'"
echo "   - Choose 'Web application'"
echo "   - Add authorized redirect URIs:"
echo "     - http://localhost:3000 (for frontend)"
echo "     - http://localhost:8000 (for backend)"
echo ""

read -p "Do you have your Google OAuth credentials ready? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    print_status "Please enter your Google OAuth credentials:"
    echo ""
    
    read -p "Enter your Google Client ID: " GOOGLE_CLIENT_ID
    read -p "Enter your Google Client Secret: " GOOGLE_CLIENT_SECRET
    
    if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
        print_error "Both Client ID and Client Secret are required."
        exit 1
    fi
    
    # Update .env file
    print_status "Updating .env file with your credentials..."
    
    # Remove existing Google OAuth lines
    sed -i.bak '/GOOGLE_CLIENT_ID=/d' .env
    sed -i.bak '/GOOGLE_CLIENT_SECRET=/d' .env
    sed -i.bak '/VITE_GOOGLE_CLIENT_ID=/d' .env
    sed -i.bak '/VITE_GOOGLE_CLIENT_SECRET=/d' .env
    
    # Add new credentials
    echo "" >> .env
    echo "# Google OAuth Configuration" >> .env
    echo "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID" >> .env
    echo "GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET" >> .env
    echo "VITE_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID" >> .env
    echo "VITE_GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET" >> .env
    
    print_success "Google OAuth credentials updated!"
    echo ""
    print_status "Now restart your servers:"
    echo "  yarn fresh-start"
    echo ""
    print_status "Or restart manually:"
    echo "  yarn fresh-stop"
    echo "  yarn dev"
    
else
    echo ""
    print_status "Please follow the steps above to get your Google OAuth credentials."
    print_status "Then run this script again: ./scripts/setup-google-oauth.sh"
fi

echo ""
print_status "For more detailed instructions, see: GOOGLE_OAUTH_SETUP.md"

