import { Router, type Request, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import { ApiError } from "@google/genai";

import { requireAuth } from "../middleware/auth";
import { aiRequestSchema } from "../schemas/review";
import { reviewProject, AiReplyError } from "../ai/gemini";

export const aiRouter = Router();

// JWT authentication is required
aiRouter.use(requireAuth);

// =====================================================
// RATE LIMIT: 5 REQUESTS PER MINUTE PER USER
// =====================================================

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,

  keyGenerator: (req: Request) => req.userId!,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    message:
      "Five reviews a minute is the limit. Try again shortly.",
  },
});

aiRouter.use(aiLimiter);

// =====================================================
// POST /api/ai
// =====================================================

aiRouter.post(
  "/",
  async (req: Request, res: Response) => {
    const parsed = aiRequestSchema.safeParse(req.body);

    // Validate before calling Gemini
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.issues.map(
          (issue) => issue.message
        ),
      });
      return;
    }

    try {
      const review = await reviewProject(
        parsed.data.prompt
      );

      res.status(200).json(review);
    } catch (error) {
      // Gemini quota exceeded
      if (
        error instanceof ApiError &&
        error.status === 429
      ) {
        res.status(429).json({
          message:
            "The AI quota is used up for now. Try again later.",
        });
        return;
      }

      // Gemini API or invalid AI response
      if (
        error instanceof ApiError ||
        error instanceof AiReplyError
      ) {
        console.error("Gemini API error:", error);

        res.status(502).json({
          message:
            "The AI service did not answer properly. Try again.",
        });
        return;
      }

      // Unexpected backend errors
      console.error("Unexpected AI error:", error);

      res.status(500).json({
        message: "Something went wrong.",
      });
    }
  }
);
