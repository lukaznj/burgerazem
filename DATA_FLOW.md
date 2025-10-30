# Data Flow Diagram

## Adding a New Item

```
User clicks FAB (+ button)
    ↓
Opens Add Dialog
    ↓
User fills form (name, description, amount)
    ↓
User uploads image
    ↓
User clicks "Add Item"
    ↓
Frontend: POST /api/upload (FormData with image)
    ↓
API: Saves image to public/uploads/items/
    ↓
API: Returns { imagePath: "/uploads/items/..." }
    ↓
Frontend: POST /api/items (JSON with all data + imagePath + type)
    ↓
API: Connects to MongoDB
    ↓
API: Creates new Item document
    ↓
API: Returns { success: true, data: newItem }
    ↓
Frontend: Calls fetchItems() to refresh all data
    ↓
Frontend: Updates state (drinks/burgerParts/deserts)
    ↓
UI: Table re-renders with new item
```

## Editing an Item

```
User clicks Edit icon
    ↓
Opens Edit Dialog (pre-filled with current values)
    ↓
User modifies fields (name, description, amount)
    ↓
User clicks "Save"
    ↓
Frontend: PUT /api/items/[id] (JSON with updated fields)
    ↓
API: Connects to MongoDB
    ↓
API: Updates Item document (findByIdAndUpdate)
    ↓
API: Returns { success: true, data: updatedItem }
    ↓
Frontend: Calls fetchItems() to refresh all data
    ↓
Frontend: Updates state
    ↓
UI: Table re-renders with updated item
```

## Deleting an Item

```
User clicks Delete icon
    ↓
Browser shows confirmation dialog
    ↓
User confirms deletion
    ↓
Frontend: DELETE /api/items/[id]
    ↓
API: Connects to MongoDB
    ↓
API: Deletes Item document (findByIdAndDelete)
    ↓
API: Returns { success: true, data: deletedItem }
    ↓
Frontend: Calls fetchItems() to refresh all data
    ↓
Frontend: Updates state
    ↓
UI: Table re-renders without deleted item
```

## Loading Data on Page Load

```
User navigates to /admin/manage
    ↓
Component mounts
    ↓
useEffect() triggers fetchItems()
    ↓
Frontend: Parallel requests:
  - GET /api/items?type=drinks
  - GET /api/items?type=burgerParts
  - GET /api/items?type=deserts
    ↓
API: Connects to MongoDB (cached connection)
    ↓
API: Queries Item collection with filter { type: "drinks" }
    ↓
API: Returns { success: true, data: [items...] }
    ↓
Frontend: Updates state for each category
    ↓
UI: Renders tables with data in tabs
```

## Database Schema

```
MongoDB Collection: items

Document Example:
{
  _id: ObjectId("..."),
  name: "Coca Cola",
  description: "Classic refreshing soda",
  amount: 2.99,
  imagePath: "/uploads/items/1730323200000-coca-cola.jpg",
  type: "drinks",
  createdAt: ISODate("2025-10-30T18:00:00.000Z"),
  updatedAt: ISODate("2025-10-30T18:00:00.000Z")
}

Indexes:
- _id (default)
- type (custom for efficient filtering)
```

## API Response Format

All APIs follow this consistent format:

### Success Response
```json
{
  "success": true,
  "data": { /* item or array of items */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message description"
}
```

HTTP Status Codes:
- 200: Success (GET, PUT, DELETE)
- 201: Created (POST)
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

