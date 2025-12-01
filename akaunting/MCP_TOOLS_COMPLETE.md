# ✅ Akaunting MCP Tool Manifest Complete!

## What Was Generated

### 1. OpenAPI Specification ✅

**File**: `akaunting/openapi.json`

Complete OpenAPI 3.1.0 specification with:

- 📋 **30+ endpoints** fully documented
- 🔐 Bearer token authentication
- 📦 TypeScript-ready schemas
- 🏷️ Tagged operations (Invoices, Contacts, Transactions, Items, Categories, Reports)
- ✅ Request/response validation
- 🌐 Multiple server configurations (local + production)

**Endpoints Included**:

- Invoices: CRUD + list/search
- Contacts: Customers & vendors
- Transactions: Income & expenses
- Items: Products & services
- Categories: All types
- Reports: P&L, income, expense summaries

### 2. Tool Wrapper Library ✅

**File**: `lib/akaunting-tools.mjs`

Full TypeScript/JavaScript API client with:

- ✅ **40+ typed functions**
- 🔄 Automatic authentication
- 🛡️ Error handling
- 📝 JSDoc documentation
- 🎯 Utility functions (CSV import, quick invoice, dashboard)
- 🔧 CLI test commands

**Key Functions**:

```javascript
// Invoices
akaunting.listInvoices(params);
akaunting.getInvoice(id);
akaunting.createInvoice(invoice);
akaunting.updateInvoice(id, invoice);
akaunting.deleteInvoice(id);
akaunting.quickInvoice(contactId, items, dueDays);

// Contacts
akaunting.listContacts(params);
akaunting.createContact(contact);
akaunting.updateContact(id, contact);

// Transactions
akaunting.createExpense(expense);
akaunting.createIncome(income);
akaunting.getExpenses(params);
akaunting.getIncome(params);

// Items
akaunting.listItems();
akaunting.createItem(item);

// Categories
akaunting.listCategories(params);
akaunting.createCategory(category);

// Reports
akaunting.getProfitLoss(year, month);
akaunting.getIncomeSummary(year, month);
akaunting.getExpenseSummary(year, month);

// Utilities
akaunting.syncBankCsv(csv, mapping, categoryId);
akaunting.getDashboard();
```

### 3. MCP Configuration ✅

**File**: `mcp.json` (updated)

Added Akaunting server entry:

```json
{
  "mcpServers": {
    "akaunting": {
      "type": "openapi",
      "spec": "./akaunting/openapi.json",
      "baseUrl": "http://localhost:8080/api/v1",
      "auth": {
        "type": "bearer",
        "token": "{{AKAUNTING_API_KEY}}"
      },
      "tools": {
        "wrapper": "./lib/akaunting-tools.mjs"
      }
    }
  }
}
```

### 4. NPM Scripts ✅

**File**: `package.json` (updated)

New commands:

```bash
npm run akaunting:tools:test    # Test API connection via wrapper
npm run akaunting:dashboard     # Get dashboard summary
```

### 5. Comprehensive Documentation ✅

**File**: `docs/AKAUNTING_MCP_TOOLS_USAGE.md`

Complete usage guide with:

- 📖 All function signatures
- 💡 Code examples
- 🔧 Automation patterns
- 🚀 Real-world use cases
- ⚠️ Error handling
- 🧪 Testing strategies

---

## Usage Examples

### Import and Use

```javascript
// ES Modules
import akaunting from "./lib/akaunting-tools.mjs";

// Create an invoice
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

console.log(`Created invoice #${invoice.invoice_number}`);
```

### Quick Invoice

```javascript
// Quick invoice with auto-calculated due date
const invoice = await akaunting.quickInvoice(
  5, // Customer ID
  [
    { name: "Consulting", quantity: 5, price: 120.0, tax_id: 1 },
    { name: "Development", quantity: 10, price: 100.0, tax_id: 1 },
  ],
  30, // Due in 30 days
);
```

### Add Expense

```javascript
await akaunting.createExpense({
  paid_at: "2025-12-01",
  amount: 49.99,
  category_id: 2,
  description: "Domain renewal - digitaltableteur.com",
  payment_method: "credit_card",
});
```

### Bank CSV Import

```javascript
const csv = `Date,Amount,Description
2025-12-01,150.00,Client payment
2025-12-02,-49.99,Domain renewal
2025-12-03,2500.00,Project milestone`;

const transactions = await akaunting.syncBankCsv(
  csv,
  {
    date: "Date",
    amount: "Amount",
    description: "Description",
  },
  1,
); // Category ID

console.log(`Imported ${transactions.length} transactions`);
```

### Financial Dashboard

```javascript
const dashboard = await akaunting.getDashboard();

console.log("📊 Dashboard Summary:");
console.log(`   Unpaid Invoices: ${dashboard.summary.unpaidInvoices}`);
console.log(
  `   Total Expenses: €${dashboard.summary.totalExpenses.toFixed(2)}`,
);
console.log(`   Recent Invoices: ${dashboard.recentInvoices.length}`);
```

### Monthly Reports

```javascript
const year = 2025;
const month = 12;

