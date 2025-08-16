# Job Finder Server Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Redis server
- npm or yarn package manager

## Environment Setup

1. Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/job_finder_db?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION_TIME="15m"
JWT_REFRESH_EXPIRATION_TIME="7d"

# Remember Me Configuration (Optional - extended token durations)
JWT_REMEMBER_ME_EXPIRATION_TIME="24h"
JWT_REMEMBER_ME_REFRESH_EXPIRATION_TIME="30d"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="noreply@jobfinder.com"

# Frontend
FRONTEND_URL="http://localhost:3000"
APP_URL="http://localhost:3000"

# CORS Configuration (Optional - currently allows all origins)
# CORS_ORIGINS="http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:4200"

# Application
PORT=3000
NODE_ENV=development
```

2. Replace the database credentials with your PostgreSQL setup:
   - `username`: Your PostgreSQL username
   - `password`: Your PostgreSQL password
   - `job_finder_db`: Your database name (create this database first)

3. Configure your app URL for email links:
   - `APP_URL`: Your frontend application URL (used in email reset links)
   - `FRONTEND_URL`: Your frontend URL (used in welcome emails)

4. Ensure Redis server is running:

   ```bash
   # On Windows (if installed via Chocolatey or MSI)
   redis-server

   # On macOS (if installed via Homebrew)
   brew services start redis

   # On Linux
   sudo systemctl start redis
   ```

## Database Setup

1. Create the database in PostgreSQL:

```sql
CREATE DATABASE job_finder_db;
```

2. Run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

3. (Optional) View your database in Prisma Studio:

```bash
npx prisma studio
```

## Running the Application

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npx prisma generate
```

3. Start the development server:

```bash
npm run start:dev
```

## API Documentation

Once the server is running, you can access:

- **API Base URL**: http://localhost:3000/api
- **Swagger Documentation**: http://localhost:3000/docs

## Features Implemented

### Authentication Module

- ✅ User registration with validation
- ✅ User login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ JWT authentication guards
- ✅ Role-based access control
- ✅ Professional error handling
- ✅ Redis-based refresh token management
- ✅ Automatic token refresh on expiration
- ✅ Token blacklisting for secure logout

### Database

- ✅ Prisma ORM setup
- ✅ PostgreSQL integration
- ✅ User model with roles
- ✅ Global Prisma service

### Redis Integration

- ✅ Redis service abstraction
- ✅ Refresh token storage with expiration
- ✅ Token blacklisting capability
- ✅ User session management
- ✅ Development-only logging

### API Documentation

- ✅ Swagger/OpenAPI integration
- ✅ JWT authentication in Swagger
- ✅ Comprehensive API documentation

## Professional Structure

```
src/
├── auth/
│   ├── decorators/          # Custom decorators
│   ├── dto/                 # Data Transfer Objects
│   ├── entities/            # TypeScript entities
│   ├── guards/              # Authentication guards
│   ├── strategies/          # Passport strategies
│   ├── auth.controller.ts   # Auth endpoints
│   ├── auth.module.ts       # Auth module
│   └── auth.service.ts      # Auth business logic
├── prisma/
│   ├── prisma.module.ts     # Global Prisma module
│   └── prisma.service.ts    # Prisma service
└── main.ts                  # Application entry point
```

## Available Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token using existing access token
- `POST /api/auth/logout` - Logout user and invalidate tokens

### Email Verification (Protected Routes)

- `POST /api/auth/verify-email` - Verify email with 6-digit code (requires JWT)
- `POST /api/auth/resend-verification` - Resend email verification code (requires JWT)

### Password Management

- `POST /api/auth/forgot-password` - Request password reset code via email (public)
- `POST /api/auth/reset-password` - Reset password with code (requires JWT)
- `POST /api/auth/change-password` - Change password with current password (requires JWT)

### Health Check

- `GET /api/health` - Application health status

## JWT Token Management

### Access Token

- **Lifetime**: 15 minutes
- **Purpose**: API authentication
- **Storage**: Client-side (localStorage/sessionStorage)

### Refresh Token

- **Lifetime**: 7 days
- **Purpose**: Generate new access tokens
- **Storage**: Redis (server-side) with access token as key

### Token Refresh Flow

1. Client uses access token for API calls
2. When access token expires (401 error), client calls `/api/auth/refresh`
3. Server validates refresh token in Redis
4. If valid, generates new access and refresh tokens
5. Old tokens are invalidated, new tokens stored in Redis
6. Client receives new tokens and continues API calls

### Password Reset Flow

1. **Forgot Password** (Public): User enters email → Server sends reset link via email
2. **Click Reset Link**: Link format: `APP_URL/reset-password?code=123456`
3. **Frontend extracts code**: Frontend gets code from URL query parameter
4. **Get Access Token**: User must login or register to get JWT token
5. **Reset Password** (Protected): User provides JWT token + code + new password
6. **Security**: Only authenticated users can reset passwords (prevents abuse)

### Email Verification Flow

1. **Register**: User registers → Verification code sent via email
2. **Login**: User gets access token from login
3. **Verify**: User calls verify endpoint with JWT token + 6-digit code
4. **Welcome**: Email verified → Welcome email sent automatically

### Password Management Flows

#### Change Password (User knows current password)

1. **Protected Route**: User must be logged in with JWT token
2. **Verification**: Requires current password for security
3. **Validation**: New password must be different from current
4. **Update**: Password changed immediately

#### Reset Password (User forgot password)

1. **Public Request**: User enters email → Reset link sent
2. **Authentication Required**: User must login to get JWT token
3. **Code Verification**: Uses 6-digit code from email link
4. **Security**: Prevents unauthorized password changes
