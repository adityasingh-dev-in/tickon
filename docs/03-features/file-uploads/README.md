# Feature: File Uploads

> Secure file upload, storage, retrieval, preview, and deletion system powered by Cloudinary for ProjectOS.

---

# Status

| Property     | Value      |
| ------------ | ---------- |
| Status       | Planned    |
| Priority     | P1         |
| Last Updated | 2026-07-19 |

---

# Overview

The File Upload feature allows users to attach files to tasks while keeping the application server lightweight.

Files are uploaded to **Cloudinary**, while MongoDB stores only the file metadata.

Supported capabilities include:

- Upload attachments
- Preview images
- Download files
- Delete attachments
- Secure access
- File validation
- Upload progress
- Optimized image delivery

---

# User Stories

### Upload

- As a user, I want to attach files to a task.

### Preview

- As a user, I want to preview images without downloading them.

### Download

- As a user, I want to download uploaded files.

### Delete

- As a user, I want to remove unnecessary attachments.

---

# Functional Requirements

| ID       | Requirement                   | Priority | Status  |
| -------- | ----------------------------- | -------- | ------- |
| FILE-001 | Upload files to tasks         | P0       | Planned |
| FILE-002 | Upload progress indicator     | P1       | Planned |
| FILE-003 | Client-side validation        | P0       | Planned |
| FILE-004 | Server-side validation        | P0       | Planned |
| FILE-005 | Store files in Cloudinary     | P0       | Planned |
| FILE-006 | Generate optimized image URLs | P1       | Planned |
| FILE-007 | Delete uploaded files         | P0       | Planned |
| FILE-008 | Preview images                | P1       | Planned |
| FILE-009 | Download attachments          | P1       | Planned |
| FILE-010 | Attach multiple files         | Future   | Planned |

---

# Upload Workflow

```text
User

↓

Select File

↓

Client Validation

↓

Upload Progress

↓

POST /tasks/:taskId/attachments

↓

Express

↓

Authentication

↓

Validation

↓

Multer

↓

Cloudinary Upload

↓

MongoDB Metadata Saved

↓

Task Updated

↓

Return Attachment

↓

React Query Refresh

↓

Attachment Appears
```

---

# Delete Workflow

```text
User

↓

Delete Attachment

↓

Confirmation Dialog

↓

DELETE /tasks/:taskId/attachments/:attachmentId

↓

Find Attachment

↓

Delete From Cloudinary

↓

Remove Metadata

↓

Update Task

↓

Refresh UI
```

---

# Download Workflow

```text
User

↓

Click Download

↓

Browser Opens Secure URL

↓

Cloudinary

↓

File Download
```

---

# Upload Constraints

| Property                     | Value          |
| ---------------------------- | -------------- |
| Maximum File Size            | 10 MB          |
| Maximum Attachments Per Task | 20             |
| Maximum Filename Length      | 255 Characters |
| Duplicate Filenames          | Allowed        |
| Storage Provider             | Cloudinary     |

---

# Supported File Types

## Images

- JPEG
- PNG
- WebP
- GIF
- SVG

## Documents

- PDF
- DOC
- DOCX
- XLS
- XLSX
- PPT
- PPTX
- TXT

Future versions may support additional file formats.

---

# Image Processing

Images uploaded to Cloudinary are automatically optimized.

Transformations include:

- Auto Quality
- Auto Format
- Compression
- Responsive Delivery

Thumbnail images are generated automatically.

---

# API Endpoints

| Method | Endpoint                                       | Description       | Authentication |
| ------ | ---------------------------------------------- | ----------------- | -------------- |
| POST   | `/api/tasks/:taskId/attachments`               | Upload attachment | Required       |
| GET    | `/api/tasks/:taskId/attachments`               | List attachments  | Required       |
| DELETE | `/api/tasks/:taskId/attachments/:attachmentId` | Delete attachment | Required       |

---

# Upload Request

```text
Content-Type

multipart/form-data

Fields

file

taskId
```

---

# Upload Response

