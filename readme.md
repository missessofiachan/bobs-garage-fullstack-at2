# Bob's Garage - Full Stack Application

A modern full-stack web application for managing an auto repair shop, featuring user authentication, service management, staff profiles, favorites, and an admin dashboard. Includes advanced features like audit logging, full-text search, Prometheus metrics, input sanitization, and comprehensive monitoring. Built with React, TypeScript, Node.js, Express, and MySQL.

## 🚀 Features

### Frontend (React + TypeScript)
- **Public Pages**: Home, About, Services (with filtering and sorting)
- **Advanced Search**: Full-text search with search term highlighting
- **Authentication**: Login, Register with validation
- **User Features**: Profile management, favorites system
- **Admin Dashboard**: Comprehensive overview with metrics and system health
- **Admin Management**: CRUD operations for Services, Staff, and Users
- **Audit Logs**: View and filter admin action logs with search and date filtering
- **Media Uploads**: Image uploads for services and staff photos
- **Theme Support**: Light/Dark mode with trans pride color scheme
- **Accessibility**: WCAG AA compliant with proper contrast ratios

### Backend (Node.js + Express)
- **RESTful API**: Complete CRUD operations with API versioning (`/api/v1/`)
- **Authentication**: JWT-based auth with refresh tokens (HttpOnly cookies)
- **Database**: MySQL with Sequelize ORM and migrations
- **Full-Text Search**: MySQL full-text indexes for fast service search
- **File Uploads**: Multer-based image uploads with enhanced validation (magic bytes, MIME type checking)
- **Security**: 
  - Helmet, CORS, per-user rate limiting
  - Input sanitization (XSS protection with DOMPurify)
  - Structured error responses with request IDs
  - Request ID tracking for distributed tracing
- **Monitoring & Observability**:
  - Prometheus metrics endpoint (`/metrics`)
  - Query performance monitoring (slow query detection)
  - Request/response logging (sanitized, configurable)
  - Enhanced health checks with database, memory, and uptime status
- **Audit Logging**: Comprehensive tracking of admin actions for compliance
- **Error Handling**: Comprehensive error handling with error codes and timestamps

## 📋 Prerequisites

- **Node.js** 20.x or higher
- **Yarn** 1.22.22 (via Corepack)
- **Docker** (optional, for MySQL database)
- **MySQL** 8.0+ (if not using Docker)

## 🏗️ Project Structure

```
bobs-garage-fullstack-at2/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── api/           # Axios configuration & API calls
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Redux store configuration
│   │   ├── styles/        # Theme & styling (Vanilla-Extract)
│   │   └── routes/        # Route protection components
│   └── package.json
├── server/                 # Node.js backend application
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers (including audit.controller.ts)
│   │   ├── db/            # Database models & migrations
│   │   │   ├── models/    # Sequelize models (including AuditLog.ts)
│   │   │   └── migrations/ # Database migrations
│   │   ├── middleware/    # Express middleware
│   │   │   ├── sanitize.ts      # Input sanitization
│   │   │   ├── metrics.ts       # Prometheus metrics
│   │   │   ├── queryPerformance.ts # Query monitoring
│   │   │   └── rateLimit.ts     # Per-user rate limiting
│   │   ├── routes/        # API routes (v1 versioned)
│   │   ├── services/      # Business logic (including audit.service.ts, metrics.service.ts)
│   │   ├── utils/         # Utility functions (including sanitize.ts)
│   │   └── validation/    # Zod schemas
│   ├── docker-compose.yml # MySQL container setup
│   └── package.json
├── server/postman/         # Postman collection for API testing
└── package.json            # Root workspace configuration
```

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bobs-garage-fullstack-at2
```

### 2. Enable Corepack and Yarn

```bash
corepack enable
corepack prepare yarn@1.22.22 --activate
```

### 3. Install Dependencies

```bash
yarn install
```

This will install dependencies for all workspaces (root, client, and server).

### 4. Database Setup

#### Option A: Using Docker (Recommended)

**Simple Setup (from root):**
```bash
docker-compose -f docker/docker-compose.yml up -d
```

**Production Setup (from server directory):**
```bash
cd server
docker-compose -f ../docker/docker-compose.mysql.yml up -d
```

This starts a MySQL container. The database will be automatically created based on your `.env` configuration.

#### Option B: Local MySQL Installation

1. Install MySQL 8.0+ on your system
2. Create a database:
   ```sql
   CREATE DATABASE bobs_garage;
   ```

### 5. Configure Environment Variables

#### Server Configuration

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and configure:

```env
# Server Configuration
NODE_ENV=development
PORT=4000

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=bobs_garage
DATABASE_USER=root
DATABASE_PASSWORD=your_password_here

