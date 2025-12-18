# Akaunting Installation Complete ✅

## What Was Installed

A complete **Akaunting accounting system** with Docker + MCP integration has been set up in your project.

### Files Created

```
akaunting/
├── docker-compose.yml              # Docker services (Akaunting + MariaDB)
├── env.example                     # Environment template
├── setup.sh (executable)           # Automated setup script
├── README.md                       # Full documentation
├── QUICKSTART.md                   # 5-minute guide
├── AGENTS.md                       # AI assistant reference
└── .gitignore                      # Security (excludes .env)

scripts/
├── akaunting-mcp-setup.mjs        # MCP configuration script
└── test-akaunting-mcp.mjs         # Connection testing script

docs/
└── AKAUNTING_MCP_SETUP.md         # Comprehensive setup guide

Root:
├── package.json                    # Added npm scripts
└── .gitignore                      # Added akaunting excludes
```

### NPM Scripts Added

```json
{
  "akaunting:install": "cd akaunting && ./setup.sh",
  "akaunting:start": "cd akaunting && docker compose up -d",
  "akaunting:stop": "cd akaunting && docker compose stop",
  "akaunting:restart": "cd akaunting && docker compose restart",
  "akaunting:logs": "cd akaunting && docker compose logs -f",
  "akaunting:mcp:setup": "node scripts/akaunting-mcp-setup.mjs",
  "akaunting:mcp:test": "node scripts/test-akaunting-mcp.mjs"
}
```

## Next Steps (5 minutes)

### 1. Install Akaunting

```bash
npm run akaunting:install
```

This will:

- Generate secure `APP_KEY`
- Create `.env` file
- Start Docker containers
- Expose Akaunting on http://localhost:8080

### 2. Complete Setup Wizard

Open http://localhost:8080 and fill in:

- Company: **Digitaltableteur**
- Email: **mail@digitaltableteur.com**
- Currency: **EUR**
- Timezone: **Europe/Helsinki**
- Admin password: (create strong password)

### 3. Enable API Access

1. Log in to Akaunting
2. Go to **Settings → Developer → API**
3. Click **Create Token** (name it "VS Code MCP")
4. Enable these modules:
   - ✅ invoices
   - ✅ contacts
   - ✅ items
   - ✅ transactions
   - ✅ reports
   - ✅ categories
   - ✅ expenses
5. **Copy the API token**

### 4. Configure MCP

Add your API key to `akaunting/.env`:

```bash
AKAUNTING_API_KEY=your_api_token_here
```

Then run:

```bash
npm run akaunting:mcp:setup
```

### 5. Test Connection

```bash
npm run akaunting:mcp:test
```

Expected output:

```
✅ Connection successful!
✅ Invoices        - 0 records
✅ Contacts        - 0 records
✅ Items           - 0 records
```

## What You Can Do Now

Once configured, your VS Code MCP can:

### 📝 Automated Invoicing

- Generate invoices from project milestones
- Auto-fill client details
- Calculate VAT automatically
- Send PDF invoices via email

### 💰 Expense Tracking

- Categorize expenses from receipts
- Track billable vs non-billable costs
- Monitor project budgets
- Tag expenses by client/project

### 📊 Financial Reports

- Monthly profit & loss statements
- Income vs expense comparisons
- Client revenue breakdown
- Tax reports (VAT, income tax)

### 🤖 MCP Automation Examples

**Create invoice programmatically:**

```typescript
await fetch("http://localhost:8080/api/v1/invoices", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    contact_id: 1,
    invoiced_at: "2025-12-01",
    due_at: "2025-12-15",
    items: [
      {
        name: "Website Design",
        quantity: 1,
        price: 1500.0,
        tax_id: 1,
      },
    ],
  }),
});
```

**Add expense:**

```typescript
await fetch("http://localhost:8080/api/v1/transactions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    type: "expense",
    paid_at: "2025-12-01",
    amount: 49.99,
    category_id: 1,
    description: "Domain renewal",
  }),
});
```

## Architecture

```
┌─────────────────────┐
│   VS Code Editor    │
│                     │
│  ┌───────────────┐  │
│  │  MCP Tools    │  │  ← Automate bookkeeping
│  └───────┬───────┘  │
└──────────┼──────────┘
           │ HTTP REST API
           │ (Bearer Token)
           ▼
┌─────────────────────┐
│  Akaunting API      │  ← Self-hosted in EU
│  localhost:8080     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Docker Containers  │
│  ┌───────────────┐  │
│  │ Akaunting App │  │
│  └───────┬───────┘  │
│  ┌───────▼───────┐  │
│  │   MariaDB     │  │
│  └───────────────┘  │
└─────────────────────┘
```

## Security Notes

✅ **Safe:**

- `.env` files excluded from git
- API uses Bearer token authentication
- Database not exposed externally
- Docker isolated network

⚠️ **Important:**

- Never commit API keys
- Rotate tokens every 90 days
- Use HTTPS in production
- Backup database regularly

## Documentation

- **Quick start**: `akaunting/QUICKSTART.md` (5-min guide)
- **Full setup**: `akaunting/README.md` (Docker details)
- **MCP integration**: `docs/AKAUNTING_MCP_SETUP.md` (comprehensive)
- **AI reference**: `akaunting/AGENTS.md` (for LLMs)
- **Official docs**: https://akaunting.com/docs

## Troubleshooting

### Port 8080 already in use

Edit `akaunting/docker-compose.yml`:

```yaml
ports:
  - "8081:80" # Changed from 8080
```

Update `akaunting/.env`:

```bash
AKAUNTING_API_BASE_URL=http://localhost:8081/api/v1
```

### Docker not installed

Install Docker Desktop: https://docs.docker.com/get-docker/

### Connection refused

```bash
npm run akaunting:start
```

### 401 Unauthorized

1. Regenerate API key in Akaunting dashboard
2. Update `akaunting/.env`
3. Run `npm run akaunting:mcp:setup` again

## Production Deployment (Optional)

For EU-hosted production:

1. Deploy to **Hetzner** (Germany) or **UpCloud** (Finland)
2. Set up reverse proxy with SSL:
   ```
   https://accounting.digitaltableteur.eu → localhost:8080
   ```
3. Update environment:
   ```bash
   AKAUNTING_APP_URL=https://accounting.digitaltableteur.eu
   ```
4. Configure firewall to restrict API access by IP
5. Set up automated daily backups

See `docs/AKAUNTING_MCP_SETUP.md` for full production guide.

## Support

- **Project issues**: GitHub Issues
- **Akaunting docs**: https://akaunting.com/docs
- **API reference**: https://akaunting.com/docs/api
- **Community**: https://akaunting.com/forum

---

## Ready to Start?

Run this command to begin:

```bash
npm run akaunting:install
```

Then follow the 5 steps above. The entire setup takes less than 5 minutes! 🚀
