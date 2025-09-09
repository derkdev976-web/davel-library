# 📋 Document Management System Setup Guide

## Overview
The document management system allows admins to view and request documents from applicants and members, while users can upload and manage their documents. This system integrates with the existing membership application and user profile systems.

## 🚀 Features

### Admin Features
- **View Documents**: Browse all applications and member documents
- **Request Documents**: Send document requests to users with reasons and due dates
- **Track Requests**: Monitor the status of document requests (Pending, Completed, Overdue, Cancelled)
- **Email Notifications**: Automatic emails when requesting documents and updating statuses
- **Search & Filter**: Find users and applications quickly

### User Features
- **View Requests**: See all document requests from admins
- **Upload Documents**: Submit requested documents directly through the interface
- **Document Library**: View all uploaded documents
- **Status Tracking**: Monitor the progress of document requests

## 🔧 Setup Requirements

### 1. Database Schema
The system requires the `DocumentRequest` model in your Prisma schema:

```prisma
model DocumentRequest {
  id            String    @id @default(cuid())
  userId        String
  requestedBy   String
  documentType  String
  requestReason String
  dueDate       DateTime?
  status        String    @default("PENDING") // PENDING, COMPLETED, OVERDUE, CANCELLED
  type          String    @default("MEMBER") // APPLICANT or MEMBER
  adminNotes    String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  reviewedAt    DateTime?
  reviewedBy    String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status])
  @@index([status, type])
  @@index([dueDate])
}
```

### 2. Environment Variables
Ensure your `.env.local` file includes email configuration:

```bash
# Email Configuration
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-gmail-app-password
```

### 3. Database Migration
Run the following commands to update your database:

```bash
npx prisma generate
npx prisma db push
```

## 📱 API Endpoints

### Admin Document Management
- **GET** `/api/admin/documents` - View all applications and member documents
- **POST** `/api/admin/documents` - Create document requests
- **PUT** `/api/admin/documents` - Update request status
- **GET** `/api/admin/documents/requests` - View all document requests

### User Document Management
- **GET** `/api/user/documents` - View user's documents and requests
- **POST** `/api/user/documents` - Upload documents

## 🎯 Usage Guide

### For Admins

#### 1. Access Document Management
- Navigate to Admin Dashboard
- Click on the "Documents" tab
- You'll see three main sections:
  - **Applications**: View membership applications and their documents
  - **Members**: View existing member documents
  - **Requests**: Track all document requests

#### 2. Request Documents
1. Click "Request" button on any user/applicant
2. Select document type from dropdown
3. Provide reason for request
4. Set optional due date
5. Click "Send Request"

#### 3. Monitor Requests
- View request status in the Requests tab
- Update status (Complete, Cancel, etc.)
- Add admin notes for context

### For Users

#### 1. View Document Requests
- Navigate to Member Dashboard
- Click on "Documents" tab
- See all pending document requests

#### 2. Upload Documents
1. Select file for upload
2. Choose document type
3. Click "Upload" button
4. Document status updates automatically

#### 3. Manage Documents
- View all uploaded documents
- Access document history
- Upload additional documents as needed

## 📧 Email Notifications

### Document Request Emails
- Sent automatically when admin requests documents
- Includes request details, reason, and due date
- Clear instructions for users

### Status Update Emails
- Sent when request status changes
- Different templates for completion vs. review
- Professional formatting with library branding

## 🔒 Security Features

### Authentication
- All endpoints require valid session
- Admin-only access for document requests
- User can only access their own documents

### Data Validation
- File type restrictions (PDF, JPG, PNG)
- File size limits (5MB max)
- Required field validation

### Audit Trail
- Track who requested documents
- Record when documents are uploaded
- Maintain request history

## 🎨 UI Components

### Admin Dashboard
- **DocumentManagement**: Main admin interface
- Tabbed interface for applications, members, and requests
- Search and filter functionality
- Status management tools

### Member Dashboard
- **UserDocumentManagement**: User interface
- Document request viewer
- Upload functionality
- Document library

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Regenerate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push
```

#### 2. Email Not Sending
- Verify environment variables
- Check Gmail app password setup
- Ensure nodemailer is installed

#### 3. File Upload Issues
- Check file size limits
- Verify accepted file types
- Ensure proper permissions

### Debug Steps
1. Check browser console for errors
2. Verify API endpoint responses
3. Check server logs for detailed errors
4. Test email functionality separately

## 📊 Monitoring

### Request Tracking
- Monitor pending requests
- Track completion rates
- Identify overdue documents

### User Engagement
- Document upload frequency
- Response time to requests
- User satisfaction metrics

## 🚀 Future Enhancements

### Planned Features
- **Bulk Operations**: Request documents from multiple users
- **Advanced Filtering**: Date ranges, document types, status
- **Document Templates**: Pre-defined request templates
- **Integration**: Connect with external storage services
- **Analytics**: Detailed reporting and insights

### Customization Options
- Email template customization
- Document type configuration
- Workflow automation
- Approval processes

## 📞 Support

### Getting Help
1. Check this documentation first
2. Review server logs for errors
3. Test individual components
4. Contact development team

### Best Practices
- Regular database backups
- Monitor email delivery rates
- Keep document types updated
- Regular system maintenance

---

**🎯 Goal**: Streamline document collection and management for both admins and users.

**✅ Success Metrics**: 
- Reduced manual document requests
- Faster document collection
- Improved user experience
- Better audit trail
- Automated notifications
