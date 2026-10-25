"use client";

import React from "react";
import {
  isChunkLoadError,
  readDocumentAttributes,
  readSsrSnapshot,
  useReloadWhenReachable,
  useRestoreDocumentAttributes,
} from "./lib/ssr-snapshot";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // A chunk that failed to download (a dropped connection) is not a broken
  // page: put the server-rendered document back and reload once the site
  // answers. Read once, before React replaces the DOM.
  const [snapshot] = React.useState(() => readSsrSnapshot(error));
  const [attributes] = React.useState(() =>
    snapshot ? readDocumentAttributes() : null,
  );
  useRestoreDocumentAttributes(attributes);
  useReloadWhenReachable(isChunkLoadError(error));

  if (snapshot) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: snapshot.body }}
        />
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>Something went wrong!</h2>
          <p style={{ marginBottom: "1.5rem", color: "#666" }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#dfff00",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
