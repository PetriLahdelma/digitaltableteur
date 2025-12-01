# Akaunting MCP Integration Setup

## Overview

This guide explains how to integrate Akaunting with VS Code Model Context Protocol (MCP) tools for automated bookkeeping, invoice generation, and financial management.

## Architecture

```
┌─────────────────────┐
│   VS Code Editor    │
│                     │
│  ┌───────────────┐  │
│  │  MCP Tools    │  │
│  │               │  │
│  │ • List invoices│ │
│  │ • Create contact│
│  │ • Add expenses│  │
│  │ • Generate reports│
│  └───────┬───────┘  │
└──────────┼──────────┘
           │ HTTP REST API
           │ (Bearer Token Auth)
           ▼
┌─────────────────────┐
│  Akaunting API      │
│  localhost:8080     │
│                     │
│  /api/v1/invoices   │
│  /api/v1/contacts   │
│  /api/v1/transactions│
│  /api/v1/reports    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Docker Containers  │
│                     │
│  ┌───────────────┐  │
│  │ Akaunting App │  │
│  └───────┬───────┘  │
│          │          │
│  ┌───────▼───────┐  │
│  │   MariaDB     │  │
│  └───────────────┘  │
└─────────────────────┘
```

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ for MCP scripts
- Akaunting running locally or on a server

## Installation Steps

### 1. Install Akaunting with Docker

```bash
# From project root
cd akaunting
chmod +x setup.sh
./setup.sh
```

This will:

- Pull Akaunting Docker image
- Set up MariaDB database
- Generate secure APP_KEY
- Start services on http://localhost:8080

### 2. Complete Akaunting Initial Setup

1. Open http://localhost:8080
2. Complete installation wizard:
   - **Company Name**: Digitaltableteur
   - **Currency**: EUR
   - **Timezone**: Europe/Helsinki
   - **Admin Email**: Your email
   - **Admin Password**: Strong password

### 3. Enable API Access

1. Log in to Akaunting
2. Navigate to **Settings → Developer → API**
3. Click **Create Token**
4. Token name: `VS Code MCP`
5. **Enable these modules**:
   - ✅ invoices
   - ✅ contacts
   - ✅ items
   - ✅ transactions
   - ✅ reports
   - ✅ categories
   - ✅ expenses
   - ✅ accounts
6. Copy the generated API token

### 4. Configure Environment

Edit `akaunting/.env`:

```bash
# Required
AKAUNTING_API_KEY=your_token_from_step_3
AKAUNTING_API_BASE_URL=http://localhost:8080/api/v1

# For production (optional)
AKAUNTING_APP_URL=https://accounting.digitaltableteur.eu
```

### 5. Set Up MCP Integration

```bash
npm run akaunting:mcp:setup
```

This updates `mcp.json` with Akaunting configuration.

### 6. Test Connection

```bash
npm run akaunting:mcp:test
```

Expected output:

```
✅ Connection successful!
📊 Found 0 invoices
✅ Invoices        - 0 records
✅ Contacts        - 0 records
✅ Items           - 0 records
✅ Transactions    - 0 records
✅ Categories      - 5 records
```

## MCP Configuration Reference

After setup, `mcp.json` will contain:

```json
{
  "mcpServers": {
    "akaunting": {
      "type": "http",
      "baseUrl": "http://localhost:8080/api/v1",
      "auth": {
        "type": "bearer",
        "token": "your_api_token"
      },
      "description": "Akaunting Accounting Software API",
      "endpoints": {
        "invoices": "/invoices",
        "contacts": "/contacts",
        "items": "/items",
        "transactions": "/transactions",
        "reports": "/reports",
        "categories": "/categories",
        "expenses": "/expenses"
      }
    }
  }
}
```

## API Usage Examples

### List All Invoices

```bash
curl -X GET "http://localhost:8080/api/v1/invoices" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

### Create a Customer

```bash
curl -X POST "http://localhost:8080/api/v1/contacts" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "customer",
    "name": "Example Client Ltd",
    "email": "client@example.com",
    "tax_number": "FI12345678",
    "currency_code": "EUR",
    "enabled": true
  }'
```

### Create an Invoice

```bash
curl -X POST "http://localhost:8080/api/v1/invoices" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiced_at": "2025-12-01",
    "due_at": "2025-12-15",
    "amount": 1200.00,
    "currency_code": "EUR",
    "contact_id": 1,
    "items": [
      {
        "name": "Website Development",
        "quantity": 1,
        "price": 1000.00,
        "tax_id": 1
      }
    ]
  }'
```

### Add an Expense

```bash
curl -X POST "http://localhost:8080/api/v1/transactions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expense",
    "paid_at": "2025-12-01",
    "amount": 49.99,
    "currency_code": "EUR",
    "account_id": 1,
    "category_id": 1,
    "description": "Domain renewal",
    "payment_method": "credit_card"
  }'
```

### Generate Profit & Loss Report

```bash
curl -X GET "http://localhost:8080/api/v1/reports/profit-loss?year=2025" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

## MCP Automation Use Cases

### 1. Invoice Generation from Project Milestones

