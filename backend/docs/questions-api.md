# Savollar va Terminlar API

## Autentifikatsiya

Barcha API so'rovlari uchun autentifikatsiya talab qilinadi. So'rov boshida `Authorization` headerida JWT token yuborilishi kerak:

```
Authorization: Bearer <token>
```

## Yozma Savollar API

### Barcha yozma savollarni olish

```http
GET /api/questions/written
```

#### Query parametrlari:
- `page` - Sahifa raqami (default: 1)
- `limit` - Sahifadagi elementlar soni (default: 10)
- `topic_id` - Mavzu ID si bo'yicha filtrlash
- `created_by` - Yaratuvchi ID si bo'yicha filtrlash
- `status` - Status bo'yicha filtrlash
- `search` - Matn bo'yicha qidirish

#### Muvaffaqiyatli javob:
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
      "type": "text",
      "text": "string",
      "correct_answer": "string",
      "points": "number",
      "status": "boolean",
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

### ID bo'yicha yozma savolni olish

```http
GET /api/questions/written/:id
```

#### Muvaffaqiyatli javob:
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
    "type": "text",
    "text": "string",
    "correct_answer": "string",
    "points": "number",
    "status": "boolean",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Yozma savol yaratish

```http
POST /api/questions/written
```

#### So'rov tarkibi:
```json
{
  "topic_id": "string",
  "text": "string",
  "correct_answer": "string",
  "points": "number"
}
```

#### Muvaffaqiyatli javob:
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
    "status": true,
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Yozma savolni yangilash

```http
PUT /api/questions/written/:id
```

#### So'rov tarkibi:
```json
{
  "text": "string",
  "correct_answer": "string",
  "points": "number",
  "status": "boolean"
}
```

#### Muvaffaqiyatli javob:
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
    "type": "text",
    "text": "string",
    "correct_answer": "string",
    "points": "number",
    "status": "boolean",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Yozma savolni o'chirish

```http
DELETE /api/questions/written/:id
```

#### Muvaffaqiyatli javob:
```json
{
  "success": true,
  "message": "Yozma savol muvaffaqiyatli o'chirildi"
}
```

## Test Savollar API

### Barcha test savollarni olish

```http
GET /api/questions/test
```

#### Query parametrlari:
- `page` - Sahifa raqami (default: 1)
- `limit` - Sahifadagi elementlar soni (default: 10)
- `topic_id` - Mavzu ID si bo'yicha filtrlash
- `created_by` - Yaratuvchi ID si bo'yicha filtrlash
- `status` - Status bo'yicha filtrlash
- `search` - Matn bo'yicha qidirish

#### Muvaffaqiyatli javob:
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
      "type": "single",
      "text": "string",
      "points": "number",
      "status": "boolean",
      "created_at": "date",
      "updated_at": "date",
      "options": [
        {
          "_id": "string",
          "content": "string",
          "is_correct": "boolean"
        }
      ]
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "pages": "number"
  }
}
```

### ID bo'yicha test savolni olish

```http
GET /api/questions/test/:id
```

#### Muvaffaqiyatli javob:
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
    "type": "single",
    "text": "string",
    "points": "number",
    "status": "boolean",
    "created_at": "date",
    "updated_at": "date",
    "options": [
      {
        "_id": "string",
        "content": "string",
        "is_correct": "boolean"
      }
    ]
  }
}
```

### Test savol yaratish

```http
POST /api/questions/test
```

#### So'rov tarkibi:
```json
{
  "topic_id": "string",
  "text": "string",
  "points": "number",
  "options": [
    {
      "content": "string",
      "is_correct": "boolean"
    }
  ]
}
```

#### Muvaffaqiyatli javob:
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
      "status": true,
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

### Test savolni yangilash

```http
PUT /api/questions/test/:id
```

#### So'rov tarkibi:
```json
{
  "text": "string",
  "points": "number",
  "status": "boolean",
  "options": [
    {
      "content": "string",
      "is_correct": "boolean"
    }
  ]
}
```

#### Muvaffaqiyatli javob:
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
    "type": "single",
    "text": "string",
    "points": "number",
    "status": "boolean",
    "created_at": "date",
    "updated_at": "date",
    "options": [
      {
        "_id": "string",
        "content": "string",
        "is_correct": "boolean"
      }
    ]
  }
}
```

### Test savolni o'chirish

```http
DELETE /api/questions/test/:id
```

#### Muvaffaqiyatli javob:
```json
{
  "success": true,
  "message": "Test savol muvaffaqiyatli o'chirildi"
}
```

## Terminlar API

### Barcha terminlarni olish

```http
GET /api/questions/terms
```

#### Query parametrlari:
- `page` - Sahifa raqami (default: 1)
- `limit` - Sahifadagi elementlar soni (default: 10)
- `topic_id` - Mavzu ID si bo'yicha filtrlash
- `created_by` - Yaratuvchi ID si bo'yicha filtrlash
- `status` - Status bo'yicha filtrlash
- `search` - Matn bo'yicha qidirish

#### Muvaffaqiyatli javob:
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
      "term": "string",
      "definition": "string",
      "status": "string",
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

### ID bo'yicha terminni olish

```http
GET /api/questions/terms/:id
```

#### Muvaffaqiyatli javob:
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
    "term": "string",
    "definition": "string",
    "status": "string",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Termin yaratish

```http
POST /api/questions/terms
```

#### So'rov tarkibi:
```json
{
  "topic_id": "string",
  "term": "string",
  "definition": "string"
}
```

#### Muvaffaqiyatli javob:
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "topic_id": "string",
    "created_by": "string",
    "term": "string",
    "definition": "string",
    "status": "active",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Terminni yangilash

```http
PUT /api/questions/terms/:id
```

#### So'rov tarkibi:
```json
{
  "term": "string",
  "definition": "string",
  "status": "string"
}
```

#### Muvaffaqiyatli javob:
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
    "term": "string",
    "definition": "string",
    "status": "string",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Terminni o'chirish

```http
DELETE /api/questions/terms/:id
```

#### Muvaffaqiyatli javob:
```json
{
  "success": true,
  "message": "Termin muvaffaqiyatli o'chirildi"
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
3. Test savollar uchun kamida 2 ta variant bo'lishi kerak
4. Test savollar uchun bitta to'g'ri javob bo'lishi kerak
5. Barcha so'rovlar va javoblar JSON formatida
6. Vaqt formatlari ISO 8601 standartida
7. ID lar MongoDB ObjectId formatida