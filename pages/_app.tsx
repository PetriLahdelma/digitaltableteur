import React from "react";
import type { AppProps } from "next/app";
import "../src/index.css";
import { ThemeProvider } from "@dt/ThemeProvider";
import { HelmetProvider } from "react-helmet-async";
import { useEffect, useState } from "react";
import { initI18n } from "../src/i18n";

function MyApp({ Component, pageProps }: AppProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setReady(true));
  }, []);

  useEffect(() => {
    const redirectPath = sessionStorage.getItem("redirectPath");
    if (redirectPath) {
      history.replaceState(null, "", redirectPath);
      sessionStorage.removeItem("redirectPath");
    }
  }, []);

  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (gaId) {
      const gtagScript = document.createElement("script");
      gtagScript.async = true;
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(gtagScript);

      const inlineScript = document.createElement("script");
      inlineScript.innerHTML = `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${gaId}');`;
      document.head.appendChild(inlineScript);
    }
  }, []);

  if (!ready) return null;

  return (
    <HelmetProvider>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default MyApp;
