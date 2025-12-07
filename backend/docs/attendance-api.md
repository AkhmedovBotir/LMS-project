# Davomat API

## Autentifikatsiya

Barcha API so'rovlari uchun autentifikatsiya talab qilinadi. So'rov boshida `Authorization` headerida JWT token yuborilishi kerak:

```
Authorization: Bearer <token>
```

## O'qituvchilar uchun API

### O'qituvchining o'quvchilari davomati

```http
GET /api/attendance/teacher/my-students
```

#### Muvaffaqiyatli javob:
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "student_id": {
        "_id": "string",
        "first_name": "string",
        "last_name": "string"
      },
      "group_id": {
        "_id": "string",
        "name": "string"
      },
      "date": "date",
      "status": "string",
      "notes": "string",
      "created_at": "date",
      "updated_at": "date"
    }
  ]
}
```

### Guruh davomati

```http
GET /api/attendance/teacher/group/:group_id/attendance
```

#### Query parametrlari:
- `date` - Sana (YYYY-MM-DD)
- `start_date` - Boshlang'ich sana (YYYY-MM-DD)
- `end_date` - Tugash sanasi (YYYY-MM-DD)

#### Muvaffaqiyatli javob:
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "student_id": {
        "_id": "string",
        "first_name": "string",
        "last_name": "string"
      },
      "group_id": {
        "_id": "string",
        "name": "string"
      },
      "date": "date",
      "status": "string",
      "notes": "string",
      "created_at": "date",
      "updated_at": "date"
    }
  ]
}
```

### Guruh davomati yaratish

```http
POST /api/attendance/teacher/group/:group_id/attendance
```

#### So'rov tarkibi:
```json
{
  "date": "date",
  "attendance_data": [
    {
      "student_id": "string",
      "status": "string",
      "notes": "string"
    }
  ]
}
```

#### Muvaffaqiyatli javob:
```json
{
  "success": true,
  "message": "Guruh davomati muvaffaqiyatli saqlandi",
  "data": [
    {
      "_id": "string",
      "student_id": {
        "_id": "string",
        "first_name": "string",
        "last_name": "string"
      },
      "group_id": {
        "_id": "string",
        "name": "string"
      },
      "date": "date",
      "status": "string",
      "notes": "string",
      "created_at": "date",
      "updated_at": "date"
    }
  ]
}
```

## Umumiy API

### Barcha davomat yozuvlari

```http
GET /api/attendance
```

#### Query parametrlari:
- `page` - Sahifa raqami (default: 1)
- `limit` - Sahifadagi elementlar soni (default: 10)
- `student_id` - O'quvchi ID si bo'yicha filtrlash
- `group_id` - Guruh ID si bo'yicha filtrlash
- `date` - Sana bo'yicha filtrlash
- `status` - Status bo'yicha filtrlash
- `start_date` - Boshlang'ich sana (YYYY-MM-DD)
- `end_date` - Tugash sanasi (YYYY-MM-DD)

#### Muvaffaqiyatli javob:
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "student_id": {
        "_id": "string",
        "first_name": "string",
        "last_name": "string"
      },
      "group_id": {
        "_id": "string",
        "name": "string"
      },
      "date": "date",
      "status": "string",
      "notes": "string",
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "total_pages": "number",
    "limit": "number"
  }
}
```

### ID bo'yicha davomat yozuvi

```http
GET /api/attendance/:id
```

#### Muvaffaqiyatli javob:
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "student_id": {
      "_id": "string",
      "first_name": "string",
      "last_name": "string"
    },
    "group_id": {
      "_id": "string",
      "name": "string"
    },
    "date": "date",
    "status": "string",
    "notes": "string",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Yangi davomat yozuvi yaratish

```http
POST /api/attendance
```

#### So'rov tarkibi:
```json
{
  "student_id": "string",
  "group_id": "string",
  "date": "date",
  "status": "string",
  "notes": "string"
}
```

#### Muvaffaqiyatli javob:
```json
{
  "success": true,
  "message": "Davomat muvaffaqiyatli saqlandi",
  "data": {
    "_id": "string",
    "student_id": {
      "_id": "string",
      "first_name": "string",
      "last_name": "string"
    },
    "group_id": {
      "_id": "string",
      "name": "string"
    },
    "date": "date",
    "status": "string",
    "notes": "string",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Davomat yozuvini yangilash

```http
PUT /api/attendance/:id
```

#### So'rov tarkibi:
```json
{
  "status": "string",
  "notes": "string"
}
```

#### Muvaffaqiyatli javob:
```json
{
  "success": true,
  "message": "Davomat ma\'lumoti yangilandi",
  "data": {
    "_id": "string",
    "student_id": {
      "_id": "string",
      "first_name": "string",
      "last_name": "string"
    },
    "group_id": {
      "_id": "string",
      "name": "string"
    },
    "date": "date",
    "status": "string",
    "notes": "string",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Davomat yozuvini o'chirish

```http
DELETE /api/attendance/:id
```

#### Muvaffaqiyatli javob:
```json
{
  "success": true,
  "message": "Davomat ma\'lumoti o\'chirildi"
}
```

### O'quvchi davomati

```http
GET /api/attendance/student/:student_id
```

#### Query parametrlari:
- `group_id` - Guruh ID si bo'yicha filtrlash
- `start_date` - Boshlang'ich sana (YYYY-MM-DD)
- `end_date` - Tugash sanasi (YYYY-MM-DD)

#### Muvaffaqiyatli javob:
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "student_id": {
        "_id": "string",
        "first_name": "string",
        "last_name": "string"
      },
      "group_id": {
        "_id": "string",
        "name": "string"
      },
      "date": "date",
      "status": "string",
      "notes": "string",
      "created_at": "date",
      "updated_at": "date"
    }
  ]
}
```

### O'quvchi davomat statistikasi

```http
GET /api/attendance/student/:student_id/summary
```

#### Query parametrlari:
- `group_id` - Guruh ID si bo'yicha filtrlash
- `start_date` - Boshlang'ich sana (YYYY-MM-DD)
- `end_date` - Tugash sanasi (YYYY-MM-DD)

#### Muvaffaqiyatli javob:
```json
{
  "success": true,
  "data": {
    "total_days": "number",
    "present": "number",
    "absent": "number",
    "late": "number",
    "attendance_rate": "number",
    "records": [
      {
        "_id": "string",
        "student_id": {
          "_id": "string",
          "first_name": "string",
          "last_name": "string"
        },
        "group_id": {
          "_id": "string",
          "name": "string"
        },
        "date": "date",
        "status": "string",
        "notes": "string",
        "created_at": "date",
        "updated_at": "date"
      }
    ]
  }
}
```

## Xatolik kodlari

- `400` - Noto'g'ri so'rov
- `401` - Autentifikatsiya talab qilinadi
- `403` - Ruxsat yo'q
- `404` - Ma'lumot topilmadi
- `500` - Server xatosi

## Muhim eslatmalar

1. Barcha so'rovlar uchun autentifikatsiya talab qilinadi
2. O'qituvchilar uchun maxsus routelar faqat o'qituvchilar uchun mavjud
3. Status qiymatlari: 'present', 'absent', 'late'
4. Barcha so'rovlar va javoblar JSON formatida
5. Vaqt formatlari ISO 8601 standartida
6. ID lar MongoDB ObjectId formatida 