# Davomat (Attendance) API Documentation

## Base URL
```
/api/attendances
```

## Authentication
Barcha so'rovlar uchun `Authorization` headeri kerak:
```
Authorization: Bearer <your_token>
```

## Endpoints

### 1. Get All Attendances
```http
GET /api/attendances
```

**Query Parameters:**
- `page` (optional): Sahifa raqami (default: 1)
- `limit` (optional): Sahifadagi elementlar soni (default: 10)
- `employee_id` (optional): Xodim ID si
- `date` (optional): Sana (YYYY-MM-DD formatida)
- `status` (optional): Status filtri (present/absent/late)
- `search` (optional): Qidiruv so'zi (xodim ismi bo'yicha)

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "_id": "attendance_id",
            "employee_id": {
                "_id": "employee_id",
                "first_name": "John",
                "last_name": "Doe"
            },
            "date": "2024-03-20",
            "check_in": "2024-03-20T09:00:00.000Z",
            "check_out": "2024-03-20T18:00:00.000Z",
            "status": "present",
            "note": "Davomat to'g'ri",
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

### 2. Get Attendance by ID
```http
GET /api/attendances/:id
```

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "attendance_id",
        "employee_id": {
            "_id": "employee_id",
            "first_name": "John",
            "last_name": "Doe"
        },
        "date": "2024-03-20",
        "check_in": "2024-03-20T09:00:00.000Z",
        "check_out": "2024-03-20T18:00:00.000Z",
        "status": "present",
        "note": "Davomat to'g'ri",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 3. Create Attendance
```http
POST /api/attendances
```

**Request Body:**
```json
{
    "employee_id": "employee_id",
    "date": "2024-03-20",
    "check_in": "2024-03-20T09:00:00.000Z",
    "check_out": "2024-03-20T18:00:00.000Z",
    "status": "present", // Faqat: "present", "absent", "late"
    "note": "Davomat to'g'ri"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Davomat muvaffaqiyatli yaratildi",
    "data": {
        "_id": "attendance_id",
        "employee_id": {
            "_id": "employee_id",
            "first_name": "John",
            "last_name": "Doe"
        },
        "date": "2024-03-20",
        "check_in": "2024-03-20T09:00:00.000Z",
        "check_out": "2024-03-20T18:00:00.000Z",
        "status": "present",
        "note": "Davomat to'g'ri",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 4. Update Attendance
```http
PUT /api/attendances/:id
```

**Request Body:**
```json
{
    "employee_id": "employee_id",
    "date": "2024-03-20",
    "check_in": "2024-03-20T09:00:00.000Z",
    "check_out": "2024-03-20T18:00:00.000Z",
    "status": "present", // Faqat: "present", "absent", "late"
    "note": "Davomat to'g'ri"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Davomat yangilandi",
    "data": {
        "_id": "attendance_id",
        "employee_id": {
            "_id": "employee_id",
            "first_name": "John",
            "last_name": "Doe"
        },
        "date": "2024-03-20",
        "check_in": "2024-03-20T09:00:00.000Z",
        "check_out": "2024-03-20T18:00:00.000Z",
        "status": "present",
        "note": "Davomat to'g'ri",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 5. Delete Attendance
```http
DELETE /api/attendances/:id
```

**Response:**
```json
{
    "success": true,
    "message": "Davomat o'chirildi"
}
```

### 6. Get Employee Attendance Report
```http
GET /api/attendances/employee/:employee_id
```

**Query Parameters:**
- `start_date` (required): Boshlang'ich sana (YYYY-MM-DD formatida)
- `end_date` (required): Tugash sanasi (YYYY-MM-DD formatida)

**Response:**
```json
{
    "success": true,
    "data": {
        "employee": {
            "_id": "employee_id",
            "first_name": "John",
            "last_name": "Doe"
        },
        "attendance": [
            {
                "date": "2024-03-20",
                "check_in": "2024-03-20T09:00:00.000Z",
                "check_out": "2024-03-20T18:00:00.000Z",
                "status": "present",
                "note": "Davomat to'g'ri"
            }
        ],
        "summary": {
            "total_days": 30,
            "present_days": 25,
            "absent_days": 3,
            "late_days": 2
        }
    }
}
```

### 7. Get Department Attendance Report
```http
GET /api/attendances/department/:department_id
```

**Query Parameters:**
- `date` (required): Sana (YYYY-MM-DD formatida)

**Response:**
```json
{
    "success": true,
    "data": {
        "department": {
            "_id": "department_id",
            "name": "IT Department"
        },
        "date": "2024-03-20",
        "attendance": [
            {
                "employee": {
                    "_id": "employee_id",
                    "first_name": "John",
                    "last_name": "Doe"
                },
                "check_in": "2024-03-20T09:00:00.000Z",
                "check_out": "2024-03-20T18:00:00.000Z",
                "status": "present",
                "note": "Davomat to'g'ri"
            }
        ],
        "summary": {
            "total_employees": 10,
            "present_employees": 8,
            "absent_employees": 1,
            "late_employees": 1
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
    "message": "Davomat topilmadi"
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
- Status faqat `present`, `absent` yoki `late` bo'lishi mumkin
- Sana YYYY-MM-DD formatida bo'lishi kerak
- Check-in va check-out vaqtlari ISO 8601 formatida bo'lishi kerak
- Bir xodim uchun bir kunda faqat bitta davomat yaratilishi mumkin
- O'chirilgan davomatlar bazadan to'liq o'chiriladi 