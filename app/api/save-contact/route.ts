import { NextResponse, NextRequest } from 'next/server';
import { MongoClient } from 'mongodb';

function allowCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
}

export async function OPTIONS() {
  const res = NextResponse.json({}, { status: 200 });
  allowCors(res);
  return res;
}

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  allowCors(res);
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { name, email, phone, interest, message, time } = body || {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || !email || !emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const uri = process.env.MONGODB_URI as string;
  const dbName = process.env.MONGODB_DB || 'digitaltableteur';
  if (!uri) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const contacts = db.collection('contacts');
    await contacts.insertOne({ name, email, phone, interest, message, time });
    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    console.error('MongoDB error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    await client.close();
  }
}
