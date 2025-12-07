# Statistics Department API Documentation

## Base URL
```
/api/statistics-department
```

## Authentication
All endpoints require authentication using JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get Attendance Statistics
Get detailed attendance statistics for students.

**Endpoint:** `GET /attendance`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| period | string | No | Time period for statistics. Options: `daily`, `weekly`, `monthly`, `yearly`. Default: `monthly` |
| customDate | string | No | Specific date to get statistics for. Format: `YYYY-MM-DD` |

**Response:**
```json
{
    "success": true,
    "data": {
        "period": {
            "start": "2024-03-01",
            "end": "2024-03-31"
        },
        "summary": {
            "total_lessons": 150,
            "present_lessons": 120,
            "absent_lessons": 20,
            "late_lessons": 10,
            "attendance_rate": 80.00
        },
        "by_status": {
            "present": 120,
            "absent": 20,
            "late": 10
        }
    }
}
```

### 2. Get Payment Statistics
Get detailed payment statistics for students.

**Endpoint:** `GET /payments`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| period | string | No | Time period for statistics. Options: `daily`, `weekly`, `monthly`, `yearly`. Default: `monthly` |
| customDate | string | No | Specific date to get statistics for. Format: `YYYY-MM-DD` |
| course_id | string | No | Filter statistics by specific course ID |

**Response:**
```json
{
    "success": true,
    "data": {
        "period": {
            "start": "2024-03-01",
            "end": "2024-03-31"
        },
        "summary": {
            "total_payments": 150,
            "total_amount": 15000000,
            "average_payment": 100000
        },
        "by_payment_type": {
            "cash": 5000000,
            "card": 7000000,
            "transfer": 3000000
        },
        "by_status": {
            "completed": 120,
            "pending": 20,
            "cancelled": 10
        },
        "by_course": {
            "English": {
                "total_amount": 5000000,
                "payment_count": 50,
                "unique_students": 45
            }
        },
        "daily_trends": {
            "2024-03-01": {
                "amount": 500000,
                "count": 5
            }
        }
    }
}
```

### 3. Get Reception Statistics
Get detailed statistics about reception conversions and contacts.

**Endpoint:** `GET /reception`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| period | string | No | Time period for statistics. Options: `daily`, `weekly`, `monthly`, `yearly`. Default: `monthly` |
| customDate | string | No | Specific date to get statistics for. Format: `YYYY-MM-DD` |

**Response:**
```json
{
    "success": true,
    "data": {
        "period": {
            "start": "2024-03-01",
            "end": "2024-03-31"
        },
        "summary": {
            "total_receptions": 100,
            "converted_to_students": 30,
            "contacted": 50,
            "not_contacted": 20,
            "conversion_rate": 30.00
        },
        "by_source": {
            "website": {
                "total": 40,
                "converted": 15,
                "contacted": 20,
                "not_contacted": 5,
                "conversion_rate": 37.50
            },
            "instagram": {
                "total": 30,
                "converted": 10,
                "contacted": 15,
                "not_contacted": 5,
                "conversion_rate": 33.33
            }
        },
        "daily_trends": {
            "2024-03-01": {
                "total": 5,
                "converted": 2,
                "contacted": 2,
                "not_contacted": 1,
                "conversion_rate": 40.00
            }
        }
    }
}
```

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
    "success": false,
    "message": "Authentication required"
}
```

### 500 Internal Server Error
```json
{
    "success": false,
    "message": "Statistikani olishda xatolik yuz berdi"
}
```

## Examples

### Get Monthly Payment Statistics
```
GET /api/statistics-department/payments?period=monthly
```

### Get Daily Attendance Statistics
```
GET /api/statistics-department/attendance?period=daily
```

### Get Reception Statistics
```
GET /api/statistics-department/reception?period=monthly
```

### Get Statistics for Specific Date
```
GET /api/statistics-department/reception?customDate=2024-03-15
```

## Notes
- All dates are in UTC timezone
- Amounts are in the base currency unit (e.g., so'm)
- Statistics are calculated based on the specified period or custom date
- Conversion rates are calculated as percentages 