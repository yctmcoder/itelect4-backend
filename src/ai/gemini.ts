
import { GoogleGenAI, type Content } from "@google/genai";

import {
  MODEL,
  SYSTEM_PROMPT,
  EXAMPLES,
  wrap,
} from "./prompt";

import {
  reviewSchema,
  reviewJsonSchema,
  type Review,
} from "../schemas/review";

// =====================================================
// GEMINI CLIENT
// =====================================================

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Add it to your backend .env file."
    );
  }

  if (client === null) {
    client = new GoogleGenAI({ apiKey });
  }

  return client;
}

// =====================================================
// BUILD THE CONVERSATION
// =====================================================

// Two example exchanges plus the real user message.
function buildContents(description: string): Content[] {
  const exampleTurns: Content[] = EXAMPLES.flatMap(
    (example): Content[] => [
      {
        role: "user",
        parts: [{ text: wrap(example.description) }],
      },
      {
        role: "model",
        parts: [{ text: JSON.stringify(example.review) }],
      },
    ]
  );

  return [
    ...exampleTurns,
    {
      role: "user",
      parts: [{ text: wrap(description) }],
    },
  ];
}

// =====================================================
// AI RESPONSE ERROR
// =====================================================

export class AiReplyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiReplyError";
  }
}

// =====================================================
// GENERATE STRUCTURED REVIEW
// =====================================================

export async function reviewProject(
  description: string
): Promise<Review> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: buildContents(description),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseJsonSchema: reviewJsonSchema,
    },
  });

  const responseText = response.text;

  if (!responseText) {
    throw new AiReplyError(
      "Gemini returned an empty response."
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new AiReplyError(
      "Gemini returned invalid JSON."
    );
  }

  const result = reviewSchema.safeParse(parsed);

  if (!result.success) {
    throw new AiReplyError(
      "Gemini returned JSON that does not match the review schema."
    );
  }

  return result.data;
}
