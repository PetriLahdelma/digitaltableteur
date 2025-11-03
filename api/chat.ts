import { streamText, convertToCoreMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import { digitaltableteurContext } from "./donny-context";

const systemPrompt = [
  "You are Donny, Digitaltableteur's sales & creative assistant. Be accurate, concise, and grounded in the provided context.",
  "Context about Digitaltableteur:",
  digitaltableteurContext.trim(),
].join("\n\n");

export default async function handler(req: any, res: any) {
  // --- Handle CORS first ---
  const allowedOrigins = [
    "https://digitaltableteur.com",
    "https://www.digitaltableteur.com",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5176",
    "http://localhost:3001",
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // --- Handle allowed POST method ---
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OpenAI API key" });
  }

  const { messages = [] } = req.body ?? {};
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "messages must be an array" });
  }

  try {
    const result = await streamText({
      model: openai("gpt-4-turbo"),
      system: systemPrompt,
      messages: convertToCoreMessages(messages),
      temperature: 0.3,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("OpenAI chat error", error);
    return res
      .status(500)
      .json({ error: "Donny ran into a snag. Please try again soon." });
  }
}
