"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useTranslation } from "react-i18next";

import Icon from "@dt/Icon";
import Label from "@dt/Label";
import Title from "@dt/Title";
import { usePersistentTheme } from "../../shared/hooks/usePersistentTheme";
import styles from "../../shared/patterns/Header/MobileMenu.module.css";

type NavItem = { href: string; label: string; exact?: boolean };

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  onNavigate?: () => void;
  id?: string;
  navItems: NavItem[];
  languages: { code: string; label: string }[];
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
}: Props) {
  const { t, i18n } = useTranslation();
  const { theme, cycleTheme } = usePersistentTheme();
  const pathname = usePathname();
  const currentLang = i18n.language.split("-")[0];
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);

    const focusable =
      panelRef.current?.querySelector<HTMLElement>(
        [
          "button:not([disabled])",
          "[href]:not([tabindex='-1'])",
          "input:not([disabled]):not([tabindex='-1'])",
          "select:not([disabled]):not([tabindex='-1'])",
          "textarea:not([disabled]):not([tabindex='-1'])",
          "[tabindex]:not([tabindex='-1'])",
        ].join(","),
      ) ?? null;

    focusable?.focus();
    if (!focusable) {
      containerRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previous?.focus();
    };
  }, [isOpen, onClose]);

  const handleTrapFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;

    const focusableElements = panelRef.current?.querySelectorAll<HTMLElement>(
      [
        "button:not([disabled])",
        "[href]:not([tabindex='-1'])",
        "input:not([disabled]):not([tabindex='-1'])",
        "select:not([disabled]):not([tabindex='-1'])",
        "textarea:not([disabled]):not([tabindex='-1'])",
        "[tabindex]:not([tabindex='-1'])",
      ].join(","),
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    } else if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  };

  const accessibleLabel = t("navMenuAccessibleLabel", "Main navigation");

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={accessibleLabel}
      id={id}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleTrapFocus}
        ref={panelRef}
      >
        <div className={styles.panelContent} tabIndex={-1} ref={containerRef}>
          <div className={styles.header}>
            <Title size="S" level={2} className={styles.title}>
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

          <nav aria-label="Mobile navigation">
            <ul className={styles.nav}>
              {navItems.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                      onClick={() => {
                        onNavigate?.();
                        onClose?.();
                      }}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.languageSticky}>
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
                        onNavigate?.();
                      }}
                      className={`${styles.languageButton} ${
                        currentLang === lang.code
                          ? styles.languageButtonActive
                          : ""
                      }`.trim()}
                      aria-current={
                        currentLang === lang.code ? "true" : undefined
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
                href="/cookie-policy-full"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
