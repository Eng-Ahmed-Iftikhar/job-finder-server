# Users Resource Module

A comprehensive CRUD resource module for managing users, profiles, and phone numbers in the job-finder application.

## 🏗️ **Module Structure**

```
src/users/
├── users.module.ts          # Module definition
├── users.service.ts         # Business logic
├── users.controller.ts      # API endpoints
├── dto/                     # Data Transfer Objects
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   ├── create-profile.dto.ts
│   ├── update-profile.dto.ts
│   └── create-phone-number.dto.ts
└── README.md               # This file
```

## 🚀 **Features**

### **User Management**

- ✅ Create, Read, Update, Delete users
- ✅ User authentication and authorization
- ✅ Role-based access control (USER, ADMIN)
- ✅ Email verification status
- ✅ Account activation status

### **Profile Management**

- ✅ Create, Read, Update, Delete user profiles
- ✅ Location information (city, state, country, address)
- ✅ Profile picture and resume URLs
- ✅ One-to-one relationship with users

### **Phone Number Management**

- ✅ Add, Update, Delete phone numbers
- ✅ Country code support
- ✅ Verification status tracking
- ✅ Multiple phone numbers per user

### **Advanced Features**

- ✅ User search functionality
- ✅ User statistics and analytics
- ✅ Admin-only operations
- ✅ Comprehensive error handling

## 🔐 **Authentication & Authorization**

All endpoints require JWT authentication. Some endpoints require admin privileges.

### **Public Endpoints**

- None (all require authentication)

### **User Endpoints** (requires USER role)

- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user
- `POST /users/me/profile` - Create profile
- `GET /users/me/profile` - Get current user profile
- `PUT /users/me/profile` - Update current user profile
- `DELETE /users/me/profile` - Delete current user profile
- `POST /users/me/phone-numbers` - Add phone number
- `GET /users/me/phone-numbers` - Get phone numbers
- `PUT /users/me/phone-numbers/:id` - Update phone number
- `DELETE /users/me/phone-numbers/:id` - Delete phone number

### **Admin Endpoints** (requires ADMIN role)

- `POST /users` - Create new user
- `GET /users` - Get all users
- `GET /users/stats` - Get user statistics
- `GET /users/search` - Search users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user by ID
- `DELETE /users/:id` - Delete user by ID
- `GET /users/:id/profile` - Get user profile
- `PUT /users/:id/profile` - Update user profile
- `DELETE /users/:id/profile` - Delete user profile
- `GET /users/:id/phone-numbers` - Get user phone numbers

## 📋 **API Endpoints**

### **User Endpoints**

#### `POST /users` (Admin only)

