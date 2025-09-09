# Digital File Upload System Guide

## Overview

The Davel Library now supports comprehensive digital file upload functionality, allowing users to upload various document types including PDFs, DOCX, EPUB, and many more formats. This system is designed to handle digital books, documents, and other file types with proper validation, security, and user experience.

## Supported File Types

### Digital Books & Documents
- **PDF** (.pdf) - Portable Document Format
- **DOCX** (.docx) - Microsoft Word Document (Modern)
- **DOC** (.doc) - Microsoft Word Document (Legacy)
- **EPUB** (.epub) - Electronic Publication Format
- **TXT** (.txt) - Plain Text File
- **RTF** (.rtf) - Rich Text Format
- **ODT** (.odt) - OpenDocument Text Format
- **Pages** (.pages) - Apple Pages Document
- **MOBI** (.mobi) - Mobipocket eBook Format
- **AZW3** (.azw3) - Kindle Format

### Media Files
- **Images**: JPG, PNG, GIF, WebP
- **Videos**: MP4, MOV, WebM
- **Profile Pictures**: JPG, PNG, GIF
- **News Images**: JPG, PNG, GIF

## File Size Limits

| Upload Type | Maximum Size | Description |
|-------------|--------------|-------------|
| Digital Books | 100MB | For large eBook files and documents |
| Documents | 50MB | For general document uploads |
| Gallery | 10MB | For images and videos |
| Profile/News | 5MB | For profile pictures and news images |

## Components

### 1. Enhanced FileUpload Component (`components/ui/file-upload.tsx`)

The main file upload component has been enhanced to support multiple file types:

```typescript
interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove?: () => void
  selectedFile?: File | null
  previewUrl?: string | null
  accept?: string
  maxSize?: number
  className?: string
  disabled?: boolean
  type?: "profile" | "gallery" | "news" | "digital" | "document"
}
```

**Features:**
- Drag and drop functionality
- File type validation
- File size validation
- Visual feedback for different file types
- Progress indicators
- Error handling

### 2. DigitalFileUpload Component (`components/ui/digital-file-upload.tsx`)

A specialized component for digital file uploads with enhanced features:

```typescript
interface DigitalFileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove?: () => void
  selectedFile?: File | null
  uploadedFileUrl?: string | null
  className?: string
  disabled?: boolean
  maxSize?: number
  acceptedTypes?: string[]
}
```

**Features:**
- File type icons with color coding
- Detailed file information display
- Upload progress tracking
- Supported file types showcase
- Enhanced error messages
- File validation with visual feedback

### 3. Upload API (`app/api/upload/route.ts`)

A comprehensive API endpoint that handles all file upload types:

```typescript
// File type configurations
const FILE_CONFIGS = {
  digital: {
    allowedTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/epub+zip",
      "text/plain",
      "application/rtf",
      "application/vnd.oasis.opendocument.text",
      "application/x-iwork-pages-sffpages",
      "application/x-mobipocket-ebook",
      "application/vnd.amazon.ebook"
    ],
    maxSize: 100 * 1024 * 1024, // 100MB
    folder: "ebooks"
  },
  // ... other configurations
}
```

**Features:**
- File type validation
- File size validation
- Secure file storage
- Unique filename generation
- Error handling and responses
- Authentication checks

## Usage Examples

### Basic File Upload

```typescript
import { FileUpload } from "@/components/ui/file-upload"

<FileUpload
  onFileSelect={(file) => {
    // Handle file selection
    console.log('Selected file:', file)
  }}
  type="digital"
  maxSize={100 * 1024 * 1024} // 100MB
/>
```

### Digital File Upload with Enhanced Features

```typescript
import { DigitalFileUpload } from "@/components/ui/digital-file-upload"

<DigitalFileUpload
  onFileSelect={async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'digital')
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('Upload successful:', result.url)
    }
  }}
  onFileRemove={() => {
    // Handle file removal
  }}
  selectedFile={selectedFile}
  uploadedFileUrl={uploadedFileUrl}
/>
```

### Book Manager Integration

The book manager component now includes digital file upload functionality:

```typescript
{formData.isDigital && (
  <div className="space-y-4">
    <div>
      <Label>Digital Book File</Label>
      <DigitalFileUpload
        onFileSelect={async (file) => {
          // Upload logic
        }}
        onFileRemove={() => {
          // Remove logic
        }}
        selectedFile={selectedFile}
        uploadedFileUrl={formData.digitalFileUrl}
      />
    </div>
  </div>
)}
```

## File Storage Structure

Files are organized in the following directory structure:

```
public/uploads/
├── ebooks/          # Digital books (PDF, EPUB, etc.)
├── documents/       # General documents (PDF, DOCX, etc.)
├── gallery/         # Images and videos
├── profile/         # Profile pictures
└── news/            # News images
```

## Security Features

1. **File Type Validation**: Only allowed MIME types are accepted
2. **File Size Limits**: Prevents oversized file uploads
3. **Authentication**: Uploads require user authentication
4. **Unique Filenames**: Prevents filename conflicts
5. **Secure Storage**: Files stored in public/uploads with proper permissions

## Error Handling

The system provides comprehensive error handling:

- **File too large**: Clear error message with size limit
- **Invalid file type**: Lists supported file types
- **Upload failures**: Detailed error messages
- **Network errors**: User-friendly error notifications

## Demo Page

A demo page is available at `/digital-upload-demo` to test all upload functionality:

- Test different file types
- View upload progress
- See file information
- Test error scenarios
- View supported file types

## Integration with Database

The system integrates with the Prisma database schema:

```prisma
model Book {
  // ... other fields
  isDigital   Boolean  @default(false)
  digitalFile String?
  digitalFileSize Int?
  digitalFileType String?
  digitalFileUrl String?
  // ... other fields
}
```

## Best Practices

1. **Always validate files** on both client and server side
2. **Use appropriate file size limits** for different use cases
3. **Provide clear error messages** to users
4. **Show upload progress** for large files
5. **Handle file removal** gracefully
6. **Use secure file storage** with proper permissions
7. **Implement file type restrictions** based on use case

## Troubleshooting

### Common Issues

1. **File not uploading**: Check file size and type restrictions
2. **Upload directory not found**: Ensure upload directories exist
3. **Permission errors**: Check file system permissions
4. **Large file timeouts**: Consider implementing chunked uploads

### Debug Information

- Check browser console for client-side errors
- Check server logs for API errors
- Verify file permissions on upload directories
- Test with different file types and sizes

## Future Enhancements

1. **Chunked uploads** for very large files
2. **File compression** for images
3. **Virus scanning** for uploaded files
4. **Cloud storage integration** (AWS S3, etc.)
5. **File preview** functionality
6. **Batch upload** capabilities
7. **File versioning** system

## API Endpoints

### POST /api/upload

Upload a file with the specified type.

**Request:**
```typescript
FormData {
  file: File,
  type: "digital" | "document" | "gallery" | "profile" | "news"
}
```

**Response:**
```typescript
{
  message: "File uploaded successfully",
  url: string,
  fileName: string,
  originalName: string,
  size: number,
  type: string,
  uploadedAt: string
}
```

**Error Response:**
```typescript
{
  error: string
}
```

This comprehensive digital file upload system provides a robust foundation for handling various document types in the Davel Library application, with proper validation, security, and user experience considerations.
