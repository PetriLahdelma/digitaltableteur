# Bug report: Claude desktop (macOS) renders a blank window on the first launch after every update

## Summary
After every app auto-update, the **first** launch shows a blank window. A second launch (full quit + reopen) always works. This reproduces on every version bump, not intermittently.

## Environment
- App: Claude for macOS (`com.anthropic.claudefordesktop`)
- Version where last observed: **1.10628.0** (also seen on 1.9659.x, 1.9255.x)
- Platform: macOS, Apple Silicon (arm64)
- Node/Electron runtime reported by app: nodeVersion 24.15.0

## Steps to reproduce
1. Leave the app closed long enough that an update is downloaded/applied on next launch.
2. Open the app. → Blank window. The shell/chrome may appear but content never paints.
3. Quit fully (Cmd+Q) and reopen. → Works normally.

## Expected
First launch after an update renders normally, or the app force-reloads cleanly instead of showing a blank screen.

## Actual
Blank window on first post-update launch; recovered only by relaunch.

## Root cause (from local logs)
The app loads claude.ai as a remotely deployed SPA. On the first post-update launch the renderer serves a **stale, disk-cached SPA entrypoint** whose lazily imported chunk hashes no longer exist on the CDN, so a dynamic `import()` 404s and the app crashes to a fatal error boundary with no visible fallback (blank).

Key evidence:

- Main process confirms the document loads (so this is not network-down or a main-process crash):
  ```
  [startup-perf] { window_did_finish_load_ms: 1204, main_view_dom_ready_ms: 1457 }
  ```
- Marker that this is the first run of the new build:
  ```
  [updater] Version changed since last launch: 1.9659.4 -> 1.10628.0
  ```
- Renderer death on comparable update relaunches (2026-04-19, 2026-04-20, 2026-06-02):
  ```
  [spa] chunk preload failed, reloading TypeError: Failed to fetch dynamically imported module:
       https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/cf52a4cc1-Da2FnJQI.js
  [BOOTSTRAP] Fatal error boundary triggered {"errorCode":"1XAF0WC","url":"/epitaxy"}
  ```
- The launch-pair pattern (blank launch immediately followed by a working relaunch) recurs on every update:
  | Update | 1st launch (blank) | 2nd launch (works) |
  |--------|--------------------|--------------------|
  | -> 1.10628.0 | 08:46:37 (quit 08:47:11) | 08:47:13 |
  | -> 1.9659.x | 16:26:08 | 16:37:07 |
  | -> 1.9659.x | 21:20:32 | 21:20:59 |

## Ruled out
- No service worker is involved.
- Not GPU/hardware acceleration (no GPU faults logged; the DOM finishes loading).

## Impact
Every update produces a broken first launch. The built-in "chunk preload failed, reloading" self-heal does not reliably recover before the user gives up and relaunches.

## Suggested fix (app side)
- On detecting a version change (or on a dynamic-import/chunk fetch failure), force a cache-busting reload of the SPA entrypoint that bypasses the renderer HTTP/code cache, rather than reusing the stale cached module graph.
- Render a visible fallback / auto-reload UI when the bootstrap error boundary (errorCode `1XAF0WC`) fires, instead of a blank window.

## User-side workaround
- When blank: Cmd+R to reload, or Cmd+Q and reopen.
- To stop recurrence, with the app fully quit, clear its web caches:
  ```
  rm -rf ~/Library/Application\ Support/Claude/Cache \
         ~/Library/Application\ Support/Claude/Code\ Cache \
         ~/Library/Application\ Support/Claude/GPUCache
  ```
