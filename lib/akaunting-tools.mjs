#!/usr/bin/env node

/**
 * Akaunting MCP Tool Wrapper
 *
 * Provides typed functions for interacting with Akaunting API
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = resolve(__dirname, "../akaunting/.env");

// Load environment variables
function loadEnv() {
  if (!existsSync(ENV_PATH)) {
    throw new Error(
      "Akaunting .env file not found. Run: npm run akaunting:mcp:setup",
    );
  }

  const envContent = readFileSync(ENV_PATH, "utf-8");
  const env = {};

  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    }
  });

  return env;
}

const env = loadEnv();
const BASE_URL = env.AKAUNTING_API_BASE_URL || "http://localhost:8080/api";
const API_USERNAME = env.AKAUNTING_API_USERNAME;
const API_PASSWORD = env.AKAUNTING_API_PASSWORD;
const COMPANY_ID = env.AKAUNTING_COMPANY_ID || "1";

if (!API_USERNAME || !API_PASSWORD) {
  throw new Error(
    "AKAUNTING_API_USERNAME and AKAUNTING_API_PASSWORD must be set in akaunting/.env",
  );
}

// Create Basic Auth token
const authToken = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString(
  "base64",
);

/**
 * Make authenticated API request
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Basic ${authToken}`,
      "X-Company": COMPANY_ID,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(
      `Akaunting API Error (${response.status}): ${error.message}`,
    );
  }

  return response.json();
}

/**
 * Akaunting API Wrapper
 */
