# Akaunting MCP Tools Usage Guide

## Overview

The Akaunting MCP integration provides a complete TypeScript/JavaScript API wrapper with OpenAPI specification for automated accounting operations directly from VS Code.

## Installation Status

✅ **OpenAPI Spec**: `akaunting/openapi.json`  
✅ **Tool Wrapper**: `lib/akaunting-tools.mjs`  
✅ **MCP Configuration**: `mcp.json` (akaunting server)

## Quick Start

### 1. Import the Tools

```javascript
import akaunting from "./lib/akaunting-tools.mjs";

// Or use dynamic import
const { akaunting } = await import("./lib/akaunting-tools.mjs");
```

### 2. Use the API

```javascript
// List invoices
const invoices = await akaunting.listInvoices({ status: "paid" });

// Create invoice
const invoice = await akaunting.createInvoice({
  invoiced_at: "2025-12-01",
  due_at: "2025-12-15",
  contact_id: 1,
  currency_code: "EUR",
  items: [
    {
      name: "Website Design",
      quantity: 1,
      price: 1500.0,
      tax_id: 1,
    },
  ],
});

// Add expense
const expense = await akaunting.createExpense({
  paid_at: "2025-12-01",
  amount: 49.99,
  category_id: 1,
  description: "Domain renewal",
  payment_method: "credit_card",
});
```

## Complete API Reference

### Invoices

#### `akaunting.listInvoices(params)`

List all invoices with optional filtering.

**Parameters:**

- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search term
- `status` (string): Filter by status (`draft`, `sent`, `viewed`, `approved`, `partial`, `paid`, `cancelled`)

**Returns:** `Promise<Object>` - Paginated invoice list

**Example:**

```javascript
const invoices = await akaunting.listInvoices({
  status: "unpaid",
  limit: 10,
});
```

#### `akaunting.getInvoice(id)`

Get single invoice by ID.

**Example:**

```javascript
const invoice = await akaunting.getInvoice(123);
```

#### `akaunting.createInvoice(invoice)`

Create a new invoice.

**Required Fields:**

- `invoiced_at` (string): Invoice date (YYYY-MM-DD)
- `due_at` (string): Due date (YYYY-MM-DD)
- `contact_id` (number): Customer ID
- `currency_code` (string): Currency (EUR, USD, etc.)
- `items` (array): Line items

**Example:**

```javascript
const invoice = await akaunting.createInvoice({
  invoiced_at: "2025-12-01",
  due_at: "2025-12-15",
  contact_id: 5,
  currency_code: "EUR",
  notes: "Thank you for your business!",
  items: [
    {
      name: "Web Development",
      description: "Homepage redesign",
      quantity: 1,
      price: 2500.0,
      tax_id: 1,
    },
    {
      name: "SEO Optimization",
      quantity: 5,
      price: 150.0,
      tax_id: 1,
    },
  ],
});
```

#### `akaunting.updateInvoice(id, invoice)`

Update an existing invoice.

**Example:**

```javascript
await akaunting.updateInvoice(123, {
  status: "paid",
  notes: "Payment received via bank transfer",
});
```

#### `akaunting.deleteInvoice(id)`

Delete an invoice.

**Example:**

```javascript
await akaunting.deleteInvoice(123);
```

#### `akaunting.quickInvoice(contactId, items, dueDays)`

Quick invoice creation with automatic date calculation.

**Parameters:**

- `contactId` (number): Customer ID
- `items` (array): Items with { name, quantity, price, tax_id }
- `dueDays` (number): Days until due (default: 14)

**Example:**

```javascript
const invoice = await akaunting.quickInvoice(
  5,
  [{ name: "Consulting", quantity: 5, price: 120.0, tax_id: 1 }],
  30,
); // Due in 30 days
```

---

### Contacts (Customers & Vendors)

#### `akaunting.listContacts(params)`

List all contacts.

**Parameters:**

- `type` (string): Filter by type (`customer`, `vendor`)
- `search` (string): Search term

**Example:**

```javascript
const customers = await akaunting.listContacts({ type: "customer" });
```

#### `akaunting.getContact(id)`

