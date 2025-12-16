# Frontend-Backend Integration Guide

## Backend API Structure

Bu frontend, aşağıdaki backend API yapısına uyumlu olarak geliştirilmiştir:

### Response Format

Backend'den gelen tüm yanıtlar şu formatta olmalıdır:

```typescript
{
  status: "success" | "error",
  data?: any,
  message?: string
}
```

### Authentication Endpoints

#### POST /api/auth/register
**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Success Response:**
```json
{
  "status": "success",
  "message": "User registered successfully"
}
```

#### POST /api/auth/login
**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response:**
```json
{
  "status": "success",
  "data": {
    "token": "jwt_token_here"
  },
  "message": "Authentication successful"
}
```

#### GET /api/auth/me
**Headers:**
```
Authorization: Bearer {token}
```

**Success Response:**
```json
{
  "status": "success",
  "data": {
    "id": "user_id",
    "username": "string",
    "email": "string",
    "role": "user" | "admin"
  }
}
```

### File Endpoints (To Be Implemented)

#### POST /api/files/upload
**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (FormData):**
- `file`: File
- `accessLevel`: "public" | "private" | "restricted"
- `expiresAt`: Date
- `downloadLimit`: number
- `allowedUsers`: string[] (emails, for restricted access)
- `password`: string (for password-protected files)

**Success Response:**
```json
{
  "status": "success",
  "data": {
    "fileId": "string",
    "shareLink": "string",
    "filename": "string",
    "size": number,
    "uploadedAt": "ISO Date",
    "expiresAt": "ISO Date"
  }
}
```

#### GET /api/files
**Headers:**
```
Authorization: Bearer {token}
```

**Success Response:**
```json
{
  "status": "success",
  "data": {
    "files": [
      {
        "id": "string",
        "filename": "string",
        "size": number,
        "uploadedAt": "ISO Date",
        "expiresAt": "ISO Date",
        "accessLevel": "public" | "private" | "restricted",
        "downloadCount": number,
        "downloadLimit": number,
        "shareLink": "string",
        "status": "active" | "expired"
      }
    ]
  }
}
```

#### GET /api/files/:fileId
**Success Response:**
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "filename": "string",
    "size": number,
    "uploadedBy": "string",
    "uploadedAt": "ISO Date",
    "expiresAt": "ISO Date",
    "accessLevel": "public" | "private" | "restricted",
    "downloadCount": number,
    "downloadLimit": number,
    "isExpired": boolean,
    "isLimitReached": boolean
  }
}
```

#### POST /api/files/download/:fileId
**Request Body (for restricted/password-protected files):**
```json
{
  "email": "string",  // for restricted
  "password": "string"  // for password-protected
}
```

**Success Response:**
```json
{
  "status": "success",
  "data": {
    "downloadUrl": "string"
  }
}
```

#### DELETE /api/files/:fileId
**Headers:**
```
Authorization: Bearer {token}
```

**Success Response:**
```json
{
  "status": "success",
  "message": "File deleted successfully"
}
```

## Environment Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000
```

## Changes Made to Frontend

### 1. API Service Layer
- Created `src/config/api.ts` for API configuration
- Created `src/services/api.ts` for centralized API calls
- All API responses now expect `{status, data, message}` format

### 2. Authentication Updates
- **Login**: Changed from `email` to `username` field
- **Register**: Changed from `fullName` to `username` field
- Response format updated to check `result.status` instead of `result.success`
- Register flow now redirects to login page instead of auto-login

### 3. Response Format
- All API calls now use backend's response format: `{status: "success" | "error", data, message}`
- Error handling updated to use `result.message` instead of `result.error?.message`

## Testing the Integration

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend dev server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Test Authentication:
   - Register with username, email, and password
   - Login with username and password
   - Check that JWT token is stored in localStorage

4. Test File Operations (once backend endpoints are implemented):
   - Upload files with different access levels
   - View files in dashboard
   - Download files
   - Delete files

## Backend Model Reference

### User Model
```typescript
{
  username: string (unique)
  email: string (unique)
  password: string (hashed)
  role: "user" | "admin"
  createdAt: Date
}
```

### File Model
```typescript
{
  filename: string
  path: string
  uploader: ObjectId (User ref)
  accessLevel: "public" | "private" | "restricted"
  size: number
  downloadCount: number
  downloadLimit: number
  allowedUsers: ObjectId[] (User refs)
  uploadedAt: Date
  updatedAt: Date
  expiresAt: Date
  encryption: {
    wrappedKey: Buffer
    keyIv: Buffer
    keyAuthTag: Buffer
    fileIv: Buffer
    fileAuthTag: Buffer
  }
}
```

### EventLog Model
```typescript
{
  eventType: string
  attachments: ObjectId[] (File refs)
  userId: ObjectId (User ref)
  timestamp: Date
  details: string
}
```

## Next Steps for Backend

1. **Implement File Upload Endpoint** (`POST /api/files/upload`)
   - Handle multipart/form-data
   - Encrypt file using AES-256-GCM
   - Store encrypted file and metadata
   - Return file info and share link

2. **Implement File List Endpoint** (`GET /api/files`)
   - Return user's uploaded files
   - Filter by status (active/expired)
   - Include download statistics

3. **Implement File Download Endpoint** (`POST /api/files/download/:fileId`)
   - Validate access permissions
   - Check expiry and download limits
   - Decrypt file
   - Return download URL or stream

4. **Implement File Info Endpoint** (`GET /api/files/:fileId`)
   - Return public file metadata
   - Don't require authentication for public files

5. **Implement File Delete Endpoint** (`DELETE /api/files/:fileId`)
   - Verify ownership
   - Delete encrypted file
   - Delete database record
   - Log deletion event

6. **Add File Cleanup Job**
   - Periodically check for expired files
   - Delete expired files
   - Log cleanup events

## Security Considerations

- All authenticated endpoints must verify JWT token
- File access must respect access levels (public/private/restricted)
- File encryption keys must never be exposed
- Download limits must be enforced
- Expired files must not be accessible
