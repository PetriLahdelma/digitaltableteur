# Sanity MCP Server Setup Guide

## Overview

The **Sanity MCP Server** (`https://mcp.sanity.io`) provides 40+ tools for interacting with your Sanity workspace through the Model Context Protocol (MCP). It enables AI assistants like Claude Code and Cursor to perform content operations, GROQ queries, semantic search, translations, version management, and more—all through natural language.

**Official Documentation**: https://www.sanity.io/docs/compute-and-ai/mcp-server

---

## Quick Start

### 1. MCP Configuration

The Sanity MCP server is already configured in `mcp.json`:

```json
{
  "mcpServers": {
    "sanity": {
      "type": "http",
      "url": "https://mcp.sanity.io",
      "description": "Sanity CMS MCP Server - 40+ tools",
      "env": {
        "SANITY_TOKEN": "<YOUR_SANITY_API_TOKEN_OPTIONAL>"
      },
      "headers": {
        "Authorization": "Bearer {{SANITY_TOKEN}}"
      }
    }
  }
}
```

### 2. Authentication

**Option A: OAuth (Recommended)**

- Sanity MCP uses OAuth by default
- MCP clients will prompt for Sanity credentials on first use
- Sessions expire after 7 days (automatic refresh in compatible clients)
- No environment variables required

**Option B: API Token**

- Create a token at https://www.sanity.io/manage
- Set environment variable to skip OAuth:

```bash
export SANITY_TOKEN=skAbcd1234...  # Your Sanity API token
```

Add to `.env.local`:

```
SANITY_TOKEN=skAbcd1234...
SANITY_PROJECT_ID=abc123xy
SANITY_DATASET=production
```

### 3. Test Connection

```bash
npm run sanity:mcp:test
```

This validates:

- ✅ Sanity MCP server accessibility
- ✅ MCP configuration in `mcp.json`
- ✅ Environment variables (token, project ID, dataset)
- ✅ Sanity Client API connectivity
- 📊 Lists all 40+ available tools

---

## Available Tools (40+)

### 🔵 Document Operations (High Priority)

- `create_document` - Create new documents from markdown + formatting instructions
- `update_document` - AI-powered content updates and rewrites
- `patch_document` - Precise field modifications
- `transform_document` - Find-and-replace with formatting preservation
- `translate_document` - Multi-language translation with style guide support
- `publish_document` - Publish draft to make it live
- `unpublish_document` - Move published document back to drafts
- `delete_document` - Permanently delete document and drafts

### 🟢 Version Management (High Priority)

- `create_version` - Create document version for a release
- `version_replace_document` - Replace version contents
- `version_discard_document` - Remove document from release
- `version_unpublish_document` - Mark document for unpublish on release

### 🟡 GROQ & Queries (High Priority)

- `get_groq_specification` - Get GROQ language spec summary
- `query_documents` - Query documents using GROQ

### 🟠 Semantic Search (High Priority)

- `semantic_search` - Embeddings-based content discovery
- `list_embeddings_indices` - List available embeddings indices

### 🔴 Image Operations

- `transform_image` - AI-powered image transformation/generation

### 🟣 Release Management (High Priority)

- `list_releases` - List content releases (filtered by state)
- `create_release` - Create new release with auto-generated ID
- `edit_release` - Update release metadata
- `schedule_release` - Schedule release for specific time
- `publish_release` - Publish release immediately
- `archive_release` - Archive inactive release
- `unarchive_release` - Restore archived release
- `unschedule_release` - Remove scheduled release time
- `delete_release` - Delete release

### 🔵 Project & Schema

- `list_projects` - List all Sanity projects
- `get_project_studios` - Get studio applications for project
- `get_schema` - Get full workspace schema
- `list_workspace_schemas` - List available schema names
- `get_context` - Get project-specific context (schemas, releases, embeddings)

### 🟢 Dataset Management

- `list_datasets` - List all datasets in project
- `create_dataset` - Create new dataset
- `update_dataset` - Modify dataset settings

