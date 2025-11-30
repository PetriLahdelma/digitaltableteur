import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ThemeProvider } from "@dt/ThemeProvider";
import { HelmetProvider } from "react-helmet-async";
import i18n from "./i18n"; // Use default export - already initialized
import * as Sentry from "@sentry/react";

const redirectPath = sessionStorage.getItem("redirectPath");
if (redirectPath) {
  history.replaceState(null, "", redirectPath);
  sessionStorage.removeItem("redirectPath");
}

// Initialize Sentry (only if DSN provided)
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    // Sample a small percentage of traces by default; can tune via env var
    tracesSampleRate: Number(
      import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || 0.05,
    ),
    release: (window as any).__DT_RELEASE__ || undefined,
  });
}

// Use Vite's environment variable style
const gaId = import.meta.env.VITE_GA_ID;
if (gaId) {
  const gtagScript = document.createElement("script");
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(gtagScript);

  const inlineScript = document.createElement("script");
  inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}');
  `;
  document.head.appendChild(inlineScript);
}

// i18n is now synchronously initialized, so we can render immediately
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        {sentryDsn ? (
          <Sentry.ErrorBoundary fallback={<p>Something went wrong.</p>}>
            <App />
          </Sentry.ErrorBoundary>
        ) : (
          <App />
        )}
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>,
);

// Temporary: unregister any previously installed service workers and clear caches.
// This helps clients that have an old service worker still active after deploys.
// It only runs in non-localhost environments to avoid disturbing dev setup.
if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => {
        regs.forEach((reg) => {
          try {
            reg.unregister();
          } catch (e) {
            // swallow errors - best effort unregister
          }
        });
      })
      .catch(() => undefined);
  }

  // Also try clearing caches (best-effort). Some browsers may restrict this.
  if (typeof caches !== "undefined") {
    caches
      .keys()
      .then((names) => Promise.all(names.map((n) => caches.delete(n))))
      .catch(() => undefined);
  }
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Narrow augmentation: avoid overriding built-in Vite typing; extend only when key exists
declare global {
  interface ImportMetaEnv {
    readonly VITE_GA_ID?: string;
    readonly VITE_SENTRY_DSN?: string;
    readonly VITE_SENTRY_TRACES_SAMPLE_RATE?: string;
  }
}
