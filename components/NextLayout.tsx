"use client";

import React from "react";
import dynamic from "next/dynamic";

import CookieConsent from "@/shared/components/CookieConsent/CookieConsent";
import Footer from "@/shared/patterns/Footer/Footer";
import styles from "@/shared/components/Layout/Layout.module.css";
import { NextHeader } from "./NextHeader";

const ChatWidget = dynamic(
  () => import("@/shared/components/ChatWidget/ChatWidget"),
  { ssr: false },
);
const CookieConsentIsland = dynamic(
  () => import("@/shared/components/CookieConsent/CookieConsent"),
  { ssr: false },
);

export function NextLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <a href="#main" className={styles.skipLink}>
        Skip to main content
      </a>
      <NextHeader />
      <main id="main" className={styles.main}>
        {children}
      </main>
      <Footer />
      <ChatWidget />
      <CookieConsentIsland />
    </div>
  );
}
