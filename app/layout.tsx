import React from "react";
import type { Metadata } from "next";
import Providers from "./providers";
import "../src/styles/variables.css";
import "./globals.css";
import Header from "../src/patterns/Header/Header";
import Footer from "../src/patterns/Footer/Footer";

export const metadata: Metadata = {
  title: "Digitaltableteur",
  description: "Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
