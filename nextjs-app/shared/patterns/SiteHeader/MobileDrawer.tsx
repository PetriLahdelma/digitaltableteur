"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { NavLink } from "@/nextjs-app/shared/components/NavLink";
import { IconButton } from "@/nextjs-app/shared/components/IconButton";
import { X, Sun, Moon, CircleHalf } from "@phosphor-icons/react";
import styles from "./SiteHeader.module.css";
import type { NavItem } from "./SiteHeader";
import type { Theme } from "@dt/ThemeProvider";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  currentLang: string;
  onLanguageChange: (code: string) => void;
  onThemeToggle: () => void;
  theme: Theme;
}

const themeIcons: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  hcb: CircleHalf,
  hcw: CircleHalf,
};

export function MobileDrawer({
  isOpen,
  onClose,
  navItems,
  currentLang,
  onLanguageChange,
  onThemeToggle,
  theme,
}: MobileDrawerProps) {
  const { t } = useTranslation();
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const ThemeIcon = themeIcons[theme];

  // Focus management: trap focus inside drawer, restore on close
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;

    // Store the currently focused element (hamburger button) to restore focus on close
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Find the main content container and set inert to prevent focus escape
    const mainContent =
      document.getElementById("main-content") ||
      document.getElementById("__next") ||
      document.querySelector("main") ||
      document.body.firstElementChild;

    if (mainContent && mainContent !== document.body) {
      mainContent.setAttribute("inert", "");
    }

    // Focus the close button after drawer opens (first focusable element)
    const focusCloseButton = () => {
      closeButtonRef.current?.focus();
    };

    // Use requestAnimationFrame to ensure DOM is ready after animation
    requestAnimationFrame(focusCloseButton);

    return () => {
      // Remove inert from main content
      if (mainContent && mainContent !== document.body) {
        mainContent.removeAttribute("inert");
      }
      // Restore focus to the element that opened the drawer (hamburger button)
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  // GSAP animations
  useEffect(() => {
    if (!isOpen) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        // Skip animations for reduced motion
        gsap.set(backdropRef.current, { opacity: 1 });
        gsap.set(panelRef.current, { x: "0%" });
        gsap.set("[data-nav-item]", { opacity: 1, x: 0 });
      } else {
        // Backdrop fade in
        gsap.fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.2 }
        );

        // Panel slide in
        gsap.fromTo(
          panelRef.current,
          { x: "100%" },
          { x: "0%", duration: 0.3, ease: "power2.out" }
        );

        // Stagger nav items
        gsap.fromTo(
          "[data-nav-item]",
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.2, stagger: 0.05, delay: 0.15 }
        );
      }
    });

    return () => ctx.revert();
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 bg-black/50 lg:hidden"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-[280px] max-w-[80vw] bg-background border-l border-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("navMenuAccessibleLabel")}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-heading text-title-s font-semibold">
            {t("navMenuTitle", "Menu")}
          </span>
          <IconButton
            ref={closeButtonRef}
            icon={<X weight="bold" className="size-5" />}
            label={t("navMenuClose")}
            onClick={onClose}
            variant="ghost"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4" aria-label={t("navMenuLinks")}>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href} data-nav-item>
                <NavLink
                  href={item.href}
                  exact={item.exact}
                  className="block py-3 px-4 rounded-md text-title-s font-medium hover:bg-muted"
                  activeClassName="bg-muted text-foreground"
                  inactiveClassName="text-muted-foreground"
                >
                  {t(item.label)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Controls */}
        <div className="p-4 border-t border-border space-y-4">
          {/* Language */}
          <div>
            <span className="block font-body text-text-s text-muted-foreground mb-2">
              {t("navMenuLanguages")}
            </span>
            <div className="flex gap-2">
              {[
                { code: "en", ariaLabel: t("langEN_ariaLabel") },
                { code: "fi", ariaLabel: t("langFI_ariaLabel") },
                { code: "sv", ariaLabel: t("langSV_ariaLabel") },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  aria-label={`${lang.code.toUpperCase()} — ${lang.ariaLabel}`}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-md text-text-m font-body uppercase transition-colors",
                    currentLang === lang.code
                      ? "bg-foreground text-background font-medium"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {lang.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between">
            <span className="font-body text-text-s text-muted-foreground">
              {t("navMenuTheme")}
            </span>
            <IconButton
              icon={
                <span
                  className={styles.themeIcon}
                  data-theme={theme}
                  aria-hidden
                >
                  <ThemeIcon weight="bold" className="size-5" />
                </span>
              }
              label={t("navMenuThemeToggle")}
              onClick={onThemeToggle}
              variant="outline"
            />
          </div>

          {/* Legal Links */}
          <div className="flex gap-4 pt-2">
            <Link
              href="/privacy-policy"
              className="font-body text-text-s text-muted-foreground hover:text-foreground"
            >
              {t("navMenuCookiePolicy")}
            </Link>
            <Link
              href="/ai-use"
              className="font-body text-text-s text-muted-foreground hover:text-foreground"
            >
              {t("navMenuAiUsage")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
