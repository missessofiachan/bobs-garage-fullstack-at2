# Bob's Garage - Full Stack Application

A modern full-stack web application for managing an auto repair shop, featuring user authentication, service management, staff profiles, favorites, and an admin dashboard. Includes advanced features like audit logging, full-text search, Prometheus metrics, input sanitization, and comprehensive monitoring. Built with React, TypeScript, Node.js, Express, and MySQL.

## 🚀 Features

### Frontend (React + TypeScript)
- **Public Pages**: Home, About, Services (with filtering and sorting), Staff, Contact, Accessibility, Privacy Policy, Terms of Service
- **Advanced Search**: Full-text search with search term highlighting
- **Authentication**: Login, Register, Forgot Password with validation
- **User Features**: Profile management, favorites system, settings (theme, accessibility preferences)
- **Admin Dashboard**: Comprehensive overview with metrics and system health
- **Admin Management**: CRUD operations for Services, Staff, and Users
- **Audit Logs**: View and filter admin action logs with search and date filtering
- **Media Uploads**: Image uploads for services and staff photos
- **Theme Support**: Light/Dark mode with trans pride color scheme
- **Accessibility**: WCAG AA compliant with proper contrast ratios, scroll-to-top functionality

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

Create a `docker-compose.yml` file in the project root (see Docker section below for example), then:

```bash
docker-compose up -d
```

This starts a MySQL container. The database will be automatically created based on your container configuration. Update your `server/.env` file to match the container settings.

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

Edit `client/.env` (if `.env.example` exists, otherwise create it):

```env
VITE_API_URL=http://localhost:4000/api
```

**Note**: If `.env.example` files don't exist, you can create `.env` files manually based on the configuration examples above.

### 6. Seed the Database (Optional)

```bash
cd server
tsx src/db/seeders/index.ts
```

This populates the database with initial data for testing (services, staff, and users).

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
- `yarn start` - Start production server
- `yarn lint` - Lint all workspaces
- `yarn lint:fix` - Fix linting issues automatically
- `yarn format` - Format code using Biome
- `yarn format:check` - Check formatting without fixing
- `yarn typecheck` - Type check all TypeScript files
- `yarn test` - Run tests in all workspaces (when test scripts are configured)
- `yarn test:watch` - Run tests in watch mode
- `yarn clean` - Clean build artifacts
- `yarn update:dependencies` - Update dependencies interactively

### Client Scripts

- `yarn workspace client dev` - Start Vite dev server (port 5173)
- `yarn workspace client build` - Build for production
- `yarn workspace client preview` - Preview production build
- `yarn workspace client typecheck` - Type check only
- `yarn workspace client clean` - Clean build artifacts
- `yarn workspace client test` - Run client tests with Vitest (if configured)

### Server Scripts

- `yarn workspace server dev` - Start server with hot reload (nodemon + tsx)
- `yarn workspace server build` - Compile TypeScript to JavaScript
- `yarn workspace server start` - Start production server (runs `node dist/server.js`)
- `yarn workspace server typecheck` - Type check only
- `yarn workspace server clean` - Clean build artifacts

### Database Scripts

**Migrations** (using Sequelize CLI):
```bash
# Run migrations (from server directory)
cd server
npx sequelize-cli db:migrate

# Rollback last migration
npx sequelize-cli db:migrate:undo

# Rollback all migrations
npx sequelize-cli db:migrate:undo:all

# Check migration status
npx sequelize-cli db:migrate:status
```

**Seeding**:
```bash
# Run seeders (from server directory)
cd server
tsx src/db/seeders/index.ts
```

**Testing** (using Vitest directly):
```bash
# Run server tests
cd server
npx vitest

# Run client tests
cd client
npx vitest

# Run tests in watch mode
npx vitest --watch

# Run tests with coverage
npx vitest --coverage
```

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

The project uses **Sequelize migrations** for database schema management. Migrations are located in `server/src/db/migrations/`.

### Running Migrations

```bash
# Navigate to server directory
cd server

# Run pending migrations
npx sequelize-cli db:migrate

# Rollback last migration
npx sequelize-cli db:migrate:undo

# Rollback all migrations
npx sequelize-cli db:migrate:undo:all

# Check migration status
npx sequelize-cli db:migrate:status

# Create a new migration
npx sequelize-cli migration:generate --name migration-name
```

### Migration Files

- `20240101000001-create-audit-logs.js` - Creates audit_logs table
- `20240101000002-add-fulltext-index-services.js` - Adds full-text search index on services

### Database Seeding

Seeders are located in `server/src/db/seeders/` and can be run with:

```bash
cd server
tsx src/db/seeders/index.ts
```

This will seed:
- Users (including an admin user)
- Staff members
- Services

**Note**: In development mode, the database is automatically synced when using `sequelize.sync()`. In production, migrations should be run manually before starting the server.

## 🔍 Full-Text Search

Services support full-text search using MySQL full-text indexes:
- **Index Coverage**: `name` and `description` fields
- **Fast Queries**: Full-text indexes enable fast, relevant search results
- **Search Highlighting**: Frontend highlights matching search terms in results
- **Usage**: Add `?search=term` query parameter to services endpoint

## 🧪 Testing

The project uses **Vitest** for testing. Test scripts can be run directly using the Vitest CLI.

### Running Tests

