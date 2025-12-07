# Reception API Documentation

## Overview
The Reception API manages potential students (visitors) who are interested in joining courses. It provides endpoints for tracking visitors from their initial contact through their conversion to students.

## Base URL
```
/api/reception
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Endpoints

### 1. Create New Reception
```http
POST /api/reception
```

**Request Body:**
```json
{
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+998901234567",
    "notes": "Optional notes about the visitor"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Mehmon muvaffaqiyatli qo'shildi",
    "data": {
        "_id": "reception_id",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+998901234567",
        "status": "kelgan",
        "notes": "Optional notes about the visitor",
        "contactInfo": {
            "contacted": false
        },
        "trialInfo": {
            "trialResult": "kutilmoqda"
        },
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 2. Get All Receptions
```http
GET /api/reception
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "_id": "reception_id",
            "first_name": "John",
            "last_name": "Doe",
            "phone": "+998901234567",
            "status": "kelgan",
            "student": {
                "_id": "student_id",
                "first_name": "John",
                "last_name": "Doe",
                "phone": "+998901234567"
            },
            "group": {
                "_id": "group_id",
                "name": "Group Name"
            },
            "created_at": "2024-03-20T10:00:00.000Z",
            "updated_at": "2024-03-20T10:00:00.000Z"
        }
    ]
}
```

### 3. Get Reception by ID
```http
GET /api/reception/:id
```

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "reception_id",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+998901234567",
        "status": "kelgan",
        "student": {
            "_id": "student_id",
            "first_name": "John",
            "last_name": "Doe",
            "phone": "+998901234567"
        },
        "group": {
            "_id": "group_id",
            "name": "Group Name"
        },
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 4. Update Reception
```http
PUT /api/reception/:id
```

**Request Body:**
```json
{
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+998901234567",
    "notes": "Updated notes"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Mehmon ma'lumotlari yangilandi",
    "data": {
        "_id": "reception_id",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+998901234567",
        "notes": "Updated notes",
        "how_came": "string", // Optional: How they came (banner, flayer, friends, relatives, instagram, telegram, other)
        "created_at": "2024-03-20T10:00:00.000Z",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

### 5. Contact Reception
```http
PATCH /api/reception/:id/contact
```

**Request Body:**
```json
{
    "contactNotes": "Contacted via phone, interested in Web Development course"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Aloqa ma'lumotlari yangilandi",
    "data": {
        "_id": "reception_id",
        "status": "aloqa",
        "contactInfo": {
            "contacted": true,
            "contactDate": "2024-03-20T10:00:00.000Z",
            "contactNotes": "Contacted via phone, interested in Web Development course"
        }
    }
}
```

### 6. Add to Trial
```http
PATCH /api/reception/:id/trial
```

**Request Body:**
```json
{
    "trialNotes": "Scheduled for trial lesson",
    "trialDate": "2024-03-25T10:00:00.000Z"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Sinov ma'lumotlari yangilandi",
    "data": {
        "_id": "reception_id",
        "status": "sinov",
        "trialInfo": {
            "trialDate": "2024-03-25T10:00:00.000Z",
            "trialNotes": "Scheduled for trial lesson",
            "trialResult": "kutilmoqda"
        }
    }
}
```

### 7. Convert to Student
```http
POST /api/reception/:id/convert-to-student
```

**Request Body:**
```json
{
    "groupId": "group_id",
    "birth_date": "2000-01-01",
    "address": "123 Main St",
    "parent_name": "Parent Name",
    "parent_phone": "+998901234568",
    "gender": "male"
}
```

**Response:**
```json
{
    "success": true,
    "message": "O'quvchi muvaffaqiyatli yaratildi va guruhga qo'shildi",
    "data": {
        "reception": {
            "_id": "reception_id",
            "status": "o'quvchi",
            "studentId": "student_id",
            "groupId": "group_id"
        },
        "student": {
            "_id": "student_id",
            "first_name": "John",
            "last_name": "Doe",
            "phone": "+998901234567",
            "payment_status": "trial",
            "group_students": [
                {
                    "group_id": {
                        "name": "Group Name",
                        "course_id": {
                            "name": "Course Name"
                        }
                    }
                }
            ]
        },
        "group": {
            "_id": "group_id",
            "name": "Group Name",
            "course_id": {
                "name": "Course Name"
            }
        },
        "groupStudent": {
            "group_id": "group_id",
            "student_id": "student_id",
            "status": "active",
            "joined_at": "2024-03-20T10:00:00.000Z"
        }
    }
}
```

### 8. Delete Reception
```http
DELETE /api/reception/:id
```

**Response:**
```json
{
    "success": true,
    "message": "Mehmon muvaffaqiyatli o'chirildi"
}
```

## Status Types
- `kelgan` - Initial status when visitor first arrives
- `aloqa` - After initial contact
- `sinov` - When scheduled for trial lesson
- `o'quvchi` - After converting to student

## Trial Result Types
- `kutilmoqda` - Waiting for trial
- `muvaffaqiyatli` - Successful trial
- `muvaffaqiyatsiz` - Unsuccessful trial

## Error Responses

### 400 Bad Request
```json
{
    "success": false,
    "message": "Validation error",
    "errors": [
        {
            "field": "phone",
            "message": "Telefon raqam kiritish majburiy"
        }
    ]
}
```

### 404 Not Found
```json
{
    "success": false,
    "message": "Mehmon topilmadi"
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
- All dates are returned in ISO 8601 format
- Phone numbers should be in international format
- When converting to student, a default password "123456" is set
- The student's initial payment status is set to "trial"
- Group student count is automatically incremented when adding a new student 