# Authentication & Security
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRES_IN=1h
REFRESH_EXPIRES_IN=7d

# CORS & URLs
CORS_ORIGINS=http://localhost:5173
BASE_URL=http://localhost:4000

# File Uploads
UPLOAD_DIR=uploads
UPLOAD_MAX_SIZE=2097152

# Monitoring & Observability
METRICS_ENABLED=true              # Enable Prometheus metrics endpoint
SLOW_QUERY_THRESHOLD_MS=1000     # Log queries slower than this (ms)
DETAILED_LOGGING_ENABLED=false   # Enable detailed request/response logging
LOG_LEVEL=info                    # Log level: error, warn, info, debug

# Rate Limiting (Per-User)
RATE_LIMIT_MAX=200                # Max requests per window for unauthenticated users
RATE_LIMIT_AUTHENTICATED_MAX=500  # Max requests per window for authenticated users
RATE_LIMIT_WINDOW_MS=60000        # Rate limit window in milliseconds
```

#### Client Configuration

```bash
cd client
cp .env.example .env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

### 6. Seed the Database (Optional)

```bash
yarn seed
```

This populates the database with initial data for testing.

### 7. Start Development Servers

From the root directory:

```bash
yarn dev
```

This starts both the client (Vite dev server on port 5173) and server (Express on port 4000) concurrently.

Or start them separately:

```bash
# Terminal 1: Start server
yarn workspace server dev

# Terminal 2: Start client
yarn workspace client dev
```

## 📝 Available Scripts

### Root Level (Monorepo)

- `yarn dev` - Start both client and server in development mode
- `yarn build` - Build both client and server for production
- `yarn lint` - Lint all workspaces
- `yarn format` - Format code using Biome
- `yarn typecheck` - Type check all TypeScript files
- `yarn test` - Run tests in all workspaces
- `yarn seed` - Seed the database

### Client Scripts

- `yarn workspace client dev` - Start Vite dev server
- `yarn workspace client build` - Build for production
- `yarn workspace client preview` - Preview production build
- `yarn workspace client typecheck` - Type check only
- `yarn workspace client test` - Run client tests

### Server Scripts

- `yarn workspace server dev` - Start server with hot reload
- `yarn workspace server build` - Compile TypeScript to JavaScript
- `yarn workspace server start` - Start production server
- `yarn workspace server seed` - Seed the database
- `yarn workspace server migrate` - Run pending database migrations
- `yarn workspace server migrate:undo` - Rollback last migration
- `yarn workspace server migrate:undo:all` - Rollback all migrations
- `yarn workspace server migrate:status` - Check migration status
- `yarn workspace server typecheck` - Type check only
- `yarn workspace server test` - Run server tests

## 🌐 API Documentation

### Base URL

- Development: `http://localhost:4000/api/v1` (or `/api` for backward compatibility)
- All endpoints are versioned under `/api/v1/` with backward compatibility at `/api/`

### Authentication

All protected endpoints require a JWT access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

The refresh token is stored in an HttpOnly cookie and is automatically sent with requests.

### Endpoints

