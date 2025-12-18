/**
 * Data Retention Cleanup Script
 * Automatically removes old contact form submissions per GDPR compliance
 * Should be run as a cron job (e.g., daily or weekly)
 */

import { MongoClient } from "mongodb";
import * as Sentry from "@sentry/nextjs";

const RETENTION_DAYS = 730; // 2 years as stated in privacy policy
const DRY_RUN = process.env.DRY_RUN === "true";

interface CleanupResult {
  deletedCount: number;
  oldestDeleted?: Date;
  newestDeleted?: Date;
  errors: string[];
}

async function cleanupOldContactSubmissions(): Promise<CleanupResult> {
  const result: CleanupResult = {
    deletedCount: 0,
    errors: [],
  };

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri) {
    const error = "MONGODB_URI not configured";
    result.errors.push(error);
    console.error(error);
    return result;
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✓ Connected to MongoDB");

    const db = client.db(dbName);
    const contacts = db.collection("contacts");

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    console.log(`Retention policy: ${RETENTION_DAYS} days`);
    console.log(`Cutoff date: ${cutoffDate.toISOString()}`);

    // Find old submissions
    const oldSubmissions = await contacts
      .find({
        time: { $lt: cutoffDate },
      })
      .toArray();

    console.log(
      `Found ${oldSubmissions.length} submissions older than ${RETENTION_DAYS} days`,
    );

    if (oldSubmissions.length === 0) {
      console.log("✓ No data to clean up");
      return result;
    }

    // Track date range
    const dates = oldSubmissions
      .map((s) => new Date(s.time))
      .sort((a, b) => a.getTime() - b.getTime());

    result.oldestDeleted = dates[0];
    result.newestDeleted = dates[dates.length - 1];

    console.log(
      `Date range: ${result.oldestDeleted.toISOString()} to ${result.newestDeleted.toISOString()}`,
    );

    if (DRY_RUN) {
      console.log("🔍 DRY RUN - No data will be deleted");
      console.log("Submissions that would be deleted:");
      oldSubmissions.forEach((sub) => {
        console.log(`  - ${sub.email} (${new Date(sub.time).toISOString()})`);
      });
      result.deletedCount = oldSubmissions.length;
      return result;
    }

    // Create audit log before deletion
    const auditLog = {
      action: "scheduled_data_retention_cleanup",
      timestamp: new Date(),
      deletedCount: oldSubmissions.length,
      cutoffDate,
      oldestDeleted: result.oldestDeleted,
      newestDeleted: result.newestDeleted,
      deletedEmails: oldSubmissions.map((s) => ({
        email: s.email,
        submittedAt: s.time,
      })),
    };

    await db.collection("deletion_audit_log").insertOne(auditLog);
    console.log("✓ Created audit log entry");

    // Delete old submissions
    const deleteResult = await contacts.deleteMany({
      time: { $lt: cutoffDate },
    });

    result.deletedCount = deleteResult.deletedCount;
    console.log(`✓ Deleted ${result.deletedCount} old submissions`);

    // Log to Sentry for monitoring
    Sentry.captureMessage(
      `Data retention cleanup: ${result.deletedCount} submissions deleted`,
      {
        level: "info",
        extra: {
          deletedCount: result.deletedCount,
          cutoffDate: cutoffDate.toISOString(),
          oldestDeleted: result.oldestDeleted?.toISOString(),
          newestDeleted: result.newestDeleted?.toISOString(),
        },
      },
    );

    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    result.errors.push(errorMsg);
    console.error("❌ Cleanup failed:", error);

    Sentry.captureException(error, {
      tags: {
        operation: "data_retention_cleanup",
      },
    });

    throw error;
  } finally {
    await client.close();
    console.log("✓ MongoDB connection closed");
  }
}

// Run if executed directly
if (require.main === module) {
  console.log("=== Data Retention Cleanup ===");
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "PRODUCTION"}`);
  console.log("");

  cleanupOldContactSubmissions()
    .then((result) => {
      console.log("");
      console.log("=== Cleanup Complete ===");
      console.log(`Deleted: ${result.deletedCount} submissions`);
      if (result.errors.length > 0) {
        console.log(`Errors: ${result.errors.length}`);
        result.errors.forEach((err) => console.error(`  - ${err}`));
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error("");
      console.error("=== Cleanup Failed ===");
      console.error(error);
      process.exit(1);
    });
}

export { cleanupOldContactSubmissions };