### 🟡 Migration & Documentation

- `sanity_migration_guide` - Comprehensive migration guidance
- `migrate_schema` - Platform-specific schema migration guide
- `migrate_content` - Platform-specific content migration guide (Contentful, WordPress, Strapi)
- `search_docs` - Search Sanity documentation
- `read_docs` - Read specific documentation article
- `list_learn_docs` - List learning materials
- `read_learn_docs` - Read learning materials by slug

---

## Integration with Existing Scripts

Your project already has comprehensive Sanity automation in `scripts/sanity-migration/`:

### Existing Scripts (Local → Sanity)

- ✅ `npm run sanity:parse-posts` - Parse React/TSX posts
- ✅ `npm run sanity:convert` - Convert to Sanity format
- ✅ `npm run sanity:upload` - Upload with assets
- ✅ `npm run sanity:sync-from-remote` - Pull Sanity → MDX
- ✅ `npm run sanity:cleanup-legacy` - Remove old documents

### MCP Enhancements (To Create)

**High-Priority Scripts** (recommended):

```bash
# Semantic search across content
npm run sanity:semantic-search <query>

# Interactive GROQ queries with AI assistance
npm run sanity:groq <natural-language-query>

# Translate document to another language
npm run sanity:translate <document-id> <target-language>

# Version management
npm run sanity:version:create <document-id> <release-id>
npm run sanity:version:list
npm run sanity:version:publish <release-id>

# Release operations
npm run sanity:release:create <title>
npm run sanity:release:schedule <release-id> <datetime>
npm run sanity:release:publish <release-id>
```

**Implementation Pattern** (example for semantic search):

```javascript
// scripts/sanity/semantic-search.mjs
#!/usr/bin/env node
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const query = process.argv[2];
if (!query) {
  console.error("Usage: npm run sanity:semantic-search <query>");
  process.exit(1);
}

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || "production";
const token = process.env.SANITY_TOKEN;

// Call semantic_search via MCP or direct API
// (Implementation depends on MCP client library or direct HTTP)

console.log(`Searching Sanity for: "${query}"`);
// Execute semantic search...
```

---

## MCP Usage Examples

Once configured, use natural language in Claude Code or Cursor:

### Content Operations

```
"List all blog posts in Sanity"
"Create a new blog post about design systems"
"Update the 'figma-mcp-design-systems' post with improved intro"
"Translate the 'workflow-tips' post to Finnish"
"Publish the draft post 'new-article-2025'"
```

### Semantic Search

```
"Search Sanity for content about accessibility"
"Find articles mentioning React and TypeScript"
"Show me posts related to design automation"
```

### GROQ Queries

```
"Query all posts published in 2025"
"Get posts by author Petri Lahdelma"
"Find posts with more than 5 minute read time"
```

### Version & Release Management

```
"Create a new release called 'January 2025 Launch'"
"Schedule the January release for 2025-01-15 at 10:00"
"List all active content releases"
"Create a version of post XYZ for the next release"
```

### Schema & Migration

```
"Show me the Sanity schema for the post type"
"Help me migrate from WordPress to Sanity"
"List all available datasets in my project"
```

---

## Troubleshooting

### Authentication Issues

**Problem**: "Authentication failed" or "Session expired"

**Solution**:

1. **OAuth (default)**: Run this in VS Code/Cursor command palette:
   - VS Code: `Authentication: Remove Dynamic Authentication Providers`
   - Cursor: `Cursor: Clear All MCP Tokens`
   - Restart MCP server
2. **Token auth**: Verify `SANITY_TOKEN` in `.env.local` is valid
   - Create new token at https://www.sanity.io/manage
   - Ensure token has appropriate permissions

### Tool Availability

**Problem**: Some tools not appearing

**Solution**:

- Verify project permissions in Sanity dashboard
- Check dataset access (some operations require specific roles)
- Ensure you're using the latest MCP client

### Connection Issues