Get single contact by ID.

#### `akaunting.createContact(contact)`

Create a new customer or vendor.

**Required Fields:**

- `type` (string): `customer` or `vendor`
- `name` (string): Contact name
- `email` (string): Email address
- `currency_code` (string): Currency code

**Example:**

```javascript
const customer = await akaunting.createContact({
  type: "customer",
  name: "Acme Corporation",
  email: "billing@acme.com",
  tax_number: "FI12345678",
  phone: "+358 40 1234567",
  address: "Mannerheimintie 1",
  city: "Helsinki",
  zip_code: "00100",
  country: "Finland",
  currency_code: "EUR",
  enabled: true,
});
```

#### `akaunting.updateContact(id, contact)`

Update an existing contact.

#### `akaunting.deleteContact(id)`

Delete a contact.

---

### Transactions (Income & Expenses)

#### `akaunting.listTransactions(params)`

List all transactions.

**Parameters:**

- `type` (string): Filter by type (`income`, `expense`)
- `search` (string): Search term

#### `akaunting.getTransaction(id)`

Get single transaction by ID.

#### `akaunting.createTransaction(transaction)`

Create income or expense transaction.

**Required Fields:**

- `type` (string): `income` or `expense`
- `paid_at` (string): Transaction date (YYYY-MM-DD)
- `amount` (number): Amount
- `currency_code` (string): Currency
- `account_id` (number): Account ID
- `category_id` (number): Category ID
- `description` (string): Description
- `payment_method` (string): Payment method

**Example:**

```javascript
const transaction = await akaunting.createTransaction({
  type: "expense",
  paid_at: "2025-12-01",
  amount: 129.99,
  currency_code: "EUR",
  account_id: 1,
  category_id: 3,
  description: "Adobe Creative Cloud subscription",
  payment_method: "credit_card",
  reference: "INV-2025-12-001",
});
```

#### `akaunting.createExpense(expense)`

Shorthand for creating expenses.

**Example:**

```javascript
await akaunting.createExpense({
  paid_at: "2025-12-01",
  amount: 49.99,
  category_id: 2,
  description: "Domain renewal",
  payment_method: "credit_card",
});
```

#### `akaunting.createIncome(income)`

Shorthand for creating income.

#### `akaunting.getExpenses(params)`

Get expenses only.

**Example:**

```javascript
const expenses = await akaunting.getExpenses({ limit: 20 });
```

#### `akaunting.getIncome(params)`

Get income only.

---

### Items (Products & Services)

#### `akaunting.listItems()`

List all items (products/services).

#### `akaunting.getItem(id)`

Get single item by ID.

#### `akaunting.createItem(item)`

Create a new item.

**Required Fields:**

- `name` (string): Item name
- `sale_price` (number): Sale price

**Example:**

```javascript
const item = await akaunting.createItem({
  name: "Website Development",
  description: "Full-stack web development services",
  sale_price: 120.0,
  purchase_price: 0,
  tax_id: 1,
  category_id: 1,
});
```

#### `akaunting.updateItem(id, item)`

Update an existing item.

#### `akaunting.deleteItem(id)`

Delete an item.

---

### Categories

#### `akaunting.listCategories(params)`

List all categories.

**Parameters:**

- `type` (string): Filter by type (`income`, `expense`, `item`, `other`)

**Example:**

```javascript
const expenseCategories = await akaunting.listCategories({ type: "expense" });
```

#### `akaunting.getCategory(id)`

Get single category by ID.

#### `akaunting.createCategory(category)`

Create a new category.

**Required Fields:**

- `name` (string): Category name
- `type` (string): Type (`income`, `expense`, `item`, `other`)

**Example:**

```javascript
const category = await akaunting.createCategory({
  name: "Software & Tools",
  type: "expense",
  color: "#3B82F6",
});
```

---

### Reports

#### `akaunting.getProfitLoss(year, month)`

Get profit & loss report.

**Parameters:**

- `year` (number): Year (required)
- `month` (number): Month (optional, 1-12)

**Example:**