Create a new user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER",
  "socialProvider": "EMAIL"
}
```

#### `GET /users` (Admin only)

Get all users with their profiles.

#### `GET /users/stats` (Admin only)

Get user statistics.

**Response:**

```json
{
  "totalUsers": 100,
  "activeUsers": 95,
  "verifiedUsers": 90,
  "usersWithProfiles": 85,
  "usersWithoutProfiles": 15
}
```

#### `GET /users/search?q=query` (Admin only)

Search users by email, firstName, or lastName.

#### `GET /users/me`

Get current authenticated user profile.

#### `PUT /users/me`

Update current authenticated user.

**Request Body:**

```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "email": "newemail@example.com"
}
```

#### `GET /users/:id` (Admin only)

Get user by ID.

#### `PUT /users/:id` (Admin only)

Update user by ID.

#### `DELETE /users/:id` (Admin only)

Delete user by ID.

### **Profile Endpoints**

#### `POST /users/me/profile`

Create profile for current user.

**Request Body:**

```json
{
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "address": "123 Main St",
  "pictureUrl": "https://example.com/pic.jpg",
  "resumeUrl": "https://example.com/resume.pdf"
}
```

#### `GET /users/me/profile`

Get current user profile.

#### `PUT /users/me/profile`

Update current user profile.

#### `DELETE /users/me/profile`

Delete current user profile.

### **Phone Number Endpoints**

#### `POST /users/me/phone-numbers`

Add phone number to current user.

**Request Body:**

```json
{
  "countryCode": "+1",
  "number": "5551234567"
}
```

#### `GET /users/me/phone-numbers`

Get current user phone numbers.

#### `PUT /users/me/phone-numbers/:phoneNumberId`

Update phone number.

**Request Body:**

```json
{
  "countryCode": "+1",
  "number": "5559876543",
  "isVerified": true
}
```

#### `DELETE /users/me/phone-numbers/:phoneNumberId`

Delete phone number.

## 🗄️ **Database Schema**

### **User Model**

```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  password        String?
  firstName       String?
  lastName        String?
  role            UserRole @default(USER)
  socialProvider  SocialProvider @default(EMAIL)
  isActive        Boolean  @default(true)
  isEmailVerified Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  profile         Profile?
  phoneNumbers    UserPhoneNumber[]
  verificationCodes VerificationCode[]
}
```

### **Profile Model**

```prisma
model Profile {
  id          String   @id @default(cuid())
  userId      String   @unique
  city        String?
  state       String?
  country     String?
  address     String?
  pictureUrl  String?
  resumeUrl   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  phoneNumbers UserPhoneNumber[]
}
```

### **UserPhoneNumber Model**

```prisma
model UserPhoneNumber {
  id          String   @id @default(cuid())
  userId      String
  profileId   String
  countryCode String
  number      String
  isVerified  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
}
```

## 🔧 **Usage Examples**

### **Creating a User with Profile**

```typescript
// 1. Create user
const user = await usersService.createUser({
  email: 'john@example.com',
  password: 'securepassword',
  firstName: 'John',
  lastName: 'Doe',
});

// 2. Create profile
const profile = await usersService.createProfile(user.id, {
  city: 'New York',
  state: 'NY',
  country: 'USA',
  address: '123 Main St',
});

// 3. Add phone number
const phoneNumber = await usersService.addPhoneNumber(user.id, {
  countryCode: '+1',
  number: '5551234567',
});
```

### **Updating User Information**

```typescript
// Update user
const updatedUser = await usersService.updateUser(userId, {
  firstName: 'Updated',
  lastName: 'Name',
});

// Update profile
const updatedProfile = await usersService.updateProfile(userId, {
  city: 'Los Angeles',
  state: 'CA',
});
```

### **Searching Users**

```typescript
// Search users
const searchResults = await usersService.searchUsers('john');
```

## 🚨 **Error Handling**

The service includes comprehensive error handling:

- **NotFoundException**: When user/profile/phone number not found
- **ConflictException**: When email/phone number already exists
- **BadRequestException**: When validation fails
- **UnauthorizedException**: When authentication fails
- **ForbiddenException**: When authorization fails

## 📊 **Performance Considerations**

- **Selective Queries**: Uses Prisma's `select` to fetch only needed fields
- **Eager Loading**: Includes related data when needed
- **Pagination**: Search results are limited to 20 items
- **Indexing**: Database indexes on frequently queried fields

## 🔒 **Security Features**

- **JWT Authentication**: All endpoints require valid JWT tokens
- **Role-Based Access**: Different endpoints for users vs admins
- **Input Validation**: DTOs with class-validator decorators
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **Password Hashing**: bcrypt with salt rounds of 12

## 🧪 **Testing**

The module includes comprehensive testing:

- **Unit Tests**: Service method testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: CRUD operation verification

## 📝 **Dependencies**

- **@nestjs/common**: NestJS core functionality
- **@nestjs/swagger**: API documentation
- **class-validator**: Input validation
- **bcryptjs**: Password hashing
- **@prisma/client**: Database ORM

## 🚀 **Getting Started**

1. **Import Module**: Add `UsersModule` to your `AppModule`
2. **Configure Guards**: Ensure JWT and Roles guards are configured
3. **Set Up Database**: Run Prisma migrations
4. **Test Endpoints**: Use the provided test scripts

## 📚 **Additional Resources**

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Class Validator](https://github.com/typestack/class-validator)
- [Swagger Documentation](https://swagger.io/docs/)