const [profitLoss, income, expenses] = await Promise.all([
  akaunting.getProfitLoss(year, month),
  akaunting.getIncomeSummary(year, month),
  akaunting.getExpenseSummary(year, month),
]);

console.log("Financial Reports for December 2025:");
console.log(profitLoss.data);
```

---

## Automation Use Cases

### 1. Monthly Retainer Invoicing

```javascript
async function generateMonthlyRetainers() {
  const customers = await akaunting.listContacts({ type: "customer" });

  for (const customer of customers.data) {
    if (customer.reference === "RETAINER") {
      await akaunting.quickInvoice(
        customer.id,
        [{ name: "Monthly Retainer", quantity: 1, price: 2000.0, tax_id: 1 }],
        30,
      );
    }
  }
}
```

### 2. Expense Categorization

```javascript
async function categorizeExpense(description, amount, date) {
  const categories = await akaunting.listCategories({ type: "expense" });

  const rules = {
    "domain|hosting": categories.data.find((c) => c.name === "Web Services")
      ?.id,
    "adobe|figma": categories.data.find((c) => c.name === "Software")?.id,
  };

  let categoryId = 1;
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
```

### 3. Client Onboarding

```javascript
async function onboardClient(clientData) {
  // Create contact
  const customer = await akaunting.createContact({
    type: "customer",
    name: clientData.name,
    email: clientData.email,
    currency_code: "EUR",
  });

  // Create default service items
  await akaunting.createItem({
    name: `${customer.name} - Consulting`,
    sale_price: 120.0,
    tax_id: 1,
  });

  return customer;
}
```

---

## Testing

### Test API Connection

```bash
npm run akaunting:tools:test
```

Expected output:

```
Testing Akaunting API connection...
✅ Connection successful!
Found 0 invoices
```

### Get Dashboard

```bash
npm run akaunting:dashboard
```

Expected output:

```
📊 Dashboard Summary:
   Unpaid Invoices: 3
   Total Expenses: €1,234.56
```

### Manual Testing

```javascript
import akaunting from "./lib/akaunting-tools.mjs";

// Test invoice creation
const invoice = await akaunting.createInvoice({
  invoiced_at: "2025-12-01",
  due_at: "2025-12-15",
  contact_id: 1,
  currency_code: "EUR",
  items: [{ name: "Test", quantity: 1, price: 100, tax_id: 1 }],
});

console.log("Created:", invoice.id);

// Clean up
await akaunting.deleteInvoice(invoice.id);
```

---

## VS Code Copilot Integration

Once configured, use in Copilot Chat:

```
@akaunting create invoice for customer 5 with web design service €1500

@akaunting list unpaid invoices

@akaunting add expense domain renewal €49.99

@akaunting show profit and loss for 2025

@akaunting import bank statement CSV
```

---

## File Structure

```
digitaltableteur/
├── akaunting/
│   ├── openapi.json                    # ✅ OpenAPI 3.1.0 spec
│   ├── docker-compose.yml              # Docker setup
│   ├── setup.sh                        # Installation script
│   └── README.md                       # Setup docs
├── lib/
│   └── akaunting-tools.mjs             # ✅ Tool wrapper
├── scripts/
│   ├── akaunting-mcp-setup.mjs         # MCP config script
│   └── test-akaunting-mcp.mjs          # Connection test
├── docs/
│   ├── AKAUNTING_MCP_SETUP.md          # Setup guide
│   └── AKAUNTING_MCP_TOOLS_USAGE.md    # ✅ Usage guide
├── mcp.json                            # ✅ MCP configuration
└── package.json                        # ✅ NPM scripts
```

---

## Next Steps

### 1. Configure Environment

Edit `akaunting/.env`:

```bash
AKAUNTING_API_KEY=your_api_key_here
```

### 2. Test Connection

```bash
npm run akaunting:tools:test
```

### 3. Import in Your Code

```javascript
import akaunting from "./lib/akaunting-tools.mjs";

// Start using!
const invoices = await akaunting.listInvoices();
```

### 4. Build Automation

Create your own automation scripts using the wrapper:

```javascript
// scripts/monthly-invoicing.mjs
import akaunting from "../lib/akaunting-tools.mjs";

async function run() {
  // Your custom automation here
}

run();
```

---

## Resources

- **OpenAPI Spec**: `akaunting/openapi.json`
- **Tool Wrapper**: `lib/akaunting-tools.mjs`
- **Usage Guide**: `docs/AKAUNTING_MCP_TOOLS_USAGE.md`
- **Setup Guide**: `docs/AKAUNTING_MCP_SETUP.md`
- **Official API Docs**: https://akaunting.com/docs/api

---

## Summary

✅ **OpenAPI Spec**: Complete with 30+ endpoints  
✅ **Tool Wrapper**: 40+ typed functions  
✅ **MCP Config**: Integrated in `mcp.json`  
✅ **NPM Scripts**: Test & dashboard commands  
✅ **Documentation**: Comprehensive usage guide  
✅ **Examples**: 20+ real-world automation patterns

**You can now call:**

- `akaunting.createInvoice()`
- `akaunting.getExpenses()`
- `akaunting.syncBankCsv()`
- ...and 40+ more functions!

🚀 **Ready to automate your accounting!**
