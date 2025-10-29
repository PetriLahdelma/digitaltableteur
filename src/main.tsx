import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ThemeProvider } from "@dt/ThemeProvider";
import { HelmetProvider } from "react-helmet-async";
import { initI18n } from "./i18n";

const redirectPath = sessionStorage.getItem("redirectPath");
if (redirectPath) {
  history.replaceState(null, "", redirectPath);
  sessionStorage.removeItem("redirectPath");
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

initI18n().then(() => {
  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
  );
  root.render(
    <React.StrictMode>
      <HelmetProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </HelmetProvider>
    </React.StrictMode>,
  );
});

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

declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}
