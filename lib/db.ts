/**
 * MongoDB Connection Module
 * Handles connection to MongoDB Atlas
 * Exports MongoClient for use throughout the application
 */

import { MongoClient, Db } from 'mongodb';

// MongoDB connection string - use environment variable
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global MongoDB client and db instances
 * Using singleton pattern to avoid creating multiple connections
 */
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Connect to MongoDB and return the db instance
 * Uses connection pooling and caching for performance
 */
export async function connectToDatabase() {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db('medical_booking_system');

    // Cache the client and db for reuse
    cachedClient = client;
    cachedDb = db;

    console.log('✓ Connected to MongoDB');

    return { client, db };
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error);
    throw error;
  }
}

/**
 * Get the database instance
 * Must call connectToDatabase first
 */
export async function getDatabase() {
  const { db } = await connectToDatabase();
  return db;
}

/**
 * Close the MongoDB connection
 * Call this on app shutdown
 */
export async function closeDatabase() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log('✓ MongoDB connection closed');
  }
}
