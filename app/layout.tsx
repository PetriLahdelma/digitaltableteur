import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

import { fontVariables } from "./fonts";
import {
  getOrganizationSchema,
  getWebSiteSchema,
  stringifyJsonLd,
} from "./lib/structuredData";
import { I18nProvider } from "../providers/I18nProvider";
import { NextThemeProvider } from "../providers/ThemeProvider";
import { ToastProvider } from "../providers/ToastProvider";
import { AnimationProvider } from "../providers/AnimationProvider";
import { NextLinkProvider } from "../providers/NextLinkProvider";
import { NextImageProvider } from "../providers/NextImageProvider";
import { NextNavigationProvider } from "../providers/NextNavigationProvider";
import { SmoothScrollProvider } from "../providers/SmoothScrollProvider";
import { CookieConsentProvider } from "@/nextjs-app/shared/lib/cookieConsent";
import { NextLayout } from "@dt/NextLayout";
import { WebMcpProvider } from "../providers/WebMcpProvider";
import { HtmlLangSync } from "./components/HtmlLangSync";
import { DeferredAnalytics } from "./components/DeferredAnalytics";
import "@digitaltableteur/react/style.css";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.digitaltableteur.com";

/** Single GA4 property — env override for staging; production default is site measurement ID. */
const gaMeasurementId =
  process.env.NEXT_PUBLIC_GA_ID?.trim() || "G-09HMKEXGPX";

export const metadata: Metadata = {
  title: "Digitaltableteur",
  description:
    "Design consultancy and portfolio focused on design systems, AI-powered design workflows, DesignOps, accessibility, and product craft.",
  metadataBase: new URL(siteUrl),
  verification: {
    google: "ZWNygD_tzG8nCWZFlCNWKGCbTkDMFthbvF8L4zltpwE",
  },
  authors: [
    {
      name: "Petri Lahdelma",
      url: `${siteUrl}/about`,
    },
  ],
  creator: "Petri Lahdelma",
  publisher: "Digitaltableteur",
  keywords: [
    "design consultancy",
    "design systems",
    "AI-powered design",
    "DesignOps",
    "component libraries",
    "accessibility",
    "product design",
  ],
  alternates: {
    // No hreflang `languages` map: the site serves a single English URL tree
    // (translation is client-side only, no locale-segmented routes). Advertising
    // en/fi/sv alternates that all resolve to "/" is a misleading SEO signal, so
    // we emit only the canonical. Add real hreflang here if/when locale routes
    // (e.g. /fi, /sv) actually exist.
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Digitaltableteur — Design Systems & AI-Powered DesignOps",
    description:
      "Design consultancy, portfolio work, design systems, AI-native workflows, and accessibility-minded product craft from Digitaltableteur.",
    siteName: "Digitaltableteur",
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Digitaltableteur — Design Systems & AI-Powered DesignOps",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digitaltableteur — Design Systems & AI-Powered DesignOps",
    description:
      "Design consultancy, portfolio work, design systems, AI-native workflows, and accessibility-minded product craft from Digitaltableteur.",
    images: [`${siteUrl}/twitter-image`],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/*
         * Font Loading Strategy:
         * - next/font handles font preloading and optimization automatically
         * - Satoshi (local): single variable typeface for the whole site
         * - Exposed via --font-body; --font-heading follows it (all Satoshi)
         * - Syne removed: no separate heading face, no Google Fonts dependency
         *
         * No manual preload needed - next/font injects optimal preload tags
         */}
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {process.env.FIGMA_HTML_CAPTURE === "1" ? (
          <Script
            src="https://mcp.figma.com/mcp/html-to-design/capture.js"
            strategy="beforeInteractive"
          />
        ) : null}
        {/* GTM + GA4 (+ ahrefs) are consent- AND interaction-gated in
            <DeferredAnalytics> (rendered inside CookieConsentProvider) so they
            only load after the visitor grants the analytics category, and even
            then stay off the critical path / out of the Lighthouse/PSI trace. */}
      </head>
      <body suppressHydrationWarning>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NJ654G92"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: stringifyJsonLd(getOrganizationSchema()),
          }}
        />
        <script
          id="schema-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: stringifyJsonLd(
              getWebSiteSchema({ potentialActions: false }),
            ),
          }}
        />
        <Analytics />
        <WebMcpProvider>
          <NextThemeProvider>
            <NextLinkProvider>
              <NextImageProvider>
                <NextNavigationProvider>
                  <I18nProvider>
                    <HtmlLangSync />
                    <AnimationProvider>
                      <SmoothScrollProvider>
                        <ToastProvider>
                          <CookieConsentProvider autoShow={true}>
                            <DeferredAnalytics
                              gaMeasurementId={gaMeasurementId}
                            />
                            <NextLayout>{children}</NextLayout>
                          </CookieConsentProvider>
                        </ToastProvider>
                      </SmoothScrollProvider>
                    </AnimationProvider>
                  </I18nProvider>
                </NextNavigationProvider>
              </NextImageProvider>
            </NextLinkProvider>
          </NextThemeProvider>
        </WebMcpProvider>
      </body>
    </html>
  );
}
