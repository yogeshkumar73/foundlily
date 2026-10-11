import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  if (!MONGODB_URI) {
    console.error(
      '[Database] MONGODB_URI is missing. Check your .env file.'
    );
    return false;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = mongoose.connection.readyState === 1;

    console.log('[Database] Connected to MongoDB successfully');

    return isConnected;
  } catch (error) {
    console.error(
      `[Database] MongoDB connection failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );

    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}