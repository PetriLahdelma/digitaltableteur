"use client";

import React from "react";

import CookieConsent from "@/shared/components/CookieConsent/CookieConsent";
import ChatWidget from "@/shared/components/ChatWidget/ChatWidget";
import Footer from "@/shared/patterns/Footer/Footer";
import styles from "@/shared/components/Layout/Layout.module.css";
import { NextHeader } from "./NextHeader";

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
      <CookieConsent />
    </div>
  );
}
