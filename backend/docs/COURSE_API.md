# Kurs (Course) API Documentation

## Base URL
```
/api/courses
```

## Authentication
Barcha so'rovlar uchun `Authorization` headeri kerak:
```
Authorization: Bearer <your_token>
```

## Endpoints

### 1. Get All Courses
```http
GET /api/courses
```

**Query Parameters:**
- `page` (optional): Sahifa raqami (default: 1)
- `limit` (optional): Sahifadagi elementlar soni (default: 10)
- `status` (optional): Status filtri (active/inactive)
- `search` (optional): Qidiruv so'zi (nomi bo'yicha)

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "_id": "course_id",
            "name": "Web Development",
            "description": "Full stack web development course",
            "duration_months": 6,
            "price": 2000000,
            "instructor": {
                "_id": "employee_id",
                "first_name": "John",
                "last_name": "Doe",
                "position": "Senior Developer"
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

### 2. Get Course by ID
```http
GET /api/courses/:id
```

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "course_id",
        "name": "Web Development",
        "description": "Full stack web development course",
        "duration_months": 6,
        "price": 2000000,
        "instructor": {
            "_id": "employee_id",
            "first_name": "John",
            "last_name": "Doe",
            "position": "Senior Developer"
        },
        "status": "active",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 3. Create Course
```http
POST /api/courses
```

**Request Body:**
```json
{
    "name": "Web Development",
    "description": "Full stack web development course",
    "duration_months": 6,
    "price": 2000000,
    "instructor_id": "employee_id" // Har qanday xodim ID si
}
```

**Response:**
```json
{
    "success": true,
    "message": "Kurs muvaffaqiyatli yaratildi",
    "data": {
        "_id": "course_id",
        "name": "Web Development",
        "description": "Full stack web development course",
        "duration_months": 6,
        "price": 2000000,
        "instructor": {
            "_id": "employee_id",
            "first_name": "John",
            "last_name": "Doe",
            "position": "Senior Developer"
        },
        "status": "active",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 4. Update Course
```http
PUT /api/courses/:id
```

**Request Body:**
```json
{
    "name": "Web Development",
    "description": "Full stack web development course",
    "duration_months": 6,
    "price": 2000000,
    "instructor_id": "employee_id", // Har qanday xodim ID si
    "status": "active" // optional
}
```

**Response:**
```json
{
    "success": true,
    "message": "Kurs yangilandi",
    "data": {
        "_id": "course_id",
        "name": "Web Development",
        "description": "Full stack web development course",
        "duration_months": 6,
        "price": 2000000,
        "instructor": {
            "_id": "employee_id",
            "first_name": "John",
            "last_name": "Doe",
            "position": "Senior Developer"
        },
        "status": "active",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 5. Delete Course
```http
DELETE /api/courses/:id
```

**Response:**
```json
{
    "success": true,
    "message": "Kurs o'chirildi"
}
```

### 6. Update Course Status
```http
PATCH /api/courses/:id/status
```

**Request Body:**
```json
{
    "status": "inactive" // Faqat: "active" yoki "inactive"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Kurs statusi yangilandi",
    "data": {
        "_id": "course_id",
        "name": "Web Development",
        "status": "inactive"
    }
}
```

### 7. Get Course Statistics
```http
GET /api/courses/:id/statistics
```

**Response:**
```json
{
    "success": true,
    "data": {
        "course": {
            "_id": "course_id",
            "name": "Web Development"
        },
        "statistics": {
            "total_groups": 5,
            "active_groups": 3,
            "total_students": 100,
            "active_students": 75,
            "completed_students": 20,
            "dropout_students": 5,
            "total_revenue": 200000000,
            "average_attendance": 85
        }
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
    "message": "Kurs topilmadi"
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
- Kurs nomi unique bo'lishi kerak
- O'chirilgan kurslar bazadan to'liq o'chiriladi
- Kurs o'chirilganda, unga tegishli guruhlar va o'quvchilar ham o'chiriladi
- Kurs statusi `inactive` bo'lganda, yangi guruhlar yaratilmaydi
- O'qituvchi sifatida har qanday xodimni tayinlash mumkin (role shart emas)
- Bir xodim bir vaqtning o'zida bir nechta kurslarni o'tishi mumkin
- O'qituvchi o'zgartirilganda, mavjud guruhlar uchun o'qituvchi o'zgarmaydi 