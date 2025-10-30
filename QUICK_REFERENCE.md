# Quick Reference Guide

## File Locations

### Models
- **Item Model**: `src/models/Item.ts`

### API Routes
- **Items Collection**: `src/app/api/items/route.ts`
- **Single Item**: `src/app/api/items/[id]/route.ts`
- **Image Upload**: `src/app/api/upload/route.ts`

### Frontend
- **Admin Manage Page**: `src/app/admin/manage/page.tsx`

### Documentation
- **API Docs**: `src/app/api/README.md`
- **Setup Checklist**: `SETUP_CHECKLIST.md`
- **Data Flow**: `DATA_FLOW.md`
- **Implementation Summary**: `DATABASE_INTEGRATION.md`

## Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/items` | Get all items (optional: ?type=drinks) |
| POST | `/api/items` | Create new item |
| GET | `/api/items/[id]` | Get single item |
| PUT | `/api/items/[id]` | Update item |
| DELETE | `/api/items/[id]` | Delete item |
| POST | `/api/upload` | Upload image |

## Environment Variables

```bash
# .env.local
MONGODB_URI=mongodb://localhost:27017/burgerazem
```

## Data Types

### Item Type
```typescript
type ItemType = "drinks" | "burgerParts" | "deserts"
```

### Item Interface
```typescript
interface IItem {
  _id: string;
  name: string;
  description: string;
  amount: number;
  imagePath: string;
  type: ItemType;
  createdAt?: Date;
  updatedAt?: Date;
}
```

## Common Operations

### Fetch Items by Type
```typescript
const response = await fetch('/api/items?type=drinks');
const data = await response.json();
```

### Create Item
```typescript
const response = await fetch('/api/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Item Name',
    description: 'Description',
    amount: 9.99,
    imagePath: '/uploads/items/image.jpg',
    type: 'drinks'
  })
});
```

### Update Item
```typescript
const response = await fetch(`/api/items/${itemId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Updated Name',
    description: 'Updated Description',
    amount: 12.99
  })
});
```

### Delete Item
```typescript
const response = await fetch(`/api/items/${itemId}`, {
  method: 'DELETE'
});
```

### Upload Image
```typescript
const formData = new FormData();
formData.append('file', fileObject);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

## Database Queries (Server-Side)

### Find by Type
```typescript
const items = await Item.find({ type: 'drinks' });
```

### Create Item
```typescript
const item = await Item.create({
  name: 'Item Name',
  description: 'Description',
  amount: 9.99,
  imagePath: '/uploads/items/image.jpg',
  type: 'drinks'
});
```

### Update Item
```typescript
const item = await Item.findByIdAndUpdate(
  id,
  { name: 'New Name' },
  { new: true, runValidators: true }
);
```

### Delete Item
```typescript
const item = await Item.findByIdAndDelete(id);
```

## Troubleshooting Tips

### Database Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Or for MongoDB Atlas, verify connection string
```

### Image Upload Issues
```bash
# Ensure directory exists
mkdir -p public/uploads/items

# Check permissions
ls -la public/uploads/items
```

### Frontend Not Updating
1. Check browser console for errors
2. Verify API responses in Network tab
3. Ensure `fetchItems()` is called after mutations
4. Check state updates in React DevTools

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run build
npm run build
```

## Key Features

✅ **Tabbed Interface** - Organize items by category
✅ **CRUD Operations** - Create, Read, Update, Delete
✅ **Image Upload** - Upload and preview images
✅ **Real-time Updates** - UI refreshes after operations
✅ **Form Validation** - Required fields checked
✅ **Confirmation Dialogs** - Prevent accidental deletions
✅ **Loading States** - User feedback during operations
✅ **Error Handling** - Graceful error messages
✅ **Responsive Design** - Material-UI components
✅ **TypeScript** - Full type safety

## Need Help?

Refer to:
1. `SETUP_CHECKLIST.md` - Detailed setup guide
2. `DATA_FLOW.md` - Understand data flow
3. `DATABASE_INTEGRATION.md` - Implementation details
4. `src/app/api/README.md` - API documentation

