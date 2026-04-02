"use client";

import React from "react";
import dynamic from "next/dynamic";

import { SiteHeader, SiteFooter, SkipLink } from "../../patterns/navigation";
import { PageTransition } from "../animations/PageTransition";
import styles from "../Layout/Layout.module.css";

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
        <SkipLink href="#main-content" />
        <SiteHeader />
        <main id="main-content" className={styles.main}>
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter />
        <ChatWidget />
      </div>
      <CookieConsentModal />
    </>
  );
}
