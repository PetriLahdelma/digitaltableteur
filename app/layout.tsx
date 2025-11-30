import type { Metadata } from "next";
import Script from "next/script";

import {
  getOrganizationSchema,
  getWebSiteSchema,
  stringifyJsonLd,
} from "./lib/structuredData";
import { I18nProvider } from "../providers/I18nProvider";
import { NextThemeProvider } from "../providers/ThemeProvider";
import { ToastProvider } from "../providers/ToastProvider";
import { NextLayout } from "../components/NextLayout";
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
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
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
            <ToastProvider>
              <NextLayout>{children}</NextLayout>
            </ToastProvider>
          </I18nProvider>
        </NextThemeProvider>
      </body>
    </html>
  );
}
