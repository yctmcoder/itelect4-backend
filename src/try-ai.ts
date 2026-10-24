
import "dotenv/config";
import { reviewProject } from "./ai/gemini";

// =====================================================
// SESSION 11 — GEMINI AI TEST
// =====================================================

async function tryAi(): Promise<void> {
  const description =
    "I developed a Library Management Application " +
    "using React and TypeScript. The backend uses " +
    "Express and MongoDB Atlas. Users can register, " +
    "log in using JWT authentication, create books, " +
    "and search books. Both applications are " +
    "deployed on Vercel, and book records remain " +
    "saved after refreshing the page.";

  console.log("Sending project description to Gemini...");

  const review = await reviewProject(description);

  console.log("Gemini AI Review:");
  console.log(JSON.stringify(review, null, 2));
}

// =====================================================
// RUN TEST AND HANDLE ERRORS
// =====================================================

tryAi().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error("Gemini call failed:", error.message);
  } else {
    console.error("Gemini call failed:", String(error));
  }

  process.exitCode = 1;
});
