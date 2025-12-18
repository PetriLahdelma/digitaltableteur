# Emergency Secret Rotation Playbook

**Purpose**: One-command secret rotation procedure for security incidents  
**Use Case**: API key compromise, suspicious access, breach response  
**Last Updated**: December 3, 2025

---

## 🚨 When to Use This Playbook

Execute this procedure immediately if:

- API key exposed in public repository
- Suspicious authentication attempts detected
- Sentry alerts for unauthorized access
- Team member departure (revoke their keys)
- Security audit recommendation
- Precautionary rotation (every 90 days)

---

## 📋 Services Requiring Key Rotation

| Service             | Priority | Rotation Time | Downtime Risk          |
| ------------------- | -------- | ------------- | ---------------------- |
| OpenAI API          | CRITICAL | 2 minutes     | 100% (chat offline)    |
| MongoDB Atlas       | CRITICAL | 5 minutes     | 100% (DB offline)      |
| Vercel Deploy Token | HIGH     | 1 minute      | 0% (only affects CI)   |
| Sentry DSN/Auth     | HIGH     | 2 minutes     | 0% (monitoring only)   |
| Linear API Key      | MEDIUM   | 1 minute      | 0% (automation only)   |
| Sanity Token        | MEDIUM   | 2 minutes     | 50% (CMS write access) |
| Figma Token         | LOW      | 1 minute      | 0% (MCP tools only)    |
| GitHub MCP PAT      | LOW      | 1 minute      | 0% (MCP tools only)    |

**Total Estimated Time**: 15-20 minutes  
**Expected Downtime**: 2-5 minutes (chat + DB reconnection)

---

## 🔐 Pre-Rotation Checklist

Before rotating any keys:

```bash
# 1. Backup current environment variables
cd /Users/petrilahdelma/SAPDevelop/digitaltableteur
echo "Backing up environment variables..."
cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)

# 2. Export Vercel production variables
vercel env pull .env.production.backup --environment=production

# 3. Create encrypted backup vault
tar -czf secrets-backup-$(date +%Y%m%d).tar.gz \
  .env.local.backup.* \
  .env.production.backup
openssl enc -aes-256-cbc -salt \
  -in secrets-backup-$(date +%Y%m%d).tar.gz \
  -out secrets-backup-$(date +%Y%m%d).tar.gz.enc \
  -k "YOUR_PASSPHRASE_HERE"
rm secrets-backup-$(date +%Y%m%d).tar.gz

# 4. Verify backup
ls -lh secrets-backup-*.tar.gz.enc
```

---

## 1️⃣ OpenAI API Key Rotation

**Impact**: Chat endpoint will be offline until redeployed  
**Service**: https://platform.openai.com/api-keys

### Steps

```bash
# 1. Generate new key
# Manual: Visit https://platform.openai.com/api-keys
# Click "Create new secret key"
# Name: "digitaltableteur-prod-YYYYMMDD"
# Copy key immediately (only shown once)

# 2. Update local environment
export NEW_OPENAI_KEY="sk-proj-..."
echo "OPENAI_API_KEY=$NEW_OPENAI_KEY" >> .env.local

# 3. Update Vercel production
vercel env add OPENAI_API_KEY production
# Paste new key when prompted

# 4. Verify in Vercel dashboard
vercel env ls

# 5. Redeploy
vercel --prod

# 6. Test chat endpoint
curl -X POST https://digitaltableteur.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "test"}]}'

# 7. Delete old key from OpenAI dashboard (after confirming new key works)
```

**Data Retention**: Enable 30-day retention in OpenAI settings to comply with audit logs.

---

## 2️⃣ MongoDB URI Rotation (Least Privilege User)

**Impact**: All API endpoints offline until connection pool refreshed  
**Service**: https://cloud.mongodb.com

### Create New Least-Privilege User

```bash
# 1. Log into MongoDB Atlas → Database Access
# 2. Click "Add New Database User"

# Configuration:
# - Username: digitaltableteur_app_YYYYMMDD
# - Password: Generate strong 24-char password
# - Database User Privileges:
#   ✅ Built-in Role: readWrite on database "digitaltableteur"
#   ❌ Remove: Atlas admin, clusterMonitor, dbAdmin
# - Restrict Access to Specific Clusters: Production cluster only

# 3. Get new connection string
# Click "Connect" → "Connect your application"
# Copy connection string, replace <password>

NEW_MONGO_URI="mongodb+srv://digitaltableteur_app_YYYYMMDD:<password>@cluster0.xxxxx.mongodb.net/digitaltableteur?retryWrites=true&w=majority"

# 4. Update local
echo "MONGODB_URI=$NEW_MONGO_URI" >> .env.local

# 5. Update Vercel
vercel env add MONGODB_URI production
# Paste new URI when prompted

# 6. Redeploy
vercel --prod

# 7. Test connection
curl https://digitaltableteur.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "message": "Connection test"
  }'

# 8. Delete old user from MongoDB Atlas after 24-hour grace period
```

