
import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  // Check if the MongoDB connection string exists.
  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Copy .env.example to .env and fill it in.",
    );
  }

  // Connect to MongoDB Atlas.
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  console.log("MongoDB connected:", mongoose.connection.name);
}