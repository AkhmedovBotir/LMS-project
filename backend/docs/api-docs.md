# API Documentation

## Base URL
```
/api
```

## Authentication
Barcha so'rovlar uchun JWT token talab qilinadi. Token quyidagi formatda header'da yuborilishi kerak:
```
Authorization: Bearer <your_token>
```

## Xodimlar (Employees)

### Xodimlar ro'yxatini olish
```http
GET /employees
```

Query parametrlar:
- `page` (optional): Sahifa raqami (default: 1)
- `limit` (optional): Sahifadagi elementlar soni (default: 10)
- `department_id` (optional): Bo'lim bo'yicha filtrlash
- `position_id` (optional): Lavozim bo'yicha filtrlash
- `role` (optional): Rol bo'yicha filtrlash
- `status` (optional): Status bo'yicha filtrlash
- `search` (optional): Qidiruv so'zi (ism, familiya, telefon, login)

Javob:
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "first_name": "string",
      "last_name": "string",
      "phone": "string",
      "username": "string",
      "role": {
        "_id": "string",
        "name": "string"
      },
      "id_number": "string",
      "birth_date": "date",
      "hire_date": "date",
      "address": "string",
      "department_id": {
        "_id": "string",
        "name": "string"
      },
      "position_id": {
        "_id": "string",
        "name": "string"
      },
      "status": "string"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "total_pages": "number"
  }
}
```

### Xodim ma'lumotlarini olish
```http
GET /employees/:id
```

Javob:
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "username": "string",
    "role": {
      "_id": "string",
      "name": "string"
    },
    "id_number": "string",
    "birth_date": "date",
    "hire_date": "date",
    "address": "string",
    "department_id": {
      "_id": "string",
      "name": "string"
    },
    "position_id": {
      "_id": "string",
      "name": "string"
    },
    "status": "string"
  }
}
```

### Yangi xodim qo'shish
```http
POST /employees
```

So'rov tarkibi:
```json
{
  "first_name": "string",
  "last_name": "string",
  "phone": "string",
  "username": "string",
  "password": "string",
  "role": "string",
  "id_number": "string",
  "birth_date": "date",
  "hire_date": "date",
  "address": "string",
  "department_id": "string",
  "position_id": "string"
}
```

Javob:
```json
{
  "success": true,
  "message": "Xodim muvaffaqiyatli yaratildi",
  "data": {
    "_id": "string",
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "username": "string",
    "role": {
      "_id": "string",
      "name": "string"
    },
    "id_number": "string",
    "birth_date": "date",
    "hire_date": "date",
    "address": "string",
    "department_id": {
      "_id": "string",
      "name": "string"
    },
    "position_id": {
      "_id": "string",
      "name": "string"
    },
    "status": "string"
  }
}
```

### Xodim ma'lumotlarini yangilash
```http
PUT /employees/:id
```

So'rov tarkibi:
```json
{
  "first_name": "string",
  "last_name": "string",
  "phone": "string",
  "username": "string",
  "password": "string",
  "role": "string",
  "id_number": "string",
  "birth_date": "date",
  "hire_date": "date",
  "address": "string",
  "department_id": "string",
  "position_id": "string",
  "status": "string"
}
```

Javob:
```json
{
  "success": true,
  "message": "Xodim yangilandi",
  "data": {
    "_id": "string",
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "username": "string",
    "role": {
      "_id": "string",
      "name": "string"
    },
    "id_number": "string",
    "birth_date": "date",
    "hire_date": "date",
    "address": "string",
    "department_id": {
      "_id": "string",
      "name": "string"
    },
    "position_id": {
      "_id": "string",
      "name": "string"
    },
    "status": "string"
  }
}
```

### Xodimni o'chirish
```http
DELETE /employees/:id
```

Javob:
```json
{
  "success": true,
  "message": "Xodim o'chirildi"
}
```

### Xodim statusini yangilash
```http
PATCH /employees/:id/status
```

So'rov tarkibi:
```json
{
  "status": "string" // "active" yoki "inactive"
}
```

