/**
 * Script to fix the duplicate key error by removing the old unique index on clerkUserId
 *
 * The old Order schema had a unique index on clerkUserId which prevented users
 * from having multiple orders. This script removes that index.
 *
 * Usage:
 *   node scripts/fix-order-index.js
 */

const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable not found');
  console.error('Please set MONGODB_URI in your .env.local file');
  process.exit(1);
}

async function fixOrderIndex() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');

    // Get all indexes
    const indexes = await ordersCollection.indexes();
    console.log('\nCurrent indexes on orders collection:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Check if the problematic index exists
    const hasUniqueClerkUserIdIndex = indexes.some(
      index => index.name === 'clerkUserId_1' && index.unique === true
    );

    if (hasUniqueClerkUserIdIndex) {
      console.log('\n⚠️  Found problematic unique index on clerkUserId');
      console.log('Dropping index: clerkUserId_1');

      await ordersCollection.dropIndex('clerkUserId_1');

      console.log('✅ Successfully dropped the unique index on clerkUserId');
      console.log('\nYou can now create multiple orders per user!');
    } else {
      console.log('\n✅ No problematic unique index found.');
      console.log('The clerkUserId_1 index either doesn\'t exist or is not unique.');
    }

    // Show final indexes
    const finalIndexes = await ordersCollection.indexes();
    console.log('\nFinal indexes on orders collection:');
    finalIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

  } catch (error) {
    console.error('\n❌ Error fixing index:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

fixOrderIndex();

