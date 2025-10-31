# 🔧 Duplicate Key Error Fix

## Problem
```
Error: E11000 duplicate key error collection: test.orders 
index: clerkUserId_1 dup key: { clerkUserId: "user_xxx" }
```

## Cause
The old Order schema had a **unique index** on the `clerkUserId` field, which meant each user could only have ONE order in the database. This prevented users from creating multiple orders (drinks, burgers, desserts separately).

## Solution
The unique index needed to be dropped from the MongoDB collection.

## What Was Done

### 1. Created Fix Script
Created `scripts/fix-order-index.js` that:
- Connects to MongoDB
- Lists all indexes on the orders collection
- Drops the problematic `clerkUserId_1` unique index
- Shows the remaining indexes

### 2. Ran the Fix
```bash
node scripts/fix-order-index.js
```

**Result:**
```
✅ Successfully dropped the unique index on clerkUserId
```

### 3. Current Indexes
After the fix, the orders collection has these indexes:
- `_id_` - Default MongoDB index
- `clerkUserId_1_status_1` - Compound index (NOT unique) for queries
- `orderType_1_status_1` - Compound index for filtering by type

## Now You Can:
✅ Order multiple drinks  
✅ Order multiple burgers  
✅ Order multiple desserts  
✅ Have multiple orders at the same time  

## Testing
Try ordering a drink now - it should work without errors!

```bash
npm run dev
# Visit your app and order a drink
```

## Technical Details

### Old Schema (Problem):
```javascript
// Had unique index automatically created
clerkUserId: { type: String, required: true, unique: true } // ❌
```

### New Schema (Fixed):
```javascript
// No unique constraint on clerkUserId
clerkUserId: { type: String, required: true } // ✅

// Compound indexes for querying (NOT unique)
OrderSchema.index({ clerkUserId: 1, status: 1 });
OrderSchema.index({ orderType: 1, status: 1 });
```

## If It Happens Again

If you recreate the database or get this error again:

1. Run the fix script:
   ```bash
   node scripts/fix-order-index.js
   ```

2. Or manually in MongoDB Compass:
   - Go to your database
   - Select the `orders` collection
   - Click "Indexes" tab
   - Find `clerkUserId_1` with unique: true
   - Click the trash icon to delete it

## Prevention

The updated Order model (`src/models/Order.ts`) no longer creates a unique index on `clerkUserId`, so this shouldn't happen again in fresh databases.

---

**Fixed!** You can now order drinks without duplicate key errors! 🎉

