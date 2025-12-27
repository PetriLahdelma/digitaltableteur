"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useTranslation } from "react-i18next";

import Icon from "../Icon";
import Label from "../Label";
import Title from "../Title";
import { usePersistentTheme } from "../../hooks/usePersistentTheme";
import styles from "../../patterns/Header/MobileMenu.module.css";

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
  const currentLang = (
    i18n?.resolvedLanguage ||
    i18n?.language ||
    "en"
  ).split("-")[0];

  React.useEffect(() => {
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

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      id={id}
      onClick={() => onClose?.()}
    >
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.panelContent} tabIndex={-1}>
          <div className={styles.header} suppressHydrationWarning>
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

          <nav aria-label="Mobile navigation" suppressHydrationWarning>
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
                      suppressHydrationWarning
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.languageSticky} suppressHydrationWarning>
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