**Problem**: "Cannot reach mcp.sanity.io"

**Solution**:

```bash
# Test connectivity
curl -I https://mcp.sanity.io

# Test MCP configuration
npm run sanity:mcp:test
```

---

## API Token Permissions

When using token authentication (skipping OAuth), ensure your token has:

- **Read permissions**: For queries, schema access, document listing
- **Write permissions**: For create/update/patch operations
- **Editor role**: For publish/unpublish operations
- **Admin role**: For dataset/project management

Create tokens at: https://www.sanity.io/manage → API → Tokens

---

## Comparison: MCP vs. Existing Scripts

| Operation              | Existing Scripts      | Sanity MCP              | Advantage                          |
| ---------------------- | --------------------- | ----------------------- | ---------------------------------- |
| **Upload documents**   | ✅ `sanity:upload`    | ✅ `create_document`    | Scripts = batch, MCP = interactive |
| **Query content**      | ✅ `@sanity/client`   | ✅ `query_documents`    | MCP = natural language → GROQ      |
| **Semantic search**    | ❌ None               | ✅ `semantic_search`    | **MCP only**                       |
| **Translate content**  | ❌ Manual             | ✅ `translate_document` | **MCP only**                       |
| **Version management** | ❌ None               | ✅ 4 version tools      | **MCP only**                       |
| **Release operations** | ❌ None               | ✅ 9 release tools      | **MCP only**                       |
| **Sync to MDX**        | ✅ `sync-from-remote` | ❌ N/A                  | **Scripts only**                   |
| **Batch asset upload** | ✅ `batchUpload`      | ⚠️ Single images        | Scripts = better for bulk          |

**Recommendation**: Use existing scripts for batch operations and migrations. Use MCP for interactive content editing, translations, and workflows.

---

## Security Considerations

### Token Storage

- Store `SANITY_TOKEN` in `.env.local` (gitignored)
- **Never commit tokens** to version control
- Use Vercel environment variables for production

### Token Scoping

- Create **separate tokens** for dev/staging/production
- Use **read-only tokens** when write access not needed
- Rotate tokens periodically (see `docs/EMERGENCY_SECRET_ROTATION.md`)

### OAuth vs. Token

- **OAuth**: Better security (time-limited, revocable sessions)
- **Token**: Simpler for automation scripts
- **Use OAuth** for interactive MCP, **tokens** for CI/CD

---

## Related Documentation

- **Existing Sanity Automation**: `docs/SANITY_MIGRATION.md`
- **Emergency Token Rotation**: `docs/EMERGENCY_SECRET_ROTATION.md`
- **Security Audit**: `docs/COMPREHENSIVE_SECURITY_AUDIT_2025-12-03.md`
- **GitHub MCP Setup**: `docs/GITHUB_MCP_SETUP.md`
- **Figma MCP Setup**: `docs/FIGMA_MCP_SETUP.md`

---

## Support & Community

- **Official MCP Docs**: https://www.sanity.io/docs/compute-and-ai/mcp-server
- **Sanity Community**: https://snty.link/community
- **Status Page**: https://www.sanity-status.com/
- **GitHub Issues**: https://github.com/sanity-io

---

## Future Enhancements

### Planned Scripts (High Priority)

1. **Semantic Search Wrapper** - `scripts/sanity/semantic-search.mjs`
2. **GROQ Query Helper** - `scripts/sanity/groq-query.mjs`
3. **Translation Automation** - `scripts/sanity/translate-post.mjs`
4. **Version Manager** - `scripts/sanity/version-create.mjs`

### Integration Ideas

- **Webhook automation**: Trigger MCP operations on Sanity document changes
- **CI/CD integration**: Run semantic search in PR checks to find related docs
- **Translation pipeline**: Auto-translate new posts to FI/SV using MCP
- **Release scheduler**: Schedule content releases via GitHub Actions + MCP

---

**Last Updated**: December 5, 2025  
**MCP Server Version**: Experimental (see Sanity changelog for updates)
