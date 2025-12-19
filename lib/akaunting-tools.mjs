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
const API_TOKEN = env.AKAUNTING_API_TOKEN;
const API_USERNAME = env.AKAUNTING_API_USERNAME;
const API_PASSWORD = env.AKAUNTING_API_PASSWORD;
const COMPANY_ID = env.AKAUNTING_COMPANY_ID || "1";

// Prefer API token over Basic Auth
let authHeader;
if (API_TOKEN) {
  authHeader = `Bearer ${API_TOKEN}`;
} else if (API_USERNAME && API_PASSWORD) {
  const authToken = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString(
    "base64",
  );
  authHeader = `Basic ${authToken}`;
} else {
  throw new Error(
    "Either AKAUNTING_API_TOKEN or both AKAUNTING_API_USERNAME and AKAUNTING_API_PASSWORD must be set in akaunting/.env",
  );
}

/**
 * Make authenticated API request
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: authHeader,
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

// ============================================================================
// FINNISH TAX & COMPLIANCE UTILITIES
// ============================================================================

/**
 * Finnish VAT rates (2025)
 */
const FI_VAT_RATES = {
  STANDARD: 25.5, // Standard rate (increased from 24% in 2024)
  REDUCED_1: 14, // Food, animal feed
  REDUCED_2: 10, // Books, medicines, public transport, accommodation
  ZERO: 0, // Healthcare, education, financial services, intra-EU
};

/**
 * Generate VAT summary for Finnish tax authorities (Vero.fi)
 * Produces ALV-ilmoitus format data
 *
 * @param {Object} params
 * @param {string} params.startDate - ISO date (YYYY-MM-DD)
 * @param {string} params.endDate - ISO date (YYYY-MM-DD)
 * @param {string} params.period - 'monthly' | 'quarterly'
 * @returns {Promise<Object>} VAT summary with boxes matching Vero.fi form
 */
export async function generateVATSummary({
  startDate,
  endDate,
  period = "monthly",
}) {
  // Fetch all transactions in period
  const [invoices, bills] = await Promise.all([
    akaunting.listInvoices({
      search: `invoiced_at:[${startDate},${endDate}]`,
      limit: 1000,
    }),
    request("/bills", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).catch(() => ({ data: [] })),
  ]);

  // Calculate sales (output VAT)
  const salesByRate = {
    25.5: { net: 0, vat: 0, gross: 0 },
    14: { net: 0, vat: 0, gross: 0 },
    10: { net: 0, vat: 0, gross: 0 },
    0: { net: 0, vat: 0, gross: 0 },
  };

  invoices.data?.forEach((invoice) => {
    const rate = invoice.items?.[0]?.tax || 0;
    const amount = parseFloat(invoice.amount || 0);
    const vatAmount = parseFloat(invoice.tax || 0);
    const netAmount = amount - vatAmount;

    if (salesByRate[rate]) {
      salesByRate[rate].net += netAmount;
      salesByRate[rate].vat += vatAmount;
      salesByRate[rate].gross += amount;
    }
  });

  // Calculate purchases (input VAT)
  const purchasesByRate = {
    25.5: { net: 0, vat: 0, gross: 0 },
    14: { net: 0, vat: 0, gross: 0 },
    10: { net: 0, vat: 0, gross: 0 },
    0: { net: 0, vat: 0, gross: 0 },
  };

  bills.data?.forEach((bill) => {
    const rate = bill.items?.[0]?.tax || 0;
    const amount = parseFloat(bill.amount || 0);
    const vatAmount = parseFloat(bill.tax || 0);
    const netAmount = amount - vatAmount;

    if (purchasesByRate[rate]) {
      purchasesByRate[rate].net += netAmount;
      purchasesByRate[rate].vat += vatAmount;
      purchasesByRate[rate].gross += amount;
    }
  });

  // Calculate totals
  const totalSalesVAT = Object.values(salesByRate).reduce(
    (sum, r) => sum + r.vat,
    0,
  );
  const totalPurchaseVAT = Object.values(purchasesByRate).reduce(
    (sum, r) => sum + r.vat,
    0,
  );
  const vatPayable = totalSalesVAT - totalPurchaseVAT;

  return {
    period: { startDate, endDate, type: period },
    currency: "EUR",

    // Vero.fi ALV-ilmoitus boxes
    boxes: {
      301: salesByRate[25.5].net, // Sales at 25.5% (net)
      302: salesByRate[25.5].vat, // VAT at 25.5%
      303: salesByRate[14].net, // Sales at 14% (net)
      304: salesByRate[14].vat, // VAT at 14%
      305: salesByRate[10].net, // Sales at 10% (net)
      306: salesByRate[10].vat, // VAT at 10%
      307: salesByRate[0].net, // Zero-rated sales
      308: 0, // EU intra-community supplies
      309:
        purchasesByRate[25.5].net +
        purchasesByRate[14].net +
        purchasesByRate[10].net, // Purchases with VAT
      310: totalPurchaseVAT, // Deductible input VAT
      311: vatPayable, // VAT payable (or refund if negative)
    },

    // Detailed breakdown
    sales: salesByRate,
    purchases: purchasesByRate,

    summary: {
      totalSalesNet: Object.values(salesByRate).reduce(
        (sum, r) => sum + r.net,
        0,
      ),
      totalSalesVAT,
      totalSalesGross: Object.values(salesByRate).reduce(
        (sum, r) => sum + r.gross,
        0,
      ),
      totalPurchaseNet: Object.values(purchasesByRate).reduce(
        (sum, r) => sum + r.net,
        0,
      ),
      totalPurchaseVAT,
      totalPurchaseGross: Object.values(purchasesByRate).reduce(
        (sum, r) => sum + r.gross,
        0,
      ),
      vatPayable,
      invoiceCount: invoices.data?.length || 0,
      billCount: bills.data?.length || 0,
    },

    // Ready for OmaVero submission
    omaVeroFormat: {
      ilmoituskausi: period === "monthly" ? "kuukausi" : "neljännesvuosi",
      kausi: `${startDate.slice(0, 7)}`, // YYYY-MM format
      myynti_255_veroton: salesByRate[25.5].net.toFixed(2),
      myynti_255_vero: salesByRate[25.5].vat.toFixed(2),
      myynti_14_veroton: salesByRate[14].net.toFixed(2),
      myynti_14_vero: salesByRate[14].vat.toFixed(2),
      myynti_10_veroton: salesByRate[10].net.toFixed(2),
      myynti_10_vero: salesByRate[10].vat.toFixed(2),
      vähennettävä_vero: totalPurchaseVAT.toFixed(2),
      maksettava_vero: vatPayable.toFixed(2),
    },
  };
}

