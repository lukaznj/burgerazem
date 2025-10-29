// lib/dbConnect.ts

import mongoose from 'mongoose';

// 1. Check if the MongoDB URI is defined
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local or Vercel settings'
  );
}

// 2. Define the Mongoose cache object type and attach it to the global scope
// This is necessary to persist the connection across hot reloads in development
// and across serverless function invocations in production.
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the global object to hold our mongoose cache
declare global {
   
  var mongoose: MongooseCache;
}

// 3. Initialize the cache object
// Use the global object (if defined) or initialize it locally.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}


/**
 * Establishes a cached MongoDB connection using Mongoose.
 * @returns {Promise<typeof mongoose>} The Mongoose connection object.
 */
async function dbConnect() {
  // 4. Return the existing connection if it is available
  if (cached.conn) {
    console.log('Using existing MongoDB connection.');
    return cached.conn;
  }

  // 5. If a connection promise is not running, create a new one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Recommended for serverless to handle timeouts better
    };

    // Create a new connection promise
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      // Once resolved, store the connection instance in conn
      cached.conn = mongoose;
      return mongoose;
    });
  }

  // 6. Wait for the connection promise to resolve
  try {
    // We already stored the promise in cached.promise, just await it
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    // Reset the promise on error so the next call attempts a new connection
    cached.promise = null;
    throw e;
  }
}

export default dbConnect;