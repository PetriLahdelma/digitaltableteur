import type { Metadata } from "next";

import { I18nProvider } from "../providers/I18nProvider";
import { NextThemeProvider } from "../providers/ThemeProvider";
import { NextLayout } from "../components/NextLayout";
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
    sitemap: `${siteUrl}/sitemap.xml`,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Digitaltableteur — Design Systems & AI-Powered DesignOps",
    description: "Design systems, AI-native workflows, and product craft from Digitaltableteur.",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digitaltableteur — Design Systems & AI-Powered DesignOps",
    description: "Design systems, AI-native workflows, and product craft from Digitaltableteur.",
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
            {/* @ts-expect-error -- React version mismatch workaround */}
            <NextLayout>{children}</NextLayout>
          </I18nProvider>
        </NextThemeProvider>
      </body>
    </html>
  );
}