/**
 * List missing receipts and expense evidence
 * Identifies transactions without proper documentation
 *
 * @param {Object} params
 * @param {string} params.startDate - ISO date
 * @param {string} params.endDate - ISO date
 * @param {number} params.threshold - Minimum amount requiring receipt (default: 10 EUR)
 * @returns {Promise<Object>} Missing receipts report
 */
export async function listMissingReceipts({
  startDate,
  endDate,
  threshold = 10,
}) {
  const transactions = await request("/transactions", {
    method: "GET",
  }).catch(() => ({ data: [] }));

  const expenses =
    transactions.data?.filter(
      (t) =>
        t.type === "expense" &&
        parseFloat(t.amount) >= threshold &&
        new Date(t.paid_at) >= new Date(startDate) &&
        new Date(t.paid_at) <= new Date(endDate),
    ) || [];

  const missing = expenses.filter((expense) => {
    // Check if has attachment or reference
    return !expense.attachment && !expense.reference;
  });

  const total = missing.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  return {
    period: { startDate, endDate },
    threshold,
    missing: missing.map((e) => ({
      id: e.id,
      date: e.paid_at,
      amount: parseFloat(e.amount),
      description: e.description,
      category: e.category?.name,
      account: e.account?.name,
      contact: e.contact?.name,
      missingReason: !e.attachment ? "no_receipt" : "no_reference",
    })),
    summary: {
      totalMissing: missing.length,
      totalAmount: total,
      percentageOfExpenses:
        expenses.length > 0
          ? ((missing.length / expenses.length) * 100).toFixed(1)
          : 0,
      complianceRisk: total > 1000 ? "high" : total > 500 ? "medium" : "low",
    },
    recommendations: [
      "Upload receipts for transactions over €10",
      "Add reference numbers for all expenses",
      "Finnish Tax Administration requires proof for all deductible expenses",
      "Missing receipts may be rejected in audit",
    ],
  };
}

/**
 * Prepare monthly bookkeeping report for accountant
 * Finnish format: "Kuukauden kirjanpitoaineisto"
 *
 * @param {Object} params
 * @param {number} params.year
 * @param {number} params.month - 1-12
 * @returns {Promise<Object>} Complete monthly report package
 */