> **Note**: All endpoints are available at both `/api/v1/` (versioned) and `/api/` (backward compatibility). The documentation shows the versioned paths.

#### Auth
- `POST /api/v1/auth/register` - Register a new user (first user becomes admin)
- `POST /api/v1/auth/login` - Login and receive access token
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout (clears refresh token cookie)

#### Services (Enhanced Search)
- `GET /api/v1/services` - List all services (public)
  - Query params: `search` (full-text search), `published`, `sort`, `order`
  - Full-text search uses MySQL full-text indexes for fast, relevant results
- `GET /api/v1/services/:id` - Get service by ID (public)
- `POST /api/v1/services` - Create service (admin only)
- `PUT /api/v1/services/:id` - Update service (admin only)
- `DELETE /api/v1/services/:id` - Delete service (admin only)
- `POST /api/v1/services/:id/image` - Upload service image (admin only)

#### Staff
- `GET /api/v1/staff` - List all staff (public)
- `GET /api/v1/staff/:id` - Get staff by ID (public)
- `POST /api/v1/staff` - Create staff member (admin only)
- `PUT /api/v1/staff/:id` - Update staff member (admin only)
- `DELETE /api/v1/staff/:id` - Delete staff member (admin only)
- `POST /api/v1/staff/:id/image` - Upload staff photo (admin only)

#### User Profile
- `GET /api/v1/users/me` - Get current user profile (auth required)
- `PUT /api/v1/users/me` - Update current user profile (auth required)

#### Favorites
- `GET /api/v1/users/me/favorites` - List user's favorites (auth required)
- `POST /api/v1/users/me/favorites/:serviceId` - Add favorite (auth required)
- `GET /api/v1/users/me/favorites/:serviceId` - Check if favorited (auth required)
- `DELETE /api/v1/users/me/favorites/:serviceId` - Remove favorite (auth required)

#### Admin
- `GET /api/v1/admin/metrics` - Get dashboard metrics (admin only, cached)
- `GET /api/v1/admin/audit-logs` - Get audit logs with filtering (admin only)
  - Query params: `page`, `limit`, `userId`, `action`, `resource`, `startDate`, `endDate`
- `GET /api/v1/admin/users` - List all users (admin only)
- `GET /api/v1/admin/users/:id` - Get user by ID (admin only)
- `POST /api/v1/admin/users` - Create user (admin only)
- `PUT /api/v1/admin/users/:id` - Update user (admin only)
- `DELETE /api/v1/admin/users/:id` - Delete user (admin only)

#### Health & Monitoring
- `GET /health` - Enhanced health check with database, memory, cache, and uptime status
- `GET /db-status` - Database connection status
- `GET /metrics` - Prometheus metrics endpoint (when `METRICS_ENABLED=true`)
  - Includes: HTTP request metrics, error rates, cache hit/miss rates, database query metrics

### Postman Collection

A complete Postman collection with automated tests is available at `server/postman/Bob's_Garage_API.postman_collection.json`.

See `server/postman/README.md` for setup and usage instructions.

## 🔒 Authentication Flow

1. **Register/Login**: User registers or logs in and receives an access token
2. **Access Token**: Short-lived JWT token (default: 1 hour) sent in Authorization header
3. **Refresh Token**: Long-lived token (default: 7 days) stored in HttpOnly cookie
4. **Token Refresh**: Client automatically refreshes access token when it expires
5. **Admin Role**: First registered user automatically receives admin role

## 🎨 Theming

The application supports light and dark themes with a trans pride color scheme:

- **Dark Mode**: True dark background (#121212) with improved contrast
- **Light Mode**: Clean white background with trans pride accents
- **Accessibility**: All colors meet WCAG AA contrast ratio requirements

Theme preference is persisted in localStorage and can be toggled from the navigation bar.

## 🔒 Security Features

### Input Sanitization
- **XSS Protection**: All user inputs are sanitized using DOMPurify (server-side)
- **HTML Sanitization**: Removes dangerous HTML tags while preserving safe formatting
- **File Upload Validation**: 
  - Magic bytes (file signature) validation
  - Strict MIME type checking
  - File extension validation
  - Content validation middleware

### Rate Limiting
- **Per-User Rate Limiting**: Different limits for authenticated vs unauthenticated users
  - Authenticated users: 500 requests/minute (default)
  - Unauthenticated users: 200 requests/minute (default)
- **Auth Endpoint Protection**: Stricter limits on login/register endpoints (10 requests/minute)

### Audit Logging
- **Comprehensive Tracking**: All admin actions are logged with:
  - User ID and email
  - Action type (create, update, delete, upload, etc.)
  - Resource type and ID
  - Previous and new state (for updates)
  - IP address and user agent
  - Request ID for tracing
- **Admin Audit Logs Endpoint**: View and filter audit logs with pagination and date filtering

### Request Tracing
- **Request ID**: Every request receives a unique `X-Request-ID` header
- **Distributed Tracing**: Request IDs included in logs and error responses
- **Performance Headers**: Response time included in `X-Response-Time` header

## 📊 Monitoring & Observability

### Prometheus Metrics
When `METRICS_ENABLED=true`, the `/metrics` endpoint provides:
- **HTTP Metrics**: Request counts, durations, error rates
- **Cache Metrics**: Hit/miss rates by cache type
- **Database Metrics**: Query counts and durations by operation/table
- **System Metrics**: Memory usage, uptime

### Query Performance Monitoring
- **Slow Query Detection**: Logs queries taking longer than threshold (default: 1000ms)
- **Request Performance**: Tracks and logs slow requests (>1s)
- **Response Time Headers**: `X-Response-Time` header on all responses

### Enhanced Logging
- **Request/Response Logging**: Optional detailed logging with sensitive field redaction
- **Structured Logging**: Winston logger with configurable log levels
- **Production-Safe**: Detailed logging disabled by default, configurable via `DETAILED_LOGGING_ENABLED`

### Health Checks
- **Enhanced Health Endpoint**: `/health` provides:
  - Database connection status
  - Memory usage
  - Cache status
  - Uptime
  - System information

## 🗄️ Database Migrations

The project uses Sequelize migrations for database schema management:

### Running Migrations

```bash
# Run pending migrations
yarn workspace server migrate

# Rollback last migration
yarn workspace server migrate:undo

# Rollback all migrations
yarn workspace server migrate:undo:all

# Check migration status
yarn workspace server migrate:status
```

### Migration Files

- `20240101000001-create-audit-logs.js` - Creates audit_logs table
- `20240101000002-add-fulltext-index-services.js` - Adds full-text search index on services

Migrations are automatically run when the server starts in development mode.

## 🔍 Full-Text Search

Services support full-text search using MySQL full-text indexes:
- **Index Coverage**: `name` and `description` fields
- **Fast Queries**: Full-text indexes enable fast, relevant search results
- **Search Highlighting**: Frontend highlights matching search terms in results
- **Usage**: Add `?search=term` query parameter to services endpoint

## 🧪 Testing

### Running Tests

```bash
# Run all tests
yarn test

# Run client tests
yarn workspace client test

# Run server tests
yarn workspace server test

# Watch mode
yarn workspace client test:watch
yarn workspace server test:watch
```

## 🐳 Docker

### Database Container

The MySQL database can be run in a Docker container:

**From root directory:**
```bash
docker-compose -f docker/docker-compose.yml up -d      # Start database
docker-compose -f docker/docker-compose.yml down        # Stop database
docker-compose -f docker/docker-compose.yml logs -f     # View logs
docker-compose -f docker/docker-compose.yml down -v     # Stop and remove data volumes
```

**From server directory (production setup):**
```bash
cd server
docker-compose -f ../docker/docker-compose.mysql.yml up -d
docker-compose -f ../docker/docker-compose.mysql.yml down
```

The container uses environment variables from `server/.env` for configuration.

## 📦 Building for Production

```bash
# Build both client and server
yarn build

# The client build will be in client/dist/
# The server build will be in server/dist/

# To run the production server:
cd server
yarn start
```

Make sure to set `NODE_ENV=production` in your production environment variables.

## 🔧 Tech Stack

### Frontend
- **React** 19.1.1 - UI library
- **TypeScript** 5.8.3 - Type safety
- **Vite** 7.1.2 - Build tool and dev server
- **React Router** 7.8.1 - Client-side routing
- **Redux Toolkit** 2.8.2 - State management
- **React Query** 5.85.3 - Server state management
- **Bootstrap** 5.3.7 - UI components
- **Vanilla-Extract** - CSS-in-JS theming
- **Axios** 1.11.0 - HTTP client
- **Zod** 4.0.17 - Schema validation

### Backend
- **Node.js** 20+ - Runtime
- **Express** 5.1.0 - Web framework
- **TypeScript** 5.9.2 - Type safety
- **Sequelize** 6.37.7 - ORM with migrations
- **MySQL** 8.0+ - Database with full-text indexes
- **JWT** 9.0.2 - Authentication
- **Multer** 2.0.2 - File uploads
- **Zod** 4.0.17 - Validation
- **Helmet** 8.1.0 - Security headers
- **Winston** 3.18.3 - Logging
- **DOMPurify** + **JSDOM** - Server-side HTML sanitization
- **prom-client** - Prometheus metrics

### Development Tools
- **Biome** - Linting and formatting
- **Vitest** - Testing framework
- **Husky** - Git hooks
- **Docker** - Containerization

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure tests pass: `yarn test`
4. Run linting: `yarn lint`
5. Run type checking: `yarn typecheck`
6. Commit using conventional commits
7. Push and create a pull request

## 📄 License

ISC

## 🐛 Troubleshooting

### Database Connection Issues

- Ensure MySQL is running (check with `docker ps` if using Docker)
- Verify database credentials in `server/.env`
- Check that the database exists: `CREATE DATABASE bobs_garage;`

### Port Already in Use

- Change `PORT` in `server/.env` for the server
- Change Vite port in `client/vite.config.ts` if needed

### Authentication Issues

- Clear browser cookies and localStorage
- Verify JWT_SECRET is set in `server/.env` (min 32 characters)
- Check that refresh token cookie path matches your API routes

### Migration Issues

- Ensure database user has CREATE/ALTER/DROP permissions
- Check migration status: `yarn workspace server migrate:status`
- If migrations fail, check Sequelize logs for detailed error messages

### Metrics Not Appearing

- Verify `METRICS_ENABLED=true` in `server/.env`
- Check that `/metrics` endpoint is accessible (may require authentication in some setups)
- Ensure prom-client is properly installed: `yarn workspace server install`

### Build Errors

- Delete `node_modules` and reinstall: `rm -rf node_modules && yarn install`
- Clear TypeScript build cache: `rm -rf server/dist client/dist`
- Ensure all environment variables are set correctly

## 📚 Additional Resources

### Documentation
- [Styling Guide](STYLING_GUIDE.md) - Complete design system documentation with Trans Pride theme, accessibility features, and implementation guide
- [Architecture Overview](ARCHITECTURE.md) - System architecture, data flow, and technical decisions
- [Development Guide](DEVELOPMENT.md) - Development workflow, debugging, and common tasks
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions and best practices
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute to the project

### API & Testing
- [Postman Collection Documentation](server/postman/README.md)
- [Client README](client/README.md)
- [CI/CD Configuration](.github/workflows/ci.yml)

## 👥 Support

For issues and questions, please open an issue on the repository.

---

**Note**: This is a portfolio/learning project. Ensure all sensitive data is properly secured in production environments.
