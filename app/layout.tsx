import type { Metadata } from "next";
import Script from "next/script";

import { fontVariables } from "./fonts";
import {
  getOrganizationSchema,
  getWebSiteSchema,
  stringifyJsonLd,
} from "./lib/structuredData";
import { I18nProvider } from "../providers/I18nProvider";
import { NextThemeProvider } from "../providers/ThemeProvider";
import { ToastProvider } from "../providers/ToastProvider";
import { CookieConsentProvider } from "@/nextjs-app/shared/lib/cookieConsent";
import { NextLayout } from "@dt/NextLayout";
import { HtmlLangSync } from "./components/HtmlLangSync";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.digitaltableteur.com";

export const metadata: Metadata = {
  title: "Digitaltableteur",
  description: "Design Systems & AI-Powered DesignOps",
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
      "Design systems, AI-native workflows, and product craft from Digitaltableteur.",
    siteName: "Digitaltableteur",
    images: [
      {
        url: `${siteUrl}/logo512.png`,
        width: 512,
        height: 512,
        alt: "Digitaltableteur Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digitaltableteur — Design Systems & AI-Powered DesignOps",
    description:
      "Design systems, AI-native workflows, and product craft from Digitaltableteur.",
    images: [`${siteUrl}/logo512.png`],
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
        <Script id="gtm-base" strategy="beforeInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-NJ654G92');
          `}
        </Script>
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="iO1vJe+oY/MXihktNC/upw"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-09HMKEXGPX"
          strategy="afterInteractive"
        />
        <Script id="gtag-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-09HMKEXGPX');
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
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <>
            <Script
              id="gtag-src"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        ) : null}
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: stringifyJsonLd(getOrganizationSchema()),
          }}
        />
        <Script
          id="schema-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: stringifyJsonLd(
              getWebSiteSchema({ potentialActions: false }),
            ),
          }}
        />
        <NextThemeProvider>
          <I18nProvider>
            <HtmlLangSync />
            <ToastProvider>
              <CookieConsentProvider autoShow={true}>
                <NextLayout>{children}</NextLayout>
              </CookieConsentProvider>
            </ToastProvider>
          </I18nProvider>
        </NextThemeProvider>
      </body>
    </html>
  );
}
