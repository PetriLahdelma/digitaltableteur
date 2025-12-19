#!/usr/bin/env node

/**
 * Create a test invoice in Akaunting
 */

import { akaunting } from "../lib/akaunting-tools.mjs";

async function createTestInvoice() {
  try {
    console.log("🔍 Checking for existing contact...");

    // Search for contact with email
    const contacts = await akaunting.listContacts({
      type: "customer",
      search: "petri.lahdelma@gmail.com",
    });

    let contact;
    if (contacts.data && contacts.data.length > 0) {
      contact = contacts.data[0];
      console.log(`✅ Found existing contact: ${contact.name} (ID: ${contact.id})`);
    } else {
      console.log("📝 Creating new contact...");
      contact = await akaunting.createContact({
        type: "customer",
        name: "Petri Lahdelma",
        email: "petri.lahdelma@gmail.com",
        currency_code: "EUR",
        enabled: true,
      });
      console.log(`✅ Contact created: ${contact.data.name} (ID: ${contact.data.id})`);
      contact = contact.data;
    }

    console.log("\n📄 Creating test invoice...");

    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 14); // Due in 14 days

    const invoice = await akaunting.createInvoice({
      invoiced_at: today.toISOString().split("T")[0],
      due_at: dueDate.toISOString().split("T")[0],
      contact_id: contact.id,
      currency_code: "EUR",
      items: [
        {
          name: "Test Service - Web Development",
          description: "Test invoice item for development purposes",
          quantity: 1,
          price: 100.0,
        },
        {
          name: "Test Service - Consultation",
          description: "Another test item",
          quantity: 2,
          price: 50.0,
        },
      ],
      notes: "This is a test invoice created via MCP automation.",
      status: "draft",
    });

    console.log("\n✅ Invoice created successfully!");
    console.log(`   Invoice Number: ${invoice.data.document_number}`);
    console.log(`   Invoice Date: ${invoice.data.invoiced_at}`);
    console.log(`   Due Date: ${invoice.data.due_at}`);
    console.log(`   Total: €${invoice.data.amount}`);
    console.log(`   Status: ${invoice.data.status}`);
    console.log(`\n🔗 View invoice at: http://localhost:8080/sales/invoices/${invoice.data.id}`);

    console.log("\n📧 Note: To send this invoice by email:");
    console.log("   1. Open Akaunting at http://localhost:8080");
    console.log("   2. Go to Sales > Invoices");
    console.log(`   3. Open invoice ${invoice.data.document_number}`);
    console.log("   4. Click 'Send' button to email to petri.lahdelma@gmail.com");
    console.log("\n⚠️  Email sending requires SMTP configuration in Akaunting.");

    return invoice.data;
  } catch (error) {
    console.error("❌ Error creating test invoice:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

createTestInvoice();
