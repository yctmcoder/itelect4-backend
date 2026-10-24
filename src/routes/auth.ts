
import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User";

export const authRouter = Router();

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

// REGISTER
authRouter.post(
  "/register",
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    try {
      const { name, email, password } = req.body ?? {};

      if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        password.length < 8
      ) {
        res.status(400).json({
          message: "Valid name, email and password (minimum 8 characters) are required",
        });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        res.status(409).json({
          message: "That email is already registered",
        });
        return;
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
      });

      res.status(201).json({
        message: "User registered successfully",
        user: user.toJSON(),
      });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        res.status(409).json({
          message: "That email is already registered",
        });
        return;
      }

      console.error("Registration error:", error);
      res.status(500).json({
        message: "Registration failed",
      });
    }
  }
);

// LOGIN
authRouter.post(
  "/login",
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    try {
      const { email, password } = req.body ?? {};

      if (
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        res.status(400).json({
          message: "Email and password are required",
        });
        return;
      }

      const user = await User.findOne({
        email: email.trim().toLowerCase(),
      }).select("+password");

      if (
        !user ||
        !user.isActive ||
        !(await bcrypt.compare(password, user.password))
      ) {
        res.status(401).json({
          message: "Email or password is incorrect",
        });
        return;
      }

      const secret = process.env.JWT_SECRET;

      if (!secret) {
        throw new Error("JWT_SECRET is missing");
      }

      const token = jwt.sign(
        { userId: user.id.toString() },
        secret,
        { expiresIn: "2h" }
      );

      res.status(200).json({
        token,
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        message: "Login failed",
      });
    }
  }
);
