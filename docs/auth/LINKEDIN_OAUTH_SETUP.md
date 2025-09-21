# LinkedIn OAuth Setup Instructions

This guide will help you set up LinkedIn OAuth authentication for your Resume Scanner application.

## Prerequisites

- LinkedIn Developer account
- Access to create LinkedIn applications
- LinkedIn Page (can be created during app setup)

## Step 1: Create LinkedIn Application

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Click "Create app"
3. Fill in the required details:
   - **App name**: "Resume Scanner"
   - **LinkedIn Page**: Associate your app with a LinkedIn Page (create one if needed)
   - **Privacy Policy URL**: Provide a link to your application's privacy policy
   - **Logo**: Upload a logo for your application
4. Agree to the terms and click "Create app"

## Step 2: Verify Your Application

1. After creating the app, you'll need to verify the LinkedIn Page associated with it
2. Click on the "Verify" button and follow the instructions to complete the verification process

## Step 3: Add "Sign In with LinkedIn" Product

1. In your application's dashboard, go to the "Products" tab
2. Find "Sign In with LinkedIn" and click "Select"
3. Agree to the terms and add the product to your application

## Step 4: Configure OAuth 2.0 Settings

1. Navigate to the "Auth" tab in your application's dashboard
2. Under "OAuth 2.0 settings":
   - **Authorized Redirect URLs**: Add the following URLs:
     - `http://localhost:3000` (for frontend development)
     - `http://localhost:8000` (for backend development)
     - `https://yourdomain.com` (for production)
3. Note down your **Client ID** and **Client Secret** from the "Application credentials" section

## Step 5: Configure Environment Variables

### Backend Configuration

Update your `.env` file with LinkedIn OAuth credentials:

```env
# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID=your_actual_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_actual_linkedin_client_secret_here
```

### Frontend Configuration

The frontend will automatically use the same credentials:

```env
# Frontend LinkedIn OAuth (same as backend)
VITE_LINKEDIN_CLIENT_ID=your_actual_linkedin_client_id_here
VITE_LINKEDIN_CLIENT_SECRET=your_actual_linkedin_client_secret_here
```

## Step 6: Test the Implementation

1. Start both frontend and backend servers:
   ```bash
   yarn fresh-start
   ```

2. Go to `http://localhost:3000/login`
3. Click "Continue with LinkedIn"
4. Complete the LinkedIn OAuth flow
5. You should be redirected back to your application and logged in

## Quick Setup Script

You can use the provided setup script to configure LinkedIn OAuth credentials:

```bash
yarn setup-linkedin
```

This interactive script will guide you through entering your LinkedIn OAuth credentials.

## LinkedIn OAuth Flow

The implementation follows LinkedIn's OAuth 2.0 flow:

1. **Authorization Request**: User clicks "Continue with LinkedIn" button
2. **Redirect to LinkedIn**: User is redirected to LinkedIn's authorization page
3. **User Authorization**: User grants permissions to your application
4. **Authorization Code**: LinkedIn redirects back with an authorization code
5. **Token Exchange**: Backend exchanges the code for an access token
6. **User Info Retrieval**: Backend fetches user information from LinkedIn API
7. **User Creation/Login**: Backend creates or finds user account and returns session token

## API Endpoints

### Backend Endpoints

- `POST /api/auth/linkedin` - LinkedIn OAuth login endpoint
- `POST /auth/linkedin` - Alternative endpoint (without /api prefix)

### Request Format

```json
{
  "code": "authorization_code_from_linkedin",
  "redirect_uri": "http://localhost:3000"
}
```

### Response Format

```json
{
  "success": true,
  "token": "session_token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "profile_photo": "https://linkedin-profile-photo-url",
    "linkedin_url": "https://www.linkedin.com/in/user-profile",
    "updated_at": "2025-09-21T10:00:00Z"
  },
  "message": "LinkedIn login successful"
}
```

## LinkedIn API Permissions

The implementation requests the following LinkedIn API permissions:

- `r_liteprofile` - Access to basic profile information
- `r_emailaddress` - Access to user's email address

## Troubleshooting

### Common Issues

1. **"LinkedIn OAuth credentials not configured"**
   - Ensure you've set `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET` in your `.env` file
   - Restart your servers after updating environment variables

2. **"Invalid LinkedIn OAuth credentials"**
   - Verify your Client ID and Client Secret are correct
   - Check that your LinkedIn app is properly configured

3. **"Redirect URI mismatch"**
   - Ensure your redirect URIs in LinkedIn Developer Portal match your application URLs
   - Add both `http://localhost:3000` and `http://localhost:8000` for development

4. **"Failed to retrieve user information"**
   - Check that you've added the "Sign In with LinkedIn" product to your app
   - Verify your app has the required permissions

### Debug Mode

Enable debug logging by setting the log level in your `.env` file:

```env
LOG_LEVEL=DEBUG
```

This will provide detailed information about the OAuth flow in your backend logs.

## Security Considerations

1. **Client Secret**: Never expose your LinkedIn Client Secret in frontend code
2. **Redirect URIs**: Only use HTTPS redirect URIs in production
3. **State Parameter**: The implementation includes CSRF protection via state parameter
4. **Token Storage**: Store session tokens securely and implement proper logout

## Production Deployment

For production deployment:

1. Update redirect URIs to use your production domain
2. Use HTTPS for all redirect URIs
3. Set up proper environment variable management
4. Monitor OAuth flow for any issues
5. Implement proper error handling and logging

## Support

If you encounter issues with LinkedIn OAuth setup:

1. Check the [LinkedIn Developer Documentation](https://docs.microsoft.com/en-us/linkedin/)
2. Review the [LinkedIn OAuth 2.0 Guide](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)
3. Check your application's error logs
4. Verify your LinkedIn app configuration

## Integration with Existing Features

The LinkedIn OAuth implementation integrates seamlessly with:

- User profile management
- Resume scanning and analysis
- Job matching features
- All existing authentication features

Users can log in with LinkedIn and access all the same features as email/password users.
