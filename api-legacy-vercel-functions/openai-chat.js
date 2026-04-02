export default async function handler(request, response) {
  // Only allow POST requests
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Get the prompt from the request body
  let userPrompt;
  try {
    userPrompt = request.body.prompt;
  } catch {
    response.status(400).json({ error: "Invalid request body" });
    return;
  }

  if (!userPrompt) {
    response.status(400).json({ error: "No prompt provided" });
    return;
  }

  // Prepare the OpenAI API call
  const apiKey = process.env.OPENAI_API_KEY;
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  const body = JSON.stringify({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: userPrompt }],
  });

  // Send the request to OpenAI
  try {
    const openaiRes = await fetch(apiUrl, {
      method: "POST",
      headers,
      body,
    });
    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      response.status(openaiRes.status).json({ error: errorText });
      return;
    }
    const data = await openaiRes.json();
    response.status(200).json(data);
  } catch (err) {
    response.status(500).json({ error: err.message });
  }
}
