# Bob's Garage API - Postman Collection

This directory contains a comprehensive Postman collection for testing the Bob's Garage API.

## Setup

### 1. Import the Collection

1. Open Postman
2. Click **Import** button
3. Select the `Bob's_Garage_API.postman_collection.json` file
4. The collection will be imported with all endpoints organized by category

### 2. Create an Environment (Recommended)

1. Click the **Environments** tab in Postman
2. Click **+** to create a new environment
3. Name it "Bob's Garage Local" (or similar)
4. Add the following variables:

| Variable | Initial Value | Current Value | Description |
|----------|---------------|---------------|-------------|
| `baseUrl` | `http://localhost:4000` | `http://localhost:4000` | API base URL |
| `accessToken` | (empty) | (auto-populated) | JWT access token (auto-saved after login) |
| `testEmail` | (empty) | (auto-populated) | Test user email (auto-saved after register) |
| `serviceId` | (empty) | (auto-populated) | Service ID (auto-saved from list) |
| `staffId` | (empty) | (auto-populated) | Staff ID (auto-saved from list) |
| `userId` | (empty) | (auto-populated) | User ID (auto-saved from admin list) |
| `createdServiceId` | (empty) | (auto-populated) | Created service ID |
| `createdStaffId` | (empty) | (auto-populated) | Created staff ID |
| `userRole` | (empty) | (auto-populated) | Current user role |

5. Select your environment from the dropdown in the top-right corner

## Collection Structure

The collection is organized into the following folders:

### 🔐 Auth
- **Register** - Create a new user account
- **Login** - Authenticate and get access token (auto-saves token)
- **Refresh Token** - Refresh access token using HttpOnly cookie

### 🔧 Services
- **List Services** - Get all services (public)
- **Get Service by ID** - Get a specific service
- **Create Service** - Create a new service (Admin only)
- **Update Service** - Update a service (Admin only)
- **Upload Service Image** - Upload image for a service (Admin only)
- **Delete Service** - Delete a service (Admin only)

### 👥 Staff
- **List Staff** - Get all staff members (public)
- **Get Staff by ID** - Get a specific staff member
- **Create Staff** - Create a new staff member (Admin only)
- **Update Staff** - Update a staff member (Admin only)
- **Upload Staff Photo** - Upload photo for staff (Admin only)
- **Delete Staff** - Delete a staff member (Admin only)

### 👤 User (Me)
- **Get My Profile** - Get current user's profile (Auth required)
- **Update My Profile** - Update current user's profile (Auth required)

### ⭐ Favorites
- **List Favorites** - Get user's favorite services (Auth required)
- **Add Favorite** - Add a service to favorites (Auth required)
- **Check Favorite** - Check if a service is favorited (Auth required)
- **Remove Favorite** - Remove a service from favorites (Auth required)

### 🛡️ Admin
- **Get Metrics** - Get admin dashboard metrics (Admin only)
- **List Users** - Get all users (Admin only)
- **Get User by ID** - Get a specific user (Admin only)
- **Create User** - Create a new user (Admin only)
- **Update User** - Update a user (Admin only)
- **Delete User** - Delete a user (Admin only)

### 💚 Health
- **Health Check** - Check API health status
- **DB Status** - Check database connection status

## Usage Workflow

### 1. Initial Setup (First Time)
1. Run **Auth → Register** to create a test account
2. Run **Auth → Login** to get an access token (auto-saved)
3. If you need admin access, ensure the first registered user has the admin role

### 2. Testing Protected Endpoints
Most endpoints require authentication. The collection uses Bearer token authentication automatically if `accessToken` is set in the environment.

### 3. Testing Admin Endpoints
1. Ensure you're logged in as an admin user
2. Admin endpoints will automatically use the saved `accessToken`

### 4. Automated Testing
Each request includes automated tests that:
- Verify status codes
- Validate response structure
- Auto-save IDs and tokens to environment variables

## Tips

### Running the Entire Collection
1. Click on the collection name
2. Click **Run** button
3. Select the requests you want to run
4. Click **Run Bob's Garage API**

**Note:** Make sure to run Auth → Register and Auth → Login first to set up authentication.

### File Uploads
For image upload endpoints (Services → Upload Service Image, Staff → Upload Staff Photo):
1. Click on the request
2. In the Body tab, select "form-data"
3. Click "Select Files" next to the file field
4. Choose an image file from your computer

### Variables Auto-Save
The collection automatically saves:
- `accessToken` after login
- `serviceId` and `staffId` after listing
- `createdServiceId` and `createdStaffId` after creating
- `userId` after listing admin users

These variables are used in subsequent requests automatically.

## Troubleshooting

### 401 Unauthorized
- Make sure you've run **Auth → Login** first
- Check that `accessToken` is set in your environment
- Try running **Auth → Refresh Token** to get a new token

### 403 Forbidden (Admin endpoints)
- Ensure your user has the `admin` role
- The first registered user automatically gets admin role

### Connection Refused
- Make sure the server is running on `http://localhost:4000`
- Update `baseUrl` in your environment if the server is running on a different port

## Collection Features

- ✅ **Automated Tests** - Each request includes test scripts
- ✅ **Auto Token Management** - Tokens are automatically saved and used
- ✅ **Variable Management** - IDs are automatically saved for chained requests
- ✅ **Organized Structure** - Endpoints grouped by functionality
- ✅ **Bearer Token Auth** - Collection-level auth configured
- ✅ **Error Handling** - Tests validate error responses

## Notes

- The refresh token endpoint uses HttpOnly cookies, so it works automatically in Postman if cookies are enabled
- Rate limiting applies to auth endpoints (5 requests per minute)
- File uploads are limited to 2MB by default
- Image uploads accept: PNG, JPEG, GIF, WEBP, SVG
