# Authentication API Documentation

## Base URL
```
http://localhost:5000/api/auth
```

## Authentication
Most endpoints require authentication using a JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Endpoints

### Login
Authenticate and get access token.

**URL:** `/login`  
**Method:** `POST`  
**Auth Required:** No

**Request Body:**
```json
{
    "username": "string",
    "password": "string"
}
```

**Success Response:**
- **Code:** 200
```json
{
    "success": true,
    "data": {
        "token": "string",
        "user": {
            "id": "string",
            "first_name": "string",
            "last_name": "string",
            "username": "string",
            "phone": "string",
            "user_type_id": "string",
            "user_type": "string",
            "status": "string",
            "created_at": "date",
            "updated_at": "date"
        }
    }
}
```

**Error Response:**
- **Code:** 400 - Bad Request
```json
{
    "success": false,
    "message": "Username and password are required"
}
```
- **Code:** 401 - Unauthorized
```json
{
    "success": false,
    "message": "Invalid credentials"
}
```

### Get User Types
Get all available user types.

**URL:** `/user-types`  
**Method:** `GET`  
**Auth Required:** Yes

**Success Response:**
- **Code:** 200
```json
{
    "success": true,
    "data": [
        {
            "_id": "string",
            "name": "string",
            "created_at": "date",
            "updated_at": "date"
        }
    ]
}
```

### Get All Admins
Get paginated list of admins with filters.

**URL:** `/admins`  
**Method:** `GET`  
**Auth Required:** Yes

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in first_name, last_name, username, phone
- `status` (optional): Filter by status
- `user_type_id` (optional): Filter by user type
- `sort_by` (optional): Sort field (default: _id)
- `sort_order` (optional): Sort direction (asc/desc, default: asc)

**Success Response:**
- **Code:** 200
```json
{
    "success": true,
    "data": [
        {
            "_id": "string",
            "first_name": "string",
            "last_name": "string",
            "username": "string",
            "phone": "string",
            "user_type_id": {
                "_id": "string",
                "name": "string"
            },
            "status": "string",
            "created_at": "date",
            "updated_at": "date"
        }
    ],
    "pagination": {
        "total": "number",
        "page": "number",
        "limit": "number",
        "total_pages": "number"
    }
}
```

### Get Single Admin
Get details of a specific admin.

**URL:** `/admins/:id`  
**Method:** `GET`  
**Auth Required:** Yes

**URL Parameters:**
- `id`: Admin ID

**Success Response:**
- **Code:** 200
```json
{
    "success": true,
    "data": {
        "_id": "string",
        "first_name": "string",
        "last_name": "string",
        "username": "string",
        "phone": "string",
        "user_type_id": {
            "_id": "string",
            "name": "string"
        },
        "status": "string",
        "created_at": "date",
        "updated_at": "date"
    }
}
```

**Error Response:**
- **Code:** 404 - Not Found
```json
{
    "success": false,
    "message": "Admin not found"
}
```

### Create Admin
Create a new admin user.

**URL:** `/admins`  
**Method:** `POST`  
**Auth Required:** Yes

**Request Body:**
```json
{
    "first_name": "string",
    "last_name": "string",
    "username": "string",
    "phone": "string",
    "password": "string",
    "user_type_id": "string"
}
```

**Success Response:**
- **Code:** 201
```json
{
    "success": true,
    "data": {
        "_id": "string",
        "first_name": "string",
        "last_name": "string",
        "username": "string",
        "phone": "string",
        "user_type_id": "string",
        "status": "string",
        "created_at": "date",
        "updated_at": "date"
    }
}
```

**Error Response:**
- **Code:** 400 - Bad Request
```json
{
    "success": false,
    "message": "Username or phone number already exists"
}
```

### Update Admin
Update an existing admin.

**URL:** `/admins/:id`  
**Method:** `PUT`  
**Auth Required:** Yes

**URL Parameters:**
- `id`: Admin ID

**Request Body:**
```json
{
    "first_name": "string",
    "last_name": "string",
    "username": "string",
    "phone": "string",
    "password": "string",
    "user_type_id": "string",
    "status": "string"
}
```

**Success Response:**
- **Code:** 200
```json
{
    "success": true,
    "data": {
        "_id": "string",
        "first_name": "string",
        "last_name": "string",
        "username": "string",
        "phone": "string",
        "user_type_id": "string",
        "status": "string",
        "created_at": "date",
        "updated_at": "date"
    }
}
```

**Error Response:**
- **Code:** 400 - Bad Request
```json
{
    "success": false,
    "message": "Invalid admin ID"
}
```
- **Code:** 404 - Not Found
```json
{
    "success": false,
    "message": "Admin not found"
}
```

### Delete Admin
Delete an admin.

**URL:** `/admins/:id`  
**Method:** `DELETE`  
**Auth Required:** Yes

**URL Parameters:**
- `id`: Admin ID

**Success Response:**
- **Code:** 200
```json
{
    "success": true,
    "message": "Admin deleted successfully"
}
```

**Error Response:**
- **Code:** 404 - Not Found
```json
{
    "success": false,
    "message": "Admin not found"
}
```

### Update Admin Status
Update admin's status (active/inactive).

**URL:** `/admins/:id/status`  
**Method:** `PATCH`  
**Auth Required:** Yes

**URL Parameters:**
- `id`: Admin ID

**Request Body:**
```json
{
    "status": "active" | "inactive"
}
```

**Success Response:**
- **Code:** 200
```json
{
    "success": true,
    "data": {
        "_id": "string",
        "status": "string"
    }
}
```

**Error Response:**
- **Code:** 404 - Not Found
```json
{
    "success": false,
    "message": "Admin not found"
}
```

## Error Codes
- 400: Bad Request - Invalid input data
- 401: Unauthorized - Authentication required or invalid token
- 404: Not Found - Resource not found
- 500: Internal Server Error - Server error

## Notes
- All timestamps are in ISO 8601 format
- Passwords are automatically hashed before saving
- Status can be either 'active' or 'inactive'
- User types must exist before creating an admin
- Phone numbers should be in international format 