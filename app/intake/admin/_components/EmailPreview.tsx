"use client";

import { useEffect, useRef } from "react";

/**
 * The invite email rendered exactly as sent. The intake CSP forbids frames,
 * so the email's own HTML and styles go into a shadow root, where they cannot
 * leak into the page or take its styles. The HTML is the server's escaped
 * output (mail-html.ts), never raw input.
 */
export function EmailPreview({ html, title }: { html: string; title: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const root = element.shadowRoot ?? element.attachShadow({ mode: "open" });
    root.innerHTML = html;
  }, [html]);
  return <div ref={host} role="document" aria-label={title} />;
}