```bash
# Run server tests
cd server
npx vitest

# Run client tests
cd client
npx vitest

# Run tests in watch mode
npx vitest --watch

# Run tests with coverage
npx vitest --coverage

# Run specific test file
npx vitest tests/auth.integration.test.ts
```

### Test Configuration

- **Server**: Tests are configured in `server/vitest.config.ts` with Node.js environment
- **Client**: Tests are configured in `client/vitest.config.ts` with jsdom environment
- **Coverage**: Both configurations include coverage reporting (v8 provider)
- **Setup Files**: 
  - Server: `server/tests/setup.ts`
  - Client: `client/src/tests/setupTests.ts`

### Test Structure

- **Integration Tests**: Located in `server/tests/` (auth, admin, resources, etc.)
- **Unit Tests**: Component and utility tests in `client/src/` and `server/src/`

## 🐳 Docker

### Database Container

While Docker configuration files are not currently included in the repository, you can set up a MySQL container using Docker Compose. Create a `docker-compose.yml` file in the project root:

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: bobs-garage-mysql
    environment:
      MYSQL_ROOT_PASSWORD: your_password_here
      MYSQL_DATABASE: bobs_garage
      MYSQL_USER: bobs_garage
      MYSQL_PASSWORD: your_password_here
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

Then run:
```bash
docker-compose up -d      # Start database
docker-compose down        # Stop database
docker-compose logs -f     # View logs
docker-compose down -v     # Stop and remove data volumes
```

Alternatively, use a local MySQL installation as described in the setup instructions.

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
- **Redux Toolkit** 2.10.0 - State management
- **React Query** (TanStack Query) 5.90.6 - Server state management
- **Bootstrap** 5.3.7 - UI components
- **React Bootstrap** 2.10.10 - Bootstrap components for React
- **Framer Motion** 12.23.24 - Animation library
- **Vanilla-Extract** - CSS-in-JS theming
- **Radix UI** - Accessible UI primitives (Dialog)
- **React Icons** 5.3.0 - Icon library
- **Axios** 1.11.0 - HTTP client
- **Zod** 4.0.17 - Schema validation

### Backend
- **Node.js** 20+ - Runtime
- **Express** 5.1.0 - Web framework
- **TypeScript** 5.9.2 - Type safety
- **Sequelize** 6.37.7 - ORM with migrations
- **Sequelize TypeScript** 2.1.6 - TypeScript support for Sequelize
- **MySQL** 8.0+ (mysql2 3.14.3) - Database with full-text indexes
- **JWT** (jsonwebtoken 9.0.2) - Authentication
- **Bcrypt** 6.0.0 - Password hashing
- **Multer** 2.0.2 - File uploads
- **Zod** 4.0.17 - Validation
- **Helmet** 8.1.0 - Security headers
- **CORS** 2.8.5 - Cross-origin resource sharing
- **Cookie Parser** 1.4.7 - Cookie parsing
- **Compression** 1.7.4 - Response compression
- **Morgan** 1.10.1 - HTTP request logger
- **Winston** 3.18.3 - Logging
- **Express Rate Limit** 8.2.1 - Rate limiting
- **ioredis** 5.4.1 - Redis client (for caching/rate limiting)
- **DOMPurify** 3.3.0 + **JSDOM** 27.0.1 - Server-side HTML sanitization
- **prom-client** 15.1.0 - Prometheus metrics
- **Reflect Metadata** 0.2.2 - Metadata reflection

### Development Tools
- **Biome** 2.3.3 - Linting and formatting
- **Vitest** 3.2.4 - Testing framework
- **Husky** 9.1.5 - Git hooks
- **Commitlint** 20.1.0 - Commit message linting
- **Lint-staged** 16.2.6 - Pre-commit linting
- **Concurrently** 9.1.2 - Run multiple commands
- **Nodemon** 3.1.0 - Server auto-reload
- **TSX** 4.20.4 - TypeScript execution
- **Supertest** 7.1.4 - HTTP assertion library

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
- Run clean scripts: `yarn clean` or `yarn workspace server clean && yarn workspace client clean`

### Test Scripts Not Found

- Tests are configured with Vitest but may not have npm scripts defined
- Run tests directly: `npx vitest` from the `server` or `client` directory
- Check `vitest.config.ts` files for test configuration

## 📚 Additional Resources

### Documentation
- [Styling Guide](STYLING_GUIDE.md) - Complete design system documentation with Trans Pride theme, accessibility features, and implementation guide
- [Architecture Overview](ARCHITECTURE.md) - System architecture, data flow, and technical decisions
- [Development Guide](DEVELOPMENT.md) - Development workflow, debugging, and common tasks
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions and best practices
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute to the project

### API & Testing
- [Postman Collection Documentation](server/postman/README.md) - API testing with Postman
- [Database Migrations README](server/src/db/migrations/README.md) - Migration documentation

### Project Structure Notes
- **ScrollToTop Component**: Automatically scrolls to top on route changes
- **Error Boundary**: Global error handling for React components
- **Lazy Loading**: Pages are lazy-loaded for better performance
- **Accessibility**: WCAG AA compliant with settings page for user preferences

## 👥 Support

For issues and questions, please open an issue on the repository.

---

**Note**: This is a portfolio/learning project. Ensure all sensitive data is properly secured in production environments.
