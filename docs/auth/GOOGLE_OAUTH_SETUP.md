# Google OAuth Setup Instructions

This guide will help you set up Google OAuth authentication for your Resume Scanner application.

## Prerequisites

- Google Cloud Console account
- Access to create OAuth 2.0 credentials

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Resume Scanner OAuth"
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on "Google+ API" and click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in required fields:
     - App name: "Resume Scanner"
     - User support email: your email
     - Developer contact: your email
   - Add scopes: `openid`, `email`, `profile`
   - Add test users (your email for testing)

4. Create OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Name: "Resume Scanner Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:5173` (if using Vite dev server)
   - Authorized redirect URIs:
     - `http://localhost:3000`
     - `http://localhost:3000/auth/google/callback`

5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Environment Variables

### Frontend Configuration

Update `frontend/.env.local`:

```env
VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
VITE_API_URL=http://localhost:8000
```

### Backend Configuration

Update `backend/.env`:

```env
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
```

## Step 5: Test the Implementation

1. Start both frontend and backend servers:
   ```bash
   yarn dev
   ```

2. Go to `http://localhost:3000/login`
3. Click "Continue with Google"
4. Complete the Google OAuth flow
5. You should be redirected to the dashboard upon successful authentication

## Troubleshooting

### Common Issues

1. **"Invalid client" error**:
   - Check that your Client ID is correct
   - Ensure the redirect URI matches exactly

2. **"Redirect URI mismatch" error**:
   - Add the exact redirect URI to your Google Cloud Console
   - Check for trailing slashes and protocol (http vs https)

3. **"Access blocked" error**:
   - Make sure your app is in "Testing" mode
   - Add your email as a test user
   - Or publish your app for production use

4. **CORS errors**:
   - Ensure your backend CORS settings include `http://localhost:3000`
   - Check that the API endpoints are accessible

### Development vs Production

For production deployment:

1. Update authorized origins and redirect URIs to your production domain
2. Consider using environment-specific OAuth credentials
3. Update the redirect URI in the backend code to match your production URL

## Security Notes

- Never commit your Client Secret to version control
- Use environment variables for all sensitive configuration
- Consider using different OAuth credentials for development and production
- Regularly rotate your OAuth credentials

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
