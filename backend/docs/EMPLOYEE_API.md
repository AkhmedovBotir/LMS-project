# Employee API Documentation

## Base URL
```
/api/employees
```

## Authentication
Barcha so'rovlar uchun `Authorization` headeri kerak:
```
Authorization: Bearer <your_token>
```

## Endpoints

### 1. Get All Employees
```http
GET /api/employees
```

**Query Parameters:**
- `page` (optional): Sahifa raqami (default: 1)
- `limit` (optional): Sahifadagi elementlar soni (default: 10)
- `department_id` (optional): Bo'lim ID si
- `position_id` (optional): Lavozim ID si
- `role` (optional): Foydalanuvchi turi (admin, teacher, student)
- `status` (optional): Status filtri (active/inactive)
- `search` (optional): Qidiruv so'zi (ism, familiya, telefon, login bo'yicha)

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "_id": "employee_id",
            "first_name": "John",
            "last_name": "Doe",
            "phone": "+998901234567",
            "username": "johndoe",
            "role": {
                "_id": "role_id",
                "name": "teacher"
            },
            "id_number": "AA1234567",
            "birth_date": "1990-01-01",
            "hire_date": "2024-01-01",
            "address": "Tashkent, Uzbekistan",
            "department_id": {
                "_id": "department_id",
                "name": "IT Department"
            },
            "position_id": {
                "_id": "position_id",
                "name": "Senior Developer"
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

### 2. Get Employee by ID
```http
GET /api/employees/:id
```

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "employee_id",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+998901234567",
        "username": "johndoe",
        "role": {
            "_id": "role_id",
            "name": "teacher"
        },
        "id_number": "AA1234567",
        "birth_date": "1990-01-01",
        "hire_date": "2024-01-01",
        "address": "Tashkent, Uzbekistan",
        "department_id": {
            "_id": "department_id",
            "name": "IT Department"
        },
        "position_id": {
            "_id": "position_id",
            "name": "Senior Developer"
        },
        "status": "active",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 3. Create Employee
```http
POST /api/employees
```

**Request Body:**
```json
{
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+998901234567",
    "username": "johndoe",
    "password": "password123",
    "role": "teacher", // Faqat: "admin", "teacher", "student"
    "id_number": "AA1234567",
    "birth_date": "1990-01-01",
    "hire_date": "2024-01-01",
    "address": "Tashkent, Uzbekistan",
    "department_id": "department_id",
    "position_id": "position_id"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Xodim muvaffaqiyatli yaratildi",
    "data": {
        "_id": "employee_id",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+998901234567",
        "username": "johndoe",
        "role": {
            "_id": "role_id",
            "name": "teacher"
        },
        "id_number": "AA1234567",
        "birth_date": "1990-01-01",
        "hire_date": "2024-01-01",
        "address": "Tashkent, Uzbekistan",
        "department_id": {
            "_id": "department_id",
            "name": "IT Department"
        },
        "position_id": {
            "_id": "position_id",
            "name": "Senior Developer"
        },
        "status": "active",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 4. Update Employee
```http
PUT /api/employees/:id
```

**Request Body:**
```json
{
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+998901234567",
    "username": "johndoe",
    "password": "newpassword123", // optional
    "role": "teacher", // Faqat: "admin", "teacher", "student"
    "id_number": "AA1234567",
    "birth_date": "1990-01-01",
    "hire_date": "2024-01-01",
    "address": "Tashkent, Uzbekistan",
    "department_id": "department_id",
    "position_id": "position_id",
    "status": "active" // optional
}
```

**Response:**
```json
{
    "success": true,
    "message": "Xodim yangilandi",
    "data": {
        "_id": "employee_id",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+998901234567",
        "username": "johndoe",
        "role": {
            "_id": "role_id",
            "name": "teacher"
        },
        "id_number": "AA1234567",
        "birth_date": "1990-01-01",
        "hire_date": "2024-01-01",
        "address": "Tashkent, Uzbekistan",
        "department_id": {
            "_id": "department_id",
            "name": "IT Department"
        },
        "position_id": {
            "_id": "position_id",
            "name": "Senior Developer"
        },
        "status": "active",
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 5. Delete Employee
```http
DELETE /api/employees/:id
```

**Response:**
```json
{
    "success": true,
    "message": "Xodim o'chirildi"
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
    "message": "Xodim topilmadi"
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
- Role faqat `admin`, `teacher` yoki `student` bo'lishi mumkin
- Login, telefon raqami va ID raqami unique bo'lishi kerak
- O'chirilgan xodimlar bazadan to'liq o'chiriladi 