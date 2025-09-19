# Recipe Sharing API - Complete API Reference

This document provides comprehensive API documentation for all endpoints, request/response formats, authentication, and usage examples.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://api.recipeapp.com`

## Authentication

The API uses JWT (JSON Web Token) based authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Flow

1. **Sign Up**: `POST /api/auth/signup`
2. **Verify Email**: `GET /api/auth/verify-email/:token`
3. **Login**: `POST /api/auth/login`
4. **Use JWT Token**: Include in Authorization header for protected routes
5. **Refresh Token**: `POST /api/auth/refresh-token` (when token expires)

## Response Format

All API responses follow a consistent format:

```json
{
  "status": "success|error",
  "data": {
    // Response data object
  },
  "message": "Human-readable message",
  "pagination": {  // Only for paginated endpoints
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Error Handling

Error responses include appropriate HTTP status codes and error details:

```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    // Additional error context
  }
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `422` - Unprocessable Entity (validation failed)
- `500` - Internal Server Error

## Authentication & User Management

### Register New User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "64f7b2a5c8e4f1234567890a",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": false
    }
  }
}
```

### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f7b2a5c8e4f1234567890a",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### Other Authentication Endpoints

- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify-email/:token` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `PATCH /api/auth/reset-password/:token` - Reset password with token
- `POST /api/auth/refresh-token` - Get new access token
- `PATCH /api/auth/update-password` - Update password (authenticated)

## User Profile & Social

### Get Current User Profile
```http
GET /api/users/me/profile
Authorization: Bearer <token>
```

### Update User Profile
```http
PUT /api/users/me/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "firstName": "Jane",
  "lastName": "Smith",
  "bio": "Passionate home cook",
  "profilePicture": "<file>"
}
```

### Follow/Unfollow User
```http
POST /api/users/follow/64f7b2a5c8e4f1234567890b
Authorization: Bearer <token>

DELETE /api/users/follow/64f7b2a5c8e4f1234567890b
Authorization: Bearer <token>
```

## Recipe Management

### Create New Recipe
```http
POST /api/recipes
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Chocolate Chip Cookies",
  "description": "Delicious homemade chocolate chip cookies",
  "ingredients": [
    {
      "name": "flour",
      "amount": 2,
      "unit": "cups"
    },
    {
      "name": "chocolate chips",
      "amount": 1,
      "unit": "cup"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "description": "Preheat oven to 375°F"
    },
    {
      "step": 2,
      "description": "Mix flour and chocolate chips in a bowl"
    }
  ],
  "cuisineType": "American",
  "difficulty": "Easy",
  "prepTime": 15,
  "cookTime": 12,
  "servings": 24,
  "images": ["<file1>", "<file2>"]
}
```

### Get Recipe by ID
```http
GET /api/recipes/64f7b2a5c8e4f1234567890a
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "recipe": {
      "id": "64f7b2a5c8e4f1234567890a",
      "title": "Chocolate Chip Cookies",
      "description": "Delicious homemade chocolate chip cookies",
      "author": {
        "id": "64f7b2a5c8e4f1234567890b",
        "username": "johndoe",
        "firstName": "John",
        "lastName": "Doe"
      },
      "ingredients": [...],
      "instructions": [...],
      "images": ["/uploads/recipes/image1.jpg"],
      "cuisineType": "American",
      "difficulty": "Easy",
      "prepTime": 15,
      "cookTime": 12,
      "servings": 24,
      "averageRating": 4.5,
      "likesCount": 15,
      "views": 234,
      "createdAt": "2023-09-05T10:30:00Z"
    }
  }
}
```

### Update Recipe
```http
PUT /api/recipes/64f7b2a5c8e4f1234567890a
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Recipe Title",
  "description": "Updated description"
}
```

### Delete Recipe
```http
DELETE /api/recipes/64f7b2a5c8e4f1234567890a
Authorization: Bearer <token>
```

## Recipe Discovery & Search

