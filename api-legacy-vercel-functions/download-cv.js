import { readFileSync } from "fs";
import path from "path";
import handleCors from "./cors.js";

export default async function handler(req, res) {
  // Handle CORS
  if (handleCors(req, res)) {
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Fail closed: if CV_PASSWORD is not configured, refuse all attempts
  if (!process.env.CV_PASSWORD) {
    return res.status(503).json({ error: "Service temporarily unavailable" });
  }

  const password =
    typeof req.body?.password === "string" ? req.body.password : "";

  // Fail closed: if CV_PASSWORD is not configured, refuse all attempts
  if (!process.env.CV_PASSWORD) {
    return res.status(503).json({ error: "Service temporarily unavailable" });
  }

  if (password !== process.env.CV_PASSWORD) {
    return res.status(403).json({ error: "Invalid password" });
  }

  try {
    const filePath = path.join(process.cwd(), "private", "CV.pdf");
    const file = readFileSync(filePath);

    const filename = "CV.pdf";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=" + filename);
    res.send(file);
  } catch (error) {
    return res.status(500).json({ error: "File not found" });
  }
}