**Security Note**: Never use `admin` database privileges. Scope to `digitaltableteur` DB only.

---

## 3️⃣ Linear API Key Rotation

**Impact**: None (automation/MCP only)  
**Service**: https://linear.app/settings/api

### Steps

```bash
# 1. Generate new Personal API Key
# Visit: https://linear.app/settings/api
# Click "Create new key"
# Name: "digitaltableteur-automation-YYYYMMDD"
# Scopes: Read + Write (or minimal required)

# 2. Copy key (starts with lin_api_...)
export NEW_LINEAR_KEY="lin_api_..."

# 3. Update local
echo "LINEAR_API_KEY=$NEW_LINEAR_KEY" >> .env.local

# 4. Update Vercel (if used in serverless functions)
vercel env add LINEAR_API_KEY production

# 5. Test
npx tsx scripts/linear/check-issue.ts DIG-16

# 6. Revoke old key from Linear dashboard
```

---

## 4️⃣ Sanity Token Rotation

**Impact**: CMS write operations fail until updated  
**Service**: https://www.sanity.io/manage

### Steps

```bash
# 1. Navigate to: https://www.sanity.io/manage
# Select project → API → Tokens
# Click "Add new token"

# Configuration:
# - Name: digitaltableteur-app-YYYYMMDD
# - Permissions: Editor (or Read-only if only consuming content)

# 2. Copy token
export NEW_SANITY_TOKEN="sk..."

# 3. Update local
echo "SANITY_API_TOKEN=$NEW_SANITY_TOKEN" >> .env.local
echo "SANITY_TOKEN=$NEW_SANITY_TOKEN" >> .env.local

# 4. Update Vercel
vercel env add SANITY_API_TOKEN production
vercel env add SANITY_TOKEN production

# 5. Redeploy if Sanity used in API routes
vercel --prod

# 6. Test (if applicable)
curl https://digitaltableteur.com/api/blog/posts

# 7. Delete old token from Sanity dashboard
```

---

## 5️⃣ Figma Token Rotation

**Impact**: None (MCP server only)  
**Service**: https://www.figma.com/developers/api#access-tokens

### Steps

```bash
# 1. Generate new Personal Access Token
# Visit: https://www.figma.com/developers/api#access-tokens
# Settings → Account → Personal Access Tokens
# Click "Generate new token"
# Name: digitaltableteur-mcp-YYYYMMDD

# 2. Copy token
export NEW_FIGMA_TOKEN="figd_..."

# 3. Update local
echo "FIGMA_TOKEN=$NEW_FIGMA_TOKEN" >> .env.local

# 4. Test MCP connection
npm run figma:mcp:test

# 5. Revoke old token from Figma settings
```

---

## 6️⃣ GitHub MCP PAT Rotation

**Impact**: None (MCP server only)  
**Service**: https://github.com/settings/tokens

### Steps

```bash
# 1. Generate fine-grained Personal Access Token
# Visit: https://github.com/settings/tokens?type=beta
# Click "Generate new token"

# Configuration:
# - Name: digitaltableteur-mcp-YYYYMMDD
# - Expiration: 90 days
# - Repository access: Only select repositories (digitaltableteur)
# - Permissions:
#   ✅ Contents: Read-only
#   ✅ Metadata: Read-only
#   ✅ Pull requests: Read-only
#   ❌ Remove: All write/admin permissions

# 2. Copy token
export NEW_GITHUB_PAT="github_pat_..."

# 3. Update local
echo "GITHUB_MCP_PAT=$NEW_GITHUB_PAT" >> .env.local

# 4. Test MCP connection
npm run github:mcp:test

# 5. Revoke old token from GitHub settings
```

---

## 7️⃣ Sentry Auth Token Rotation

**Impact**: None (CI deployments only)  
**Service**: https://sentry.io/settings/account/api/auth-tokens/

### Steps

