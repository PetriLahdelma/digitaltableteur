# Agent Browser Guide for AI Agents

> **Use this tool for visual verification and browser interaction during development.**
> Do NOT use Playwright for non-testing visual checks - use `agent-browser` instead.

## Overview

`agent-browser` is a headless browser automation CLI optimized for AI agents. It provides semantic element locators, accessibility snapshots, and lightweight browser interaction without the overhead of full testing frameworks.

## When to Use Agent Browser

**USE agent-browser for:**
- Checking if a UI change renders correctly
- Verifying layout and visual appearance
- Taking screenshots for user feedback
- Navigating the site during development
- Quick element state verification
- Visual diff enabled coding

**DO NOT use for:**
- Automated test suites (use Playwright/Vitest)
- Visual regression testing (use `npm run test:visual`)
- CI/CD pipelines

## Quick Start

```bash
# Open dev server and navigate
agent-browser open http://localhost:3001

# Take a screenshot
agent-browser screenshot ./screenshot.png

# Get accessibility snapshot (shows element references like @e1, @e2)
agent-browser snapshot

# Click an element by text
agent-browser find text "Start your sprint" click

# Check if element is visible
agent-browser is visible "#design-sprints"

# Scroll down
agent-browser scroll down 500
```

## Common Workflows

### Verify a Component Renders Correctly

```bash
# Start with navigation
agent-browser open http://localhost:3001

# Wait for page load
agent-browser wait --load networkidle

# Take screenshot of current state
agent-browser screenshot ./check-component.png

# Or get accessibility tree to verify elements exist
agent-browser snapshot -i -c  # Interactive, compact
```

### Check Mobile Viewport

```bash
agent-browser set device "iPhone 14"
agent-browser open http://localhost:3001
agent-browser screenshot ./mobile-view.png
```

### Verify Dark Mode

```bash
agent-browser set media dark
agent-browser open http://localhost:3001
agent-browser screenshot ./dark-mode.png
```

### Check Specific Section

```bash
agent-browser open http://localhost:3001/#design-sprints
agent-browser wait "#design-sprints"
agent-browser screenshot --full ./design-sprints-section.png
```

### Interactive Element Testing

```bash
# Find and click a button
agent-browser find role button click

# Fill a form field
agent-browser find label "Email" fill "test@example.com"

# Check a checkbox
agent-browser find text "I agree" check

# Get text content
agent-browser find role heading text
```

## Core Commands Reference

### Navigation
| Command | Description |
|---------|-------------|
| `open <url>` | Navigate to URL |
| `back` / `forward` | Browser history |
| `reload` | Refresh page |

### Interaction
| Command | Description |
|---------|-------------|
| `click <selector>` | Click element |
| `type <selector> <text>` | Type text |
| `fill <selector> <text>` | Fill input field |
| `hover <selector>` | Hover over element |
| `scroll <up\|down\|left\|right> [px]` | Scroll page |

### Information
| Command | Description |
|---------|-------------|
| `snapshot` | Get accessibility tree |
| `screenshot [path]` | Capture page |
| `get text <selector>` | Get element text |
| `get html <selector>` | Get element HTML |
| `is visible <selector>` | Check visibility |

### Semantic Locators (Recommended)
```bash
find role <role> <action>        # By ARIA role (button, link, heading)
find text <text> <action>        # By visible text
find label <label> <action>      # By associated label
find placeholder <ph> <action>   # By placeholder text
find testid <id> <action>        # By data-testid attribute
```

### Device & Viewport
```bash
set viewport 1920 1080          # Desktop
set device "iPhone 14"          # Mobile emulation
set device "iPad Pro"           # Tablet
set media dark                  # Dark color scheme
set media light                 # Light color scheme
```

## Snapshot Filtering

Reduce output verbosity with flags:

```bash
snapshot -i          # Interactive elements only
snapshot -c          # Compact (remove empty elements)
snapshot -d 3        # Limit depth to 3 levels
snapshot -s "#main"  # Scope to specific selector
snapshot -i -c -d 5  # Combine options
```

## Sessions

For parallel browser instances:

```bash
agent-browser --session dev1 open http://localhost:3001
agent-browser --session dev2 open http://localhost:3002
agent-browser session list
```

## Tips for AI Agents

1. **Always wait for page load** before taking screenshots:
   ```bash
   agent-browser wait --load networkidle
   ```

2. **Use semantic locators** over CSS selectors when possible:
   ```bash
   # Preferred
   agent-browser find text "Submit" click

   # Less preferred
   agent-browser click "button.submit-btn"
   ```

3. **Take full-page screenshots** for layout verification:
   ```bash
   agent-browser screenshot --full ./full-page.png
   ```

4. **Use compact snapshots** for element verification:
   ```bash
   agent-browser snapshot -i -c
   ```

5. **Check multiple viewports** for responsive design:
   ```bash
   agent-browser set viewport 1920 1080 && agent-browser screenshot ./desktop.png
   agent-browser set viewport 768 1024 && agent-browser screenshot ./tablet.png
   agent-browser set viewport 375 812 && agent-browser screenshot ./mobile.png
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AGENT_BROWSER_SESSION` | Default session name |

## Installation

Already installed in this project as a dev dependency:
```bash
npm install agent-browser --save-dev
```

First-time setup (downloads Chromium):
```bash
npx agent-browser install
```

---

**Repository:** https://github.com/vercel-labs/agent-browser
**License:** Apache-2.0
