"use client";

import React from "react";
import dynamic from "next/dynamic";

import { SiteHeader, SiteFooter, SkipLink } from "../../patterns/navigation";
import { PageTransition } from "../animations/PageTransition";
import { DonnyActionProvider } from "../DonnyActionProvider";
import styles from "./NextLayout.module.css";

const ChatWidget = dynamic(() => import("../ChatWidget/ChatWidget"), {
  ssr: false,
});
const CookieConsentModal = dynamic(
  () => import("../CookieConsent/CookieConsent"),
  { ssr: false },
);


/** Props for NextLayout. */
export interface NextLayoutProps {
  /** Additional class names on the layout wrapper. */
  className?: string;
  children: React.ReactNode;
}

/**
 * NextLayout component.
 */
export function NextLayout({ children, className }: NextLayoutProps) {
  return (
    <>
      <DonnyActionProvider>
        <div
          className={
            className ? `${styles.layout} ${className}` : styles.layout
          }
        >
          <SkipLink href="#main-content" />
          <SiteHeader />
          <main id="main-content" className={styles.main}>
            <PageTransition>{children}</PageTransition>
          </main>
          <SiteFooter />
          <ChatWidget />
        </div>
      </DonnyActionProvider>
      <CookieConsentModal />
    </>
  );
}