```javascript
// Full year
const yearReport = await akaunting.getProfitLoss(2025);

// Specific month
const monthReport = await akaunting.getProfitLoss(2025, 12);
```

#### `akaunting.getIncomeSummary(year, month)`

Get income summary report.

**Example:**

```javascript
const income = await akaunting.getIncomeSummary(2025, 11);
```

#### `akaunting.getExpenseSummary(year, month)`

Get expense summary report.

**Example:**

```javascript
const expenses = await akaunting.getExpenseSummary(2025, 11);
```

---

### Utility Functions

#### `akaunting.syncBankCsv(csvContent, mapping, defaultCategoryId, defaultPaymentMethod)`

Import bank statement CSV and create transactions.

**Parameters:**

- `csvContent` (string): CSV file content
- `mapping` (object): Column mapping `{ date, amount, description, reference }`
- `defaultCategoryId` (number): Default category ID
- `defaultPaymentMethod` (string): Payment method (default: `bank_transfer`)

**Example:**

```javascript
const csv = `Date,Amount,Description,Reference
2025-12-01,150.00,Client payment,INV-001
2025-12-02,-49.99,Domain renewal,DOM-2025
2025-12-03,2500.00,Project milestone,PROJ-123`;

const transactions = await akaunting.syncBankCsv(
  csv,
  {
    date: "Date",
    amount: "Amount",
    description: "Description",
    reference: "Reference",
  },
  1,
); // Category ID 1

console.log(`Imported ${transactions.length} transactions`);
```

#### `akaunting.getDashboard()`

Get dashboard summary with recent data.

**Returns:**

- `recentInvoices` (array): Last 5 invoices
- `recentExpenses` (array): Last 5 expenses
- `profitLoss` (object): Current month P&L
- `summary` (object): Quick stats

**Example:**

```javascript
const dashboard = await akaunting.getDashboard();

console.log(`Unpaid Invoices: ${dashboard.summary.unpaidInvoices}`);
console.log(`Total Expenses: €${dashboard.summary.totalExpenses.toFixed(2)}`);
```

---

## Automation Examples

### 1. Monthly Invoice Generation

```javascript
// Generate monthly retainer invoice for all active customers
async function generateMonthlyRetainers() {
  const customers = await akaunting.listContacts({ type: "customer" });

  for (const customer of customers.data) {
    if (customer.enabled && customer.reference === "RETAINER") {
      await akaunting.quickInvoice(
        customer.id,
        [
          {
            name: "Monthly Retainer",
            quantity: 1,
            price: 2000.0,
            tax_id: 1,
          },
        ],
        30,
      );

      console.log(`✅ Created invoice for ${customer.name}`);
    }
  }
}
```

### 2. Expense Categorization from Receipts

```javascript
// Auto-categorize expense based on description keywords
async function categorizeExpense(description, amount, date) {
  const categories = await akaunting.listCategories({ type: "expense" });

  const rules = {
    "domain|hosting|ssl": categories.data.find((c) => c.name === "Web Services")
      ?.id,
    "adobe|figma|canva": categories.data.find((c) => c.name === "Software")?.id,
    "coffee|lunch|meeting": categories.data.find((c) => c.name === "Meals")?.id,
  };

  let categoryId = 1; // Default

  for (const [pattern, id] of Object.entries(rules)) {
    if (new RegExp(pattern, "i").test(description)) {
      categoryId = id;
      break;
    }
  }

  return akaunting.createExpense({
    paid_at: date,
    amount,
    category_id: categoryId,
    description,
    payment_method: "credit_card",
  });
}

// Usage
await categorizeExpense("Adobe Creative Cloud", 59.99, "2025-12-01");
```

### 3. Financial Health Check

```javascript
async function financialHealthCheck() {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  const [profitLoss, invoices, expenses] = await Promise.all([
    akaunting.getProfitLoss(year, month),
    akaunting.listInvoices({ status: "unpaid" }),
    akaunting.getExpenses(),
  ]);

  const report = {
    unpaidInvoices: invoices.data.length,
    unpaidAmount: invoices.data.reduce(
      (sum, inv) => sum + parseFloat(inv.amount),
      0,
    ),
    monthlyExpenses: expenses.data
      .filter((e) => new Date(e.paid_at).getMonth() === month - 1)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0),
    profitLoss: profitLoss.data,
  };

  console.log("📊 Financial Health Report:");
  console.log(
    `   Unpaid Invoices: ${report.unpaidInvoices} (€${report.unpaidAmount.toFixed(2)})`,
  );
  console.log(`   Monthly Expenses: €${report.monthlyExpenses.toFixed(2)}`);

  return report;
}
```

