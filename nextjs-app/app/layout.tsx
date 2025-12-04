import type { Metadata } from "next";

import { I18nProvider } from "../../providers/I18nProvider";
import { NextThemeProvider } from "../providers/ThemeProvider";
import { CookieConsentProvider } from "../shared/lib/cookieConsent";
import { NextLayout } from "@dt/NextLayout";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://digitaltableteur.com";

export const metadata: Metadata = {
  title: "Digitaltableteur",
  description: "Design Systems & AI-Powered DesignOps",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Digitaltableteur — Design Systems & AI-Powered DesignOps",
    description:
      "Design systems, AI-native workflows, and product craft from Digitaltableteur.",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digitaltableteur — Design Systems & AI-Powered DesignOps",
    description:
      "Design systems, AI-native workflows, and product craft from Digitaltableteur.",
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
        <NextThemeProvider>
          <I18nProvider>
            <CookieConsentProvider>
              <NextLayout>{children}</NextLayout>
            </CookieConsentProvider>
          </I18nProvider>
        </NextThemeProvider>
      </body>
    </html>
  );
}
