#!/usr/bin/env node
/**
 * Route manifest for html-to-design Figma captures (Phase 15).
 * Does NOT mutate Figma — use generate_figma_design MCP + figma:run-capture.
 *
 * Usage:
 *   npm run dev:figma-capture
 *   npm run figma:capture-routes
 *   npm run figma:run-capture -- --route work --capture-id <uuid>
 */
import {
  buildCaptureUrl,
  CAPTURE_ROUTES,
  CAPTURE_VIEWPORT_WIDTH,
  DEV_ORIGIN,
  FIGMA_FILE_KEY,
  FIGMA_FILE_SLUG,
  readDsbState,
} from "./figma-html-capture-lib.mjs";

function main() {
  const routeArg = process.argv.indexOf("--route");
  const captureArg = process.argv.indexOf("--capture-id");
  const routeKey =
    routeArg >= 0 ? process.argv[routeArg + 1] : undefined;
  const captureId =
    captureArg >= 0 ? process.argv[captureArg + 1] : undefined;

  const state = readDsbState();

  console.log(`Figma file: ${FIGMA_FILE_KEY} (${FIGMA_FILE_SLUG})`);
  console.log(`Dev origin: ${DEV_ORIGIN} (npm run dev:figma-capture)`);
  console.log(`Capture viewport: ${CAPTURE_VIEWPORT_WIDTH}px wide (required)\n`);

  if (routeKey) {
    const route = CAPTURE_ROUTES[routeKey];
    if (!route) {
      console.error(
        `Unknown route "${routeKey}". Keys: ${Object.keys(CAPTURE_ROUTES).join(", ")}`,
      );
      process.exit(1);
    }
    console.log(`Route: ${routeKey} — ${route.label}`);
    console.log(`Production: ${state.routeViews?.[routeKey]?.url ?? "—"}`);
    const view = state.routeViews?.[routeKey];
    if (view?.captureMethod === "html-to-design" && !view?.needsRecapture) {
      console.log(`Current html-to-design node: ${view.nodeId}`);
      console.log(view.figmaUrl);
    } else if (view?.needsRecapture) {
      console.log(`Needs re-capture: ${view.recaptureReason ?? "viewport invalid"}`);
    } else if (view?.nodeId) {
      console.log(`Legacy VIews frame: ${view.nodeId} (replace via new capture)`);
    }
    if (captureId) {
      console.log(`\nCapture URL:\n${buildCaptureUrl(route.path, captureId)}`);
      console.log(
        `\nRun capture (Playwright @ ${CAPTURE_VIEWPORT_WIDTH}px — NOT Cursor browser):\n  npm run figma:run-capture -- --route ${routeKey} --capture-id ${captureId}`,
      );
    } else {
      console.log(
        "\nNext: generate_figma_design MCP → captureId → figma:run-capture",
      );
    }
    return;
  }

  console.log("Routes (html-to-design queue):\n");
  for (const [key, route] of Object.entries(CAPTURE_ROUTES)) {
    const view = state.routeViews?.[key];
    let status;
    if (view?.needsRecapture) {
      status = `↻ re-capture (${view.captureViewportWidth ?? "?"}px → ${CAPTURE_VIEWPORT_WIDTH}px)`;
    } else if (view?.captureMethod === "html-to-design") {
      status = `✓ ${view.capturedAt ?? ""} @ ${view.captureViewportWidth ?? "?"}px → ${view.nodeId}`;
    } else if (view?.nodeId) {
      status = `legacy ${view.nodeId}`;
    } else {
      status = "pending";
    }
    console.log(`  ${key.padEnd(14)} ${route.path.padEnd(42)} ${status}`);
  }

  console.log(`
Workflow:
  1. npm run dev:figma-capture
  2. generate_figma_design({ fileKey: "${FIGMA_FILE_KEY}" }) → captureId
  3. npm run figma:run-capture -- --route <key> --capture-id <id>
     (Playwright Chrome @ ${CAPTURE_VIEWPORT_WIDTH}px — never Cursor browser ~538px)
  4. Poll generate_figma_design with captureId until completed
  5. Update dsb-state.json (nodeId, captureViewportWidth: ${CAPTURE_VIEWPORT_WIDTH})
  Do NOT run figma-rebuild-route-views.mjs on capture frames.
`);
}

main();
