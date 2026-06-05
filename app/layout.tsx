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
import { SmoothScrollProvider } from "../providers/SmoothScrollProvider";
import { CookieConsentProvider } from "@/nextjs-app/shared/lib/cookieConsent";
import { ToasterProvider } from "@/nextjs-app/shared/components/interactive";
import { NextLayout } from "@dt/NextLayout";
import { WebMcpProvider } from "../providers/WebMcpProvider";
import { HtmlLangSync } from "./components/HtmlLangSync";
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
    canonical: "/",
    languages: {
      en: "/",
      fi: "/",
      sv: "/",
    },
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
         * - Syne (Google Fonts): Subset to latin, display: swap
         * - Satoshi (local): Variable font with display: swap
         * - Both fonts use CSS custom properties: --font-heading, --font-body
         *
         * No manual preload needed - next/font injects optimal preload tags
         */}
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {process.env.FIGMA_HTML_CAPTURE === "1" ? (
          <Script
            src="https://mcp.figma.com/mcp/html-to-design/capture.js"
            strategy="beforeInteractive"
          />
        ) : null}
        {/* GTM uses afterInteractive to avoid blocking LCP */}
        <Script id="gtm-base" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-NJ654G92');
          `}
        </Script>
        {process.env.NODE_ENV === "production" ? (
          <Script
            src="https://analytics.ahrefs.com/analytics.js"
            data-key="iO1vJe+oY/MXihktNC/upw"
            strategy="afterInteractive"
          />
        ) : null}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}');
          `}
        </Script>
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
            <I18nProvider>
              <HtmlLangSync />
              <AnimationProvider>
                <SmoothScrollProvider>
                  <ToastProvider>
                    <ToasterProvider position="bottom-right">
                      <CookieConsentProvider autoShow={true}>
                        <NextLayout>{children}</NextLayout>
                      </CookieConsentProvider>
                    </ToasterProvider>
                  </ToastProvider>
                </SmoothScrollProvider>
              </AnimationProvider>
            </I18nProvider>
          </NextThemeProvider>
        </WebMcpProvider>
      </body>
    </html>
  );
}
