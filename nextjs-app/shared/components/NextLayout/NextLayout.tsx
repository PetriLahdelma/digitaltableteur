"use client";

import React from "react";
import dynamic from "next/dynamic";

import Footer from "../../patterns/Footer/Footer";
import styles from "../Layout/Layout.module.css";
import { NextHeader } from "../NextHeader/NextHeader";

const ChatWidget = dynamic(() => import("../ChatWidget/ChatWidget"), {
  ssr: false,
});
const CookieConsentModal = dynamic(
  () => import("../CookieConsent/CookieConsent"),
  { ssr: false },
);

export function NextLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
      </div>
      <CookieConsentModal />
    </>
  );
}
