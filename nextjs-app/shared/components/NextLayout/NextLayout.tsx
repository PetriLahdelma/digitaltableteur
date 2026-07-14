"use client";

import React, {
  lazy,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { SiteHeader, SiteFooter, SkipLink } from "../../patterns/navigation";
import { useTranslate } from "../../lib/translation";
import { PageTransition } from "../animations/PageTransition";
import { DonnyActionProvider } from "../DonnyActionProvider";
import styles from "./NextLayout.module.css";

const ChatWidget = lazy(() => import("../ChatWidget/ChatWidget"));
const CookieConsentModal = lazy(() => import("../CookieConsent/CookieConsent"));

function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <Suspense fallback={null}>{children}</Suspense>;
}


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
  // The skip link is the first focusable element on every page, so it must
  // speak the visitor's language (EN/FI/SV) rather than the SkipLink default.
  const t = useTranslate();
  return (
    <>
      <DonnyActionProvider>
        <div
          className={
            className ? `${styles.layout} ${className}` : styles.layout
          }
        >
          <SkipLink href="#main-content">
            {t("skipToMainContent", "Skip to main content")}
          </SkipLink>
          <SiteHeader />
          {/* tabIndex=-1 makes the skip-link target programmatically
              focusable, so activating the skip link moves focus INTO main
              (not just scrolls). Without it the browser leaves focus on
              <body> and the next Tab restarts from the header — defeating
              the skip link (WCAG 2.4.1). */}
          <main id="main-content" tabIndex={-1} className={styles.main}>
            <PageTransition>{children}</PageTransition>
          </main>
          <SiteFooter />
          <ClientOnly>
            <ChatWidget />
          </ClientOnly>
        </div>
      </DonnyActionProvider>
      <ClientOnly>
        <CookieConsentModal />
      </ClientOnly>
    </>
  );
}
