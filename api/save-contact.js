import { MongoClient } from "mongodb";
import handleCors from "./cors.js";

export default async function handler(request, response) {
  if (handleCors(request, response)) {
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  let body = request.body;

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
    } catch (err) {
      response.status(400).json({ error: "Invalid JSON body" });
      return;
    }
  }

  const { name, email, phone, interest, message, time } = body || {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || !email || !emailRegex.test(email)) {
    response.status(400).json({ error: "Invalid form data" });
    return;
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

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