```typescript
// When project milestone completed
async function createInvoiceFromMilestone(milestone) {
  const invoice = await fetch(`${AKAUNTING_BASE_URL}/invoices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AKAUNTING_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contact_id: milestone.clientId,
      invoiced_at: new Date().toISOString().split("T")[0],
      due_at: addDays(new Date(), 14).toISOString().split("T")[0],
      items: [
        {
          name: milestone.description,
          quantity: 1,
          price: milestone.value,
          tax_id: 1, // 25.5% VAT
        },
      ],
    }),
  });
  return invoice.json();
}
```

### 2. Expense Categorization from Receipts

```typescript
// Auto-categorize uploaded receipt
async function categorizeExpense(receipt) {
  const category = detectCategory(receipt.description);

  await fetch(`${AKAUNTING_BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AKAUNTING_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "expense",
      paid_at: receipt.date,
      amount: receipt.amount,
      currency_code: "EUR",
      account_id: 1,
      category_id: category.id,
      description: receipt.description,
      attachment: receipt.imageUrl,
    }),
  });
}
```

### 3. Monthly Financial Report Generation

```typescript
// Generate monthly summary
async function generateMonthlySummary(year, month) {
  const [income, expenses, profitLoss] = await Promise.all([
    fetch(
      `${AKAUNTING_BASE_URL}/reports/income-summary?year=${year}&month=${month}`,
    ),
    fetch(
      `${AKAUNTING_BASE_URL}/reports/expense-summary?year=${year}&month=${month}`,
    ),
    fetch(
      `${AKAUNTING_BASE_URL}/reports/profit-loss?year=${year}&month=${month}`,
    ),
  ]);

  return {
    income: await income.json(),
    expenses: await expenses.json(),
    profitLoss: await profitLoss.json(),
  };
}
```

### 4. Client Onboarding Automation

```typescript
// Create client + default items
async function onboardClient(clientData) {
  // Create contact
  const contact = await fetch(`${AKAUNTING_BASE_URL}/contacts`, {
    method: "POST",
    body: JSON.stringify({
      type: "customer",
      name: clientData.name,
      email: clientData.email,
      tax_number: clientData.vatId,
      currency_code: "EUR",
    }),
  });

  // Create default service items for this client
  const services = ["Design Consultation", "Development", "Maintenance"];
  for (const service of services) {
    await fetch(`${AKAUNTING_BASE_URL}/items`, {
      method: "POST",
      body: JSON.stringify({
        name: service,
        sale_price: getDefaultPrice(service),
        tax_id: 1,
      }),
    });
  }

  return contact.json();
}
```

## Security Best Practices

### 1. API Key Management

- **Never commit** `.env` files (already in `.gitignore`)
- **Rotate keys** every 90 days
- **Use read-only keys** for reporting MCP tools
- **Use full-access keys** only for administrative tasks

### 2. Network Security

For production:

```nginx
# Restrict API access by IP
location /api/ {
    allow 123.45.67.89;  # Your office IP
    deny all;

    proxy_pass http://localhost:8080;
}
```

### 3. Rate Limiting

Add to `docker-compose.yml`:

```yaml
environment:
  - THROTTLE_REQUESTS=60 # per minute
  - THROTTLE_DURATION=1 # minute
```

### 4. HTTPS Only (Production)

```bash
# Use Caddy reverse proxy
caddy reverse-proxy \
  --from accounting.digitaltableteur.eu \
  --to localhost:8080
```

## Troubleshooting

### Connection Refused

```bash
# Check if containers are running
docker compose ps

# Start containers
cd akaunting && docker compose up -d

# View logs
docker compose logs -f
```

### 401 Unauthorized

1. Verify API key in `akaunting/.env`
2. Check key hasn't expired: Settings → Developer → API
3. Ensure required modules are enabled for the token

### 404 Endpoint Not Found

- Verify you're using `/api/v1/` prefix
- Check Akaunting version supports the endpoint
- Update Akaunting: `docker compose pull && docker compose up -d`

### Data Not Syncing

```bash
# Clear Akaunting cache
docker exec -it akaunting-app php artisan cache:clear
docker exec -it akaunting-app php artisan config:clear
```

## Production Deployment

### EU-Hosted VPS Setup

1. **Choose provider**: Hetzner (Germany), UpCloud (Finland), or Scaleway (France)

2. **Install Docker on VPS**:

```bash
ssh root@your-vps-ip
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

3. **Clone and deploy**:

```bash
git clone https://github.com/PetriLahdelma/digitaltableteur.git
cd digitaltableteur/akaunting
cp env.example .env
# Edit .env with production values
./setup.sh
```

4. **Set up SSL with Caddy**:

```bash
docker run -d \
  -p 80:80 -p 443:443 \
  -v caddy_data:/data \
  -v caddy_config:/config \
  caddy:alpine \
  caddy reverse-proxy \
    --from accounting.digitaltableteur.eu \
    --to localhost:8080
```

5. **Update DNS**:

```
A record: accounting.digitaltableteur.eu → VPS_IP
```

6. **Update MCP config**:

```json
{
  "baseUrl": "https://accounting.digitaltableteur.eu/api/v1"
}
```

## Backup & Disaster Recovery

### Automated Daily Backups

Add to crontab:

```bash
# Daily 3am backup
0 3 * * * /path/to/digitaltableteur/akaunting/backup.sh
```

`backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
docker exec akaunting-db mysqldump -u akaunting -pakaunting akaunting | gzip > /backups/akaunting-$DATE.sql.gz
find /backups -name "akaunting-*.sql.gz" -mtime +30 -delete
```

### Restore from Backup

```bash
gunzip < backup-20251201.sql.gz | \
  docker exec -i akaunting-db mysql -u akaunting -pakaunting akaunting
```

## Resources

- **Akaunting Docs**: https://akaunting.com/docs
- **API Reference**: https://akaunting.com/docs/api
- **Forum**: https://akaunting.com/forum
- **GitHub**: https://github.com/akaunting/akaunting

## Next Steps

1. ✅ Install Akaunting with Docker
2. ✅ Enable API access
3. ✅ Configure MCP integration
4. ✅ Test connection
5. 📝 Create your first invoice via MCP
6. 📝 Set up automated expense categorization
7. 📝 Schedule monthly report generation
8. 📝 Deploy to production VPS with SSL

For Linear issue tracking integration, see `docs/LINEAR_AUTOMATION.md`.
