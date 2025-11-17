# GitHub MCP Server Setup Guide

## Overview

The GitHub MCP (Model Context Protocol) Server has been configured for your digitaltableteur project. This provides AI tools with direct access to GitHub's platform capabilities, including repository management, issues, pull requests, and more.

## Configuration

The GitHub MCP server is configured in `mcp.json` as a remote server hosted by GitHub at `https://api.githubcopilot.com/mcp/`.

## Setup Steps

### 1. Create a GitHub Personal Access Token

You need to create a Personal Access Token (PAT) to authenticate with the GitHub API:

1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/personal-access-tokens/new)
2. Choose **"Fine-grained personal access tokens"** (recommended) or **"Tokens (classic)"**
3. Set an expiration date (recommended: 90 days)
4. Select the permissions you want to grant:

#### Recommended Permissions:

- **Repository permissions:**
  - Contents: Read/Write (for file operations)
  - Issues: Read/Write (for issue management)
  - Pull requests: Read/Write (for PR management)
  - Actions: Read (for workflow information)
  - Metadata: Read (required)

- **Account permissions:**
  - Email addresses: Read
  - Profile: Read

5. Click **"Generate token"**
6. **Copy the token immediately** (you won't be able to see it again)

### 2. Configure the Token

When prompted by your MCP host (VS Code, Claude Desktop, etc.), enter your GitHub Personal Access Token.

The token will be used for the `GITHUB_MCP_PAT` environment variable configured in `mcp.json`.

## Available Toolsets

The GitHub MCP server provides various toolsets you can enable:

### Default Toolsets (automatically enabled):

- **context**: User and GitHub context information
- **repos**: Repository operations
- **issues**: Issue management
- **pull_requests**: Pull request operations
- **users**: User information

### Additional Available Toolsets:

- **actions**: GitHub Actions and CI/CD operations
- **code_security**: Code security and scanning tools
- **dependabot**: Dependabot operations
- **discussions**: GitHub Discussions
- **gists**: GitHub Gist operations
- **git**: Low-level Git operations
- **labels**: Label management
- **notifications**: Notification management
- **orgs**: Organization management
- **projects**: GitHub Projects
- **secret_protection**: Secret scanning
- **security_advisories**: Security advisory management
- **stargazers**: Repository star operations

## Usage Examples

Once configured, you can interact with GitHub through natural language:

### Repository Operations

- "Show me the latest commits in the main branch"
- "Create a new issue for the bug we discussed"
- "List all open pull requests"
- "Search for files containing 'react-icons'"

### Issue Management

- "Create an issue titled 'Fix navigation bug'"
- "Add a comment to issue #192"
- "Label issue #192 with 'bug' and 'high-priority'"

### Pull Request Operations

- "Show me the diff for PR #192"
- "Merge the pull request #192"
- "Create a review comment on line 25"

### Code Analysis

- "Analyze the security findings in this repository"
- "Show me the GitHub Actions workflow status"
- "List all Dependabot alerts"

## Security Best Practices

1. **Token Expiration**: Set short expiration dates (90 days or less) for your tokens
2. **Minimal Permissions**: Only grant the permissions you actually need
3. **Token Storage**: Never commit tokens to your repository
4. **Regular Rotation**: Rotate tokens regularly
5. **Monitor Usage**: Review token usage in GitHub settings

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify your token is correct and hasn't expired
   - Check that the token has the required permissions
   - Ensure the token is for the correct GitHub account/organization

2. **Rate Limiting**
   - GitHub has API rate limits (5000 requests/hour for authenticated users)
   - The MCP server will handle rate limiting automatically

3. **Permission Errors**
   - Ensure your token has the necessary permissions for the operation
   - Check if you have access to the specific repository

### Debug Mode

To enable debug logging, you can set environment variables:

- `GITHUB_DEBUG=1` - Enable debug logging
- `GITHUB_LOG_LEVEL=debug` - Set log level

## Configuration Files

- **Primary Config**: `mcp.json` - Main MCP server configuration
- **Environment**: Set `GITHUB_MCP_PAT` environment variable with your token

## Related Documentation

- [GitHub MCP Server Official Documentation](https://github.com/github/github-mcp-server)
- [GitHub Personal Access Token Guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [GitHub API Documentation](https://docs.github.com/en/rest)

## Support

For issues with the GitHub MCP server:

- Check the [official GitHub MCP server issues](https://github.com/github/github-mcp-server/issues)
- Review the [GitHub MCP server documentation](https://github.com/github/github-mcp-server/blob/main/README.md)
