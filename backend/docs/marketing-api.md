# Marketing API Documentation

## Base URL
```
/api/marketing
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## File Upload Structure
Images are stored in type-specific folders:
```
uploads/
└── marketing/
    ├── banner/     # Banner images
    ├── reklama/    # Reklama images
    └── hamkor/     # Partner logos
```

## Marker Endpoints

### Get All Markers
```http
GET /markers
```

Query Parameters:
- `type` (optional): Filter by marker type ('banner', 'reklama', 'hamkor')
- `status` (optional): Filter by status

Response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "type": "string",
      "title": "string",
      "address": "string",
      "location": {
        "type": "Point",
        "coordinates": [number, number]
      },
      "bannerName": "string",
      "bannerImage": "string",
      "bannerSize": {
        "width": "number",
        "height": "number"
      },
      "reklamaMavzusi": "string",
      "joyNomi": "string",
      "hamkorNomi": "string",
      "logo": "string",
      "description": "string",
      "status": "string",
      "created_at": "date",
      "updated_at": "date"
    }
  ]
}
```

### Get Marker by ID
```http
GET /markers/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "type": "string",
    "title": "string",
    "address": "string",
    "location": {
      "type": "Point",
      "coordinates": [number, number]
    },
    "bannerName": "string",
    "bannerImage": "string",
    "bannerSize": {
      "width": "number",
      "height": "number"
    },
    "reklamaMavzusi": "string",
    "joyNomi": "string",
    "hamkorNomi": "string",
    "logo": "string",
    "description": "string",
    "status": "string",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Create Marker
```http
POST /markers
```

Request Body (multipart/form-data):
- `type`: Marker type ('banner', 'reklama', 'hamkor') [required]
- `title`: Title (required for banner)
- `address`: Address [required]
- `lat`: Latitude [required]
- `lng`: Longitude [required]
- `bannerName`: Banner name (required for banner)
- `bannerSize.width`: Banner width (required for banner)
- `bannerSize.height`: Banner height (required for banner)
- `reklamaMavzusi`: Reklama topic (required for reklama)
- `joyNomi`: Place name (required for reklama)
- `hamkorNomi`: Partner name (required for hamkor)
- `description`: Description [required]
- `status`: Status [required]
- `image`: Image file (required for banner or hamkor)

Notes:
- For banner type: `title`, `bannerName`, `bannerSize`, and `image` are required
- For reklama type: `reklamaMavzusi` and `joyNomi` are required
- For hamkor type: `hamkorNomi` and `image` are required
- Image must be JPEG, JPG, PNG, or GIF
- Image will be stored in type-specific folder (e.g., `uploads/marketing/banner/`)
- Coordinates must be valid: latitude (-90 to 90) and longitude (-180 to 180)

Response:
```json
{
  "success": true,
  "message": "Marker muvaffaqiyatli yaratildi",
  "data": {
    "_id": "string",
    "type": "string",
    "title": "string",
    "address": "string",
    "location": {
      "type": "Point",
      "coordinates": [number, number]
    },
    "bannerName": "string",
    "bannerImage": "string",
    "bannerSize": {
      "width": "number",
      "height": "number"
    },
    "reklamaMavzusi": "string",
    "joyNomi": "string",
    "hamkorNomi": "string",
    "logo": "string",
    "description": "string",
    "status": "string",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Update Marker
```http
PUT /markers/:id
```

Request Body (multipart/form-data):
- Same as Create Marker

Notes:
- Old image will be automatically deleted when new image is uploaded
- If update fails, uploaded image will be deleted
- All validation rules from Create Marker apply

Response:
```json
{
  "success": true,
  "message": "Marker muvaffaqiyatli yangilandi",
  "data": {
    "_id": "string",
    "type": "string",
    "title": "string",
    "address": "string",
    "location": {
      "type": "Point",
      "coordinates": [number, number]
    },
    "bannerName": "string",
    "bannerImage": "string",
    "bannerSize": {
      "width": "number",
      "height": "number"
    },
    "reklamaMavzusi": "string",
    "joyNomi": "string",
    "hamkorNomi": "string",
    "logo": "string",
    "description": "string",
    "status": "string",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

### Delete Marker
```http
DELETE /markers/:id
```

Notes:
- Associated image files will be automatically deleted

Response:
```json
{
  "success": true,
  "message": "Marker muvaffaqiyatli o'chirildi"
}
```

## Statistics Endpoints

### Get Marketing Statistics
```http
GET /statistics
```

Response:
```json
{
  "success": true,
  "data": {
    "by_type": [
      {
        "_id": "string",
        "statuses": [
          {
            "status": "string",
            "count": "number"
          }
        ],
        "total": "number"
      }
    ]
  }
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

1. All dates are in ISO 8601 format
2. Image files:
   - Must be JPEG, JPG, PNG, or GIF
   - Will be stored in type-specific folders
   - Will be automatically deleted when marker is deleted or updated
   - Will be deleted if marker creation/update fails
3. Status values:
   - Banner: 'qo'yilgan', 'olib_tashlangan', 'yangilangan'
   - Reklama: 'o'rganilmoqda', 'tayyor', 'cancelled'
   - Hamkor: 'o'rganilmoqda', 'hamkor_bo'ldi', 'cancelled'
4. Location coordinates:
   - Must be valid latitude (-90 to 90) and longitude (-180 to 180)
   - Will be stored in MongoDB GeoJSON format [longitude, latitude]
5. All required fields must be provided based on the marker type 