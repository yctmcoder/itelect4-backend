
import express, { type Request, type Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { authRouter } from "./routes/auth";
import { bookRouter } from "./routes/books";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1,
  });
});

app.use("/api/auth", authRouter);
app.use("/api/books", bookRouter);
