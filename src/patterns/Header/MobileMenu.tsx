import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IoClose } from "react-icons/io5";
import { IoMoon, IoSunnySharp } from "react-icons/io5";
import { MdOutlineContrast } from "react-icons/md";
import { useTheme, type Theme } from "@dt/ThemeProvider";
import styles from "./MobileMenu.module.css";

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
        ref={containerRef}
        tabIndex={-1}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>
            {t("navMenuTitle", "Explore Digitaltableteur")}
          </h2>
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
          <ul className={styles.nav}>
            <li>
              <Link
                to="/"
                className={`${styles.navLink} ${
                  location.pathname === "/" ? styles.navLinkActive : ""
                }`.trim()}
                onClick={handleNavigate}
              >
                {t("navHome")}
              </Link>
            </li>
            <li>
              <Link
                to="/work"
                className={`${styles.navLink} ${
                  location.pathname.startsWith("/work")
                    ? styles.navLinkActive
                    : ""
                }`.trim()}
                onClick={handleNavigate}
              >
                {t("navWork")}
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={`${styles.navLink} ${
                  location.pathname.startsWith("/about")
                    ? styles.navLinkActive
                    : ""
                }`.trim()}
                onClick={handleNavigate}
              >
                {t("navAbout")}
              </Link>
            </li>
            <li>
              <Link
                to="/blog"
                className={`${styles.navLink} ${
                  location.pathname.startsWith("/blog")
                    ? styles.navLinkActive
                    : ""
                }`.trim()}
                onClick={handleNavigate}
              >
                {t("navBlog")}
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={`${styles.navLink} ${
                  location.pathname.startsWith("/contact")
                    ? styles.navLinkActive
                    : ""
                }`.trim()}
                onClick={handleNavigate}
              >
                {t("navContact")}
              </Link>
            </li>
          </ul>
        </nav>
        <section className={styles.segment} aria-label={t("navLangSwitch")}>
          <span className={styles.segmentLabel}>
            {t("navMenuLanguages", "Language")}
          </span>
          <div className={styles.languageList}>
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
        </section>
        <section className={styles.segment}>
          <span className={styles.segmentLabel}>
            {t("navMenuTheme", "Theme")}
          </span>
          <button
            type="button"
            className={styles.themeButton}
            onClick={handleThemeToggle}
            aria-label={t("toggleDarkMode")}
          >
            {themeIcons[theme]}
            <span>{t("navMenuThemeToggle", "Cycle theme")}</span>
          </button>
        </section>
      </div>
    </div>
  );
};

export default MobileMenu;
