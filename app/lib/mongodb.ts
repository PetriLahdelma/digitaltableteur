/**
 * MongoDB Connection Pool
 *
 * Centralized MongoDB client with connection pooling for performance and stability.
 * Prevents multiple connection attempts and ensures efficient resource usage.
 *
 * Security features:
 * - Connection pooling (prevents connection exhaustion)
 * - Configurable timeouts
 * - TLS enforcement (ensure ?tls=true in MONGODB_URI)
 * - Graceful error handling
 *
 * @see docs/SECURITY_AUDIT_COVERAGE_REPORT.md section 3.1
 */

import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

interface MongoConnectionOptions {
  maxPoolSize?: number;
  minPoolSize?: number;
  serverSelectionTimeoutMS?: number;
  socketTimeoutMS?: number;
  connectTimeoutMS?: number;
}

const defaultOptions: MongoConnectionOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
};

/**
 * Get or create a MongoDB client with connection pooling
 *
 * @returns Promise<MongoClient> - Shared MongoDB client instance
 * @throws Error if MONGODB_URI is not set
 *
 * @example
 * ```typescript
 * const client = await getMongoClient();
 * const db = client.db(process.env.MONGODB_DB);
 * const collection = db.collection('contacts');
 * ```
 */
export async function getMongoClient(): Promise<MongoClient> {
  // Return existing connected client
  if (client) {
    try {
      // Ping to check if connection is alive
      await client.db().admin().ping();
      return client;
    } catch {
      // Connection lost, will reconnect below
      client = null;
      clientPromise = null;
    }
  }

  // Return existing connection promise
  if (clientPromise) {
    return clientPromise;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  // Validate TLS is enabled (security best practice)
  if (!uri.includes("tls=true") && !uri.includes("ssl=true")) {
    console.warn(
      "⚠️  MongoDB connection without TLS detected. Consider adding ?tls=true to MONGODB_URI",
    );
  }

  // Create new connection promise
  clientPromise = MongoClient.connect(uri, defaultOptions)
    .then((c) => {
      client = c;
      console.log("✅ MongoDB connection pool established");
      return c;
    })
    .catch((error) => {
      clientPromise = null; // Reset on failure
      console.error("❌ MongoDB connection failed:", error);
      throw error;
    });

  return clientPromise;
}

/**
 * Get a MongoDB database instance
 *
 * @param dbName - Database name (defaults to MONGODB_DB env var)
 * @returns Promise<Db> - MongoDB database instance
 *
 * @example
 * ```typescript
 * const db = await getDatabase();
 * const contacts = await db.collection('contacts').find().toArray();
 * ```
 */
export async function getDatabase(dbName?: string): Promise<Db> {
  const client = await getMongoClient();
  const name = dbName || process.env.MONGODB_DB;

  if (!name) {
    throw new Error("MONGODB_DB environment variable is not set");
  }

  return client.db(name);
}

/**
 * Close the MongoDB connection (for graceful shutdown)
 *
 * @example
 * ```typescript
 * // In shutdown handler:
 * await closeMongoConnection();
 * ```
 */
export async function closeMongoConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    clientPromise = null;
    console.log("🔌 MongoDB connection closed");
  }
}

// Graceful shutdown handlers
if (typeof process !== "undefined") {
  process.on("SIGINT", async () => {
    await closeMongoConnection();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await closeMongoConnection();
    process.exit(0);
  });
}
