// lib/database/index.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const globalAny: any = global as any;
const cached = globalAny.mongoose || {
  conn: null as any,
  promise: null as any,
};

if (!globalAny.mongoose) {
  globalAny.mongoose = cached;
}

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn; // <-- return the existing connection

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URI, {
      dbName: "evently",
      bufferCommands: false,
    });

  cached.conn = await cached.promise;
  return cached.conn;
};