export const akaunting = {
  // ============================================================================
  // INVOICES
  // ============================================================================

  /**
   * List all invoices
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {string} params.status - Filter by status (draft, sent, viewed, approved, partial, paid, cancelled)
   * @returns {Promise<Object>} List of invoices
   */
  async listInvoices(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/invoices${query ? "?" + query : ""}`);
  },

  /**
   * Get invoice by ID
   * @param {number} id - Invoice ID
   * @returns {Promise<Object>} Invoice details
   */
  async getInvoice(id) {
    return request(`/invoices/${id}`);
  },

  /**
   * Create a new invoice
   * @param {Object} invoice - Invoice data
   * @param {string} invoice.invoiced_at - Invoice date (YYYY-MM-DD)
   * @param {string} invoice.due_at - Due date (YYYY-MM-DD)
   * @param {number} invoice.contact_id - Customer ID
   * @param {string} invoice.currency_code - Currency (EUR, USD, etc.)
   * @param {Array} invoice.items - Line items
   * @param {string} invoice.items[].name - Item name
   * @param {number} invoice.items[].quantity - Quantity
   * @param {number} invoice.items[].price - Unit price
   * @param {number} invoice.items[].tax_id - Tax ID (optional)
   * @param {string} invoice.notes - Invoice notes (optional)
   * @returns {Promise<Object>} Created invoice
   */
  async createInvoice(invoice) {
    return request("/invoices", {
      method: "POST",
      body: JSON.stringify(invoice),
    });
  },

  /**
   * Update an existing invoice
   * @param {number} id - Invoice ID
   * @param {Object} invoice - Updated invoice data
   * @returns {Promise<Object>} Updated invoice
   */
  async updateInvoice(id, invoice) {
    return request(`/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify(invoice),
    });
  },

  /**
   * Delete an invoice
   * @param {number} id - Invoice ID
   * @returns {Promise<void>}
   */
  async deleteInvoice(id) {
    return request(`/invoices/${id}`, { method: "DELETE" });
  },

  // ============================================================================
  // CONTACTS (Customers & Vendors)
  // ============================================================================

  /**
   * List all contacts
   * @param {Object} params - Query parameters
   * @param {string} params.type - Filter by type (customer, vendor)
   * @param {string} params.search - Search term
   * @returns {Promise<Object>} List of contacts
   */
  async listContacts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/contacts${query ? "?" + query : ""}`);
  },

  /**
   * Get contact by ID
   * @param {number} id - Contact ID
   * @returns {Promise<Object>} Contact details
   */
  async getContact(id) {
    return request(`/contacts/${id}`);
  },

  /**
   * Create a new contact (customer or vendor)
   * @param {Object} contact - Contact data
   * @param {string} contact.type - Type (customer, vendor)
   * @param {string} contact.name - Contact name
   * @param {string} contact.email - Email address
   * @param {string} contact.tax_number - Tax/VAT number (optional)
   * @param {string} contact.phone - Phone number (optional)
   * @param {string} contact.address - Street address (optional)
   * @param {string} contact.currency_code - Currency code (EUR, USD, etc.)
   * @param {boolean} contact.enabled - Active status (default: true)
   * @returns {Promise<Object>} Created contact
   */
  async createContact(contact) {
    return request("/contacts", {
      method: "POST",
      body: JSON.stringify(contact),
    });
  },

  /**
   * Update an existing contact
   * @param {number} id - Contact ID
   * @param {Object} contact - Updated contact data
   * @returns {Promise<Object>} Updated contact
   */
  async updateContact(id, contact) {
    return request(`/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(contact),
    });
  },

  /**
   * Delete a contact
   * @param {number} id - Contact ID
   * @returns {Promise<void>}
   */
  async deleteContact(id) {
    return request(`/contacts/${id}`, { method: "DELETE" });
  },

  // ============================================================================
  // TRANSACTIONS (Income & Expenses)
  // ============================================================================

  /**
   * List all transactions
   * @param {Object} params - Query parameters
   * @param {string} params.type - Filter by type (income, expense)
   * @param {string} params.search - Search term
   * @returns {Promise<Object>} List of transactions
   */
  async listTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/transactions${query ? "?" + query : ""}`);
  },

  /**
   * Get transaction by ID
   * @param {number} id - Transaction ID
   * @returns {Promise<Object>} Transaction details
   */
  async getTransaction(id) {
    return request(`/transactions/${id}`);
  },

  /**
   * Create a new transaction (income or expense)
   * @param {Object} transaction - Transaction data
   * @param {string} transaction.type - Type (income, expense)
   * @param {string} transaction.paid_at - Transaction date (YYYY-MM-DD)
   * @param {number} transaction.amount - Amount
   * @param {string} transaction.currency_code - Currency code
   * @param {number} transaction.account_id - Account ID
   * @param {number} transaction.category_id - Category ID
   * @param {string} transaction.description - Description
   * @param {string} transaction.payment_method - Payment method (cash, credit_card, bank_transfer, etc.)
   * @param {number} transaction.contact_id - Contact ID (optional)
   * @param {string} transaction.reference - Reference number (optional)
   * @returns {Promise<Object>} Created transaction
   */
  async createTransaction(transaction) {
    return request("/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    });
  },

  /**
   * Create an expense
   * @param {Object} expense - Expense data
   * @param {string} expense.paid_at - Date
   * @param {number} expense.amount - Amount
   * @param {number} expense.category_id - Category ID
   * @param {string} expense.description - Description
   * @param {string} expense.payment_method - Payment method
   * @returns {Promise<Object>} Created expense
   */
  async createExpense(expense) {
    return this.createTransaction({
      ...expense,
      type: "expense",
      currency_code: expense.currency_code || "EUR",
      account_id: expense.account_id || 1, // Default account
    });
  },

  /**
   * Create an income
   * @param {Object} income - Income data
   * @param {string} income.paid_at - Date
   * @param {number} income.amount - Amount
   * @param {number} income.category_id - Category ID
   * @param {string} income.description - Description
   * @param {string} income.payment_method - Payment method
   * @returns {Promise<Object>} Created income
   */
  async createIncome(income) {
    return this.createTransaction({
      ...income,
      type: "income",
      currency_code: income.currency_code || "EUR",
      account_id: income.account_id || 1,
    });
  },

  /**
   * Get expenses only
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of expenses
   */
  async getExpenses(params = {}) {
    return this.listTransactions({ ...params, type: "expense" });
  },

  /**
   * Get income only
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of income
   */
  async getIncome(params = {}) {
    return this.listTransactions({ ...params, type: "income" });
  },

  // ============================================================================
  // ITEMS (Products & Services)
  // ============================================================================

  /**
   * List all items
   * @returns {Promise<Object>} List of items
   */
  async listItems() {
    return request("/items");
  },

  /**
   * Get item by ID
   * @param {number} id - Item ID
   * @returns {Promise<Object>} Item details
   */
  async getItem(id) {
    return request(`/items/${id}`);
  },

  /**
   * Create a new item (product or service)
   * @param {Object} item - Item data
   * @param {string} item.name - Item name
   * @param {string} item.description - Description (optional)
   * @param {number} item.sale_price - Sale price
   * @param {number} item.purchase_price - Purchase price (optional)
   * @param {number} item.tax_id - Tax ID (optional)
   * @param {number} item.category_id - Category ID (optional)
   * @returns {Promise<Object>} Created item
   */
  async createItem(item) {
    return request("/items", {
      method: "POST",
      body: JSON.stringify(item),
    });
  },

  /**
   * Update an existing item
   * @param {number} id - Item ID
   * @param {Object} item - Updated item data
   * @returns {Promise<Object>} Updated item
   */
  async updateItem(id, item) {
    return request(`/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(item),
    });
  },

  /**
   * Delete an item
   * @param {number} id - Item ID
   * @returns {Promise<void>}
   */
  async deleteItem(id) {
    return request(`/items/${id}`, { method: "DELETE" });
  },

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  /**
   * List all categories
   * @param {Object} params - Query parameters
   * @param {string} params.type - Filter by type (income, expense, item, other)
   * @returns {Promise<Object>} List of categories
   */
  async listCategories(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/categories${query ? "?" + query : ""}`);
  },

  /**
   * Get category by ID
   * @param {number} id - Category ID
   * @returns {Promise<Object>} Category details
   */
  async getCategory(id) {
    return request(`/categories/${id}`);
  },

  /**
   * Create a new category
   * @param {Object} category - Category data
   * @param {string} category.name - Category name
   * @param {string} category.type - Type (income, expense, item, other)
   * @param {string} category.color - Color hex code (optional)
   * @returns {Promise<Object>} Created category
   */
  async createCategory(category) {
    return request("/categories", {
      method: "POST",
      body: JSON.stringify(category),
    });
  },

  // ============================================================================
  // REPORTS
  // ============================================================================

  /**
   * Get profit & loss report
   * @param {number} year - Year
   * @param {number} month - Month (optional)
   * @returns {Promise<Object>} P&L report
   */
  async getProfitLoss(year, month = null) {
    const params = { year };
    if (month) params.month = month;
    const query = new URLSearchParams(params).toString();
    return request(`/reports/profit-loss?${query}`);
  },

  /**
   * Get income summary report
   * @param {number} year - Year
   * @param {number} month - Month (optional)
   * @returns {Promise<Object>} Income summary
   */
  async getIncomeSummary(year, month = null) {
    const params = { year };
    if (month) params.month = month;
    const query = new URLSearchParams(params).toString();
    return request(`/reports/income-summary?${query}`);
  },

  /**
   * Get expense summary report
   * @param {number} year - Year
   * @param {number} month - Month (optional)
   * @returns {Promise<Object>} Expense summary
   */
  async getExpenseSummary(year, month = null) {
    const params = { year };
    if (month) params.month = month;
    const query = new URLSearchParams(params).toString();
    return request(`/reports/expense-summary?${query}`);
  },

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Parse CSV bank statement and create transactions
   * @param {string} csvContent - CSV content
   * @param {Object} mapping - Column mapping { date, amount, description }
   * @param {number} defaultCategoryId - Default category ID
   * @param {string} defaultPaymentMethod - Default payment method
   * @returns {Promise<Array>} Created transactions
   */
  async syncBankCsv(
    csvContent,
    mapping,
    defaultCategoryId,
    defaultPaymentMethod = "bank_transfer",
  ) {
    const lines = csvContent.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());

    const transactions = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      const amount = parseFloat(row[mapping.amount]);
      const type = amount > 0 ? "income" : "expense";

      try {
        const transaction = await this.createTransaction({
          type,
          paid_at: row[mapping.date],
          amount: Math.abs(amount),
          currency_code: "EUR",
          account_id: 1,
          category_id: defaultCategoryId,
          description: row[mapping.description] || "Bank transaction",
          payment_method: defaultPaymentMethod,
          reference: row[mapping.reference] || null,
        });

        transactions.push(transaction);
      } catch (error) {
        console.error(`Failed to import row ${i}:`, error.message);
      }
    }

    return transactions;
  },

  /**
   * Get dashboard summary
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboard() {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const [invoices, expenses, profitLoss] = await Promise.all([
      this.listInvoices({ limit: 5 }),
      this.getExpenses({ limit: 5 }),
      this.getProfitLoss(year, month),
    ]);

    return {
      recentInvoices: invoices.data,
      recentExpenses: expenses.data,
      profitLoss: profitLoss.data,
      summary: {
        unpaidInvoices:
          invoices.data?.filter((i) => i.status !== "paid").length || 0,
        totalExpenses:
          expenses.data?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0,
      },
    };
  },

  /**
   * Quick invoice creation from preset
   * @param {number} contactId - Customer ID
   * @param {Array} items - Items with { name, quantity, price, tax_id }
   * @param {number} dueDays - Days until due (default: 14)
   * @returns {Promise<Object>} Created invoice
   */
  async quickInvoice(contactId, items, dueDays = 14) {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + dueDays);

    return this.createInvoice({
      invoiced_at: today.toISOString().split("T")[0],
      due_at: dueDate.toISOString().split("T")[0],
      contact_id: contactId,
      currency_code: "EUR",
      items: items,
    });
  },
};

// Export for use in other modules
export default akaunting;

// CLI usage example
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  switch (command) {
    case "test":
      console.log("Testing Akaunting API connection...");
      akaunting
        .listInvoices({ limit: 1 })
        .then((result) => {
          console.log("✅ Connection successful!");
          console.log(`Found ${result.data?.length || 0} invoices`);
        })
        .catch((error) => {
          console.error("❌ Connection failed:", error.message);
          process.exit(1);
        });
      break;

    case "dashboard":
      akaunting
        .getDashboard()
        .then((dashboard) => {
          console.log("📊 Dashboard Summary:");
          console.log(
            `   Unpaid Invoices: ${dashboard.summary.unpaidInvoices}`,
          );
          console.log(
            `   Total Expenses: €${dashboard.summary.totalExpenses.toFixed(2)}`,
          );
        })
        .catch((error) => {
          console.error("Error:", error.message);
          process.exit(1);
        });
      break;

    default:
      console.log("Usage: node akaunting-tools.mjs [test|dashboard]");
  }
}
