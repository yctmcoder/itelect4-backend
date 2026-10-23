
import "dotenv/config";
import express from "express";
import { app } from "./app";
import { connectDB } from "./config/db";

// Vercel uses this Express application.
const serverlessApp = express();

serverlessApp.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    res.status(503).json({
      message: "Database connection unavailable",
    });
  }
});

serverlessApp.use(app);

export default serverlessApp;
