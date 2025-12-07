# To'lov (Payment) API Documentation

## Base URL
```
/api/payments
```

## Authentication
Barcha so'rovlar uchun `Authorization` headeri kerak:
```
Authorization: Bearer <your_token>
```

## Yangi Tuzilma (2024)
- Endi bir to'lovda bir nechta turda (naqd, karta, transfer) to'lov qilish mumkin.
- Yangi maydon: `amounts` (object: `{ cash, card, transfer }`).
- Umumiy summa uchun virtual `total_amount` maydoni mavjud.
- Eski `amount` va `payment_type` ham ishlaydi (orqaga moslik uchun), lekin yangi API faqat `amounts` ni ishlatishni tavsiya qiladi.

---

## Endpoints

### 1. Get All Payments
```http
GET /api/payments
```

**Query Parameters:**
- `page` (optional): Sahifa raqami (default: 1)
- `limit` (optional): Sahifadagi elementlar soni (default: 10)
- `student_id` (optional): O'quvchi ID si
- `course_id` (optional): Kurs ID si
- `payment_type` (optional): To'lov turi (eski format uchun)
- `status` (optional): To'lov holati
- `start_date` (optional): Boshlash sanasi (YYYY-MM-DD)
- `end_date` (optional): Tugash sanasi (YYYY-MM-DD)

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "_id": "payment_id",
            "student_id": { ... },
            "course_id": { ... },
            "amounts": {
                "cash": 1000000,
                "card": 500000,
                "transfer": 0
            },
            "total_amount": 1500000,
            "payment_date": "2024-03-20T10:00:00.000Z",
            "status": "completed",
            "payment_period": { ... },
            "notes": "",
            "created_at": "...",
            "updated_at": "..."
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

---

### 2. Get Payment by ID
```http
GET /api/payments/:id
```

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "payment_id",
        "student_id": { ... },
        "course_id": { ... },
        "amounts": {
            "cash": 1000000,
            "card": 500000,
            "transfer": 0
        },
        "total_amount": 1500000,
        "payment_date": "2024-03-20T10:00:00.000Z",
        "status": "completed",
        "payment_period": { ... },
        "notes": "",
        "created_at": "...",
        "updated_at": "..."
    }
}
```

---

### 3. Create Payment
```http
POST /api/payments
```

**Request Body (Yangi format):**
```json
{
    "student_id": "student_id",
    "course_id": "course_id",
    "amounts": {
        "cash": 1000000,
        "card": 500000,
        "transfer": 0
    },
    "payment_date": "2024-03-20",
    "months_count": 1,
    "start_date": "2024-03-20",
    "notes": "To'lov izohi"
}
```
**Request Body (Eski format, orqaga moslik):**
```json
{
    "student_id": "student_id",
    "course_id": "course_id",
    "amount": 1000000,
    "payment_type": "cash",
    "payment_date": "2024-03-20",
    "months_count": 1,
    "start_date": "2024-03-20",
    "notes": "To'lov izohi"
}
```
> **Eslatma:** Eski formatda yuborilsa, avtomatik tarzda `amounts` ga aylantiriladi.

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "payment_id",
        "student_id": { ... },
        "course_id": { ... },
        "amounts": {
            "cash": 1000000,
            "card": 500000,
            "transfer": 0
        },
        "total_amount": 1500000,
        "payment_date": "2024-03-20T10:00:00.000Z",
        "status": "completed",
        "payment_period": {
            "start_date": "2024-03-20T00:00:00.000Z",
            "end_date": "2024-04-18T00:00:00.000Z",
            "months_count": 1
        },
        "notes": "To'lov izohi",
        "created_at": "...",
        "updated_at": "..."
    }
}
```

---

### 4. Update Payment
```http
PUT /api/payments/:id
```

**Request Body (Yangi format):**
```json
{
    "amounts": {
        "cash": 0,
        "card": 1200000,
        "transfer": 0
    },
    "status": "completed",
    "notes": "Qo'shimcha to'lov"
}
```
**Request Body (Eski format, orqaga moslik):**
```json
{
    "amount": 1200000,
    "payment_type": "card",
    "status": "completed",
    "notes": "Qo'shimcha to'lov"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "payment_id",
        "student_id": { ... },
        "course_id": { ... },
        "amounts": {
            "cash": 0,
            "card": 1200000,
            "transfer": 0
        },
        "total_amount": 1200000,
        "status": "completed",
        "notes": "Qo'shimcha to'lov",
        "updated_at": "..."
    }
}
```

