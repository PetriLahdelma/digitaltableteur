import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { type Theme } from "@dt/ThemeProvider";
import styles from "./MobileMenu.module.css";
import Title from "@dt/Title";
import { NavMenuList } from "@dt/index";
import Label from "@dt/Label";
import { usePersistentTheme } from "../../hooks/usePersistentTheme";
import Icon from "@dt/Icon";
import Button from "@dt/Button";

type MobileMenuProps = {
  isOpen: boolean;
  onClose?: () => void;
  onNavigate?: () => void;
  id?: string;
};

const themeIcons: Record<Theme, React.ReactNode> = {
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

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onNavigate,
  id,
}) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { theme, cycleTheme } = usePersistentTheme();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const panelId = id ?? "mobile-menu";

  const languages = React.useMemo(
    () => [
      { code: "en", label: t("langEN") },
      { code: "fi", label: t("langFI") },
      { code: "sv", label: t("langSV") },
    ],
    [t],
  );

  const currentLanguage = (
    i18n?.resolvedLanguage ||
    i18n?.language ||
    "en"
  ).split("-")[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setCookie("i18next", code);
    localStorage.setItem("i18nextLng", code);
  };

  const handleThemeToggle = () => {
    cycleTheme();
  };

  const handleNavigate = () => {
    onNavigate?.();
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

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
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
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

    if (!focusableElements || focusableElements.length === 0) {
      return;
    }

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

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className={styles.panel}
        id={panelId}
        aria-modal="true"
        role="dialog"
        aria-label={t("navMenuAccessibleLabel", "Main navigation")}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleTrapFocus}
        ref={panelRef}
      >
        <div
          className={styles.panelContent}
          ref={containerRef}
          tabIndex={-1}
          role="document"
        >
          <header className={styles.header}>
            <Title as="h2" size="S" terminals="sans" className={styles.title}>
              {t("navMenuTitle", "Menu")}
            </Title>
            <Button
              type="button"
              variant="tertiary"
              size="m"
              className={styles.closeButton}
              onClick={onClose}
              ref={closeButtonRef}
              accessibleName={t("navMenuClose", "Close navigation")}
              icon={<Icon name="x" ariaLabel="Close" size="lg" />}
            />
          </header>
          <nav aria-label={t("navMenuLinks", "Primary pages")}>
            <NavMenuList
              items={[
                { to: "/", label: t("navHome"), exact: true },
                { to: "/work", label: t("navWork") },
                { to: "/about", label: t("navAbout") },
                { to: "/pricing", label: t("navPricing") },
                { to: "/blog", label: t("navBlog") },
                { to: "/contact", label: t("navContact") },
              ]}
              onNavigate={handleNavigate}
              listClassName={styles.nav}
              itemClassName={styles.navLink}
              activeClassName={styles.navLinkActive}
            />
          </nav>
        </div>
        <footer className={styles.footer} aria-label={t("navLangSwitch")}>
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
                {languages.map((language) => (
                  <Button
                    key={language.code}
                    type="button"
                    variant="tertiary"
                    size="s"
                    onClick={() => handleLanguageChange(language.code)}
                    className={`${styles.languageButton} ${
                      currentLanguage === language.code
                        ? styles.languageButtonActive
                        : ""
                    }`.trim()}
                    aria-current={
                      currentLanguage === language.code ? "page" : undefined
                    }
                  >
                    {language.label}
                  </Button>
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
              <Button
                id="mobile-menu-theme-button"
                type="button"
                variant="tertiary"
                size="s"
                className={styles.themeIconButton}
                onClick={handleThemeToggle}
                accessibleName={t("navMenuThemeToggle", "Cycle theme")}
                icon={themeIcons[theme]}
              />
            </div>
          </div>
          <div className={styles.footerLinks}>
            <Link
              to="/privacy-policy-full"
              className={styles.footerLink}
              onClick={handleNavigate}
            >
              {t("navMenuCookiePolicy")}
            </Link>
            <Link
              to="/ai-use"
              className={styles.footerLink}
              onClick={handleNavigate}
            >
              {t("navMenuAiUsage")}
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MobileMenu;
