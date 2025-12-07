# Guruh-O'quvchi (Group-Student) API Documentation

## Base URL
```
/api/group-students
```

## Authentication
Barcha so'rovlar uchun `Authorization` headeri kerak:
```
Authorization: Bearer <your_token>
```

## Endpoints

### 1. Get All Group-Student Records
```http
GET /api/group-students
```

**Query Parameters:**
- `page` (optional): Sahifa raqami (default: 1)
- `limit` (optional): Sahifadagi elementlar soni (default: 10)
- `group_id` (optional): Guruh ID si
- `student_id` (optional): O'quvchi ID si
- `status` (optional): Status filtri (active/inactive)

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "_id": "group_student_id",
            "group_id": {
                "_id": "group_id",
                "name": "Web Development Group 1",
                "course_id": {
                    "_id": "course_id",
                    "name": "Web Development"
                }
            },
            "student_id": {
                "_id": "student_id",
                "first_name": "Alice",
                "last_name": "Smith"
            },
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

### 2. Get Group-Student Record by ID
```http
GET /api/group-students/:id
```

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "group_student_id",
        "group_id": {
            "_id": "group_id",
            "name": "Web Development Group 1",
            "course_id": {
                "_id": "course_id",
                "name": "Web Development"
            }
        },
        "student_id": {
            "_id": "student_id",
            "first_name": "Alice",
            "last_name": "Smith"
        },
        "status": "active",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 3. Create Group-Student Record
```http
POST /api/group-students
```

**Request Body:**
```json
{
    "group_id": "group_id",
    "student_id": "student_id"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "group_student_id",
        "group_id": {
            "_id": "group_id",
            "name": "Web Development Group 1",
            "course_id": {
                "_id": "course_id",
                "name": "Web Development"
            }
        },
        "student_id": {
            "_id": "student_id",
            "first_name": "Alice",
            "last_name": "Smith"
        },
        "status": "active",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 4. Update Group-Student Record
```http
PUT /api/group-students/:id
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
        "_id": "group_student_id",
        "group_id": {
            "_id": "group_id",
            "name": "Web Development Group 1",
            "course_id": {
                "_id": "course_id",
                "name": "Web Development"
            }
        },
        "student_id": {
            "_id": "student_id",
            "first_name": "Alice",
            "last_name": "Smith"
        },
        "status": "inactive",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 5. Delete Group-Student Record
```http
DELETE /api/group-students/:id
```

**Response:**
```json
{
    "success": true,
    "message": "Guruh-o'quvchi ma'lumoti muvaffaqiyatli o'chirildi"
}
```

### 6. Get Group Students
```http
GET /api/group-students/group/:group_id
```

**Query Parameters:**
- `status` (optional): Status filtri (active/inactive)

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "_id": "group_student_id",
            "student_id": {
                "_id": "student_id",
                "first_name": "Alice",
                "last_name": "Smith"
            },
            "status": "active",
            "created_at": "2024-03-20T10:00:00.000Z",
            "updated_at": "2024-03-20T10:00:00.000Z"
        }
    ]
}
```

### 7. Get Student Groups
```http
GET /api/group-students/student/:student_id
```

**Query Parameters:**
- `status` (optional): Status filtri (active/inactive)

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "_id": "group_student_id",
            "group_id": {
                "_id": "group_id",
                "name": "Web Development Group 1",
                "course_id": {
                    "_id": "course_id",
                    "name": "Web Development"
                }
            },
            "status": "active",
            "created_at": "2024-03-20T10:00:00.000Z",
            "updated_at": "2024-03-20T10:00:00.000Z"
        }
    ]
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
    "message": "Guruh-o'quvchi ma'lumoti topilmadi"
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
- O'quvchi bir vaqtning o'zida bir nechta guruhlarda bo'lishi mumkin
- O'quvchi guruhga qo'shilganda, avtomatik ravishda `active` statusi beriladi
- O'quvchi guruhdan olib tashlanganda, statusi `inactive` ga o'zgartiriladi
- O'chirilgan guruh-o'quvchi ma'lumotlari bazadan to'liq o'chiriladi 