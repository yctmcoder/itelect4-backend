
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";

import cors from "cors";
import mongoose from "mongoose";

import { connectDB } from "./config/db";
import { authRouter } from "./routes/auth";
import { bookRouter } from "./routes/books";

export const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB before handling API requests
app.use(async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error);

    res.status(503).json({
      message: "Database connection unavailable",
    });
  }
});

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1,
  });
});

// Authentication routes
app.use("/api/auth", authRouter);

// Protected Book CRUD routes
app.use("/api/books", bookRouter);

// Export Express app for Vercel
export default app;
