import React from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IoClose } from "react-icons/io5";
import { IoMoon, IoSunnySharp } from "react-icons/io5";
import { MdOutlineContrast } from "react-icons/md";
import { useTheme, type Theme } from "@dt/ThemeProvider";
import styles from "./MobileMenu.module.css";
import Title from "@dt/Title";
import { NavMenuList } from "@dt/index";
import Label from "@dt/Label";

type MobileMenuProps = {
  isOpen: boolean;
  onClose?: () => void;
  onNavigate?: () => void;
};

const THEME_SEQUENCE: Theme[] = ["light", "dark", "hcb", "hcw"];

const themeIcons: Record<Theme, React.ReactNode> = {
  light: <IoSunnySharp className={styles.themeButtonIcon} />,
  dark: <IoMoon className={styles.themeButtonIcon} />,
  hcb: <MdOutlineContrast className={styles.themeButtonIcon} />,
  hcw: <MdOutlineContrast className={styles.themeButtonIcon} />,
};

const setCookie = (name: string, value: string, days = 365) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

const getNextTheme = (current: Theme) => {
  const index = THEME_SEQUENCE.indexOf(current);
  return THEME_SEQUENCE[(index + 1) % THEME_SEQUENCE.length];
};

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const languages = React.useMemo(
    () => [
      { code: "en", label: t("langEN") },
      { code: "fi", label: t("langFI") },
      { code: "sv", label: t("langSV") },
    ],
    [t],
  );

  const currentLanguage = i18n.language.split("-")[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setCookie("i18next", code);
    localStorage.setItem("i18nextLng", code);
    onNavigate?.();
  };

  const handleThemeToggle = () => {
    const nextTheme = getNextTheme(theme);
    setCookie("dt_theme", nextTheme);
    setTheme(nextTheme);
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

    const node = containerRef.current;
    node?.focus();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.backdrop} role="presentation">
      <div
        className={styles.panel}
        aria-modal="true"
        role="dialog"
        aria-label={t("navMenuAccessibleLabel", "Main navigation")}
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
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label={t("navMenuClose", "Close navigation")}
            >
              <IoClose size="1.25rem" />
            </button>
          </header>
          <nav aria-label={t("navMenuLinks", "Primary pages")}>
            <NavMenuList
              items={[
                { to: "/", label: t("navHome"), exact: true },
                { to: "/work", label: t("navWork") },
                { to: "/about", label: t("navAbout") },
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
                  <button
                    key={language.code}
                    type="button"
                    onClick={() => handleLanguageChange(language.code)}
                    className={`${styles.languageButton} ${
                      currentLanguage === language.code
                        ? styles.languageButtonActive
                        : ""
                    }`.trim()}
                    aria-current={
                      currentLanguage === language.code ? "true" : undefined
                    }
                  >
                    {language.label}
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
                onClick={handleThemeToggle}
                aria-label={t("navMenuThemeToggle", "Cycle theme")}
              >
                {themeIcons[theme]}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MobileMenu;
