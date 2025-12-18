# Neon GitHub Copilot Agents Setup

## Overview

This project now includes two specialized GitHub Copilot agents for database operations:

1. **Neon Migration Specialist** - Safe schema migrations with zero downtime
2. **Neon Performance Analyzer** - Automated query optimization and performance tuning

## Installation Status

✅ **Neon MCP Server**: `@neondatabase/mcp-server-neon@0.6.5` (Updated Dec 6, 2025)

⚠️ **Node Version Requirement**: Requires Node.js >=22.0.0 (Current: 20.19.2)

- The package is installed but may have compatibility issues
- Consider upgrading Node.js for full functionality
- Works in degraded mode on Node 20.x for most features

## Agent Configuration

Both agents are configured in `.github/copilot/`:

- `neon-migration-specialist.yml`
- `neon-performance-analyzer.yml`

## Environment Variables

Required for full agent functionality:

```bash
# .env.local or Vercel environment variables
NEON_API_KEY=your_neon_api_key
NEON_PROJECT_ID=your_neon_project_id
TEST_HEALTH_DATABASE_URL=postgresql://user:pass@host/db
```

## Usage Examples

### Migration Specialist

Use natural language in GitHub Copilot chat:

```
"Create a migration to add user_roles table with FK to users"
"Test this schema change in a Neon branch before production"
"Help me migrate from SQLite to Postgres safely"
"Add indexes for the user search query"
"Create a database branch for feature/auth-system"
```

**Workflow:**

1. Agent creates isolated Neon branch
2. Applies migration to branch
3. Runs validation tests
4. Applies to production if successful
5. Auto-rollback on failure

### Performance Analyzer

```
"Why is the dashboard query slow?"
"Analyze performance of user search endpoint"
"Find missing indexes in my schema"
"Optimize the blog article loading time"
"Compare query performance before and after indexing"
```

**Workflow:**

1. Identifies slow queries
2. Creates performance test branch
3. Analyzes EXPLAIN plans
4. Applies optimizations (indexes, rewrites)
5. Provides before/after metrics
6. Generates optimized code

## Current Database Usage

This project uses Neon Postgres for:

- **Test Health Dashboard** (`api-legacy-vercel-functions/test-health/db.ts`)
- **Coverage Metrics Storage** (`nextjs-app/app/api/test-health/db.ts`)
- **CI/CD Integration** (`app/api/test-health/db.ts`)

All use `pg` client library (compatible with all Postgres versions).

## Postgres Version

- **Current**: Auto-updated by Neon on compute restart
- **Supported versions**: 14.20, 15.15, 16.11, 17.7, 18.1
- **Compatibility**: `pg@8.16.3` supports all versions

## Integration with Existing Tools

### MCP Servers

Neon agents work alongside:

- **GitHub MCP** - Repository operations
- **Figma MCP** - Design integration
- **Sentry MCP** - Error tracking
- **Context7 MCP** - Documentation search
- **Vercel MCP** - Deployment management
- **Docker MCP** - Container management
- **Sanity MCP** - Content management
- **Storybook MCP** - Component development

### Workflow Example

```
User: "Add a new analytics table and optimize queries"

Migration Specialist:
1. Creates branch: digitaltableteur/analytics-table
2. Generates migration SQL
3. Applies to branch
4. Runs tests
5. Applies to production

Performance Analyzer:
6. Analyzes existing query patterns
7. Suggests indexes
8. Tests optimizations in branch
9. Provides performance comparison
10. Generates optimized queries
```

## Best Practices

### Migration Safety

- ✅ Always test migrations in branches first
- ✅ Use transactions for data migrations
- ✅ Keep migrations small and focused
- ✅ Document breaking changes
- ✅ Test rollback procedures

### Performance Optimization

- ✅ Test optimizations in isolated branches
- ✅ Measure before and after metrics
- ✅ Consider data distribution patterns
- ✅ Monitor production after deployment
- ✅ Document index rationale

## Troubleshooting

### Node Version Warning

```
npm warn EBADENGINE required: { node: '>=22.0.0' }
npm warn EBADENGINE current: { node: 'v20.19.2' }
```

**Solution**: Upgrade Node.js

```bash
# Using nvm
nvm install 22
nvm use 22

# Or using Homebrew (macOS)
brew upgrade node
```

### Agent Not Responding

1. Verify environment variables are set
2. Check Neon MCP server is running: `npm list @neondatabase/mcp-server-neon`
3. Restart VS Code / Cursor
4. Check GitHub Copilot is enabled

### Database Connection Issues

1. Verify `TEST_HEALTH_DATABASE_URL` is set
2. Test connection: `psql $TEST_HEALTH_DATABASE_URL`
3. Check Neon project status: https://console.neon.tech
4. Verify firewall/network access

## Additional Resources

- [Neon Changelog](https://neon.com/docs/changelog)
- [Neon Migration Guide](https://neon.com/docs/guides/migrations)
- [GitHub Copilot Agents](https://github.com/github/awesome-copilot)
- [Neon MCP Server](https://github.com/neondatabase/mcp-server-neon)
- [Database Branching Workflows](https://neon.com/blog/practical-guide-to-database-branching)

## Future Enhancements

Consider exploring:

- **Data API** - REST API for database queries
- **OpenAPI Generation** - Auto-generate API documentation
- **Server-Timing Headers** - Debug slow queries
- **Branch Anonymization** - Safe data masking for testing
- **HIPAA Compliance** - For sensitive data (Postgres 18+)

---

Last Updated: December 6, 2025
Neon MCP Version: 0.6.5
Node Requirement: >=22.0.0
