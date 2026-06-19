"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { gsap } from "@/nextjs-app/shared/lib/gsap";
import { useAnimationContext } from "@/providers/AnimationProvider";
import Icon from "../Icon";
import Label from "../Label";
import Title from "../Title";
import { usePersistentTheme } from "../../hooks/usePersistentTheme";
import styles from "../../patterns/Header/MobileMenu.module.css";

export type NavItem = { href: string; label: string; exact?: boolean };

export interface NextMobileMenuProps {
  isOpen: boolean;
  onClose?: () => void;
  onNavigate?: () => void;
  id?: string;
  navItems: NavItem[];
  languages: { code: string; label: string; ariaLabel: string }[];
};

const themeIcons: Record<string, React.ReactNode> = {
  light: (
    <Icon
      name="sun"
      className={styles.themeButtonIcon}
      ariaLabel="Light theme"
    />
  ),
  dark: (
    <Icon
      name="moon"
      className={styles.themeButtonIcon}
      ariaLabel="Dark theme"
    />
  ),
  hcb: (
    <Icon
      name="circle-half"
      className={styles.themeButtonIcon}
      ariaLabel="High contrast dark"
    />
  ),
  hcw: (
    <Icon
      name="circle-half"
      className={styles.themeButtonIcon}
      ariaLabel="High contrast light"
    />
  ),
};

const setCookie = (name: string, value: string, days = 365) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

export function NextMobileMenu({
  isOpen,
  onClose,
  onNavigate,
  id,
  navItems,
  languages,
}: NextMobileMenuProps) {
  const { t, i18n } = useTranslation();
  const { theme, cycleTheme } = usePersistentTheme();
  const pathname = usePathname() ?? "";
  const currentLang = (
    i18n?.resolvedLanguage ||
    i18n?.language ||
    "en"
  ).split("-")[0];

  const { motionPreference } = useAnimationContext();
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isFirstRender = useRef(true);

  // Build GSAP timeline (once, paused)
  useEffect(() => {
    if (motionPreference === "reduced") {
      tlRef.current = null;
      return;
    }

    if (
      !backdropRef.current ||
      !panelRef.current ||
      !navRef.current ||
      !controlsRef.current
    )
      return;

    const tl = gsap.timeline({ paused: true });

    tl.fromTo(
      backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.2, ease: "power2.out" }
    )
      .fromTo(
        panelRef.current,
        { x: "100%" },
        { x: "0%", duration: 0.35, ease: "power3.out" },
        0.05
      )
      .fromTo(
        navRef.current.children,
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.06,
          ease: "power2.out",
        },
        0.2
      )
      .fromTo(
        controlsRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 },
        "-=0.1"
      );

    tlRef.current = tl;

    return () => {
      tl.kill();
      tlRef.current = null;
    };
    // Re-build timeline if navItems length changes (different stagger targets)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionPreference, navItems.length]);

  // Play / reverse based on isOpen
  useEffect(() => {
    const backdrop = backdropRef.current;
    if (!backdrop) return;

    // On first render, just set initial hidden state — don't animate
    if (isFirstRender.current) {
      isFirstRender.current = false;
      backdrop.style.visibility = "hidden";
      backdrop.style.pointerEvents = "none";
      return;
    }

    // Reduced motion — instant toggle
    if (!tlRef.current) {
      backdrop.style.visibility = isOpen ? "visible" : "hidden";
      backdrop.style.pointerEvents = isOpen ? "auto" : "none";
      // Reset transforms for reduced motion so content is visible when open
      if (panelRef.current) {
        panelRef.current.style.transform = "none";
        panelRef.current.style.opacity = "1";
      }
      return;
    }

    if (isOpen) {
      backdrop.style.visibility = "visible";
      backdrop.style.pointerEvents = "auto";
      tlRef.current.timeScale(1).play(0);
    } else {
      // Reverse at slightly faster speed
      tlRef.current.timeScale(1.4).reverse();
      const reverseDuration = tlRef.current.duration() / 1.4;
      gsap.delayedCall(reverseDuration, () => {
        if (!isOpen && backdropRef.current) {
          backdropRef.current.style.visibility = "hidden";
          backdropRef.current.style.pointerEvents = "none";
        }
      });
    }
  }, [isOpen]);

  // Escape key and focus management (only when open)
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previous?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={backdropRef}
      className={styles.backdrop}
      role={isOpen ? "dialog" : undefined}
      aria-modal={isOpen ? "true" : undefined}
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
      id={id}
      onClick={() => onClose?.()}
    >
      <div
        ref={panelRef}
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.panelContent} tabIndex={-1}>
          <div className={styles.header} suppressHydrationWarning>
            <Title size="s" level={2} className={styles.title}>
              {t("navMenuTitle")}
            </Title>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => onClose?.()}
              aria-label={t("navMenuClose", "Close navigation")}
            >
              <Icon
                name="x"
                ariaLabel={t("navMenuClose", "Close navigation")}
              />
            </button>
          </div>

          <nav aria-label="Mobile navigation" suppressHydrationWarning>
            <ul ref={navRef} className={styles.nav}>
              {navItems.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                      aria-current={active ? "page" : undefined}
                      onClick={() => {
                        onNavigate?.();
                        onClose?.();
                      }}
                      suppressHydrationWarning
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            ref={controlsRef}
            className={styles.languageSticky}
            suppressHydrationWarning
          >
            <div className={styles.bottomControlsRow}>
              <div className={styles.bottomLeftGroup}>
                <Label
                  htmlFor="mobile-menu-language-list"
                  className={styles.segmentLabel}
                >
                  {t("navMenuLanguages", "Language")}
                </Label>
                <div
                  id="mobile-menu-language-list"
                  className={styles.languageList}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        setCookie("i18next", lang.code);
                        localStorage.setItem("i18nextLng", lang.code);
                      }}
                      className={`${styles.languageButton} ${
                        currentLang === lang.code
                          ? styles.languageButtonActive
                          : ""
                      }`.trim()}
                      aria-label={lang.ariaLabel}
                      aria-current={
                        currentLang === lang.code ? "page" : undefined
                      }
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.bottomRightGroup}>
                <Label
                  htmlFor="mobile-menu-theme-button"
                  className={styles.segmentLabel}
                >
                  {t("navMenuTheme", "Theme")}
                </Label>
                <button
                  id="mobile-menu-theme-button"
                  type="button"
                  className={styles.themeIconButton}
                  onClick={() => cycleTheme()}
                  aria-label={t("navMenuThemeToggle", "Cycle theme")}
                >
                  {themeIcons[theme]}
                </button>
              </div>
            </div>
            <div className={styles.footerLinks}>
              <Link
                href="/privacy-policy"
                className={styles.footerLink}
                onClick={() => {
                  onNavigate?.();
                  onClose?.();
                }}
              >
                {t("navMenuCookiePolicy")}
              </Link>
              <Link
                href="/ai-use"
                className={styles.footerLink}
                onClick={() => {
                  onNavigate?.();
                  onClose?.();
                }}
              >
                {t("navMenuAiUsage")}
              </Link>
              <Link
                href="/accessibility"
                className={styles.footerLink}
                onClick={() => {
                  onNavigate?.();
                  onClose?.();
                }}
              >
                {t("navMenuAccessibility")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
