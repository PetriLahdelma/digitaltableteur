import type { Metadata } from "next";

import { I18nProvider } from "../providers/I18nProvider";
import { NextThemeProvider } from "../providers/ThemeProvider";
import { NextLayout } from "../components/NextLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digitaltableteur",
  description: "Design Systems & AI-Powered DesignOps",
  metadataBase: new URL("https://digitaltableteur.com"),
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
