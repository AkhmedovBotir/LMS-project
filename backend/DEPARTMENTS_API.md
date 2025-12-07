# Departments API Documentation

## Base URL
```
/api/departments
```

## Authentication
Barcha so'rovlar uchun `Authorization` headeri kerak:
```
Authorization: Bearer <your_token>
```

## Endpoints

### 1. Get All Departments
```http
GET /api/departments
```

**Query Parameters:**
- `page` (optional): Sahifa raqami (default: 1)
- `limit` (optional): Sahifadagi elementlar soni (default: 10)
- `search` (optional): Qidiruv so'zi (nomi bo'yicha)
- `status` (optional): Status filtri (active/inactive)

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "_id": "department_id",
            "name": "Department Name",
            "description": "Department Description",
            "status": "active",
            "created_at": "2024-03-20T10:00:00.000Z",
            "updated_at": "2024-03-20T10:00:00.000Z"
        }
    ],
    "pagination": {
        "total": 100,
        "page": 1,
        "limit": 10,
        "total_pages": 10
    }
}
```

### 2. Get Department by ID
```http
GET /api/departments/:id
```

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "department_id",
        "name": "Department Name",
        "description": "Department Description",
        "status": "active",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 3. Create Department
```http
POST /api/departments
```

**Request Body:**
```json
{
    "name": "Department Name",
    "description": "Department Description"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "department_id",
        "name": "Department Name",
        "description": "Department Description",
        "status": "active",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 4. Update Department
```http
PUT /api/departments/:id
```

**Request Body:**
```json
{
    "name": "Updated Department Name",
    "description": "Updated Department Description"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "department_id",
        "name": "Updated Department Name",
        "description": "Updated Department Description",
        "status": "active",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 5. Delete Department
```http
DELETE /api/departments/:id
```

**Response:**
```json
{
    "success": true,
    "message": "Department deleted successfully"
}
```

### 6. Update Department Status
```http
PATCH /api/departments/:id/status
```

**Request Body:**
```json
{
    "status": "inactive"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "department_id",
        "name": "Department Name",
        "description": "Department Description",
        "status": "inactive",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

## Error Responses

### 400 Bad Request
```json
{
    "success": false,
    "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
    "success": false,
    "message": "Authentication required"
}
```

### 404 Not Found
```json
{
    "success": false,
    "message": "Department not found"
}
```

### 500 Internal Server Error
```json
{
    "success": false,
    "message": "Internal server error"
}
```

## Notes
- Barcha vaqtlar UTC formatida qaytariladi
- Status faqat `active` yoki `inactive` bo'lishi mumkin
- Nomlar unique bo'lishi kerak
- O'chirilgan departmentlar bazadan to'liq o'chiriladi 