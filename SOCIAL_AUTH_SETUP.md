# Social Authentication Setup Guide (Mobile)

This guide explains how to set up social authentication for your mobile application.

## Overview

Instead of OAuth flow, this implementation uses a simple API endpoint where the mobile app sends user information (name, email, provider) and the backend creates/updates the user account with a generated password.

## Database Schema

The social authentication fields have been added to the User table:

- `socialProvider`: The social login provider (GOOGLE, FACEBOOK, etc.)
- `profileImage`: URL to the user's profile image from the social provider

## API Endpoint

### Social Registration

**POST** `/auth/social-register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "provider": "GOOGLE",
  "profileImage": "https://example.com/profile.jpg"
}
```

**Response:**
```json
{
  "access_token": "jwt_access_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "socialProvider": "GOOGLE",
    "profileImage": "https://example.com/profile.jpg",
    "isEmailVerified": true,
    "role": "USER",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## How It Works

1. **Mobile App**: Collects user information from social login (Google, Facebook, etc.)
2. **API Call**: Sends POST request to `/auth/social-register` with user data
3. **Backend Processing**:
   - Checks if user exists by email
   - If user exists: links social account and returns JWT tokens
   - If new user: creates account with generated password and social provider info
4. **Response**: Returns JWT access token and user information

## User Account Linking

- If a user with the same email already exists, the social account is linked
- Social login users are automatically marked as email verified
- Users can have both password and social login methods
- A random password is generated for social users (they can't login with it directly)

## Supported Providers

- `GOOGLE`
- `FACEBOOK`
- `LINKEDIN`
- `GITHUB`

## Mobile Integration Example

### React Native / Flutter
```javascript
// After getting user info from Google Sign-In
const socialRegister = async (userInfo) => {
  try {
    const response = await fetch('/auth/social-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userInfo.email,
        firstName: userInfo.givenName,
        lastName: userInfo.familyName,
        provider: 'GOOGLE',
        profileImage: userInfo.photoURL,
      }),
    });
    
    const result = await response.json();
    // Store access_token and user info
    // Navigate to main app
  } catch (error) {
    console.error('Social registration failed:', error);
  }
};
```

## Security Considerations

- The generated password is not exposed to the client
- Social users are automatically email verified
- JWT tokens provide secure authentication
- Use HTTPS in production
- Validate input data on both client and server

## Database Migration

Run the migration to update your database:

```bash
npx prisma migrate dev
```

## Testing

You can test the endpoint using tools like Postman or curl:

```bash
curl -X POST http://localhost:3001/auth/social-register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "provider": "GOOGLE",
    "profileImage": "https://example.com/avatar.jpg"
  }'
```

## Benefits of This Approach

1. **Simple**: No complex OAuth flow implementation
2. **Mobile-Friendly**: Easy to integrate with mobile social SDKs
3. **Flexible**: Works with any social provider
4. **Secure**: Generates secure passwords automatically
5. **Consistent**: Uses same JWT authentication as regular users
