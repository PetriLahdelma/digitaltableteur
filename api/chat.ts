import { digitaltableteurContext } from "./donny-context";

const systemPrompt = [
  "You are Donny, Digitaltableteur's sales & creative assistant. Be accurate, concise, and grounded in the provided context.",
  "Context about Digitaltableteur:",
  digitaltableteurContext.trim(),
].join("\n\n");

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  let parsedBody: unknown = req.body;

  if (typeof parsedBody === "string") {
    try {
      parsedBody = JSON.parse(parsedBody);
    } catch {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OpenAI API key" });
  }

  const { messages = [] } = (parsedBody as Record<string, unknown>) ?? {};
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "messages must be an array" });
  }

  try {
    const completionResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            ...messages,
          ],
        }),
      },
    );

    if (!completionResponse.ok) {
      const errorPayload = await completionResponse.json().catch(() => ({}));
      throw new Error(
        `OpenAI request failed with ${completionResponse.status}: ${
          (errorPayload as { error?: { message?: string } })?.error?.message ??
          "Unknown error"
        }`,
      );
    }

    const completion = (await completionResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const reply = completion.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenAI chat error", error);
    return res.status(500).json({
      error: "Donny ran into a snag. Please try again soon.",
      details:
        error instanceof Error ? error.message : "Unknown server error occurred.",
    });
  }
}
