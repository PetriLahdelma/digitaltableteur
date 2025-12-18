# Snyk Security Integration

This project uses Snyk for continuous security monitoring and vulnerability scanning.

## Setup

### 1. Get Snyk API Token

1. Sign up or log in to [Snyk](https://app.snyk.io/)
2. Go to Account Settings → General → API Token
3. Copy your API token

### 2. Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `SNYK_TOKEN`
5. Value: Paste your Snyk API token
6. Click "Add secret"

### 3. Local Development

For local Snyk testing, authenticate once:

```bash
npx snyk auth
```

This opens a browser window for one-time authentication.

## Usage

### Run Security Scan

```bash
# Test for vulnerabilities
npx snyk test

# Test all project manifests (monorepo)
npx snyk test --all-projects

# Scan with severity threshold
npx snyk test --severity-threshold=high

# Test and upload results to Snyk dashboard
npx snyk monitor
```

### CI/CD Integration

The security workflow (`.github/workflows/security-scanning.yml`) automatically:

- ✅ Runs on every push to main/develop/DT-\* branches
- ✅ Runs on all pull requests
- ✅ Runs weekly on Mondays at 3 AM UTC
- ✅ Uploads results to GitHub Security tab (SARIF format)
- ✅ Monitors main branch for continuous tracking

### Snyk Policy

The `.snyk` file contains ignore rules for known false positives or accepted risks:

- **Dev-only MCP servers** - Not deployed to production
- **Indirect dependencies** - Waiting for upstream fixes
- **Low-risk vulnerabilities** - Risk accepted with expiration dates

Policy rules expire after 3 months and require review.

## Viewing Results

### In GitHub

1. Repository → Security → Code scanning alerts
2. Filter by tool: "Snyk"

### In Snyk Dashboard

1. Visit [app.snyk.io](https://app.snyk.io/)
2. Projects → digitaltableteur
3. View detailed vulnerability reports and fix suggestions

## Current Status

**Main Project:** ✅ 2 issues (low/high in undici via Sanity)
**Vite App:** ⚠️ 16 issues (mostly dev-only Neon MCP Server)
**Blog:** ⚠️ 1 issue (glob command injection via Sanity)

Most vulnerabilities are in development-only MCP servers and not deployed to production.

## Suppressing Vulnerabilities

To ignore a vulnerability:

1. Add to `.snyk` file with reason and expiration
2. Commit and push
3. Snyk will respect the policy on next scan

Example:

```yaml
ignore:
  "SNYK-JS-PACKAGE-ID":
    - "package > dependency":
        reason: "Dev-only, not in production"
        expires: "2026-03-18T00:00:00.000Z"
```

## Best Practices

- ✅ Review Snyk alerts weekly
- ✅ Update dependencies regularly (`npm update`)
- ✅ Renew policy expirations every 3 months
- ✅ Investigate high/critical issues immediately
- ✅ Use `npm audit fix` for automatic patches
- ⚠️ Avoid `--force` unless necessary (breaking changes)

## Resources

- [Snyk Docs](https://docs.snyk.io/)
- [GitHub Actions Integration](https://docs.snyk.io/integrations/ci-cd-integrations/github-actions-integration)
- [Snyk Policy Syntax](https://docs.snyk.io/snyk-cli/test-for-vulnerabilities/the-.snyk-file)
