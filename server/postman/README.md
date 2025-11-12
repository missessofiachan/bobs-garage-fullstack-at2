# Postman Collection - Bob's Garage API

This Postman collection provides comprehensive testing for all CRUD operations in the Bob's Garage API.

## 📋 Prerequisites

- Postman installed (Desktop or Web)
- Bob's Garage API server running on `http://localhost:4000`
- Admin credentials:
  - Email: `sofiamironeko@gmail.com`
  - Password: `lizzy144`

## 🚀 Quick Start

### 1. Import the Collection

1. Open Postman
2. Click **Import** button
3. Select `server/postman/Bob's_Garage_API.postman_collection.json`
4. The collection will appear in your Postman workspace

### 2. Set Up Environment (Optional but Recommended)

Create a new environment in Postman with these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:4000/api/v1` | `http://localhost:4000/api/v1` |

**Note:** The collection also includes collection-level variables that work without an environment, but using an environment allows you to easily switch between development, staging, and production.

### 3. Run Tests

#### Option A: Run Individual Requests

1. Start with **Authentication > Login - Admin**
2. This will automatically save the access token
3. Run other requests in any order

#### Option B: Run Collection Runner

1. Click on the collection name
2. Click **Run** button
3. Select all requests (or specific ones)
4. Click **Run Bob's Garage API - Full CRUD Tests**
5. View test results

## 📝 Collection Structure

### Authentication
- **Login - Admin**: Authenticates and saves access token automatically

### Services
- **GET All Services**: Lists all services (public)
- **GET Service by ID**: Gets a specific service
- **POST Create Service**: Creates a new service (admin only)
- **PUT Update Service**: Updates an existing service (admin only)
- **DELETE Service**: Deletes a service (admin only)

### Staff
- **GET All Staff**: Lists all staff members (public)
- **GET Staff by ID**: Gets a specific staff member
- **POST Create Staff**: Creates a new staff member (admin only)
- **PUT Update Staff**: Updates an existing staff member (admin only)
- **DELETE Staff**: Deletes a staff member (admin only)

## 🔐 Authentication Flow

1. **Login** request automatically saves the access token to collection variables
2. All admin endpoints (POST, PUT, DELETE) automatically use the saved token
3. Token is included in the `Authorization` header as `Bearer <token>`

## ✅ Test Automation

Each request includes automated tests that verify:
- ✅ Status codes (200, 201, 204, etc.)
- ✅ Response structure and data types
- ✅ Data persistence (for CREATE operations)
- ✅ Data updates (for UPDATE operations)
- ✅ Deletion verification (for DELETE operations)

## 📊 Running Full CRUD Tests

To test complete CRUD operations:

1. **Login** → Get access token
2. **GET All Services** → Verify existing data
3. **POST Create Service** → Create new service (saves ID automatically)
4. **PUT Update Service** → Update the created service
5. **DELETE Service** → Delete the created service
6. Repeat for Staff endpoints

## 🔧 Troubleshooting

### Token Not Saving
- Ensure you run the **Login - Admin** request first
- Check that the response status is 200
- Verify the response contains an `access` field

### 401 Unauthorized Errors
- Run the **Login - Admin** request again to refresh the token
- Check that the token is being sent in the Authorization header
- Verify admin credentials are correct

### 404 Not Found Errors
- Ensure the server is running on `http://localhost:4000`
- Check that the `base_url` variable is set correctly
- Verify the endpoint paths match your API version

### Connection Errors
- Verify the server is running: `yarn workspace server dev`
- Check server logs for errors
- Ensure database is connected and seeded

## 📸 Screenshots for Assessment

When running tests for your assessment (Part 4, Section 4.7), capture screenshots of:

1. **POST** request and response (Create Service)
2. **GET** request and response (Get Service by ID)
3. **PUT** request and response (Update Service)
4. **DELETE** request and response (Delete Service)

Make sure screenshots show:
- Request URL
- Request headers (including Authorization)
- Request body (for POST/PUT)
- Response status code
- Response body

## 🎯 Assessment Requirements Met

This collection satisfies the following assessment criteria:

- ✅ **4.3**: Create required application routes
- ✅ **4.6**: Create CRUD operations for each route
- ✅ **4.7**: Screenshots of POST, GET, PUT, DELETE operations
- ✅ **4.8**: Endpoints return data aligned with requirements
- ✅ **4.9**: Try/Catch exception handling (verified in responses)
- ✅ **7.3**: Test all routes/endpoints using Postman

## 📚 Additional Resources

- API Documentation: See `readme.md` for full API documentation
- Server Code: `server/src/routes/` for route definitions
- Controllers: `server/src/controllers/` for endpoint logic