Javob:
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "status": "string"
  }
}
```

### Xodim login
```http
POST /employees/login
```

So'rov tarkibi:
```json
{
  "username": "string",
  "password": "string"
}
```

Javob:
```json
{
  "message": "Muvaffaqiyatli kirildi",
  "data": {
    "token": "string"
  }
}
```

## Xatolik kodlari

### 400 Bad Request
```json
{
  "success": false,
  "message": "Xatolik xabari"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Bu amalni bajarish uchun huquq yetarli emas"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Eslatmalar

1. Barcha sanalar ISO 8601 formatida yuborilishi kerak
2. Parol kamida 6 ta belgidan iborat bo'lishi kerak
3. Telefon raqami va ID raqami unikal bo'lishi kerak
4. Status qiymatlari:
   - `active`: Faol
   - `inactive`: Faol emas
5. Rol qiymatlari:
   - `admin`: Administrator
   - `teacher`: O'qituvchi
   - `employee`: Xodim
6. Barcha so'rovlar uchun JWT token talab qilinadi
7. Xatolik yuz berganda, xatolik xabari `message` maydonida qaytariladi
8. Muvaffaqiyatli so'rovlar uchun `success: true` qaytariladi
9. Ma'lumotlar `data` maydonida qaytariladi
10. Sahifalash uchun `pagination` maydonida ma'lumotlar qaytariladi

## Mavzular (Topics)

### Mavzular ro'yxatini olish
```http
GET /topics/course/:course_id
```

Parametrlar:
- `course_id` (path): Kurs ID

Javob:
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "course_id": {
        "_id": "string",
        "name": "string"
      },
      "title": "string",
      "status": "string",
      "created_at": "date",
      "updated_at": "date"
    }
  ]
}
```

### Yangi mavzu qo'shish
```http
POST /topics
```

So'rov tarkibi:
```json
{
  "course_id": "string",
  "title": "string"
}
```

Javob:
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "course_id": "string",
    "title": "string",
    "status": "string",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Mavzuni yangilash
```http
PUT /topics/:id
```

Parametrlar:
- `id` (path): Mavzu ID

So'rov tarkibi:
```json
{
  "title": "string",
  "status": "string" // "active" yoki "inactive"
}
```

Javob:
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "course_id": "string",
    "title": "string",
    "status": "string",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Mavzuni o'chirish
```http
DELETE /topics/:id
```

Parametrlar:
- `id` (path): Mavzu ID

Javob:
```json
{
  "success": true,
  "message": "Mavzu o'chirildi"
}
```

Eslatma: Mavzu to'liq o'chiriladi (hard delete). Qayta tiklash imkoni yo'q.

### Mavzular tartibini o'zgartirish
```http
POST /topics/reorder
```

So'rov tarkibi:
```json
{
  "topics": [
    {
      "id": "string",
      "order_number": "number"
    }
  ]
}
```

Javob:
```json
{
  "success": true,
  "message": "Mavzular tartibi yangilandi"
}
```

11. Mavzular uchun:
    - Talabalar uchun to'lov tekshiriladi
    - Faqat o'qituvchilar va adminlar mavzu qo'shish/o'zgartirish/o'chirish huquqiga ega
    - Mavzular kursga bog'langan
    - Mavzu statusi "active" yoki "inactive" bo'lishi mumkin
    - Mavzular tartibini o'zgartirish uchun maxsus endpoint mavjud 

## Savollar (Questions)

### Barcha savollarni olish
```http
GET /questions
```

Query parametrlar:
- `page` (optional): Sahifa raqami (default: 1)
- `limit` (optional): Sahifadagi elementlar soni (default: 10)
- `topic_id` (optional): Mavzu bo'yicha filtrlash
- `created_by` (optional): Yaratuvchi bo'yicha filtrlash
- `question_type` (optional): Savol turi bo'yicha filtrlash (written/test)
- `status` (optional): Status bo'yicha filtrlash
- `search` (optional): Qidiruv so'zi (savol matni yoki tushuntirish)

Javob:
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "topic_id": {
        "_id": "string",
        "name": "string"
      },
      "created_by": {
        "_id": "string",
        "first_name": "string",
        "last_name": "string"
      },
      "question_type": "string",
      "content": "string",
      "correct_answer": "string",
      "points": "number",
      "status": "string",
      "options": [
        {
          "_id": "string",
          "content": "string",
          "is_correct": "boolean"
        }
      ],
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "pages": "number"
  }
}
```

### Savolni ID bo'yicha olish
```http
GET /questions/:id
```

Javob:
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "topic_id": {
      "_id": "string",
      "name": "string"
    },
    "created_by": {
      "_id": "string",
      "first_name": "string",
      "last_name": "string"
    },
    "question_type": "string",
    "content": "string",
    "correct_answer": "string",
    "points": "number",
    "status": "string",
    "options": [
      {
        "_id": "string",
        "content": "string",
        "is_correct": "boolean"
      }
    ],
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Yozma savol qo'shish
```http
POST /questions/written
```

So'rov tarkibi:
```json
{
  "topic_id": "string",
  "content": "string",
  "correct_answer": "string",
  "points": "number" // optional, default: 1
}
```

Javob:
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "topic_id": "string",
    "created_by": "string",
    "type": "text",
    "text": "string",
    "correct_answer": "string",
    "points": "number",
    "status": "active",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Test savoli qo'shish
```http
POST /questions/test
```

So'rov tarkibi:
```json
{
  "topic_id": "string",
  "content": "string",
  "points": "number", // optional, default: 1
  "options": [
    {
      "content": "string",
      "is_correct": "boolean"
    }
  ]
}
```

Javob:
```json
{
  "success": true,
  "data": {
    "question": {
      "_id": "string",
      "topic_id": "string",
      "created_by": "string",
      "type": "single",
      "text": "string",
      "points": "number",
      "status": "active",
      "created_at": "date",
      "updated_at": "date"
    },
    "options": [
      {
        "_id": "string",
        "question_id": "string",
        "content": "string",
        "is_correct": "boolean"
      }
    ]
  }
}
```

### Savolni yangilash
```http
PUT /questions/:id
```

So'rov tarkibi:
```json
{
  "content": "string",
  "correct_answer": "string", // yozma savol uchun
  "points": "number",
  "status": "string",
  "options": [ // test savol uchun
    {
      "content": "string",
      "is_correct": "boolean"
    }
  ]
}
```

Javob:
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "topic_id": "string",
    "created_by": "string",
    "question_type": "string",
    "content": "string",
    "correct_answer": "string",
    "points": "number",
    "status": "string",
    "options": [
      {
        "_id": "string",
        "content": "string",
        "is_correct": "boolean"
      }
    ],
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Savolni o'chirish
```http
DELETE /questions/:id
```

Javob:
```json
{
  "success": true,
  "message": "Savol muvaffaqiyatli o'chirildi"
}
```

12. Savollar uchun:
    - Faqat o'qituvchilar va adminlar savol qo'shish/o'zgartirish/o'chirish huquqiga ega
    - Test savoli uchun kamida 2 ta variant bo'lishi kerak
    - Test savolida bitta to'g'ri javob bo'lishi kerak
    - Talabalar uchun test variantlarining to'g'ri javob ko'rsatilmaydi
    - Savollar mavzuga bog'langan
    - Savol statusi "active" yoki "inactive" bo'lishi mumkin
    - Savol turi "text" (yozma) yoki "single" (test) bo'lishi mumkin 