```bash
# 1. Create new auth token
# Visit: https://sentry.io/settings/account/api/auth-tokens/
# Click "Create New Token"

# Configuration:
# - Name: digitaltableteur-deploy-YYYYMMDD
# - Scopes:
#   ✅ project:releases
#   ✅ org:read
#   ❌ Remove: admin/delete scopes

# 2. Copy token
export NEW_SENTRY_TOKEN="sntrys_..."

# 3. Update local
echo "SENTRY_AUTH_TOKEN=$NEW_SENTRY_TOKEN" >> .env.local

# 4. Update Vercel (for build-time sourcemap upload)
vercel env add SENTRY_AUTH_TOKEN production

# 5. Test next deployment
npm run build

# 6. Revoke old token from Sentry dashboard
```

---

## 8️⃣ CV Password Rotation (if applicable)

**Impact**: Old CV download links invalid immediately  
**Service**: Self-managed secret

### Steps

```bash
# 1. Generate strong password
export NEW_CV_PASSWORD=$(openssl rand -base64 24)
echo "Generated password: $NEW_CV_PASSWORD"

# 2. Update local
echo "CV_PASSWORD=$NEW_CV_PASSWORD" >> .env.local

# 3. Update Vercel
vercel env add CV_PASSWORD production

# 4. Redeploy
vercel --prod

# 5. Test endpoint
curl -X POST https://digitaltableteur.com/api/download-cv \
  -H "Content-Type: application/json" \
  -d "{\"password\": \"$NEW_CV_PASSWORD\"}"

# 6. Update password in external documentation (if applicable)
```

---

## 🧪 Post-Rotation Verification

After rotating all keys, run comprehensive tests:

```bash
# 1. Health check all endpoints
curl https://digitaltableteur.com/api/chat/health || echo "Chat: FAILED"
curl https://digitaltableteur.com/api/contact || echo "Contact: FAILED"
curl https://digitaltableteur.com/api/gdpr/delete-data || echo "GDPR: FAILED"

# 2. Verify Sentry connectivity
npm run build  # Should upload sourcemaps

# 3. Check MCP servers
npm run github:mcp:test
npm run figma:mcp:test

# 4. Verify Linear automation
npx tsx scripts/linear/check-issue.ts DIG-1

# 5. Monitor Sentry for errors (15 minutes)
open https://sentry.io/organizations/digitaltableteur/issues/

# 6. Check Vercel deployment logs
vercel logs https://digitaltableteur.com --prod
```

---

## 📊 Rotation Schedule

### Automated Reminders

Add to calendar:

```
Recurring Event: "Security Key Rotation"
Frequency: Every 90 days
Next Date: March 3, 2026
Alert: 1 week before
```

### Rotation Log

| Date       | Keys Rotated            | Reason         | Incident? | Downtime |
| ---------- | ----------------------- | -------------- | --------- | -------- |
| 2025-12-03 | All (initial hardening) | Security audit | No        | 0 min    |
| YYYY-MM-DD |                         |                |           |          |

---

## 🆘 Emergency Contacts

| Role              | Contact                              | Availability   |
| ----------------- | ------------------------------------ | -------------- |
| Owner             | mail@digitaltableteur.com            | 24/7           |
| Security Incident | [SECURITY] mail@digitaltableteur.com | 24/7           |
| Vercel Support    | https://vercel.com/support           | Business hours |
| MongoDB Support   | https://cloud.mongodb.com/support    | 24/7           |

---

## 🔒 Security Best Practices

1. **Never commit secrets to git** (even private repos)
2. **Use `.env.local` for local development** (in `.gitignore`)
3. **Rotate keys every 90 days minimum**
4. **Use least-privilege principle** (MongoDB user example)
5. **Enable 2FA on all services** (especially GitHub, Vercel, MongoDB)
6. **Monitor Sentry for suspicious activity** (set up alerts)
7. **Backup encrypted vault weekly** (OpenSSL AES-256)
8. **Test rotation in staging first** (if high-traffic prod)

---

## 📚 Related Documentation

- Security Audit: `docs/SECURITY_AUDIT_COVERAGE_REPORT.md`
- Hardening Implementation: `docs/SECURITY_HARDENING_IMPLEMENTATION.md`
- Key Rotation Checklist: `docs/KEY_ROTATION_CHECKLIST.md`

---

**Last Updated**: December 3, 2025  
**Next Rotation Due**: March 3, 2026  
**Responsible**: Petri Lahdelma
