import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: any, res: any) {
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
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are Donny, Digitaltableteur's sales & creative assistant. Be accurate, concise, and grounded in the provided context.",
        },
        ...messages,
      ],
    });

    const reply = completion.choices[0]?.message?.content ?? "";
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenAI chat error", error);
    return res
      .status(500)
      .json({ error: "Donny ran into a snag. Please try again soon." });
  }
}
