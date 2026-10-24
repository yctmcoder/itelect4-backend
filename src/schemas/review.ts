
import { z } from "zod";

// Request from the frontend or Postman

export const aiRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(20, "Prompt must have at least 20 characters.")
    .max(2000, "Prompt must not exceed 2000 characters."),
});


// Structured AI response
export const reviewSchema = z.object({
  summary: z.string(),

  strengths: z.array(z.string()).min(1).max(3),

  improvements: z.array(z.string()).min(1).max(3),

  readiness: z.enum([
    "ready",
    "almost",
    "not-yet",
  ]),
});

export type Review = z.infer<typeof reviewSchema>;

export const reviewJsonSchema = z.toJSONSchema(reviewSchema);
