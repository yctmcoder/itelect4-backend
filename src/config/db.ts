
import mongoose from "mongoose";

let connection: Promise<typeof mongoose> | null = null;

export function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing");
  }

  if (connection === null) {
    connection = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => {
        console.log("MongoDB connected:", m.connection.name);
        return m;
      })
      .catch((error: unknown) => {
        connection = null;
        throw error;
      });
  }

  return connection;
}


