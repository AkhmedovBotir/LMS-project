# Guruh (Group) API Documentation

## Base URL
```
/api/groups
```

## Authentication
Barcha so'rovlar uchun `Authorization` headeri kerak:
```
Authorization: Bearer <your_token>
```

## Endpoints

### 1. Get All Groups
```http
GET /api/groups
```

**Query Parameters:**
- `page` (optional): Sahifa raqami (default: 1)
- `limit` (optional): Sahifadagi elementlar soni (default: 10)
- `search` (optional): Qidiruv so'zi (nomi bo'yicha)
- `course_id` (optional): Kurs ID si
- `teacher_id` (optional): O'qituvchi ID si
- `status` (optional): Status filtri (active/inactive/completed)
- `start_date` (optional): Boshlash sanasi (YYYY-MM-DD)
- `end_date` (optional): Tugash sanasi (YYYY-MM-DD)

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "_id": "group_id",
            "name": "Web Development Group 1",
            "time": "10:00-12:00",
            "days": "Dushanba, Chorshanba, Juma",
            "course": {
                "_id": "course_id",
                "name": "Web Development"
            },
            "teacher": {
                "_id": "employee_id",
                "first_name": "John",
                "last_name": "Doe"
            },
            "status": "active",
            "start_date": "2024-03-20T00:00:00.000Z",
            "end_date": "2024-09-20T00:00:00.000Z",
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

### 2. Get Group by ID
```http
GET /api/groups/:id
```

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "group_id",
        "name": "Web Development Group 1",
        "time": "10:00-12:00",
        "days": "Dushanba, Chorshanba, Juma",
        "course": {
            "_id": "course_id",
            "name": "Web Development"
        },
        "teacher": {
            "_id": "employee_id",
            "first_name": "John",
            "last_name": "Doe"
        },
        "students": [
            {
                "_id": "student_id",
                "first_name": "Alice",
                "last_name": "Smith",
                "payment_status": "paid"
            }
        ],
        "status": "active",
        "start_date": "2024-03-20T00:00:00.000Z",
        "end_date": "2024-09-20T00:00:00.000Z",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 3. Create Group
```http
POST /api/groups
```

**Request Body:**
```json
{
    "name": "Web Development Group 1",
    "time": "10:00-12:00",
    "days": "Dushanba, Chorshanba, Juma",
    "course_id": "course_id",
    "teacher_id": "employee_id",
    "start_date": "2024-03-20",
    "end_date": "2024-09-20",
    "status": "active" // optional
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "group_id",
        "name": "Web Development Group 1",
        "time": "10:00-12:00",
        "days": "Dushanba, Chorshanba, Juma",
        "course": {
            "_id": "course_id",
            "name": "Web Development"
        },
        "teacher": {
            "_id": "employee_id",
            "first_name": "John",
            "last_name": "Doe"
        },
        "status": "active",
        "start_date": "2024-03-20T00:00:00.000Z",
        "end_date": "2024-09-20T00:00:00.000Z",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 4. Update Group
```http
PUT /api/groups/:id
```

**Request Body:**
```json
{
    "name": "Web Development Group 1",
    "time": "10:00-12:00",
    "days": "Dushanba, Chorshanba, Juma",
    "course_id": "course_id",
    "teacher_id": "employee_id",
    "start_date": "2024-03-20",
    "end_date": "2024-09-20",
    "status": "active" // optional
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "group_id",
        "name": "Web Development Group 1",
        "time": "10:00-12:00",
        "days": "Dushanba, Chorshanba, Juma",
        "course": {
            "_id": "course_id",
            "name": "Web Development"
        },
        "teacher": {
            "_id": "employee_id",
            "first_name": "John",
            "last_name": "Doe"
        },
        "status": "active",
        "start_date": "2024-03-20T00:00:00.000Z",
        "end_date": "2024-09-20T00:00:00.000Z",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 5. Delete Group
```http
DELETE /api/groups/:id
```

**Response:**
```json
{
    "success": true,
    "message": "Guruh muvaffaqiyatli o'chirildi"
}
```

### 6. Add Student to Group
```http
POST /api/groups/add-student
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
        "group": {
            "_id": "group_id",
            "name": "Web Development Group 1",
            "course": {
                "_id": "course_id",
                "name": "Web Development"
            }
        },
        "student": {
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

### 7. Get Group Students
```http
GET /api/groups/:group_id/students
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
            "student": {
                "_id": "student_id",
                "first_name": "Alice",
                "last_name": "Smith",
                "payment_status": "paid"
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
    "message": "Guruh topilmadi"
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
- Status faqat `active`, `inactive` yoki `completed` bo'lishi mumkin
- Guruh nomi unique bo'lishi kerak
- O'chirilgan guruhlar bazadan to'liq o'chiriladi
- Guruh o'chirilganda, unga tegishli o'quvchilar ham o'chiriladi
- O'quvchi bir vaqtning o'zida bir nechta guruhlarda bo'lishi mumkin
- O'quvchi guruhga qo'shilganda, avtomatik ravishda `active` statusi beriladi
- O'quvchi guruhdan olib tashlanganda, statusi `inactive` ga o'zgartiriladi 