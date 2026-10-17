"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";
import styles from "./SiteHeader.module.css";

/** Empty element at the bottom of the site header that SiteSubnav portals into. */
export const SITE_SUBNAV_SLOT_ID = "site-subnav-slot";

/** Phones only; from tablet up the in-flow bar is sticky on its own. */
const PHONE_QUERY = "(width < 768px)";
/** Scroll travel (px) in one direction before the bar shows or hides. */
const TRAVEL = 12;

export interface SiteSubnavProps {
  /** Classes for the bar (colours, border, layout); applied to both copies. */
  className?: string;
  children: ReactNode;
}

/**
 * Page-level nav bar (back link, previous and next) under the site header.
 *
 * Tablet and up: one in-flow bar, sticky below the header.
 *
 * Phones: the bar scrolls away with the page. Scrolling back up shows a
 * copy inside the site header, which slides away again on scroll down. The
 * copy lives in the header's own sticky layer: two stacked sticky layers
 * (header plus bar) snap to device pixels separately during iOS momentum
 * scrolling and the seam between them shimmers.
 */
export function SiteSubnav({ className, children }: SiteSubnavProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  // "handoff": hidden without a transition because the in-flow bar is back
  // exactly where the copy was.
  const [state, setState] = useState<"hidden" | "shown" | "handoff">("hidden");

  useEffect(() => {
    const query = window.matchMedia(PHONE_QUERY);
    const sync = () => {
      setSlot(
        query.matches ? document.getElementById(SITE_SUBNAV_SLOT_ID) : null,
      );
      if (!query.matches) setState("hidden");
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!slot) return;
    let lastY = window.scrollY;
    let travel = 0;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      const anchor = anchorRef.current;
      if (!anchor) return;
      // The slot's top edge is the header's bottom edge.
      const headerBottom = slot.getBoundingClientRect().top;
      const anchorRect = anchor.getBoundingClientRect();
      // In-flow bar fully back in place: the copy sits exactly over it, so
      // handing back is invisible.
      if (anchorRect.top >= headerBottom) {
        travel = 0;
        setState((current) => (current === "shown" ? "handoff" : current));
        return;
      }
      // Partly visible: keep whatever is showing.
      if (anchorRect.bottom > headerBottom) return;
      travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
      if (travel <= -TRAVEL) {
        setState("shown");
      } else if (
        travel >= TRAVEL &&
        !copyRef.current?.contains(document.activeElement)
      ) {
        setState("hidden");
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [slot]);

  return (
    <>
      <div
        ref={anchorRef}
        className={cn("relative z-30 tablet:sticky tablet:top-20", className)}
      >
        {children}
      </div>
      {slot &&
        createPortal(
          <div
            ref={copyRef}
            className={cn(styles.subnavCopy, className)}
            data-state={state}
            inert={state !== "shown"}
          >
            {children}
          </div>,
          slot,
        )}
    </>
  );
}

SiteSubnav.displayName = "SiteSubnav";
