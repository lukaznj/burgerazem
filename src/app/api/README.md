# Admin Items Management API

This directory contains the API routes for managing items (drinks, burger parts, and deserts) in the admin dashboard.

## Database Setup

The application uses MongoDB with Mongoose for data persistence. Make sure you have the `MONGODB_URI` environment variable set in your `.env.local` file:

```
MONGODB_URI=mongodb://localhost:27017/burgerazem
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/burgerazem?retryWrites=true&w=majority
```

## Models

### Item Model
Located at: `src/models/Item.ts`

```typescript
interface IItem {
  _id: string;
  name: string;
  description: string;
  amount: number;
  imagePath: string;
  type: "drinks" | "burgerParts" | "deserts";
}
```

## API Endpoints

### GET /api/items
Fetch all items or filter by type.

**Query Parameters:**
- `type` (optional): Filter by item type (`drinks`, `burgerParts`, or `deserts`)

**Example:**
```
GET /api/items?type=drinks
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Coca Cola",
      "description": "Classic soda",
      "amount": 2.99,
      "imagePath": "/uploads/items/...",
      "type": "drinks"
    }
  ]
}
```

### POST /api/items
Create a new item.

**Body:**
```json
{
  "name": "Coca Cola",
  "description": "Classic soda",
  "amount": 2.99,
  "imagePath": "/uploads/items/image.jpg",
  "type": "drinks"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### GET /api/items/[id]
Fetch a single item by ID.

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### PUT /api/items/[id]
Update an item. Only `name`, `description`, and `amount` can be updated.

**Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "amount": 3.99
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### DELETE /api/items/[id]
Delete an item by ID.

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### POST /api/upload
Upload an image file.

**Body:** FormData with `file` field

**Response:**
```json
{
  "success": true,
  "data": {
    "imagePath": "/uploads/items/1234567890-image.jpg"
  }
}
```

## File Uploads

Images are stored in `public/uploads/items/` directory. In production, you should use a cloud storage service like AWS S3, Cloudinary, or Vercel Blob Storage.

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message"
}
```

HTTP status codes:
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

