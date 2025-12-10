# Skills Module

This module provides comprehensive CRUD operations for managing skills and their associations with user profiles.

## Features

- **Skill Management**: Create, read, update, and delete skills
- **Profile Integration**: Add/remove skills to/from user profiles
- **Many-to-Many Relationship**: Skills can be shared across multiple profiles
- **Statistics**: Get skill usage statistics
- **Search**: Search skills by name

## Endpoints

### Global Skills Management (Admin Only)

- `POST /skills` - Create a new skill
- `GET /skills` - Get all skills (with optional search and limit)
- `GET /skills/stats` - Get skill statistics
- `GET /skills/:id` - Get skill by ID
- `PUT /skills/:id` - Update skill by ID
- `DELETE /skills/:id` - Delete skill by ID (only if not in use)

### User Profile Skills

#### Current User

- `GET /users/me/skills` - Get current user's skills
- `POST /users/me/skills` - Add skill to current user's profile
- `DELETE /users/me/skills/:skillId` - Remove skill from current user's profile

#### Admin Operations

- `GET /users/:id/skills` - Get user's skills by user ID
- `POST /users/:id/skills` - Add skill to user's profile
- `DELETE /users/:id/skills/:skillId` - Remove skill from user's profile

## Database Schema

### Skill Model

```prisma
model Skill {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  profileSkills ProfileSkill[]
}
```

### ProfileSkill Join Table

```prisma
model ProfileSkill {
  id        String   @id @default(cuid())
  profileId String
  skillId   String
  createdAt DateTime @default(now())

  profile Profile @relation(...)
  skill   Skill   @relation(...)

  @@unique([profileId, skillId])
}
```

## Usage Examples

### Add Skill to Profile

```bash
POST /users/me/skills
{
  "skillName": "JavaScript"
}
```

### Search Skills

```bash
GET /skills?search=java&limit=10
```

### Get User Skills

```bash
GET /users/me/skills
```

## Notes

- Skills are automatically created if they don't exist when adding to a profile
- Skills cannot be deleted if they are associated with any profiles
- Skill names are unique across the system
- The module is fully integrated with the Users module
