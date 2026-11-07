import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export function getGeminiModel(model = "gemini-2.5-flash") {
  return genAI.getGenerativeModel({ model });
}
