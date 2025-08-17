# Files Resource

A comprehensive file management system built with NestJS and MegaJS cloud storage.

## Features

- **File Upload**: Upload any type of file (images, documents, videos, audio) to MegaJS
- **File Management**: List, download, and delete files
- **Security**: JWT authentication and role-based access control
- **File Organization**: Automatic categorization and custom folder paths
- **Public URLs**: Generate public URLs for uploaded files
- **Admin Controls**: Admin-only endpoints for system-wide file management

## MegaJS Integration

This resource uses MegaJS for:

- Secure file storage with end-to-end encryption
- Automatic file categorization
- Public URL generation
- Metadata management
- File access control

## Environment Variables

Add these to your `.env` file:

```env
# MegaJS Configuration
MEGA_EMAIL=your-mega-email@example.com
MEGA_PASSWORD=your-mega-password
```

## API Endpoints

### File Upload

#### `POST /files/upload`

Upload a file to MegaJS.

**Request:**

- `Content-Type: multipart/form-data`
- `Authorization: Bearer <jwt-token>`

**Form Data:**

- `file`: File to upload (required)
- `fileType`: File type category (optional)
- `folderPath`: Custom folder path (optional)
- `customFilename`: Custom filename without extension (optional)

**Response:**

```json
{
  "id": "clx1234567890",
  "originalName": "profile-picture.jpg",
  "fileType": "image",
  "mimeType": "image/jpeg",
  "size": 1024000,
  "url": "https://mega.nz/file/...",
  "path": "images/profile-picture-123.jpg",
  "uploadedAt": "2024-01-01T00:00:00.000Z",
  "uploadedBy": "user123"
}
```

### File Management

#### `GET /files/my-files`

Get all files uploaded by the current user.

**Query Parameters:**

- `fileType`: Filter by file type (optional)

**Response:**

```json
[
  {
    "id": "clx1234567890",
    "originalName": "profile-picture.jpg",
    "fileType": "image",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "url": "https://mega.nz/file/...",
    "path": "images/profile-picture-123.jpg",
    "uploadedAt": "2024-01-01T00:00:00.000Z",
    "uploadedBy": "user123"
  }
]
```

#### `GET /files/info/:fileId`

Get information about a specific file.

**Path Parameters:**

- `fileId`: Mega file ID

**Response:** Same as upload response

#### `GET /files/download/:fileId`

Download a file from MegaJS.

**Path Parameters:**

- `fileId`: Mega file ID

**Response:** File binary data with appropriate headers

#### `DELETE /files/:fileId`

Delete a file (users can only delete their own files).

**Path Parameters:**

- `fileId`: Mega file ID

**Response:** 204 No Content

### Admin Endpoints

#### `GET /files/admin/all-files`

Get all files in the system (Admin only).

**Query Parameters:**

- `fileType`: Filter by file type (optional)

#### `DELETE /files/admin/:fileId`

Delete any file (Admin only).

**Path Parameters:**

- `fileId`: Mega file ID

## File Types

The system automatically categorizes files into these types:

- **`image`**: jpg, jpeg, png, gif, bmp, webp
- **`document`**: pdf, doc, docx, txt, rtf
- **`video`**: mp4, avi, mov, wmv, flv, webm
- **`audio`**: mp3, wav, aac, flac, ogg
- **`other`**: Any other file type

## File Organization

### Automatic Organization

Files are automatically organized by type:

- `images/profile-picture-123.jpg`
- `documents/report.pdf`
- `videos/presentation.mp4`

### Custom Organization

You can specify custom folder paths:

- `users/profile-pictures/profile-picture-123.jpg`
- `projects/documents/report.pdf`
- `company/logos/logo.png`

## Security Features

- **JWT Authentication**: All endpoints require valid JWT tokens
- **User Isolation**: Users can only access their own files
- **Admin Override**: Admins can access and manage all files
- **File Validation**: File size and type validation
- **End-to-end Encryption**: MegaJS encrypts all files

## File Validation

- **Maximum Size**: Limited by your Mega storage quota
- **Allowed Types**: All file types supported
- **Content Validation**: MIME type verification

## Usage Examples

### Upload Profile Picture

```bash
curl -X POST http://localhost:3000/files/upload \
  -H "Authorization: Bearer <jwt-token>" \
  -F "file=@profile-picture.jpg" \
  -F "fileType=image" \
  -F "folderPath=users/profile-pictures" \
  -F "customFilename=profile-picture-123"
```

### Upload Document

```bash
curl -X POST http://localhost:3000/files/upload \
  -H "Authorization: Bearer <jwt-token>" \
  -F "file=@report.pdf" \
  -F "fileType=document" \
  -F "folderPath=projects/documents"
```

### Get User Files

```bash
curl -X GET "http://localhost:3000/files/my-files?fileType=image" \
  -H "Authorization: Bearer <jwt-token>"
```

### Download File

```bash
curl -X GET "http://localhost:3000/files/download/clx1234567890" \
  -H "Authorization: Bearer <jwt-token>" \
  -o downloaded-file.jpg
```

### Delete File

```bash
curl -X DELETE "http://localhost:3000/files/clx1234567890" \
  -H "Authorization: Bearer <jwt-token>"
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- **400 Bad Request**: Invalid file, metadata, or request
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: File not found
- **500 Internal Server Error**: Server-side errors

## Dependencies

- `@nestjs/platform-express`: File upload handling
- `megajs`: MegaJS cloud storage client
- `uuid`: Unique identifier generation
- `class-validator`: Request validation
- `class-transformer`: Response transformation

## Installation

1. Install dependencies:

```bash
npm install megajs uuid
npm install -D @types/uuid
```

2. Configure MegaJS credentials in `.env`

3. Import `FilesModule` in your `AppModule`

4. Start the application

## MegaJS Setup

1. Create a Mega account at [mega.nz](https://mega.nz/)
2. Get your email and password
3. Set environment variables
4. Test the connection

## Best Practices

- Use appropriate file types for better organization
- Implement file cleanup for unused files
- Monitor storage usage and quota
- Use custom folder paths for better organization
- Implement file versioning if needed
- Add file compression for large files
- Implement CDN for better performance

## Troubleshooting

### Common Issues

1. **MegaJS Authentication Error**
   - Check email and password
   - Verify account is active
   - Check if Mega service is down

2. **File Upload Fails**
   - Check storage quota
   - Verify file size
   - Check JWT token validity

3. **File Not Found**
   - Verify file ID is correct
   - Check if file exists in Mega
   - Verify user permissions

4. **Permission Denied**
   - Check JWT token
   - Verify user role and permissions
   - Check file ownership

### Debug Mode

Enable debug logging by setting log level in your application configuration.
