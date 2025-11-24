import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, interest, message, time } = body || {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !email || !emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB;

    if (!uri) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 },
      );
    }

    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db(dbName);
      const contacts = db.collection("contacts");
      await contacts.insertOne({
        name,
        email,
        phone,
        interest,
        message,
        time,
      });
      return NextResponse.json({ status: "ok" }, { status: 200 });
    } catch (err) {
      console.error("MongoDB error:", err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Database error" },
        { status: 500 },
      );
    } finally {
      await client.close();
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
