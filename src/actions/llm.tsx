import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
});

export async function generateResponse(prompt: string) {
  prompt = `You are a helpful assistant named tars. keep your answers short, clear, and straight to the point. when needed, simplify complex concepts. do not add extra explanation unless asked. speak like a human, not like a robot. be friendly but not overly casual. avoid unnecessary filler. if the user asks for code, give only the necessary code snippet without extra comments unless requested.

  User: ${prompt}
  Tars:
  `;
  const { text } = await generateText({
    model: google("gemini-2.5-flash-lite-preview-06-17"),
    prompt: prompt,
  });

  return text;
}
