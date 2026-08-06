#!/usr/bin/env node
/**
 * Hydration worker for measure-ssr-evidence.mjs.
 *
 * Reads hydration jobs (entry, exportName, props, server html) as JSON on
 * stdin, installs jsdom globals BEFORE importing React or the dist (so
 * module-scope environment checks see a browser, matching how a bundler
 * loads the package client-side), hydrates each component over its server
 * HTML, and reports recoverable hydration errors + hydration console errors
 * as JSON on stdout.
 *
 * Browser-API stubs mirror the unit suite's vitest.setup.ts (matchMedia,
 * ResizeObserver, IntersectionObserver) so hydration evidence describes the
 * same environment the tests already prove rendering in.
 */
import { readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const { JSDOM } = await import("jsdom");
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://evidence.local/",
  pretendToBeVisual: true,
});

const { window } = dom;
globalThis.window = window;
globalThis.document = window.document;
globalThis.HTMLElement = window.HTMLElement;
globalThis.HTMLInputElement = window.HTMLInputElement;
globalThis.HTMLIFrameElement = window.HTMLIFrameElement;
globalThis.Element = window.Element;
globalThis.Node = window.Node;
globalThis.SVGElement = window.SVGElement;
globalThis.CustomEvent = window.CustomEvent;
globalThis.Event = window.Event;
globalThis.KeyboardEvent = window.KeyboardEvent;
globalThis.MouseEvent = window.MouseEvent;
globalThis.getComputedStyle = window.getComputedStyle;
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
globalThis.localStorage = window.localStorage;
globalThis.sessionStorage = window.sessionStorage;
if (!globalThis.navigator?.userAgent) {
  Object.defineProperty(globalThis, "navigator", {
    value: window.navigator,
    configurable: true,
  });
}

// Stubs mirroring vitest.setup.ts
window.matchMedia =
  window.matchMedia ??
  ((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
globalThis.matchMedia = window.matchMedia;
class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
globalThis.ResizeObserver = window.ResizeObserver = ObserverStub;
globalThis.IntersectionObserver = window.IntersectionObserver = ObserverStub;

const jobs = JSON.parse(readFileSync(0, "utf8"));

const { createElement } = await import("react");
const { hydrateRoot } = await import("react-dom/client");

const moduleCache = new Map();
async function entryModule(entry) {
  if (!moduleCache.has(entry)) {
    moduleCache.set(
      entry,
      await import(
        pathToFileURL(join(ROOT, "packages/react/dist", `${entry}.js`)).href
      ),
    );
  }
  return moduleCache.get(entry);
}

function stableMessage(value) {
  return String(value?.message ?? value ?? "unknown error")
    .split("\n")[0]
    .slice(0, 300);
}

const results = [];
for (const job of jobs) {
  const errors = [];
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const first = String(args[0] ?? "");
    // React hydration diagnostics arrive via console.error; anything else a
    // component logs during hydration is noise for this check.
    if (/hydrat/i.test(first)) errors.push(first.split("\n")[0].slice(0, 300));
  };
  try {
    const mod = await entryModule(job.entry);
    const Component = mod[job.exportName];
    // Fragment elements (td/tr/li/…) need a valid ancestor chain so the
    // parser context matches what the component renders; the chain comes
    // from the component's contract element.
    const outermost = window.document.createElement("div");
    let container = outermost;
    for (const tag of job.containerChain ?? []) {
      const level = window.document.createElement(tag);
      container.appendChild(level);
      container = level;
    }
    window.document.body.appendChild(outermost);
    container.innerHTML = job.html;
    const root = hydrateRoot(
      container,
      createElement(Component, job.props),
      {
        onRecoverableError: (error) => {
          errors.push(stableMessage(error));
        },
      },
    );
    // Let the hydration pass and first effects flush.
    await new Promise((resolveTick) => setTimeout(resolveTick, 25));
    root.unmount();
    outermost.remove();
  } catch (error) {
    errors.push(stableMessage(error));
  } finally {
    console.error = originalConsoleError;
  }
  results.push({
    entry: job.entry,
    exportName: job.exportName,
    errors: [...new Set(errors)].sort(),
  });
}

process.stdout.write(JSON.stringify(results));
// Leaked component timers (a known Tabs rAF leak) must not keep the worker
// alive after results are written.
process.exit(0);
