-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'GUEST',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTemporaryAdmin" BOOLEAN NOT NULL DEFAULT false,
    "tempAdminExpires" DATETIME,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATETIME,
    "gender" TEXT,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT,
    "hasDisability" BOOLEAN NOT NULL DEFAULT false,
    "disabilityDetails" TEXT,
    "preferredGenres" TEXT NOT NULL,
    "readingFrequency" TEXT,
    "profilePicture" TEXT,
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "additionalDocuments" TEXT,
    "idDocument" TEXT,
    "proofOfAddress" TEXT,
    "idDocumentVerified" BOOLEAN NOT NULL DEFAULT false,
    "proofOfAddressVerified" BOOLEAN NOT NULL DEFAULT false,
    "additionalDocsVerified" BOOLEAN NOT NULL DEFAULT false,
    "idDocumentVerifiedAt" DATETIME,
    "proofOfAddressVerifiedAt" DATETIME,
    "additionalDocsVerifiedAt" DATETIME,
    "idDocumentVerifiedBy" TEXT,
    "proofOfAddressVerifiedBy" TEXT,
    "additionalDocsVerifiedBy" TEXT,
    "idDocumentNotes" TEXT,
    "proofOfAddressNotes" TEXT,
    "additionalDocsNotes" TEXT,
    CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserVisit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "duration" INTEGER,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "visitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MembershipApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "hasDisability" BOOLEAN NOT NULL DEFAULT false,
    "disabilityDetails" TEXT,
    "preferredGenres" TEXT NOT NULL,
    "readingFrequency" TEXT NOT NULL,
    "subscribeNewsletter" BOOLEAN NOT NULL DEFAULT false,
    "idDocument" TEXT,
    "proofOfAddress" TEXT,
    "additionalDocuments" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "reviewNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MembershipApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isbn" TEXT,
    "genre" TEXT NOT NULL,
    "deweyDecimal" TEXT NOT NULL,
    "isElectronic" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT,
    "coverImage" TEXT,
    "totalCopies" INTEGER NOT NULL DEFAULT 1,
    "availableCopies" INTEGER NOT NULL DEFAULT 1,
    "isDigital" BOOLEAN NOT NULL DEFAULT false,
    "digitalFile" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT true,
    "maxReservations" INTEGER NOT NULL DEFAULT 10,
    "currentReservations" INTEGER NOT NULL DEFAULT 0,
    "publishedYear" INTEGER,
    "publisher" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "pages" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BookReservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reservedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME,
    "returnedAt" DATETIME,
    "renewalCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    CONSTRAINT "BookReservation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookReservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BookReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookReview_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "messageType" TEXT NOT NULL DEFAULT 'TEXT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NewsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "image" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "eventDate" DATETIME,
    "location" TEXT,
    "maxAttendees" INTEGER,
    "currentAttendees" INTEGER NOT NULL DEFAULT 0,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EventAttendee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventAttendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventAttendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "NewsEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "category" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "uploadedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ContentAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "grantedBy" TEXT,
    "grantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    CONSTRAINT "ContentAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupportRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "assignedTo" TEXT,
    "resolvedAt" DATETIME,
    "resolution" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupportRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HomePageContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "section" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "updatedBy" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmailVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DocumentRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "requestReason" TEXT NOT NULL,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "type" TEXT NOT NULL DEFAULT 'MEMBER',
    "adminNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    CONSTRAINT "DocumentRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "requiredAction" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DocumentNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReadingProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "currentPage" INTEGER NOT NULL DEFAULT 0,
    "totalPages" INTEGER NOT NULL DEFAULT 0,
    "readingTime" INTEGER NOT NULL DEFAULT 0,
    "bookmarks" TEXT NOT NULL DEFAULT '[]',
    "lastReadAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReadingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReadingProgress_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserVisit_userId_visitedAt_idx" ON "UserVisit"("userId", "visitedAt");

-- CreateIndex
CREATE INDEX "UserVisit_page_visitedAt_idx" ON "UserVisit"("page", "visitedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipApplication_userId_key" ON "MembershipApplication"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipApplication_email_key" ON "MembershipApplication"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");

-- CreateIndex
CREATE INDEX "Book_title_author_idx" ON "Book"("title", "author");

-- CreateIndex
CREATE INDEX "Book_visibility_isActive_idx" ON "Book"("visibility", "isActive");

-- CreateIndex
CREATE INDEX "Book_isDigital_isLocked_idx" ON "Book"("isDigital", "isLocked");

-- CreateIndex
CREATE INDEX "BookReservation_userId_status_idx" ON "BookReservation"("userId", "status");

-- CreateIndex
CREATE INDEX "BookReservation_bookId_status_idx" ON "BookReservation"("bookId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BookReview_bookId_userId_key" ON "BookReview"("bookId", "userId");

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_recipientId_idx" ON "ChatMessage"("senderId", "recipientId");

-- CreateIndex
CREATE INDEX "ChatMessage_recipientId_isRead_idx" ON "ChatMessage"("recipientId", "isRead");

-- CreateIndex
CREATE INDEX "NewsEvent_type_publishedAt_idx" ON "NewsEvent"("type", "publishedAt");

-- CreateIndex
CREATE INDEX "NewsEvent_visibility_isPublished_idx" ON "NewsEvent"("visibility", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "EventAttendee_eventId_userId_key" ON "EventAttendee"("eventId", "userId");

-- CreateIndex
CREATE INDEX "GalleryImage_category_createdAt_idx" ON "GalleryImage"("category", "createdAt");

-- CreateIndex
CREATE INDEX "GalleryImage_visibility_isPublished_idx" ON "GalleryImage"("visibility", "isPublished");

-- CreateIndex
CREATE INDEX "ContentAccess_contentType_contentId_idx" ON "ContentAccess"("contentType", "contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentAccess_userId_contentType_contentId_key" ON "ContentAccess"("userId", "contentType", "contentId");

-- CreateIndex
CREATE INDEX "SupportRequest_status_priority_idx" ON "SupportRequest"("status", "priority");

-- CreateIndex
CREATE INDEX "SupportRequest_userId_status_idx" ON "SupportRequest"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "HomePageContent_section_key" ON "HomePageContent"("section");

-- CreateIndex
CREATE INDEX "HomePageContent_section_isActive_idx" ON "HomePageContent"("section", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_token_key" ON "EmailVerification"("token");

-- CreateIndex
CREATE INDEX "EmailVerification_email_token_idx" ON "EmailVerification"("email", "token");

-- CreateIndex
CREATE INDEX "EmailVerification_expiresAt_idx" ON "EmailVerification"("expiresAt");

-- CreateIndex
CREATE INDEX "DocumentRequest_userId_status_idx" ON "DocumentRequest"("userId", "status");

-- CreateIndex
CREATE INDEX "DocumentRequest_status_type_idx" ON "DocumentRequest"("status", "type");

-- CreateIndex
CREATE INDEX "DocumentRequest_dueDate_idx" ON "DocumentRequest"("dueDate");

-- CreateIndex
CREATE INDEX "DocumentNotification_userId_status_idx" ON "DocumentNotification"("userId", "status");

-- CreateIndex
CREATE INDEX "DocumentNotification_action_createdAt_idx" ON "DocumentNotification"("action", "createdAt");

-- CreateIndex
CREATE INDEX "ReadingProgress_userId_lastReadAt_idx" ON "ReadingProgress"("userId", "lastReadAt");

-- CreateIndex
CREATE INDEX "ReadingProgress_bookId_idx" ON "ReadingProgress"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingProgress_userId_bookId_key" ON "ReadingProgress"("userId", "bookId");