### Get All Recipes (with pagination)
```http
GET /api/recipes?page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

### Advanced Recipe Search
```http
GET /api/recipes/search?keywords=chocolate&cuisineType=american&difficulty=easy&maxCookingTime=30&page=1&limit=10
```

**Query Parameters:**
- `keywords` - Search in title, description, tags
- `ingredients` - Comma-separated ingredient names
- `cuisineType` - Cuisine type filter
- `mealType` - Comma-separated meal types
- `dietaryRestrictions` - Comma-separated dietary restrictions
- `difficulty` - Easy, Medium, or Hard
- `maxCookingTime` - Maximum cooking time in minutes
- `sortBy` - createdAt, averageRating, title, cookTime
- `sortOrder` - asc or desc
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Get Recipe Categories
```http
GET /api/recipes/categories
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "categories": {
      "cuisineTypes": ["Italian", "Asian", "Mexican", "American"],
      "mealTypes": ["breakfast", "lunch", "dinner", "snack"],
      "dietaryRestrictions": ["vegetarian", "vegan", "gluten-free"],
      "tags": ["quick", "healthy", "comfort-food", "holiday"]
    }
  }
}
```

### Featured & Popular Recipes
```http
GET /api/recipes/featured?limit=5
GET /api/recipes/popular?limit=10
```

### Recipes by Category
```http
GET /api/recipes/cuisine/italian?page=1&limit=10
GET /api/recipes/meal/breakfast?page=1&limit=10
GET /api/recipes/dietary/vegetarian?page=1&limit=10
GET /api/recipes/tag/quick?page=1&limit=10
```

## Recipe Interactions

### Rate Recipe
```http
POST /api/recipes/64f7b2a5c8e4f1234567890a/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "review": "Absolutely delicious! Will make again."
}
```

### Like/Unlike Recipe
```http
POST /api/recipes/64f7b2a5c8e4f1234567890a/like
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "liked": true,
    "likesCount": 16,
    "message": "Recipe liked successfully"
  }
}
```

### Share Recipe
```http
POST /api/recipes/64f7b2a5c8e4f1234567890a/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "method": "email",
  "email": "friend@example.com",
  "message": "Check out this amazing recipe!"
}
```

Or get a shareable link:
```http
POST /api/recipes/64f7b2a5c8e4f1234567890a/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "method": "link"
}
```

## User Favorites

### Get User Favorites
```http
GET /api/users/me/favorites?page=1&limit=10
Authorization: Bearer <token>
```

### Add to Favorites
```http
POST /api/users/favorites/64f7b2a5c8e4f1234567890a
Authorization: Bearer <token>
```

### Remove from Favorites
```http
DELETE /api/users/favorites/64f7b2a5c8e4f1234567890a
Authorization: Bearer <token>
```

## Comments

### Get Recipe Comments
```http
GET /api/comments/recipe/64f7b2a5c8e4f1234567890a?page=1&limit=10
```

### Add Comment
```http
POST /api/comments/recipe/64f7b2a5c8e4f1234567890a
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "This recipe is amazing! Thanks for sharing.",
  "parentComment": null  // Optional: for replies
}
```

### Update Comment
```http
PUT /api/comments/64f7b2a5c8e4f1234567890c
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated comment content"
}
```

### Delete Comment
```http
DELETE /api/comments/64f7b2a5c8e4f1234567890c
Authorization: Bearer <token>
```

### Like/Unlike Comment
```http
POST /api/comments/64f7b2a5c8e4f1234567890c/like
Authorization: Bearer <token>

DELETE /api/comments/64f7b2a5c8e4f1234567890c/like
Authorization: Bearer <token>
```

## Notifications

### Get User Notifications
```http
GET /api/notifications?page=1&limit=20
Authorization: Bearer <token>
```

### Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer <token>
```

### Mark Notification as Read
```http
PUT /api/notifications/64f7b2a5c8e4f1234567890d/read
Authorization: Bearer <token>
```

### Mark All Notifications as Read
```http
PUT /api/notifications/mark-all-read
Authorization: Bearer <token>
```

### Delete Notification
```http
DELETE /api/notifications/64f7b2a5c8e4f1234567890d
Authorization: Bearer <token>
```

## Utility Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-09-05T10:30:00Z",
  "uptime": 3600,
  "environment": "development"
}
```

### API Documentation
```http
GET /api-docs
```
Returns the interactive Swagger UI for API exploration.

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Upload endpoints**: 10 requests per 15 minutes per user

When rate limit is exceeded, the API returns:
```json
{
  "status": "error",
  "message": "Too many requests, please try again later",
  "retryAfter": 900
}
```

## File Upload

Image uploads are supported for:
- **Profile pictures**: Maximum 5MB, formats: JPEG, PNG
- **Recipe images**: Maximum 10MB per image, up to 5 images per recipe

Upload endpoints accept `multipart/form-data` with the file field names as specified in each endpoint.

## Pagination

Paginated endpoints return pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Error Examples

### Validation Error (400)
```json
{
  "status": "error",
  "message": "Validation failed",
  "details": {
    "errors": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "password",
        "message": "Password must be at least 6 characters"
      }
    ]
  }
}
```

### Authentication Error (401)
```json
{
  "status": "error",
  "message": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

### Not Found Error (404)
```json
{
  "status": "error",
  "message": "Recipe not found",
  "code": "NOT_FOUND"
}
```

### Server Error (500)
```json
{
  "status": "error",
  "message": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

For more information about the API architecture and design patterns, see the [Architecture Documentation](ARCHITECTURE.md).