export async function prepareMonthlyReport({ year, month }) {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  const [invoices, bills, transactions, vatSummary, missingReceipts] =
    await Promise.all([
      akaunting.listInvoices({
        search: `invoiced_at:[${startDate},${endDate}]`,
        limit: 1000,
      }),
      request("/bills").catch(() => ({ data: [] })),
      request("/transactions").catch(() => ({ data: [] })),
      generateVATSummary({ startDate, endDate, period: "monthly" }),
      listMissingReceipts({ startDate, endDate }),
    ]);

  const income =
    transactions.data?.filter(
      (t) =>
        t.type === "income" &&
        new Date(t.paid_at) >= new Date(startDate) &&
        new Date(t.paid_at) <= new Date(endDate),
    ) || [];

  const expenses =
    transactions.data?.filter(
      (t) =>
        t.type === "expense" &&
        new Date(t.paid_at) >= new Date(startDate) &&
        new Date(t.paid_at) <= new Date(endDate),
    ) || [];

  const totalIncome = income.reduce(
    (sum, t) => sum + parseFloat(t.amount || 0),
    0,
  );
  const totalExpenses = expenses.reduce(
    (sum, t) => sum + parseFloat(t.amount || 0),
    0,
  );
  const netProfit = totalIncome - totalExpenses;

  return {
    period: {
      year,
      month,
      monthName: new Intl.DateTimeFormat("fi-FI", { month: "long" }).format(
        new Date(year, month - 1),
      ),
      startDate,
      endDate,
    },

    // Tuloslaskelma (Income Statement)
    incomeStatement: {
      revenue: {
        sales: vatSummary.summary.totalSalesNet,
        otherIncome: 0,
        total: totalIncome,
      },
      expenses: {
        materials: 0,
        personnel: 0,
        depreciation: 0,
        otherExpenses: totalExpenses,
        total: totalExpenses,
      },
      operatingProfit: netProfit,
      financialItems: 0,
      profitBeforeTax: netProfit,
      taxExpense: 0,
      netProfit,
    },

    // VAT summary
    vat: vatSummary,

    // Transactions
    invoices: {
      issued: invoices.data?.length || 0,
      totalAmount:
        invoices.data?.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0) ||
        0,
      paid: invoices.data?.filter((i) => i.status === "paid").length || 0,
      unpaid: invoices.data?.filter((i) => i.status !== "paid").length || 0,
    },

    bills: {
      received: bills.data?.length || 0,
      totalAmount:
        bills.data?.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0) || 0,
      paid: bills.data?.filter((b) => b.status === "paid").length || 0,
      unpaid: bills.data?.filter((b) => b.status !== "paid").length || 0,
    },

    // Compliance
    compliance: {
      missingReceipts: missingReceipts.summary.totalMissing,
      complianceScore: 100 - missingReceipts.summary.totalMissing * 5,
      warnings: missingReceipts.missing.slice(0, 5),
    },

    // Accountant checklist
    checklist: {
      invoicesRecorded: invoices.data?.length > 0,
      billsRecorded: bills.data?.length > 0,
      vatCalculated: true,
      receiptsAttached: missingReceipts.summary.totalMissing === 0,
      bankReconciled: false, // Manual check required
      salariesProcessed: false, // Manual check required
    },

    // Files to provide accountant
    deliverables: [
      `Myyntilaskut_${year}_${String(month).padStart(2, "0")}.pdf`,
      `Ostolaskut_${year}_${String(month).padStart(2, "0")}.pdf`,
      `Tiliotteet_${year}_${String(month).padStart(2, "0")}.pdf`,
      `Kuitit_${year}_${String(month).padStart(2, "0")}.zip`,
      `ALV_laskelma_${year}_${String(month).padStart(2, "0")}.pdf`,
    ],
  };
}

/**
 * Generate year-end package for Finnish Tax Administration
 * "Tilinpäätösaineisto" - Complete annual report
 *
 * @param {Object} params
 * @param {number} params.year - Fiscal year
 * @returns {Promise<Object>} Complete year-end package
 */
