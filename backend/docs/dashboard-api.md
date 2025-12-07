# Dashboard API Documentation

## Overview
Dashboard API provides comprehensive statistics and analytics for various aspects of the education management system. All endpoints support filtering by time period (daily, weekly, monthly, yearly).

## Base URL
```
/api/dashboard
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Common Parameters
All endpoints accept the following query parameter:
- `period` (string, optional): Time period for statistics
  - Values: `daily`, `weekly`, `monthly`, `yearly`
  - Default: `monthly`

## Endpoints

### 1. Get All Statistics
Returns comprehensive statistics for all aspects of the system.

```http
GET /stats
```

**Response**
```json
{
    "success": true,
    "data": {
        "period": {
            "type": "monthly",
            "start": "2024-03-01T00:00:00.000Z",
            "end": "2024-03-31T23:59:59.999Z"
        },
        "financial": {
            "total_income": 1000000,
            "total_expenses": 500000,
            "net_income": 500000,
            "profit_margin": 50.00
        },
        "payments": {
            "total_payments": 100,
            "total_amount": 1000000,
            "average_payment": 10000,
            "by_type": {
                "cash": 500000,
                "card": 300000,
                "transfer": 200000
            },
            "by_status": {
                "completed": 80,
                "pending": 15,
                "cancelled": 5
            }
        },
        "salaries": {
            "total_salaries": 10,
            "total_amount": 500000,
            "average_salary": 50000,
            "by_status": {
                "paid": 8,
                "pending": 2
            }
        },
        "groups": {
            "total_groups": 20,
            "active_groups": 15,
            "total_students": 300,
            "by_course": {
                "English": {
                    "groups": 8,
                    "students": 120,
                    "revenue": 400000
                }
            }
        },
        "marketing": {
            "total_campaigns": 5,
            "by_type": {
                "social": 2,
                "print": 1,
                "online": 2
            },
            "by_status": {
                "active": 3,
                "completed": 2
            },
            "by_district": {
                "Chilonzor": 2,
                "Yunusobod": 1
            }
        },
        "transactions": {
            "total_transactions": 110,
            "income_transactions": 100,
            "expense_transactions": 10,
            "total_income": 1000000,
            "total_expenses": 500000,
            "net_amount": 500000
        },
        "attendance": {
            "total_lessons": 1000,
            "present_lessons": 800,
            "absent_lessons": 150,
            "late_lessons": 50,
            "attendance_rate": 80.00,
            "by_status": {
                "present": 800,
                "absent": 150,
                "late": 50
            }
        }
    }
}
```

### 2. Get Financial Statistics
Returns financial statistics including income, expenses, and profit margins.

```http
GET /financial
```

**Response**
```json
{
    "success": true,
    "data": {
        "period": {
            "type": "monthly",
            "start": "2024-03-01T00:00:00.000Z",
            "end": "2024-03-31T23:59:59.999Z"
        },
        "total_income": 1000000,
        "total_expenses": 500000,
        "net_income": 500000,
        "profit_margin": 50.00
    }
}
```

### 3. Get Payment Statistics
Returns payment statistics including total payments, amounts, and distribution by type and status.

```http
GET /payments
```

**Response**
```json
{
    "success": true,
    "data": {
        "period": {
            "type": "monthly",
            "start": "2024-03-01T00:00:00.000Z",
            "end": "2024-03-31T23:59:59.999Z"
        },
        "total_payments": 100,
        "total_amount": 1000000,
        "average_payment": 10000,
        "by_type": {
            "cash": 500000,
            "card": 300000,
            "transfer": 200000
        },
        "by_status": {
            "completed": 80,
            "pending": 15,
            "cancelled": 5
        }
    }
}
```

### 4. Get Salary Statistics
Returns salary statistics including total salaries, amounts, and distribution by status.

```http
GET /salaries
```

**Response**
```json
{
    "success": true,
    "data": {
        "period": {
            "type": "monthly",
            "start": "2024-03-01T00:00:00.000Z",
            "end": "2024-03-31T23:59:59.999Z"
        },
        "total_salaries": 10,
        "total_amount": 500000,
        "average_salary": 50000,
        "by_status": {
            "paid": 8,
            "pending": 2
        }
    }
}
```

### 5. Get Group Statistics
Returns group statistics including total groups, active groups, and distribution by course.

```http
GET /groups
```

**Response**
```json
{
    "success": true,
    "data": {
        "period": {
            "type": "monthly",
            "start": "2024-03-01T00:00:00.000Z",
            "end": "2024-03-31T23:59:59.999Z"
        },
        "total_groups": 20,
        "active_groups": 15,
        "total_students": 300,
        "by_course": {
            "English": {
                "groups": 8,
                "students": 120,
                "revenue": 400000
            }
        }
    }
}
```

### 6. Get Marketing Statistics
Returns marketing statistics including campaigns, distribution by type, status, and district.

```http
GET /marketing
```

**Response**
```json
{
    "success": true,
    "data": {
        "period": {
            "type": "monthly",
            "start": "2024-03-01T00:00:00.000Z",
            "end": "2024-03-31T23:59:59.999Z"
        },
        "total_campaigns": 5,
        "by_type": {
            "social": 2,
            "print": 1,
            "online": 2
        },
        "by_status": {
            "active": 3,
            "completed": 2
        },
        "by_district": {
            "Chilonzor": 2,
            "Yunusobod": 1
        }
    }
}
```

### 7. Get Transaction Statistics
Returns transaction statistics including total transactions, income, expenses, and net amount.

```http
GET /transactions
```

**Response**
```json
{
    "success": true,
    "data": {
        "period": {
            "type": "monthly",
            "start": "2024-03-01T00:00:00.000Z",
            "end": "2024-03-31T23:59:59.999Z"
        },
        "total_transactions": 110,
        "income_transactions": 100,
        "expense_transactions": 10,
        "total_income": 1000000,
        "total_expenses": 500000,
        "net_amount": 500000
    }
}
```

### 8. Get Attendance Statistics
Returns attendance statistics including total lessons, present/absent/late counts, and attendance rate.

```http
GET /attendance
```

**Response**
```json
{
    "success": true,
    "data": {
        "period": {
            "type": "monthly",
            "start": "2024-03-01T00:00:00.000Z",
            "end": "2024-03-31T23:59:59.999Z"
        },
        "total_lessons": 1000,
        "present_lessons": 800,
        "absent_lessons": 150,
        "late_lessons": 50,
        "attendance_rate": 80.00,
        "by_status": {
            "present": 800,
            "absent": 150,
            "late": 50
        }
    }
}
```

### 9. Get Student Statistics
Returns student statistics including total students, active students, and distribution by course, group, and payment status.

```http
GET /students
```

**Response**
```json
{
    "success": true,
    "data": {
        "period": {
            "type": "monthly",
            "start": "2024-03-01T00:00:00.000Z",
            "end": "2024-03-31T23:59:59.999Z"
        },
        "total_students": 100,
        "active_students": 80,
        "trial_students": 10,
        "paid_students": 60,
        "unpaid_students": 20,
        "by_course": {
            "English": 40,
            "Math": 30,
            "Physics": 30
        },
        "by_group": {
            "Group A": 20,
            "Group B": 30,
            "Group C": 50
        },
        "by_payment_status": {
            "trial": 10,
            "paid": 60,
            "unpaid": 20,
            "expired": 10
        }
    }
}
```

### 10. Get Course Statistics
Returns course statistics including total courses, active courses, and distribution by course with groups, students, and revenue.

```http
GET /courses
```

**Response**
```json
{
    "success": true,
    "data": {
        "period": {
            "type": "monthly",
            "start": "2024-03-01T00:00:00.000Z",
            "end": "2024-03-31T23:59:59.999Z"
        },
        "total_courses": 5,
        "active_courses": 4,
        "total_groups": 20,
        "total_students": 100,
        "by_course": {
            "English": {
                "groups": 8,
                "students": 40,
                "revenue": 4000000
            },
            "Math": {
                "groups": 7,
                "students": 30,
                "revenue": 3000000
            }
        }
    }
}
```

### 11. Get Teacher Statistics
Returns teacher statistics including total teachers, active teachers, and distribution by teacher with groups, students, and salary.

```http
GET /teachers
```

**Response**
```json
{
    "success": true,
    "data": {
        "period": {
            "type": "monthly",
            "start": "2024-03-01T00:00:00.000Z",
            "end": "2024-03-31T23:59:59.999Z"
        },
        "total_teachers": 10,
        "active_teachers": 8,
        "total_groups": 20,
        "total_students": 100,
        "by_teacher": {
            "John Doe": {
                "groups": 3,
                "students": 30,
                "salary": 2000000
            },
            "Jane Smith": {
                "groups": 2,
                "students": 20,
                "salary": 1800000
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
    "message": "Error message specific to the endpoint"
}
```

## Usage Examples

### Example 1: Get Daily Statistics
```http
GET /api/dashboard/stats?period=daily
```

### Example 2: Get Weekly Payment Statistics
```http
GET /api/dashboard/payments?period=weekly
```

### Example 3: Get Monthly Course Statistics
```http
GET /api/dashboard/courses?period=monthly
```

### Example 4: Get Yearly Teacher Statistics
```http
GET /api/dashboard/teachers?period=yearly
``` 