```json
{
  "_id": "...",
  "fileName": "design.png",
  "publicId": "projectos/tasks/design",
  "secureUrl": "...",
  "thumbnailUrl": "...",
  "mimeType": "image/png",
  "fileSize": 240000,
  "uploadedBy": "...",
  "uploadedAt": "..."
}
```

---

# Attachment Model

Attachments are embedded inside the Task document.

```text
Attachment

_id

fileName

originalName

publicId

secureUrl

thumbnailUrl

mimeType

fileSize

uploadedBy

uploadedAt
```

Files themselves are never stored in MongoDB.

---

# Storage Flow

```text
Browser

↓

Express

↓

Multer

↓

Cloudinary

↓

MongoDB

Stores only:

• publicId
• secureUrl
• metadata
```

---

# Validation Rules

## Client Validation

- Required file
- Maximum size
- Allowed file type
- Filename validation

## Server Validation

- Authentication
- Ownership verification
- MIME type validation
- File size validation
- Upload limits

The server never trusts client validation.

---

# Authorization

Only authenticated users may upload files.

Additionally:

- User must own the task.
- User must own the project.

Unauthorized uploads return **403 Forbidden**.

---

# Security

## Upload Security

- Authentication required
- Authorization required
- MIME type validation
- Maximum size validation
- Filename sanitization
- Upload rate limiting

## Cloudinary

Files are uploaded through the backend.

Cloudinary credentials remain private.

The browser never communicates directly with Cloudinary.

---

# Cloudinary Configuration

| Property      | Value              |
| ------------- | ------------------ |
| Folder        | `projectos/tasks/` |
| Resource Type | Auto               |
| Quality       | Auto               |
| Format        | Auto               |
| Delivery      | Secure URL         |

---

# Edge Cases

| Scenario                   | Expected Behavior               |
| -------------------------- | ------------------------------- |
| No file selected           | Validation error                |
| File too large             | Reject upload                   |
| Unsupported file type      | Reject upload                   |
| Invalid task               | 404 Not Found                   |
| Unauthorized user          | 403 Forbidden                   |
| Task deleted during upload | Cancel upload                   |
| Cloudinary unavailable     | Upload fails gracefully         |
| Database failure           | Remove uploaded Cloudinary file |
| Network interruption       | Upload cancelled                |
| Duplicate filename         | Allowed                         |
| Attachment limit reached   | Reject upload                   |

---

# Error Responses

| Status | Meaning                 |
| ------ | ----------------------- |
| 400    | Invalid file            |
| 401    | Authentication required |
| 403    | Access denied           |
| 404    | Task not found          |
| 413    | File too large          |
| 415    | Unsupported media type  |
| 429    | Too many uploads        |
| 500    | Internal server error   |
| 502    | Cloudinary unavailable  |

---

# State Management

## TanStack Query

Queries:

- Task Details
- Task Attachments

Mutations:

- Upload Attachment
- Delete Attachment

After successful mutations:

- Invalidate Task Query
- Refresh Attachment List

---

## Zustand

Stores only UI state:

- Upload progress
- Selected files
- Preview modal
- Drag state

---

# Dependencies

## Backend

- Express
- Multer
- Cloudinary SDK
- Mongoose
- Zod

## Frontend

- TanStack Query
- React Hook Form
- Zustand

---

# Future Improvements

Future versions may include:

- Multiple file uploads
- Drag-and-drop uploads
- Upload queue
- Chunked uploads
- Folder support
- File version history
- Virus scanning
- OCR for documents
- PDF preview
- Video preview
- Audio preview
- Attachment search
- Storage usage dashboard

---

# Testing Checklist

- Upload image
- Upload document
- Reject oversized file
- Reject invalid type
- Delete attachment
- Download attachment
- Preview image
- Authorization
- Upload interruption
- Cloudinary failure
- Database failure
- Duplicate filenames
- Upload limit reached

---

# Related Documents

- Data Model
- Security & Authentication
- System Diagram
- Environment Variables
- Task Feature
- Cloudinary Configuration
