# Security Implementation Guide

This document describes all security measures, automated testing, and GDPR compliance features implemented in the Digitaltableteur project.

## 📋 Table of Contents

1. [Automated Security Testing](#automated-security-testing)
2. [Dependency Scanning](#dependency-scanning)
3. [Access Logging & Monitoring](#access-logging--monitoring)
4. [GDPR Compliance](#gdpr-compliance)
5. [Data Retention](#data-retention)
6. [Sentry Alerting](#sentry-alerting)
7. [Security Best Practices](#security-best-practices)

---

## 🔒 Automated Security Testing

### GitHub Actions Workflows

#### Security Scanning Workflow

**File**: `.github/workflows/security-scanning.yml`

Runs automatically on:

- Every push to main, develop, or feature branches
- Every pull request
- Weekly schedule (Mondays at 3 AM UTC)
- Manual trigger via GitHub UI

**What it checks**:

1. **NPM Audit** - Scans for vulnerable dependencies
   - Fails if critical vulnerabilities found
   - Warns if >5 high-severity vulnerabilities
2. **CodeQL Analysis** - Static code analysis for security issues
   - JavaScript and TypeScript scanning
   - Security and quality queries
3. **Secret Scanning** - Detects exposed credentials
   - Uses TruffleHog for verified secrets
4. **Security Headers** - Validates CSP, HSTS, etc.
5. **Environment File Check** - Ensures no .env files committed
6. **TypeScript Security** - Checks for excessive `any` types

**View Results**: GitHub → Actions → Security Scanning

---

## 📦 Dependency Scanning

### Dependabot Configuration

**File**: `.github/dependabot.yml`

Automatically scans and updates dependencies:

- **Frequency**: Weekly (Mondays at 9 AM)
- **Scope**:
  - Root package.json
  - Next.js app dependencies
  - Vite app dependencies (legacy)
  - Sanity blog dependencies
  - GitHub Actions
- **PR Limit**: 10 per run (prevents overwhelming the team)
- **Grouping**: Minor/patch updates grouped to reduce PR noise
- **Security Updates**: Always get individual PRs for visibility

**Managing Dependabot PRs**:

1. Review security advisory (if present)
2. Check changelog for breaking changes
3. Run tests locally: `npm test`
4. Merge if tests pass

---

## 📊 Access Logging & Monitoring

### SecurityLogger Implementation

**File**: `app/lib/security-logger.ts`

Centralized security logging for all sensitive operations.

#### What Gets Logged:

1. **Authentication Attempts**

   ```typescript
   SecurityLogger.logAuthAttempt(ip, userAgent, endpoint, success, reason);
   ```

   - CV password attempts
   - Future: API key validation

2. **Rate Limit Violations**

   ```typescript
   SecurityLogger.logRateLimitExceeded(ip, userAgent, endpoint, metadata);
   ```

3. **Data Access**

   ```typescript
   SecurityLogger.logDataAccess(
     ip,
     userAgent,
     endpoint,
     method,
     success,
     metadata,
   );
   ```

   - Contact form submissions
   - GDPR data queries

4. **Suspicious Activity**

   ```typescript
   SecurityLogger.logSuspiciousActivity(
     ip,
     userAgent,
     endpoint,
     reason,
     metadata,
   );
   ```

5. **GDPR Deletions**
   ```typescript
   SecurityLogger.logDataDeletion(ip, userAgent, email, success, reason);
   ```

#### Log Destinations:

- **Console**: All events (structured JSON)
- **Sentry**: Failed operations only (for alerting)
- **Future**: Dedicated log aggregation service

---

## 🇪🇺 GDPR Compliance

### Data Subject Rights

The application implements all GDPR requirements:

#### 1. Right to Access

Users can request what data is stored:

```bash
GET /api/gdpr/delete-data?email=user@example.com
```

Returns record count without exposing actual data.

#### 2. Right to Erasure (Right to be Forgotten)

Users can delete their data:

```bash
POST /api/gdpr/delete-data
Content-Type: application/json

{
  "email": "user@example.com",
  "reason": "No longer want account"
}
```

**What Gets Deleted**:

- All contact form submissions
- Associated metadata (IP, user agent)
- Logged in `deletion_requests` collection for audit

**Implementation**: `app/api/gdpr/delete-data/route.ts`

#### 3. Data Collected

As stated in Privacy Policy:

- **Contact Form**: Name, email, phone (optional), message
- **Analytics**: IP address, browser info, pages visited (Google Analytics)
- **Cookies**: Consent choice, session data

#### 4. Legal Basis

- Legitimate interest (analytics, security)
- Consent (cookies, marketing)
- Contract (when providing services)

#### 5. Data Retention

- Contact forms: 2 years or until deletion requested
- Analytics: 14 months (then anonymized)
- Logs: 90 days

---

## 🗄️ Data Retention

### Automated Cleanup Script

**File**: `scripts/cleanup-old-data.ts`

Automatically deletes contact form submissions older than 2 years.

#### Running Manually:

```bash
# Dry run (no deletion)
DRY_RUN=true npx tsx scripts/cleanup-old-data.ts

# Production run
npx tsx scripts/cleanup-old-data.ts
```

#### Automated Schedule:

**File**: `.github/workflows/data-retention.yml`

Runs every Sunday at 2 AM UTC via GitHub Actions.

**Configuration**:

```yaml
schedule:
  - cron: "0 2 * * 0" # Weekly on Sunday
```

**Manual Trigger**: GitHub → Actions → Data Retention Cleanup → Run workflow

**What Happens**:

1. Connects to MongoDB
2. Finds submissions older than 730 days
3. Creates audit log entry
4. Deletes old data
5. Reports to Sentry
6. Sends notification (optional Slack integration)

#### Audit Trail

All deletions logged in `deletion_audit_log` collection:

```javascript
{
  action: "scheduled_data_retention_cleanup",
  timestamp: Date,
  deletedCount: Number,
  cutoffDate: Date,
  deletedEmails: Array<{email, submittedAt}>
}
```

---

## 🚨 Sentry Alerting

### Configuration Guide

**File**: `docs/SENTRY_ALERT_CONFIGURATION.md`

Comprehensive guide for setting up Sentry alerts.

#### Alert Rules to Configure:

1. **Multiple Failed CV Password Attempts**
   - Trigger: >5 failed auth from same IP in 10 min
   - Action: Email notification

2. **Rate Limit Violations**
   - Trigger: >10 rate limit hits in 1 hour
   - Action: Email + Slack

3. **Suspicious Activity**
   - Trigger: Any suspicious event
   - Action: Immediate email + Slack

4. **High Error Rate**
   - Trigger: >10 errors on security endpoints in 5 min
   - Action: Email notification

5. **GDPR Deletion Failed**
   - Trigger: Data deletion with success=false
   - Action: Email for manual review

#### Setting Up Alerts:

1. Go to Sentry → Alerts → Create Alert Rule
2. Choose "Issues" alert type
3. Set condition: `event.tags.security_event` equals desired type
4. Configure threshold and time window
5. Add notification actions (email, Slack)
6. Save and test

**Testing Alerts**:

```bash
# Generate failed auth events
for i in {1..6}; do
  curl -X POST https://digitaltableteur.com/api/download-cv \
    -H "Content-Type: application/json" \
    -d '{"password":"wrong"}'
done
```

---

## 🛡️ Security Best Practices

### Implemented Measures

#### 1. Timing-Safe Password Comparison

**File**: `app/api/download-cv/route.ts`

Prevents timing attacks:

```typescript
import { timingSafeEqual } from "crypto";

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  return timingSafeEqual(bufA, bufB);
}
```

#### 2. Security Headers

**File**: `next.config.ts`

- Content-Security-Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

#### 3. CORS Configuration

**Files**: `vercel.json`, `api-legacy-vercel-functions/cors.js`

Whitelist-based origin validation.

#### 4. Environment Variable Security

All secrets in `.env.local` (gitignored):

- `MONGODB_URI`
- `MONGODB_DB`
- `CV_PASSWORD`
- `OPENAI_API_KEY`
- `SENTRY_DSN`
- `GITHUB_MCP_PAT`
- `FIGMA_TOKEN`

#### 5. Input Validation

- Email regex validation
- Field length limits
- NoSQL injection prevention (future: add mongo-sanitize)

---

## 🚀 Deployment Checklist

Before deploying to production:

### Environment Variables

Ensure all required secrets are set in Vercel:

- [ ] `MONGODB_URI`
- [ ] `MONGODB_DB`
- [ ] `CV_PASSWORD`
- [ ] `VITE_SENTRY_DSN`
- [ ] `SENTRY_AUTH_TOKEN`
- [ ] GitHub repository secrets for Actions

### Security Checks

- [ ] Run `npm audit` and fix critical/high issues
- [ ] Run security workflow manually
- [ ] Test GDPR deletion endpoint
- [ ] Verify Sentry alerts configured
- [ ] Test data retention cleanup (dry run)
- [ ] Review privacy policy matches implementation

### Monitoring

- [ ] Sentry DSN configured and receiving events
- [ ] Alert rules active in Sentry
- [ ] Dependabot enabled on repository
- [ ] CodeQL analysis passing
- [ ] Scheduled workflows enabled

---

## 📞 Support & Incident Response

### Security Incident Procedure

1. **Detect**: Monitor Sentry alerts and logs
2. **Assess**: Review scope and severity
3. **Contain**: Block malicious IPs, disable vulnerable endpoints
4. **Eradicate**: Apply patches, rotate credentials
5. **Recover**: Restore normal operations
6. **Learn**: Post-mortem and improve defenses

### Contact

**Security Issues**: mail@digitaltableteur.com  
**Responsible Disclosure**: Please report security vulnerabilities privately

---

## 📚 Related Documentation

- [Security Audit Report](./SECURITY_AUDIT_REPORT.md)
- [Sentry Alert Configuration](./SENTRY_ALERT_CONFIGURATION.md)
- [Privacy Policy](../app/privacy-policy/page.tsx)
- [Linear Automation](./LINEAR_AUTOMATION.md)
- [GitHub MCP Setup](./GITHUB_MCP_SETUP.md)

---

**Last Updated**: December 3, 2025  
**Maintained By**: Petri Lahdelma
