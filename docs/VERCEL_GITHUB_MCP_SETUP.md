# Vercel Environment Variable Setup for GitHub MCP

## Setting Up GITHUB_MCP_PAT in Vercel

### 1. Access Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `digitaltableteur` project
3. Navigate to **Settings** → **Environment Variables**

### 2. Add the GitHub MCP Token

Add a new environment variable:

- **Name**: `GITHUB_MCP_PAT`
- **Environment**: Select `Production`, `Preview`, and `Development` (all environments)

### 3. Redeploy Your Application

After adding the environment variable:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **three dots** menu → **Redeploy**
4. This ensures the new environment variable is available to all serverless functions

### Current Environment Variables Setup

Your project now has the GitHub MCP token configured for:

✅ **Local Development**: `.env.local` file
✅ **Vercel Production**: Environment variable `GITHUB_MCP_PAT`

### Verification Commands

Test the setup locally:

```bash
npm run github:mcp:test
```

Test after Vercel deployment:

```bash
# The serverless functions in /api can now access process.env.GITHUB_MCP_PAT
curl https://digitaltableteur.com/api/your-endpoint
```

### Security Notes

- The token is safely stored in Vercel's encrypted environment variable storage
- It's not exposed in your repository or client-side code
- The token has appropriate GitHub permissions for repository and issue management
- Local `.env.local` file is gitignored for security

### MCP Integration Points

The `GITHUB_MCP_PAT` environment variable will be available to:

1. **MCP Servers**: When running locally with proper environment loading
2. **Serverless Functions**: Any `/api` endpoints that need GitHub access
3. **Build Process**: If any build scripts need GitHub API access
4. **Testing**: The `npm run github:mcp:test` command for validation

### Troubleshooting

If you encounter issues:

1. Verify the environment variable is set in Vercel dashboard
2. Redeploy the application after adding the variable
3. Check that your local `.env.local` contains the correct token
4. Run `npm run github:mcp:test` to validate the connection
