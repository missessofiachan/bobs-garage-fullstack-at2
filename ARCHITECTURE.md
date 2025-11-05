# Architecture Overview

This document provides a high-level overview of the Bob's Garage application architecture.

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Application Structure](#application-structure)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Performance Considerations](#performance-considerations)
- [Scalability](#scalability)

## System Overview

Bob's Garage is a full-stack web application built with a modern monorepo architecture:

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │────────▶│   Server    │────────▶│  Database   │
│   (React)   │  HTTP   │  (Express)  │  SQL    │   (MySQL)   │
└─────────────┘         └─────────────┘         └─────────────┘
     Port 5173              Port 4000             Port 3306
```

### Key Components

- **Client**: React SPA with TypeScript
- **Server**: Node.js/Express REST API
- **Database**: MySQL with Sequelize ORM
- **Storage**: File system for uploads

## Technology Stack

### Frontend

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **React Query** - Server state management
- **Bootstrap 5** - UI components
- **Vanilla Extract** - CSS-in-JS theming
- **Framer Motion** - Animations

### Backend

- **Node.js 20+** - Runtime
- **Express 5** - Web framework
- **TypeScript** - Type safety
- **Sequelize** - ORM
- **MySQL 8.0+** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **Winston** - Logging
- **prom-client** - Metrics

## Application Structure

### Monorepo Layout

```
bobs-garage-fullstack-at2/
├── client/              # Frontend application
│   ├── src/
│   │   ├── api/         # API client & HTTP utilities
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── store/       # Redux store
│   │   ├── styles/      # Styling system
│   │   └── utils/       # Utility functions
│   └── package.json
│
├── server/              # Backend application
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── controllers/ # Route handlers
│   │   ├── db/          # Database models & migrations
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # Route definitions
│   │   ├── services/    # Business logic
│   │   └── utils/       # Utility functions
│   └── package.json
│
└── package.json         # Root workspace config
```

### Client Architecture

#### State Management

- **Redux Toolkit**: Global UI state (auth, preferences)
- **React Query**: Server state (API data, caching)
- **Local State**: Component-specific state (useState)

#### Data Flow

```
User Action → Component → API Call → React Query → Redux (if needed) → UI Update
```

#### Component Hierarchy

```
App
├── NavBar
├── Routes
│   ├── Public Pages (Home, About, Services, Staff)
│   ├── Auth Pages (Login, Register)
│   └── Protected Pages (Profile, Admin, etc.)
└── Footer
```

### Server Architecture

#### Layered Architecture

```
Routes (API Endpoints)
    ↓
Middleware (Auth, Validation, Sanitization)
    ↓
Controllers (Request/Response Handling)
    ↓
Services (Business Logic)
    ↓
Models (Database Access)
```

#### Request Flow

```
HTTP Request
    ↓
Security Middleware (Helmet, CORS, Rate Limiting)
    ↓
Request ID Middleware
    ↓
Metrics Middleware
    ↓
Body Parser
    ↓
Input Sanitization
    ↓
Authentication Middleware (if protected)
    ↓
Route Handler
    ↓
Controller
    ↓
Service (Business Logic)
    ↓
Model (Database)
    ↓
Response
```

## Data Flow

### Authentication Flow

```
1. User Login
   ↓
2. Server validates credentials
   ↓
3. Server generates JWT tokens
   ↓
4. Access token → Response header
   ↓
5. Refresh token → HttpOnly cookie
   ↓
6. Client stores access token
   ↓
7. Client includes token in API requests
   ↓
8. Server validates token on each request
   ↓
9. Token expires → Client uses refresh token
   ↓
10. Server issues new access token
```

### Data Fetching Flow

```
1. Component mounts
   ↓
2. React Query hook called
   ↓
3. Check cache first
   ↓
4. If cache miss, make API request
   ↓
5. API request with auth token
   ↓
6. Server processes request
   ↓
7. Response cached by React Query
   ↓
8. Component receives data
   ↓
9. UI updates automatically
```

## Security Architecture

### Authentication & Authorization

- **JWT Tokens**: Stateless authentication
- **Refresh Tokens**: Stored in HttpOnly cookies
- **Role-Based Access**: Admin vs regular users
- **Token Rotation**: Refresh tokens rotated on use

### Input Validation & Sanitization

- **Zod Schemas**: Request validation
- **DOMPurify**: XSS protection (HTML sanitization)
- **File Validation**: Magic bytes, MIME type checking
- **SQL Injection Prevention**: Parameterized queries (Sequelize)

### Security Headers

- **Helmet**: Security headers (CSP, XSS, etc.)
- **CORS**: Configured allowed origins
- **Rate Limiting**: Per-user and global limits
- **HTTPS**: Enforced in production

### Audit Logging

- All admin actions logged
- Tracks: user, action, resource, IP, timestamp
- Request ID tracking for tracing

## Performance Considerations

### Frontend

- **Code Splitting**: Lazy-loaded routes
- **Image Optimization**: Lazy loading, placeholders
- **Caching**: React Query cache, HTTP cache headers
- **Bundle Size**: Tree shaking, minification

### Backend

- **Database Indexes**: Full-text search, common queries
- **Connection Pooling**: Sequelize connection pool
- **Caching**: In-memory cache for metrics
- **Compression**: Gzip/Brotli compression
- **Query Optimization**: Slow query monitoring

### Database

- **Indexes**: On frequently queried fields
- **Full-Text Search**: MySQL full-text indexes
- **Connection Pool**: Min/max connections configured
- **Query Performance**: Monitoring and optimization

## Scalability

### Horizontal Scaling

- **Stateless API**: Can run multiple instances
- **Database**: Can be moved to separate server
- **File Storage**: Can be moved to cloud storage (S3)
- **Load Balancer**: Multiple server instances

### Vertical Scaling

- **Process Manager**: PM2 cluster mode
- **Database**: Connection pooling
- **Caching**: Redis (optional, currently memory)

### Future Scalability Options

- **Redis**: For distributed caching
- **CDN**: For static assets
- **Message Queue**: For background jobs
- **Microservices**: Split into smaller services if needed

## Monitoring & Observability

### Metrics

- **Prometheus**: Request counts, durations, errors
- **Database Metrics**: Query counts, durations
- **Cache Metrics**: Hit/miss rates

### Logging

- **Winston**: Structured logging
- **Request Logging**: Optional detailed request/response logging
- **Error Logging**: Centralized error tracking

### Health Checks

- **Health Endpoint**: `/health` with system status
- **Database Status**: `/db-status` for connection check
- **Metrics Endpoint**: `/metrics` for Prometheus

## API Design

### RESTful API

- **Versioning**: `/api/v1/` with backward compatibility
- **Resource-Based URLs**: `/api/v1/services`, `/api/v1/staff`
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Status Codes**: Proper HTTP status codes

### Response Format

```typescript
// Success
{
  data: { ... }
}

// Error
{
  error: {
    code: "ERROR_CODE",
    message: "Error message",
    requestId: "uuid",
    timestamp: "ISO date"
  }
}
```

## Database Schema

### Key Tables

- **users**: User accounts and authentication
- **services**: Service offerings
- **staff**: Staff member profiles
- **favorites**: User favorite services
- **audit_logs**: Admin action logs

### Relationships

- Users → Favorites (one-to-many)
- Services ↔ Favorites (many-to-many via users)
- Audit Logs → Users (many-to-one)

## File Storage

### Upload Structure

```
server/uploads/
├── services/
│   └── {serviceId}-{timestamp}.{ext}
└── staff/
    └── {staffId}-{timestamp}.{ext}
```

### Security

- File type validation (magic bytes)
- Size limits
- Sanitized filenames
- Served via static middleware

## Error Handling

### Frontend

- **Error Boundaries**: Catch React errors
- **API Error Handling**: Centralized error formatting
- **User-Friendly Messages**: Clear error messages

### Backend

- **Structured Errors**: Consistent error format
- **Error Codes**: Categorized error types
- **Request IDs**: For tracing errors
- **Logging**: All errors logged

---

For more details, see:
- [README.md](README.md) - Setup and usage
- [STYLING_GUIDE.md](STYLING_GUIDE.md) - Design system
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide

