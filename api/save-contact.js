import { MongoClient } from "mongodb";

export default async function handler(request, response) {
  const allowedOrigins = [
    "https://digitaltableteur.com",
    "https://www.digitaltableteur.com",
    "http://localhost:5173",
    "http://localhost:3000",
  ];
  const origin = request.headers.origin;
  if (allowedOrigins.includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    response.setHeader("Access-Control-Allow-Origin", allowedOrigins[0]);
  }
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "OPTIONS") {
    response.status(200).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  let body = request.body;
  // Logging incoming body
  console.log("Raw request.body:", body);

  // If body is undefined or a string, try to parse it
  if (!body || typeof body === "string") {
    try {
      // For Vercel/Node, read the raw body from the stream
      let rawBody = body;
      if (!rawBody && request.readable) {
        rawBody = await new Promise((resolve, reject) => {
          let data = "";
          request.on("data", (chunk) => {
            data += chunk;
          });
          request.on("end", () => resolve(data));
          request.on("error", (err) => reject(err));
        });
      }
      body = rawBody ? JSON.parse(rawBody) : {};
      console.log("Parsed body:", body);
    } catch (err) {
      console.error("Failed to parse body:", err);
      response.status(400).json({ error: "Invalid JSON body" });
      return;
    }
  }

  const { name, email, phone, interest, message, time } = body || {};

  if (!name || !email) {
    response.status(400).json({ error: "Missing required fields" });
    return;
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "digitaltableteur";

  if (!uri) {
    response.status(500).json({ error: "Database not configured" });
    return;
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const contacts = db.collection("contacts");
    await contacts.insertOne({ name, email, phone, interest, message, time });
    response.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("MongoDB error:", err);
    response.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
}
