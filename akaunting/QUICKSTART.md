# Akaunting Quick Start Guide

## Installation (5 minutes)

### 1. Install Akaunting

```bash
npm run akaunting:install
```

This automatically:

- ✅ Generates secure APP_KEY
- ✅ Creates `.env` configuration
- ✅ Starts Docker containers
- ✅ Exposes API on http://localhost:8080

### 2. Complete Setup Wizard

Open http://localhost:8080 and fill in:

- **Company**: Digitaltableteur
- **Email**: mail@digitaltableteur.com
- **Currency**: EUR
- **Timezone**: Europe/Helsinki
- **Admin Password**: (create strong password)

### 3. Generate API Key

1. Log in to Akaunting
2. Go to: **Settings → Developer → API**
3. Click **Create Token**
4. Name: `VS Code MCP`
5. Enable modules:
   - ✅ invoices
   - ✅ contacts
   - ✅ items
   - ✅ transactions
   - ✅ reports
   - ✅ categories
   - ✅ expenses
6. **Copy the token**

### 4. Configure MCP

Edit `akaunting/.env`:

```bash
AKAUNTING_API_KEY=paste_your_token_here
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

## Daily Usage

### Start Akaunting

```bash
npm run akaunting:start
```

### Stop Akaunting

```bash
npm run akaunting:stop
```

### View Logs

```bash
npm run akaunting:logs
```

### Restart After Changes

```bash
npm run akaunting:restart
```

## Your First Invoice

### Via Web UI

1. Open http://localhost:8080
2. Go to **Sales → Invoices → New Invoice**
3. Fill in details and save

### Via MCP/API

```bash
curl -X POST "http://localhost:8080/api/v1/invoices" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiced_at": "2025-12-01",
    "due_at": "2025-12-15",
    "contact_id": 1,
    "currency_code": "EUR",
    "items": [{
      "name": "Website Design",
      "quantity": 1,
      "price": 1500.00,
      "tax_id": 1
    }]
  }'
```

## Common Commands

### Docker Management

```bash
# Check status
cd akaunting && docker compose ps

# Update to latest version
cd akaunting && docker compose pull && docker compose up -d

# Remove all data (careful!)
cd akaunting && docker compose down -v
```

### Database Backup

```bash
# Create backup
docker exec akaunting-db mysqldump -u akaunting -pakaunting akaunting > backup-$(date +%Y%m%d).sql

# Restore backup
docker exec -i akaunting-db mysql -u akaunting -pakaunting akaunting < backup-20251201.sql
```

## Troubleshooting

### Port 8080 already in use

Edit `akaunting/docker-compose.yml`:

```yaml
ports:
  - "8081:80" # Changed from 8080
```

Then update `akaunting/.env`:

```bash
AKAUNTING_API_BASE_URL=http://localhost:8081/api/v1
```

### Can't connect to API

1. Check containers are running: `npm run akaunting:start`
2. Verify API key in `akaunting/.env`
3. Test connection: `npm run akaunting:mcp:test`

### 401 Unauthorized

1. Regenerate API key in Akaunting UI
2. Update `akaunting/.env` with new key
3. Run `npm run akaunting:mcp:setup` again

## What's Next?

- 📖 Read full docs: `docs/AKAUNTING_MCP_SETUP.md`
- 📖 Akaunting docs: `akaunting/README.md`
- 🔗 Official API: https://akaunting.com/docs/api
- 🚀 Deploy to production VPS (see docs)

## Support

- Project issues: GitHub Issues
- Akaunting docs: https://akaunting.com/docs
- API reference: https://akaunting.com/docs/api
- Community forum: https://akaunting.com/forum
