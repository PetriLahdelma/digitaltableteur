#!/usr/bin/env node

/**
 * Finnish Business Setup for Akaunting
 *
 * Configures Akaunting with Finnish tax settings, categories, and business details
 * Based on your tax cards (Verokortti) and VAT number
 *
 * Usage: node scripts/akaunting-finnish-setup.mjs
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
      "Akaunting .env file not found. Run: npm run akaunting:install",
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
    "AKAUNTING_API_USERNAME and AKAUNTING_API_PASSWORD must be set",
  );
}

const authToken = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString(
  "base64",
);

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
    throw new Error(`API Error (${response.status}): ${error.message}`);
  }

  return response.json();
}

// Finnish business configuration
const FINNISH_CONFIG = {
  business: {
    name: "Digitaltableteur",
    vatNumber: "FI22644552", // Your VAT number
    currency: "EUR",
    timezone: "Europe/Helsinki",
    address: "Hämeentie 8 C",
    city: "Helsinki",
    zipCode: "00530",
    country: "FI",
    locale: "fi-FI",
  },

  // Finnish VAT rates (2025)
  taxRates: [
    { name: "ALV 25.5%", rate: 25.5, enabled: true, type: "normal" },
    { name: "ALV 14%", rate: 14, enabled: true, type: "reduced" },
    { name: "ALV 10%", rate: 10, enabled: true, type: "reduced" },
    { name: "ALV 0%", rate: 0, enabled: true, type: "zero" },
  ],

  // Finnish expense categories (matching tax deduction categories)
  categories: {
    income: [
      { name: "Konsultointi", type: "income", color: "#4CAF50" },
      { name: "Ohjelmistokehitys", type: "income", color: "#2196F3" },
      { name: "Suunnittelu", type: "income", color: "#9C27B0" },
      { name: "Koulutus", type: "income", color: "#FF9800" },
    ],
    expense: [
      // Office & Equipment
      { name: "Toimistotarvikkeet", type: "expense", color: "#607D8B" },
      { name: "Tietokoneet ja laitteet", type: "expense", color: "#3F51B5" },
      { name: "Ohjelmistot ja lisenssit", type: "expense", color: "#00BCD4" },

      // Services
      { name: "Tilitoimisto", type: "expense", color: "#009688" },
      { name: "Kirjanpito", type: "expense", color: "#4CAF50" },
      { name: "Markkinointi", type: "expense", color: "#8BC34A" },
      { name: "Verkkopalvelut", type: "expense", color: "#CDDC39" },

      // Travel & Transportation
      { name: "Matkakulut", type: "expense", color: "#FFC107" },
      { name: "Kilometrikorvaus", type: "expense", color: "#FF9800" },
      { name: "Majoitus", type: "expense", color: "#FF5722" },

      // Professional Development
      { name: "Koulutus", type: "expense", color: "#F44336" },
      { name: "Kirjat ja materiaalit", type: "expense", color: "#E91E63" },

      // Business Operations
      { name: "Puhelin ja internet", type: "expense", color: "#9C27B0" },
      { name: "Vakuutukset", type: "expense", color: "#673AB7" },
      { name: "Pankkikulut", type: "expense", color: "#3F51B5" },

      // Mandatory
      { name: "YEL-vakuutus", type: "expense", color: "#2196F3" },
      { name: "Verot", type: "expense", color: "#03A9F4" },
    ],
  },

  // Default accounts (Finnish chart of accounts - simplified)
  accounts: [
    { name: "Toimintakate", code: "3000", type: "income" },
    { name: "Liiketoiminnan kulut", code: "4000", type: "expense" },
    { name: "Henkilöstökulut", code: "5000", type: "expense" },
    { name: "Poistot", code: "6000", type: "expense" },
  ],
};

async function setupFinnishBusiness() {
  console.log("🇫🇮 Setting up Finnish business configuration for Akaunting\n");

  try {
    // Step 1: Update company details
    console.log("📋 Updating company information...");
    const company = await request(`/companies/${COMPANY_ID}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: FINNISH_CONFIG.business.name,
        email: "mail@digitaltableteur.com",
        tax_number: FINNISH_CONFIG.business.vatNumber,
        currency_code: FINNISH_CONFIG.business.currency,
        address: FINNISH_CONFIG.business.address,
        city: FINNISH_CONFIG.business.city,
        zip_code: FINNISH_CONFIG.business.zipCode,
        country: FINNISH_CONFIG.business.country,
        locale: FINNISH_CONFIG.business.locale,
      }),
    }).catch((err) => {
      console.log(`⚠️  Company update: ${err.message}`);
      return null;
    });

    if (company) {
      console.log(`✅ Company updated: ${FINNISH_CONFIG.business.name}`);
      console.log(`   VAT Number: ${FINNISH_CONFIG.business.vatNumber}`);
    }

    // Step 2: Create Finnish VAT rates
    console.log("\n💰 Setting up Finnish VAT rates (2025)...");
    for (const taxRate of FINNISH_CONFIG.taxRates) {
      try {
        const tax = await request("/taxes", {
          method: "POST",
          body: JSON.stringify({
            name: taxRate.name,
            rate: taxRate.rate,
            type: "normal",
            enabled: 1,
          }),
        });
        console.log(`✅ Created: ${taxRate.name} (${taxRate.rate}%)`);
      } catch (err) {
        if (
          err.message.includes("already exists") ||
          err.message.includes("duplicate")
        ) {
          console.log(`⏭️  Exists: ${taxRate.name}`);
        } else {
          console.log(`⚠️  ${taxRate.name}: ${err.message}`);
        }
      }
    }

    // Step 3: Create expense categories
    console.log("\n📁 Creating expense categories...");

    // Income categories
    console.log("\n💼 Income categories:");
    for (const category of FINNISH_CONFIG.categories.income) {
      try {
        const cat = await request("/categories", {
          method: "POST",
          body: JSON.stringify({
            name: category.name,
            type: "income",
            color: category.color,
            enabled: 1,
          }),
        });
        console.log(`✅ ${category.name}`);
      } catch (err) {
        if (
          err.message.includes("already exists") ||
          err.message.includes("duplicate")
        ) {
          console.log(`⏭️  ${category.name} (exists)`);
        } else {
          console.log(`⚠️  ${category.name}: ${err.message}`);
        }
      }
    }

    // Expense categories
    console.log("\n💸 Expense categories:");
    for (const category of FINNISH_CONFIG.categories.expense) {
      try {
        const cat = await request("/categories", {
          method: "POST",
          body: JSON.stringify({
            name: category.name,
            type: "expense",
            color: category.color,
            enabled: 1,
          }),
        });
        console.log(`✅ ${category.name}`);
      } catch (err) {
        if (
          err.message.includes("already exists") ||
          err.message.includes("duplicate")
        ) {
          console.log(`⏭️  ${category.name} (exists)`);
        } else {
          console.log(`⚠️  ${category.name}: ${err.message}`);
        }
      }
    }

    // Step 4: Create a sample contact (yourself)
    console.log("\n👤 Creating business owner contact...");
    try {
      const contact = await request("/contacts", {
        method: "POST",
        body: JSON.stringify({
          type: "customer",
          name: "Petri Lahdelma",
          email: "petri.lahdelma@gmail.com",
          tax_number: FINNISH_CONFIG.business.vatNumber,
          currency_code: "EUR",
          enabled: 1,
          address: FINNISH_CONFIG.business.address,
          city: FINNISH_CONFIG.business.city,
          zip_code: FINNISH_CONFIG.business.zipCode,
          country: FINNISH_CONFIG.business.country,
        }),
      });
      console.log("✅ Business owner contact created");
    } catch (err) {
      if (
        err.message.includes("already exists") ||
        err.message.includes("duplicate")
      ) {
        console.log("⏭️  Contact already exists");
      } else {
        console.log(`⚠️  Contact: ${err.message}`);
      }
    }

    // Summary
    console.log("\n✅ Finnish business setup complete!\n");
    console.log("📊 Configuration Summary:");
    console.log(`   Business Name: ${FINNISH_CONFIG.business.name}`);
    console.log(`   VAT Number: ${FINNISH_CONFIG.business.vatNumber}`);
    console.log(`   Currency: ${FINNISH_CONFIG.business.currency}`);
    console.log(`   Timezone: ${FINNISH_CONFIG.business.timezone}`);
    console.log(`   VAT Rates: ${FINNISH_CONFIG.taxRates.length} configured`);
    console.log(
      `   Income Categories: ${FINNISH_CONFIG.categories.income.length}`,
    );
    console.log(
      `   Expense Categories: ${FINNISH_CONFIG.categories.expense.length}`,
    );

    console.log("\n📝 Next Steps:");
    console.log("   1. Visit http://localhost:8080 to verify settings");
    console.log("   2. Start adding invoices and expenses");
    console.log("   3. Run monthly VAT reports with: generateVATSummary()");
    console.log("   4. When starting business, update YEL settings");
    console.log("\n💡 Tax Card Info:");
    console.log(
      "   Your tax cards (Verokortti) are stored in akaunting/ directory",
    );
    console.log("   - Verokortti (pdf)_04.11.2025.pdf (2025 data)");
    console.log("   - Verokortti (pdf)_29.11.2025.pdf (2026 data)");
  } catch (error) {
    console.error("\n❌ Setup failed:", error.message);
    process.exit(1);
  }
}

// Run setup
setupFinnishBusiness();
