"use client";

import React, {
  lazy,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { SiteHeader, SiteFooter, SkipLink } from "../../patterns/navigation";
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
