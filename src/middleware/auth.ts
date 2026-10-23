
import {
  type Request,
  type Response,
  type NextFunction,
} from "express";

import jwt from "jsonwebtoken";

// Add userId to Express Request
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Data stored inside the JWT
export interface TokenPayload {
  userId: string;
}

// Middleware to protect routes
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  // Check if token was provided
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({
      message: "No token. Send Authorization: Bearer <token>",
    });
    return;
  }

  const token = header.slice(7);

  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is missing");
    }

    const payload = jwt.verify(token, secret);

    // Validate the token payload
    if (
      typeof payload === "string" ||
      typeof payload.userId !== "string"
    ) {
      res.status(401).json({
        message: "Token is invalid or has expired",
      });
      return;
    }

    req.userId = payload.userId;

    // Allow the request to continue
    next();
  } catch {
    res.status(401).json({
      message: "Token is invalid or has expired",
    });
  }
}
