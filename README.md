# Davel Library - Modern Library Management System

A comprehensive library management system built with Next.js, PostgreSQL, and Prisma.

## Features

### Core Functionality
- **User Authentication**: Email, phone, and admin login options
- **Role-Based Access**: ADMIN, LIBRARIAN, MEMBER, GUEST roles
- **Book Catalog**: Browse and search library books
- **Membership System**: Online membership applications
- **Dashboard**: Separate dashboards for admins and members
- **News & Events**: Library announcements and events
- **Gallery**: Photo gallery for library events
- **Dark/Light Mode**: Full theme support throughout the app

### Admin Features
- User management with temporary admin promotion
- Content visibility controls
- Analytics and user visit tracking
- Support request management
- Homepage content management

### Member Features
- Profile management
- Book reservations
- Chat support
- Support request creation
- Reading history tracking

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **3D Graphics**: Three.js with React Three Fiber
- **Animations**: Framer Motion

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd davel-library
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/davel-library?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ADMIN_EMAIL="admin@davel-library.com"
   ADMIN_PASSWORD="admin-password"
   LIBRARIAN_EMAIL="librarian@davel-library.com"
   LIBRARIAN_PASSWORD="librarian-password"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Accounts

- **Admin**: admin@davel-library.com / admin-password
- **Librarian**: librarian@davel-library.com / librarian-password

## Project Structure

```
davel-library/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── 3d/               # 3D graphics components
│   ├── dashboard/        # Dashboard components
│   ├── forms/            # Form components
│   ├── home/             # Home page components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                  # Utility libraries
├── prisma/               # Database schema and migrations
└── types/                # TypeScript type definitions
```

## Key Components

### Core Pages
- **Home** (`app/page.tsx`): Landing page with 3D hero section
- **Catalog** (`app/catalog/page.tsx`): Book browsing interface
- **Apply** (`app/apply/page.tsx`): Membership application form
- **Sign In** (`app/auth/signin/page.tsx`): Authentication page

### Dashboard Components
- **Admin Dashboard** (`components/dashboard/enhanced-admin-dashboard.tsx`): Comprehensive admin interface
- **Member Dashboard** (`components/dashboard/enhanced-member-dashboard.tsx`): Member-specific features

### 3D Components
- **Hero 3D** (`components/3d/hero-3d.tsx`): Animated 3D hero section
- **Floating Books** (`components/3d/floating-books.tsx`): Background 3D elements

## Database Schema

The application uses Prisma with the following main models:
- **User**: Authentication and user management
- **Member**: Extended user profiles
- **Book**: Library catalog
- **BookReservation**: Book borrowing system
- **NewsEvent**: Library announcements
- **GalleryImage**: Photo gallery
- **UserVisit**: Analytics tracking
- **SupportRequest**: Support system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
