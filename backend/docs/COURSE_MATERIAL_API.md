# Kurs Materiallari API Dokumentatsiyasi

## Umumiy Ma'lumotlar
Kurs materiallari API o'quv materiallari (PDF, video, rasm) bilan ishlash uchun mo'ljallangan. Bu API yordamida materiallarni yaratish, ko'rish, o'zgartirish va o'chirish mumkin.

## Asosiy URL
```
/api/course-material
```

## Tizimga Kirish
Barcha API endpointlari avtorizatsiya talab qiladi. So'rovlar uchun JWT token yuborish kerak:
```
Authorization: Bearer <sizning_token>
```

## Endpointlar

### 1. Kurs Materiallari olish
```http
GET /api/course-material/course/:course_id
```

**Query Parametrlari:**
- `course_id`: Kurs ID raqami

**Javob:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "material_id",
      "topic": "Mavzu nomi",
      "type": "pdf|video|image",
      "file": "fayl_manzili",
      "description": "Tavsif",
      "order": 1,
      "created_by": {
        "_id": "oqituvchi_id",
        "first_name": "Oqituvchi ismi",
        "last_name": "Oqituvchi familiyasi"
      },
      "created_at": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

### 2. Yangi Material yaratish
```http
POST /api/course-material
```

**Form Data:**
- `course_id`: Kurs ID raqami
- `topic_id`: Mavzu ID raqami
- `type`: Material turi (pdf|video|image)
- `description`: Tavsif (miqdori)
- `order`: Tartib raqami (miqdori)
- `created_by`: Yaratuvchi ID raqami
- `file`: Fayl (PDF, video yoki rasm)

**Javob:**
```json
{
  "success": true,
  "message": "Material muvaffaqiyatli qo'shildi",
  "data": {
    "_id": "material_id",
    "topic": {
      "_id": "topic_id",
      "title": "Mavzu nomi"
    },
    "type": "pdf|video|image",
    "file": "fayl_manzili",
    "description": "Tavsif",
    "order": 1,
    "created_by": {
      "_id": "oqituvchi_id",
      "first_name": "Oqituvchi ismi",
      "last_name": "Oqituvchi familiyasi"
    },
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

### 3. Materialni o'zgartirish
```http
PUT /api/course-material/:id
```

**Form Data:**
- `topic_id`: Mavzu ID raqami
- `description`: Tavsif
- `order`: Tartib raqami
- `status`: Holat (active|inactive)
- `updated_by`: O'zgartiruvchi ID raqami
- `file`: Yangi fayl (miqdori)

**Javob:**
```json
{
  "success": true,
  "message": "Material muvaffaqiyatli yangilandi",
  "data": {
    "_id": "material_id",
    "topic": "Mavzu nomi",
    "type": "pdf|video|image",
    "file": "fayl_manzili",
    "description": "Tavsif",
    "order": 1,
    "updated_by": {
      "_id": "oqituvchi_id",
      "first_name": "Oqituvchi ismi",
      "last_name": "Oqituvchi familiyasi"
    },
    "updated_at": "2024-01-01T10:00:00.000Z"
  }
}
```

### 4. Materialni o'chirish
```http
DELETE /api/course-material/:id
```

**Javob:**
```json
{
  "success": true,
  "message": "Material muvaffaqiyatli o'chirildi"
}
```

## Xatoliklar
API quyidagi xatolik kodlarini qaytarishi mumkin:

- `400 Bad Request`: Noto'g'ri ma'lumotlar
  - Fayl yuborilmadi
  - Fayl turi noto'g'ri
  - Kurs ID noto'g'ri

- `401 Unauthorized`: Avtorizatsiya xatosi

- `403 Forbidden`: Ruxsat yo'q

- `404 Not Found`: Resurs topilmadi

- `500 Internal Server Error`: Server xatosi
