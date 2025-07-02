# DocManager - Document Management System

## Overview

DocManager is a full-stack document management system designed for archiving, searching, and managing documents with rich metadata support. The system provides a modern web interface for document upload, OCR processing, advanced search capabilities, and in-browser document viewing.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **File Upload**: React Dropzone for drag-and-drop functionality

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **File Storage**: Local filesystem with configurable upload directory
- **OCR Processing**: Placeholder implementation for text extraction
- **API Design**: RESTful endpoints with proper error handling

### Development Environment
- **Build Tool**: Vite for fast development and optimized builds
- **TypeScript**: Full type safety across frontend and backend
- **Shared Schema**: Common types and validation schemas in shared directory
- **Development Server**: Hot module replacement with Vite dev server

## Key Components

### Database Schema
The system uses a single `documents` table with the following structure:
- **Primary Keys**: Auto-incrementing ID
- **Metadata Fields**: title, description, subject, tags (array), category, department
- **File Information**: fileName, originalName, mimeType, fileSize, filePath
- **Processing**: extractedText, ocrProcessed flag
- **Timestamps**: documentDate, createdAt, updatedAt

### File Upload System
- **Multi-file Support**: Drag-and-drop interface with file type validation
- **File Type Support**: PDF, images (JPEG/PNG), Office documents
- **Size Limits**: 100MB per file maximum
- **Storage**: Files stored in `/uploads` directory with unique naming
- **Validation**: Client and server-side file type and size validation

### Search and Filtering
- **Full-text Search**: Query across title, description, and extracted text
- **Advanced Filters**: Category, department, date range filtering
- **Sorting Options**: Relevance, date (ascending/descending), title, file size
- **Pagination**: Configurable page size with navigation controls

### Document Viewing
- **Preview Modal**: In-browser document preview with metadata display
- **Download Functionality**: Direct file download with original filename
- **Responsive Design**: Mobile-friendly interface with adaptive layouts

## Data Flow

### Document Upload Flow
1. User selects files via drag-and-drop or file picker
2. Client-side validation for file type and size
3. Metadata form completion with validation
4. FormData submission to `/api/documents` endpoint
5. Server-side file processing and storage
6. Database record creation with file metadata
7. OCR processing initiation (placeholder implementation)
8. Success response with document details

### Document Search Flow
1. User enters search query and applies filters
2. Query parameters sent to `/api/documents` GET endpoint
3. Database query with full-text search and filtering
4. Results returned with pagination metadata
5. Client renders results in grid or list view
6. Document preview and download actions available

### Document Retrieval Flow
1. Document selection triggers preview modal
2. Document metadata fetched and displayed
3. Download requests routed through `/api/documents/:id/download`
4. File served with appropriate headers and MIME type

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation integration
- **multer**: File upload middleware
- **zod**: Runtime type validation

### UI Dependencies
- **@radix-ui/**: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-dropzone**: File upload component
- **wouter**: Lightweight routing

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type system
- **tsx**: TypeScript execution
- **esbuild**: Production bundling

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev`
- **Server**: Express with Vite middleware for HMR
- **Database**: Auto-provisioned PostgreSQL on Replit
- **Port**: 5000 (mapped to external port 80)

### Production Build
- **Frontend Build**: `vite build` outputs to `dist/public`
- **Backend Build**: `esbuild` bundles server to `dist/index.js`
- **Database Migration**: `drizzle-kit push` for schema deployment
- **Start Command**: `npm run start` runs production server

### Platform Configuration
- **Replit Modules**: nodejs-20, web, postgresql-16
- **Autoscale Deployment**: Configured for production scaling
- **Environment Variables**: DATABASE_URL required for database connection

## Changelog

```
Changelog:
- June 26, 2025. Initial setup
- June 26, 2025. Implemented complete document management system with upload, metadata management, search, and file operations
- June 26, 2025. Added OCR functionality using Tesseract for image text extraction
- June 26, 2025. Implemented asynchronous OCR processing queue for background text extraction
- June 26, 2025. Added document editing functionality with proper date handling
- June 26, 2025. Created OCR status monitoring endpoints and queue management system
```

## Current Features

### Core Functionality
- **Document Upload**: Multi-file drag-and-drop with metadata forms
- **Advanced Search**: Full-text search with category, department, and date filters
- **Document Preview**: In-browser document viewing with metadata display
- **Document Editing**: Complete metadata editing with form validation
- **File Operations**: Download and "open original" functionality

### OCR and Text Processing
- **Image OCR**: Tesseract-based text extraction for JPEG/PNG images
- **Document Processing**: Word document text extraction using Mammoth
- **Asynchronous Processing**: Background OCR queue for large documents
- **Text Enhancement**: Image preprocessing for better OCR accuracy
- **Multi-language Support**: Portuguese and English OCR recognition

### Technical Implementation
- **Database**: PostgreSQL with Drizzle ORM for document metadata and text storage
- **File Storage**: Local filesystem with unique naming and validation
- **Queue System**: In-memory job queue for OCR processing
- **API Endpoints**: RESTful API with OCR status monitoring
- **Error Handling**: Comprehensive error handling and user feedback

## User Preferences

```
Preferred communication style: Simple, everyday language.
```