### 4. Client Onboarding Automation

```javascript
async function onboardNewClient(clientData) {
  // Create customer contact
  const customer = await akaunting.createContact({
    type: "customer",
    name: clientData.name,
    email: clientData.email,
    tax_number: clientData.vatId,
    currency_code: "EUR",
    enabled: true,
  });

  // Create default service items for this client
  const services = [
    { name: "Design Consultation", price: 120.0 },
    { name: "Development (hourly)", price: 100.0 },
    { name: "Project Management", price: 80.0 },
  ];

  for (const service of services) {
    await akaunting.createItem({
      name: `${customer.name} - ${service.name}`,
      sale_price: service.price,
      tax_id: 1,
    });
  }

  console.log(
    `✅ Onboarded ${customer.name} with ${services.length} service items`,
  );
  return customer;
}
```

### 5. Recurring Invoice Scheduler

```javascript
// Run this monthly via cron
async function generateRecurringInvoices() {
  const customers = await akaunting.listContacts({ type: "customer" });

  const recurringCustomers = customers.data.filter(
    (c) => c.reference && c.reference.startsWith("RECURRING-"),
  );

  for (const customer of recurringCustomers) {
    const [, amount] = customer.reference.split("-"); // e.g., RECURRING-1500

    await akaunting.quickInvoice(
      customer.id,
      [
        {
          name: "Monthly Service Fee",
          quantity: 1,
          price: parseFloat(amount),
          tax_id: 1,
        },
      ],
      14,
    );

    console.log(`✅ Generated €${amount} invoice for ${customer.name}`);
  }
}
```

---

## Testing

### CLI Test Commands

```bash
# Test connection
node lib/akaunting-tools.mjs test

# Get dashboard summary
node lib/akaunting-tools.mjs dashboard
```

### Manual Testing

```javascript
import akaunting from "./lib/akaunting-tools.mjs";

// Test invoice creation
const testInvoice = await akaunting.createInvoice({
  invoiced_at: "2025-12-01",
  due_at: "2025-12-15",
  contact_id: 1,
  currency_code: "EUR",
  items: [
    {
      name: "Test Service",
      quantity: 1,
      price: 100.0,
      tax_id: 1,
    },
  ],
});

console.log("Created test invoice:", testInvoice.id);

// Clean up
await akaunting.deleteInvoice(testInvoice.id);
```

---

## Error Handling

All functions throw errors that can be caught:

```javascript
try {
  const invoice = await akaunting.createInvoice(invalidData);
} catch (error) {
  if (error.message.includes("401")) {
    console.error("Authentication failed. Check API key.");
  } else if (error.message.includes("422")) {
    console.error("Validation error:", error.message);
  } else {
    console.error("Unknown error:", error);
  }
}
```

---

## VS Code MCP Integration

Once configured in `mcp.json`, you can use these tools directly in VS Code Copilot Chat:

```
@akaunting create invoice for customer 5 with web design service €1500
@akaunting list unpaid invoices
@akaunting add expense domain renewal €49.99
@akaunting show profit and loss for 2025
```

---

## Resources

- **OpenAPI Spec**: `akaunting/openapi.json`
- **Tool Wrapper**: `lib/akaunting-tools.mjs`
- **Official API Docs**: https://akaunting.com/docs/api
- **Setup Guide**: `docs/AKAUNTING_MCP_SETUP.md`

---

## Next Steps

1. ✅ Configure API key in `akaunting/.env`
2. ✅ Test connection: `npm run akaunting:mcp:test`
3. ✅ Import wrapper: `import akaunting from './lib/akaunting-tools.mjs'`
4. 🚀 Start automating your accounting!
