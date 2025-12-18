# Akaunting Installation & MCP Integration

## Overview

This directory contains the Docker setup for Akaunting, a self-hosted accounting software with REST API support for VS Code MCP (Model Context Protocol) integration.

## Quick Start

### 1. Install Akaunting

```bash
cd akaunting
chmod +x setup.sh
./setup.sh
```

This will:

- Generate a secure `APP_KEY`
- Create a `.env` file from `env.example`
- Start Akaunting and MariaDB containers
- Expose Akaunting on `http://localhost:8080`

### 2. Complete Initial Setup

1. Open http://localhost:8080 in your browser
2. Complete the installation wizard:
   - Company details
   - Admin user credentials
   - Currency and locale settings (defaults to EUR, Europe/Helsinki)
3. Log in to your new Akaunting instance

### 3. Enable API Access

1. Navigate to **Settings → Developer → API**
2. Click **Create Token**
3. Give it a name (e.g., "VS Code MCP")
4. Enable required modules:
   - ✅ invoices

### 3. Configure API Access

**Important**: Self-hosted Akaunting uses **Basic Authentication** with your admin credentials. The API Key app is only available in Akaunting Cloud (paid).

After completing the setup wizard, add your admin credentials to `akaunting/.env`:

```bash
AKAUNTING_API_USERNAME=admin@digitaltableteur.com
AKAUNTING_API_PASSWORD=your_admin_password
AKAUNTING_COMPANY_ID=1
```

**Optional**: Create a dedicated API user in Akaunting (Settings → Users) with limited permissions for better security.

### 4. Configure MCP Integration

Run the MCP setup script:

```bash
npm run akaunting:mcp:setup
```

This will update your `mcp.json` with Akaunting API configuration.

## Architecture

```
[ VS Code MCPs ]
       ↓ (HTTP REST API)
[ Akaunting REST API ]
       ↓
[ Akaunting Docker Container ]
       ↓
[ MariaDB Container ]
```

## API Endpoints

Once configured, your MCP can interact with:

- `GET /api/v1/invoices` - List invoices
- `POST /api/v1/invoices` - Create invoice
- `GET /api/v1/contacts` - List customers/vendors
- `POST /api/v1/contacts` - Add customer/vendor
- `GET /api/v1/transactions` - List transactions
- `GET /api/v1/items` - List products/services
- `GET /api/v1/categories` - List categories
- `GET /api/v1/reports` - Generate reports

Full API documentation: https://akaunting.com/docs/api

## Docker Management

### View logs

```bash
cd akaunting
docker compose logs -f
```

### Stop containers

```bash
docker compose stop
```

### Restart containers

```bash
docker compose restart
```

### Remove containers (keeps data)

```bash
docker compose down
```

### Remove containers and data

```bash
docker compose down -v
```

## Backup

### Database backup

```bash
docker exec akaunting-db mysqldump -u akaunting -pakaunting akaunting > backup-$(date +%Y%m%d).sql
```

### Restore database

```bash
docker exec -i akaunting-db mysql -u akaunting -pakaunting akaunting < backup-YYYYMMDD.sql
```

### Volume backup

```bash
docker run --rm \
  -v akaunting_akaunting-app:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/akaunting-app-$(date +%Y%m%d).tar.gz -C /data .
```

## Security Best Practices

1. **Change default passwords** in `akaunting/.env`
2. **Use strong admin passwords** - API uses your admin credentials
3. **Keep `.env` private** - never commit to git (already in `.gitignore`)
4. **Create dedicated API user** with limited permissions for MCP access
5. **Update regularly**: `docker compose pull && docker compose up -d`
6. **Use HTTPS in production** with reverse proxy (Caddy/Nginx)

## Production Deployment

For EU-hosted production deployment:

1. Deploy to Hetzner/UpCloud/Scaleway VPS
2. Set up reverse proxy with SSL:

```nginx
# nginx example
server {
    listen 443 ssl http2;
    server_name accounting.digitaltableteur.eu;

    ssl_certificate /etc/letsencrypt/live/accounting.digitaltableteur.eu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/accounting.digitaltableteur.eu/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. Update `AKAUNTING_APP_URL` in `.env`
4. Update `baseUrl` in MCP config

## Troubleshooting

### Port 8080 already in use

Change the port mapping in `docker-compose.yml`:

```yaml
ports:
  - "8081:80" # Use 8081 instead
```

### Database connection failed

Check if MariaDB is healthy:

```bash
docker compose ps
docker compose logs db
```

### API returns 401 Unauthorized

1. Verify username/password in `.env` match your admin credentials
2. Test authentication with curl:
   ```bash
   curl -u "admin@digitaltableteur.com:password" \
     -H "X-Company: 1" \
     http://localhost:8080/api/companies
   ```
3. Ensure `X-Company: 1` header is included in requests

### Container won't start

View detailed logs:

```bash
docker compose logs -f app
```

## MCP Integration Examples

### List invoices

```typescript
const authToken = Buffer.from(
  `${AKAUNTING_API_USERNAME}:${AKAUNTING_API_PASSWORD}`,
).toString("base64");

const invoices = await fetch("http://localhost:8080/api/invoices", {
  headers: {
    Authorization: `Basic ${authToken}`,
    "X-Company": "1",
  },
});
```

### Create customer

```typescript
const authToken = Buffer.from(
  `${AKAUNTING_API_USERNAME}:${AKAUNTING_API_PASSWORD}`,
).toString("base64");

await fetch("http://localhost:8080/api/contacts", {
  method: "POST",
  headers: {
    Authorization: `Basic ${authToken}`,
    "X-Company": "1",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    type: "customer",
    name: "Example Corp",
    email: "hello@example.com",
    currency_code: "EUR",
  }),
});
```

## Resources

- Official Documentation: https://akaunting.com/docs
- API Reference: https://akaunting.com/docs/api
- Docker Hub: https://hub.docker.com/r/akaunting/akaunting
- GitHub: https://github.com/akaunting/akaunting

## Support

For Akaunting-specific issues: https://akaunting.com/support
For MCP integration issues: See `docs/AKAUNTING_MCP_SETUP.md`
