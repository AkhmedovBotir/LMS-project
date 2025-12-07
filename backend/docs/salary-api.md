# Salary Management API Documentation

## Base URL
```
/api/salaries
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Salary Config Endpoints

### Get All Salary Configs
```http
GET /config
```

Query Parameters:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `employee_id` (optional): Filter by employee ID
- `status` (optional): Filter by status ('active' or 'inactive')
- `search` (optional): Search in employee first name or last name

Response:
```json
{
  "success": true,
  "data": [
    {
      "employee_id": {
        "_id": "string",
        "first_name": "string",
        "last_name": "string"
      },
      "base_salary": "number",
      "student_percentage": "number",
      "status": "string",
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "total_pages": "number"
  }
}
```

### Get Salary Config by ID
```http
GET /config/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "employee_id": {
      "_id": "string",
      "first_name": "string",
      "last_name": "string"
    },
    "base_salary": "number",
    "student_percentage": "number",
    "status": "string",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Create/Update Salary Config
```http
POST /config
```

Request Body:
```json
{
  "employee_id": "string",
  "base_salary": "number",
  "student_percentage": "number"
}
```

Response:
```json
{
  "success": true,
  "message": "Oylik konfiguratsiyasi yaratildi",
  "data": {
    "employee_id": "string",
    "base_salary": "number",
    "student_percentage": "number",
    "status": "active",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Edit Salary Config
```http
PUT /config/:id
```

Request Body:
```json
{
  "base_salary": "number",
  "student_percentage": "number"
}
```

Response:
```json
{
  "success": true,
  "message": "Oylik konfiguratsiyasi yangilandi",
  "data": {
    "employee_id": "string",
    "base_salary": "number",
    "student_percentage": "number",
    "status": "string",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Delete Salary Config
```http
DELETE /config/:id
```

Response:
```json
{
  "success": true,
  "message": "Oylik konfiguratsiyasi o'chirildi"
}
```

## Salary Endpoints

### Get All Salaries
```http
GET /
```

Query Parameters:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `employee_id` (optional): Filter by employee ID
- `start_date` (optional): Filter by start date
- `end_date` (optional): Filter by end date
- `status` (optional): Filter by status ('pending', 'paid', 'cancelled')
- `search` (optional): Search in employee first name or last name

Response:
```json
{
  "success": true,
  "data": [
    {
      "employee_id": {
        "_id": "string",
        "first_name": "string",
        "last_name": "string"
      },
      "month": "date",
      "base_amount": "number",
      "percentage_amount": "number",
      "bonus_amount": "number",
      "total_amount": "number",
      "note": "string",
      "status": "string",
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "total_pages": "number"
  }
}
```

### Get Salary by ID
```http
GET /:id
```

Response:
```json
{
  "success": true,
  "data": {
    "employee_id": {
      "_id": "string",
      "first_name": "string",
      "last_name": "string"
    },
    "month": "date",
    "base_amount": "number",
    "percentage_amount": "number",
    "bonus_amount": "number",
    "total_amount": "number",
    "note": "string",
    "status": "string",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Calculate Salary
```http
POST /calculate
```

Request Body:
```json
{
  "employee_id": "string",
  "month": "date"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "employee_id": "string",
    "month": "date",
    "base_amount": "number",
    "percentage_amount": "number",
    "total_amount": "number"
  }
}
```

### Create Salary
```http
POST /
```

Request Body:
```json
{
  "employee_id": "string",
  "month": "date",
  "base_amount": "number",
  "percentage_amount": "number",
  "bonus_amount": "number",
  "note": "string"
}
```

Response:
```json
{
  "success": true,
  "message": "Oylik muvaffaqiyatli saqlandi",
  "data": {
    "employee_id": "string",
    "month": "date",
    "base_amount": "number",
    "percentage_amount": "number",
    "bonus_amount": "number",
    "total_amount": "number",
    "note": "string",
    "status": "pending",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Update Salary Status
```http
PATCH /:id/status
```

Request Body:
```json
{
  "status": "string" // "pending", "paid", or "cancelled"
}
```

Response:
```json
{
  "success": true,
  "message": "Oylik statusi yangilandi",
  "data": {
    "employee_id": "string",
    "month": "date",
    "base_amount": "number",
    "percentage_amount": "number",
    "bonus_amount": "number",
    "total_amount": "number",
    "note": "string",
    "status": "string",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Delete Salary
```http
DELETE /:id
```

Response:
```json
{
  "success": true,
  "message": "Oylik o'chirildi"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Error message"
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

## Notes

1. All dates should be in ISO 8601 format
2. All amounts should be numbers
3. Status values:
   - Salary Config: 'active', 'inactive'
   - Salary: 'pending', 'paid', 'cancelled'
4. The system automatically calculates total_amount as the sum of base_amount, percentage_amount, and bonus_amount
5. When creating a new salary config, any existing active config for the employee will be automatically deactivated
6. Paid salaries cannot be deleted, only cancelled 