export async function yearEndPackage({ year }) {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  // Gather all annual data
  const monthlyReports = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      prepareMonthlyReport({ year, month: i + 1 }),
    ),
  );

  const [invoices, bills, transactions] = await Promise.all([
    akaunting.listInvoices({
      search: `invoiced_at:[${startDate},${endDate}]`,
      limit: 10000,
    }),
    request("/bills").catch(() => ({ data: [] })),
    request("/transactions").catch(() => ({ data: [] })),
  ]);

  const annualIncome =
    transactions.data
      ?.filter(
        (t) =>
          t.type === "income" &&
          new Date(t.paid_at) >= new Date(startDate) &&
          new Date(t.paid_at) <= new Date(endDate),
      )
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0;

  const annualExpenses =
    transactions.data
      ?.filter(
        (t) =>
          t.type === "expense" &&
          new Date(t.paid_at) >= new Date(startDate) &&
          new Date(t.paid_at) <= new Date(endDate),
      )
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0;

  const annualProfit = annualIncome - annualExpenses;

  // YEL calculation (entrepreneur pension insurance)
  // Base: 15.5% of annual profit (2025 rate)
  const yelBase = Math.max(8839.41, Math.min(annualProfit, 209945)); // 2025 limits
  const yelAnnual = yelBase * 0.155;
  const yelMonthly = yelAnnual / 12;

  // Prepayment tax estimate
  const taxableIncome = annualProfit - yelAnnual;
  const estimatedTax = calculateFinnishTax(taxableIncome);

  return {
    fiscalYear: year,
    period: { startDate, endDate },

    // Tilinpäätös (Financial statements)
    financialStatements: {
      incomeStatement: {
        revenue: annualIncome,
        expenses: annualExpenses,
        operatingProfit: annualProfit,
        netProfit: annualProfit - yelAnnual - estimatedTax,
      },

      balanceSheet: {
        // Note: Akaunting doesn't track balance sheet by default
        // This would require custom implementation
        assets: { total: 0 },
        liabilities: { total: 0 },
        equity: { total: annualProfit },
      },
    },

    // Monthly breakdown
    monthlyData: monthlyReports.map((r) => ({
      month: r.period.month,
      income: r.incomeStatement.revenue.total,
      expenses: r.incomeStatement.expenses.total,
      profit: r.incomeStatement.netProfit,
      vat: r.vat.summary.vatPayable,
    })),

    // VAT annual summary
    vatAnnual: {
      totalSales: monthlyReports.reduce(
        (sum, r) => sum + r.vat.summary.totalSalesNet,
        0,
      ),
      totalVATCollected: monthlyReports.reduce(
        (sum, r) => sum + r.vat.summary.totalSalesVAT,
        0,
      ),
      totalPurchases: monthlyReports.reduce(
        (sum, r) => sum + r.vat.summary.totalPurchaseNet,
        0,
      ),
      totalVATDeducted: monthlyReports.reduce(
        (sum, r) => sum + r.vat.summary.totalPurchaseVAT,
        0,
      ),
      netVAT: monthlyReports.reduce(
        (sum, r) => sum + r.vat.summary.vatPayable,
        0,
      ),
    },

    // YEL (Entrepreneur pension insurance)
    yel: {
      incomeBase: yelBase,
      rate: 15.5,
      annualPremium: yelAnnual,
      monthlyPremium: yelMonthly,
      provider: "To be selected (Ilmarinen, Elo, Varma, etc.)",
      deadline: `${year + 1}-05-02`, // YEL declaration deadline
    },

    // Prepayment tax (Ennakkoverot)
    prepaymentTax: {
      taxableIncome,
      estimatedTax,
      monthlyInstallment: estimatedTax / 12,
      adjustmentDeadline: `${year + 1}-01-09`, // January adjustment deadline
      finalDeadline: `${year + 1}-03-31`, // Pre-completed tax return
    },

    // Compliance
    compliance: {
      totalInvoices: invoices.data?.length || 0,
      totalBills: bills.data?.length || 0,
      missingReceipts: monthlyReports.reduce(
        (sum, r) => sum + r.compliance.missingReceipts,
        0,
      ),
      complianceScore:
        monthlyReports.reduce(
          (sum, r) => sum + r.compliance.complianceScore,
          0,
        ) / 12,
    },

    // Archive requirements (Finnish law: 6 years minimum)
    archiveRequirements: {
      retention: "6 years from end of fiscal year",
      deleteAfter: `${year + 6}-12-31`,
      mustInclude: [
        "All invoices (myyntilaskut)",
        "All bills (ostolaskut)",
        "All receipts (kuitit)",
        "Bank statements (tiliotteet)",
        "VAT returns (ALV-ilmoitukset)",
        "Salary records (palkkalaskelmat)",
        "Annual report (tilinpäätös)",
        "Audit trail (kirjanpitoaineisto)",
      ],
    },

    // Deliverables for tax authorities
    deliverables: [
      `Tilinpaatos_${year}.pdf`,
      `Tuloslaskelma_${year}.pdf`,
      `Tase_${year}.pdf`,
      `Liitetiedot_${year}.pdf`,
      `ALV_vuosi-ilmoitus_${year}.pdf`,
      `Palkkatodistukset_${year}.pdf`,
      `YEL_todistus_${year}.pdf`,
      `Kirjanpitoaineisto_${year}.zip`,
    ],

    // Deadlines
    deadlines: {
      annualReport: `${year + 1}-04-30`,
      taxReturn: `${year + 1}-05-02`,
      vatAnnualReturn: `${year + 1}-02-28`,
      yelDeclaration: `${year + 1}-05-02`,
    },
  };
}

/**
 * Calculate Finnish progressive income tax (simplified 2025)
 * Does not include municipal tax (varies 16.5-23.5%)
 *
 * @param {number} income - Annual taxable income in EUR
 * @returns {number} Estimated state income tax
 */
function calculateFinnishTax(income) {
  if (income <= 21300) return 0;
  if (income <= 31300) return (income - 21300) * 0.0625;
  if (income <= 54700) return 625 + (income - 31300) * 0.1725;
  if (income <= 94200) return 4660 + (income - 54700) * 0.2125;
  return 13055 + (income - 94200) * 0.3125;
}

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