---

### 5. Delete Payment
```http
DELETE /api/payments/:id
```

**Response:**
```json
{
    "success": true,
    "message": "To'lov ma'lumoti muvaffaqiyatli o'chirildi"
}
```

---

### 6. Get Student Payments
```http
GET /api/payments/student/:student_id
```

**Query Parameters:**
- `start_date` (optional): Boshlash sanasi (YYYY-MM-DD)
- `end_date` (optional): Tugash sanasi (YYYY-MM-DD)

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "_id": "payment_id",
            "amounts": {
                "cash": 1000000,
                "card": 0,
                "transfer": 0
            },
            "total_amount": 1000000,
            "payment_date": "2024-03-20T10:00:00.000Z",
            "status": "completed",
            "notes": "",
            "created_at": "...",
            "updated_at": "..."
        }
    ]
}
```

---

### 7. Get Group Payments
```http
GET /api/payments/group/:group_id
```

**Query Parameters:**
- `start_date` (optional): Boshlash sanasi (YYYY-MM-DD)
- `end_date` (optional): Tugash sanasi (YYYY-MM-DD)

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "_id": "payment_id",
            "student_id": { ... },
            "amounts": {
                "cash": 1000000,
                "card": 0,
                "transfer": 0
            },
            "total_amount": 1000000,
            "payment_date": "2024-03-20T10:00:00.000Z",
            "status": "completed",
            "notes": "",
            "created_at": "...",
            "updated_at": "..."
        }
    ]
}
```

---

### 8. Update Payment Status
```http
PATCH /api/payments/:id/status
```

**Request Body:**
```json
{
    "status": "completed"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "payment_id",
        "status": "completed",
        "updated_at": "2024-03-20T10:00:00.000Z"
    }
}
```

---

### 9. Check Student Payment Status
```http
GET /api/payments/check-status/:student_id/:course_id
```

**Response:**
```json
{
    "success": true,
    "data": {
        "payment_status": "paid",
        "next_payment_due": "2024-04-20T00:00:00.000Z",
        "last_payment_date": "2024-03-20T00:00:00.000Z",
        "total_paid": 1500000,
        "remaining_amount": 0
    }
}
```

---

### 10. Get Student Payment History
```http
GET /api/payments/student/:student_id/history
```

**Query Parameters:**
- `course_id` (optional): Kurs ID si
- `start_date` (optional): Boshlash sanasi (YYYY-MM-DD)
- `end_date` (optional): Tugash sanasi (YYYY-MM-DD)

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "_id": "payment_id",
            "course_id": { ... },
            "amounts": {
                "cash": 1000000,
                "card": 0,
                "transfer": 0
            },
            "total_amount": 1000000,
            "payment_date": "2024-03-20T10:00:00.000Z",
            "status": "completed",
            "created_at": "..."
        }
    ]
}
```

---

### 11. Get Course Payment Statistics
```http
GET /api/payments/course/:course_id/stats
```

**Query Parameters:**
- `start_date` (optional): Boshlash sanasi (YYYY-MM-DD)
- `end_date` (optional): Tugash sanasi (YYYY-MM-DD)

**Response:**
```json
{
    "success": true,
    "data": {
        "total_payments": 10000000,
        "total_students": 10,
        "average_payment": 1000000,
        "payment_types": {
            "cash": 5000000,
            "card": 3000000,
            "transfer": 2000000
        },
        "status_distribution": {
            "completed": 8000000,
            "pending": 1500000,
            "cancelled": 500000
        }
    }
}
```

---

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
    "message": "To'lov ma'lumoti topilmadi"
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
- To'lov turi: `cash`, `card`, `transfer` (faqat amounts objectida)
- To'lov holati: `pending`, `completed`, `cancelled`
- To'lov miqdori musbat son bo'lishi kerak
- To'lov sanasi kelajakdagi sana bo'lishi mumkin emas
- O'quvchi to'lov holati: `paid`, `unpaid`, `partial`
- Kurs to'lov statistikasi faqat mavjud kurslar uchun olinadi
- Yangi API faqat `amounts` ni ishlatishni tavsiya qiladi, eski format orqaga moslik uchun qoldirilgan 