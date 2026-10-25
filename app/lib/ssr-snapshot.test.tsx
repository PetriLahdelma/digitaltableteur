import React from "react";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import en from "@/nextjs-app/shared/locales/en/translation.json";
import ErrorPage from "../error";
import GlobalError from "../global-error";
import { isChunkLoadError, readSsrSnapshot } from "./ssr-snapshot";
import { SSR_SNAPSHOT_SCRIPT } from "./ssr-snapshot-script";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => (en as Record<string, string>)[key] ?? `MISSING:${key}`,
  }),
}));

function chunkError() {
  const error = new Error(
    "Failed to load chunk /_next/static/chunks/35sexg62hyh0o.js from module 197148",
  );
  error.name = "ChunkLoadError";
  return error;
}

function setSnapshot(path = window.location.pathname + window.location.search) {
  window.__DT_SSR_SNAPSHOT__ = {
    path,
    body: '<div id="restored-body"><h1>Server page</h1></div>',
    page: '<section id="restored-page"><h1>Server segment</h1></section>',
  };
}

afterEach(() => {
  delete window.__DT_SSR_SNAPSHOT__;
  document.body.innerHTML = "";
});

describe("isChunkLoadError", () => {
  it("recognises chunk failures from Turbopack, webpack and the browsers", () => {
    expect(isChunkLoadError(chunkError())).toBe(true);
    for (const message of [
      "Loading chunk 123 failed.",
      "Loading CSS chunk app-layout failed.",
      "Failed to fetch dynamically imported module: https://x/y.js",
      "Importing a module script failed.",
      "error loading dynamically imported module",
    ]) {
      expect(isChunkLoadError(new Error(message))).toBe(true);
    }
  });

  it("leaves genuine errors alone", () => {
    expect(isChunkLoadError(new TypeError("x is undefined"))).toBe(false);
    expect(isChunkLoadError(new Error("Hydration failed"))).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
  });
});

describe("readSsrSnapshot", () => {
  it("returns the snapshot for a chunk error on the page it was taken from", () => {
    setSnapshot();
    expect(readSsrSnapshot(chunkError())?.page).toContain("Server segment");
  });

  it("returns nothing for other errors", () => {
    setSnapshot();
    expect(readSsrSnapshot(new TypeError("boom"))).toBeNull();
  });

  it("returns nothing after a client-side navigation to another page", () => {
    setSnapshot("/somewhere-else");
    expect(readSsrSnapshot(chunkError())).toBeNull();
  });
});

describe("SSR_SNAPSHOT_SCRIPT", () => {
  it("saves the body and page segment without scripts", () => {
    document.body.innerHTML =
      '<header>Header</header><main id="main-content"><div><h1>Page</h1><script>window.x=1</script></div></main><script>self.__next_f=[]</script>';
    new Function(SSR_SNAPSHOT_SCRIPT)();
    const snapshot = window.__DT_SSR_SNAPSHOT__;
    expect(snapshot?.path).toBe(window.location.pathname + window.location.search);
    expect(snapshot?.body).toContain("<header>Header</header>");
    expect(snapshot?.body).not.toContain("<script");
    expect(snapshot?.page).toContain("<h1>Page</h1>");
  });
});

describe("app/error.tsx", () => {
  it("restores the server-rendered segment when a chunk failed to load", () => {
    setSnapshot();
    render(<ErrorPage error={chunkError()} reset={vi.fn()} />);
    expect(document.getElementById("restored-page")).not.toBeNull();
    expect(screen.queryByText(/something went wrong/i)).toBeNull();
  });

  it("still shows the error UI for a genuine error", () => {
    setSnapshot();
    render(<ErrorPage error={new TypeError("boom")} reset={vi.fn()} />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(document.getElementById("restored-page")).toBeNull();
  });
});

describe("app/global-error.tsx", () => {
  it("restores the server-rendered body when a chunk failed to load", () => {
    setSnapshot();
    const html = renderToStaticMarkup(
      <GlobalError error={chunkError()} reset={vi.fn()} />,
    );
    expect(html).toContain('id="restored-body"');
    expect(html).not.toContain("Something went wrong");
  });

  it("still shows the error screen for a genuine error", () => {
    setSnapshot();
    const html = renderToStaticMarkup(
      <GlobalError error={new TypeError("boom")} reset={vi.fn()} />,
    );
    expect(html).toContain("Something went wrong");
    expect(html).not.toContain("restored-body");
  });
});
