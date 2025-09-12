// Manage databse connection effeciently
//Server actions (connectToDatabase() creates new db connection elke keer sonder hierdie(Gebuik selfde connection))
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose || { conn: null, promise: null }; //If no mongoose cache create empty one
//chached hold chaced connection to db
export const connectToDatabase = async () => {
  //
  if (cached.conn) return cached.connect; //Is cached already conntected(running for first time)

  if (!MONGODB_URI) throw new Error("MONGODB_URI is missing"); //Connect to cach or create new connection
  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URI, {
      dbName: "Evently",
      bufferCommands: false,
    });

  cached.conn = await cached.promise;
  return cached.conn;
};
