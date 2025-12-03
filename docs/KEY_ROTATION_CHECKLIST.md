# 🔐 SECURITY: API Key Rotation Required

**Date**: 3 December 2025  
**Priority**: CRITICAL  
**Status**: ⚠️ PENDING ACTION

---

## 🚨 Action Required

Following the comprehensive security audit, all API keys and secrets must be rotated to ensure no previous exposures exist.

### Keys to Rotate (Complete Checklist)

#### 1. OpenAI API Key

- [ ] Log into [OpenAI Platform](https://platform.openai.com/api-keys)
- [ ] Create new API key
- [ ] Update `OPENAI_API_KEY` in:
  - [ ] Local: `.env.local`
  - [ ] Production: Vercel environment variables
  - [ ] CI/CD: GitHub Actions secrets (if used)
- [ ] Enable 30-day data retention policy (GDPR compliance)
- [ ] Delete old API key
- [ ] Test chat functionality: `curl https://digitaltableteur.com/api/chat`

#### 2. MongoDB URI (Database Credentials)

- [ ] Log into MongoDB Atlas
- [ ] Create new database user with **least privileges**:
  - Database: `digitaltableteur` (or your MONGODB_DB value)
  - Permissions: `readWrite` on `digitaltableteur` database only
  - **NO** admin or cluster-level privileges
- [ ] Generate new connection string
- [ ] Verify TLS is enabled: `?tls=true` in connection string
- [ ] Update `MONGODB_URI` in:
  - [ ] Local: `.env.local`
  - [ ] Production: Vercel environment variables
  - [ ] CI/CD: GitHub Actions secrets
- [ ] Test database connection: `npm run gdpr:check-data`
- [ ] Delete old database user

**Example secure connection string**:

```
mongodb+srv://dt-app-user:NEW_PASSWORD@cluster.mongodb.net/digitaltableteur?retryWrites=true&w=majority&tls=true
```

#### 3. Linear API Key

- [ ] Log into [Linear Settings](https://linear.app/settings/api)
- [ ] Create new Personal API Key
- [ ] Update `LINEAR_API_KEY` in:
  - [ ] Local: `.env.local`
  - [ ] CI/CD: GitHub Actions secrets (if used)
- [ ] Test: `npx tsx scripts/linear/check-issue.ts <issue-id>`
- [ ] Revoke old API key

#### 4. Sanity CMS Token

- [ ] Log into [Sanity Manage](https://www.sanity.io/manage)
- [ ] Navigate to project settings → API → Tokens
- [ ] Create new token with **read-only** permissions (unless write needed)
- [ ] Update `SANITY_TOKEN` in:
  - [ ] Local: `.env.local`
  - [ ] Production: Vercel environment variables
- [ ] Test blog functionality
- [ ] Delete old token

#### 5. Figma Personal Access Token

- [ ] Log into Figma → Settings → Personal Access Tokens
- [ ] Generate new token
- [ ] Update `FIGMA_TOKEN` in:
  - [ ] Local: `.env.local`
- [ ] Test MCP connection: `npm run figma:mcp:test`
- [ ] Revoke old token

#### 6. GitHub Personal Access Token (MCP)

- [ ] Log into GitHub → Settings → Developer settings → Personal access tokens
- [ ] Generate new token (fine-grained recommended)
- [ ] Permissions needed:
  - Repository: Read access to code, issues, pull requests
  - Organization: Read access (if applicable)
- [ ] Update `GITHUB_MCP_PAT` in:
  - [ ] Local: `.env.local`
  - [ ] CI/CD: GitHub Actions secrets (if used)
- [ ] Test MCP connection: `npm run github:mcp:test`
- [ ] Delete old token

#### 7. Sentry Auth Token (Optional but Recommended)

- [ ] Log into Sentry → Settings → Auth Tokens
- [ ] Create new token with `project:releases` scope
- [ ] Update `SENTRY_AUTH_TOKEN` in:
  - [ ] CI/CD: GitHub Actions secrets
  - [ ] Vercel environment variables
- [ ] Delete old token

#### 8. CV Password (If Weak)

- [ ] Generate strong password (16+ characters, mixed case, numbers, symbols)
- [ ] Update `CV_PASSWORD` in:
  - [ ] Local: `.env.local`
  - [ ] Production: Vercel environment variables
- [ ] Test: Try downloading CV with new password

---

## 🔒 MongoDB User Creation (Detailed Steps)

### Current Issue

Most MongoDB connections use the **cluster admin** user, which has full database access. This violates the principle of least privilege.

### Solution: Create Limited Application User

1. **Log into MongoDB Atlas**
   - Go to Security → Database Access
   - Click "Add New Database User"

2. **User Configuration**
   - **Authentication Method**: Password
   - **Username**: `dt-app-user` (or similar)
   - **Password**: Generate strong password (20+ characters)
   - **Database User Privileges**: Custom role

3. **Set Specific Privileges**

   ```
   Database: digitaltableteur (or your MONGODB_DB value)
   Collection Privileges:
     - contacts: Read, Write
     - deletion_requests: Read, Write

   Built-in Role: readWrite@digitaltableteur
   ```

4. **IP Allowlist**
   - Add Vercel IP ranges (if static)
   - Or allow all (`0.0.0.0/0`) with strong password (acceptable for read/write only user)

5. **Generate Connection String**

   ```
   mongodb+srv://dt-app-user:<password>@<cluster>.mongodb.net/digitaltableteur?retryWrites=true&w=majority&tls=true
   ```

6. **Test Connection**

   ```bash
   # Local test
   echo "MONGODB_URI=<new-connection-string>" >> .env.local
   npm run gdpr:check-data
   ```

7. **Update Production**
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Update `MONGODB_URI` with new connection string
   - Redeploy: `vercel --prod`

8. **Delete Old Admin User** (after confirming new user works)

---

## ✅ Verification Steps

After rotating all keys:

### 1. Local Development

```bash
# Test all integrations
npm run dev

# Test chat (OpenAI)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'

# Test contact form (MongoDB)
npm run gdpr:check-data

# Test Linear
npx tsx scripts/linear/check-issue.ts DIG-16

# Test MCPs
npm run github:mcp:test
npm run figma:mcp:test
```

### 2. Production

```bash
# Deploy with new secrets
vercel --prod

# Test live endpoints
curl https://digitaltableteur.com/api/health
curl https://digitaltableteur.com/api/chat # (with auth if needed)
```

### 3. Security Scan

```bash
# Verify no secrets in build
grep -r "OPENAI_API_KEY\|MONGODB_URI" .next/static/ || echo "✅ No leaks"

# Run security audit
npm run security:audit

# Check CI/CD
gh workflow run security-scanning.yml
```

---

## 📅 Rotation Schedule (Ongoing)

Document key rotation schedule in `SECURITY.md`:

| Key Type     | Rotation Frequency | Last Rotated | Next Due   |
| ------------ | ------------------ | ------------ | ---------- |
| OpenAI API   | 6 months           | 2025-12-03   | 2026-06-03 |
| MongoDB URI  | 6 months           | 2025-12-03   | 2026-06-03 |
| Linear API   | 12 months          | 2025-12-03   | 2026-12-03 |
| Sanity Token | 12 months          | 2025-12-03   | 2026-12-03 |
| Figma Token  | 12 months          | 2025-12-03   | 2026-12-03 |
| GitHub PAT   | 12 months          | 2025-12-03   | 2026-12-03 |
| CV Password  | As needed          | -            | -          |

---

## 🚨 If Secrets Were Exposed

### Immediate Actions (Within 1 Hour)

1. **Revoke exposed keys immediately** (don't wait for rotation)
2. **Check service logs** for unauthorized usage
3. **Generate new keys** and deploy
4. **Monitor services** for 24 hours

### OpenAI Exposure

- Check [Usage Dashboard](https://platform.openai.com/usage) for unusual spikes
- Revoke key immediately
- Monitor billing for fraudulent charges

### MongoDB Exposure

- Check Atlas → Metrics → Connections for unusual activity
- Rotate credentials immediately
- Review audit logs (if enabled)
- Consider enabling IP allowlist

### Linear Exposure

- Check Linear → Settings → Audit Log
- Revoke token
- Review recent API activity

---

## 📝 Documentation Updates

After key rotation:

- [ ] Update this checklist with completion dates
- [ ] Update `docs/SECURITY.md` with rotation schedule
- [ ] Document any issues encountered
- [ ] Update team documentation (if applicable)

---

## ✅ Completion Checklist

Once all keys are rotated:

- [ ] All 8 keys rotated
- [ ] MongoDB user has least privileges
- [ ] All services tested and working
- [ ] Old keys revoked/deleted
- [ ] Security scan passed
- [ ] Documentation updated
- [ ] Rotation schedule added to `SECURITY.md`
- [ ] Team notified (if applicable)

**Date Completed**: ******\_******  
**Verified By**: ******\_******

---

## 🆘 Support

If you encounter issues during rotation:

- **MongoDB**: https://www.mongodb.com/docs/atlas/security-add-mongodb-users/
- **OpenAI**: https://platform.openai.com/docs/api-reference/authentication
- **Linear**: https://developers.linear.app/docs/graphql/working-with-the-graphql-api
- **Sanity**: https://www.sanity.io/docs/http-auth
- **GitHub**: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

For project-specific help: mail@digitaltableteur.com
