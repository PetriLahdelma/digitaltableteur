import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import "../../styles/variables.css";
import "../../styles/fonts.css";
import Logo from "../../assets/images/01jy60fd46fxwvk450w70bmyzm_1750401080.webp";
import LogoOutline from "../../../public/dt-outline.svg";
import { type Theme } from "@dt/ThemeProvider";
import { useTranslation } from "react-i18next";
import { usePersistentTheme } from "../../hooks/usePersistentTheme";
import Icon from "@dt/Icon";
import MobileMenu from "./MobileMenu";

const MOBILE_MENU_ID = "dt-mobile-menu";

const themeIcons: Record<Theme, React.ReactNode> = {
  light: <Icon name="sun" ariaLabel="Light theme" />,
  dark: <Icon name="moon" ariaLabel="Dark theme" />,
  hcb: <Icon name="circle-half" ariaLabel="High contrast dark" />,
  hcw: <Icon name="circle-half" ariaLabel="High contrast light" />,
};

export interface HeaderProps {
  navItems?: HeaderNavItem[];
  onThemeCycle?: (nextTheme: Theme) => void;
  onLanguageChange?: (code: string) => void;
}

export type HeaderNavItem = {
  to: string;
  label: string;
  exact?: boolean;
};

const logoSrc = typeof Logo === "string" ? Logo : ((Logo as any).src ?? "");

// Helper to get/set language cookie
function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name: string) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
}

/**
 * Header component.
 */
export const Header: React.FC<HeaderProps> = ({
  navItems,
  onThemeCycle,
  onLanguageChange,
}) => {
  const { theme, cycleTheme } = usePersistentTheme();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const languages = React.useMemo(
    () => [
      { code: "en", label: t("langEN") },
      { code: "fi", label: t("langFI") },
      { code: "sv", label: t("langSV") },
    ],
    [t],
  );

  const defaultNavItems = React.useMemo<HeaderNavItem[]>(
    () => [
      { to: "/", label: t("navHome"), exact: true },
      { to: "/work", label: t("navWork") },
      { to: "/about", label: t("navAbout") },
      { to: "/pricing", label: t("navPricing") },
      { to: "/blog", label: t("navBlog") },
      { to: "/contact", label: t("navContact") },
    ],
    [t],
  );
  const resolvedNavItems = navItems ?? defaultNavItems;
  const currentlang = (
    i18n?.resolvedLanguage ||
    i18n?.language ||
    "en"
  ).split("-")[0];

  // On mount, check for cookie and set language if needed
  React.useEffect(() => {
    const cookieLang = getCookie("i18next");
    if (cookieLang && currentlang !== cookieLang) {
      i18n.changeLanguage(cookieLang);
    }
  }, [i18n, currentlang]);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setCookie("i18next", code);
    localStorage.setItem("i18nextLng", code);
    onLanguageChange?.(code);
  };

  const themeNames = React.useMemo(
    () => ({
      light: t("themeNameLight", "Light theme"),
      dark: t("themeNameDark", "Dark theme"),
      hcb: t("themeNameHcb", "High contrast (dark)"),
      hcw: t("themeNameHcw", "High contrast (light)"),
    }),
    [t],
  );

  const [isThemeAnimating, setIsThemeAnimating] = React.useState(false);
  const animationTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  React.useEffect(
    () => () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    },
    [],
  );

  const [hasMounted, setHasMounted] = React.useState(false);
  const [themeAnnouncement, setThemeAnnouncement] = React.useState("");
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);

    // Check if viewport is mobile/tablet
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1100);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleThemeToggle = () => {
    if (!isThemeAnimating) {
      setIsThemeAnimating(true);
      animationTimeout.current = setTimeout(() => {
        setIsThemeAnimating(false);
        animationTimeout.current = null;
      }, 450);
    }
    const nextTheme = cycleTheme();
    onThemeCycle?.(nextTheme);
    // Announce only on user-initiated changes (driven by the click handler),
    // so initial paint never emits a spurious "Theme switched to ..."
    // message that destabilised AT-tree snapshots in matrix CI.
    const nextLabel = themeNames[nextTheme] ?? nextTheme;
    setThemeAnnouncement(t("headerThemeAnnouncement", { theme: nextLabel }));
  };

  const handleOpenMobileMenu = () => setMobileMenuOpen(true);
  const handleCloseMobileMenu = () => setMobileMenuOpen(false);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previousOverflow;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.left}>
          <Link to="/" className={styles.logoLink}>
            {isMobile ? (
              <svg
                className={styles.logoMobile}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 128 128"
                aria-label={t("headerLogoAlt")}
              >
                <path d="M105.7,76.3c-1.6,0-3.2.7-4.3,2.5-5.3,8.4-7.8,11.5-10.9,11.5s-2.5-5.7-2.5-10.1v-30.2h9.8c6.5,0,6.5-11.4,0-11.4h-9.8v-4.9c0-4.1-2.4-6.1-4.9-6.1s-4.9,2-4.9,6.1v4.9h-21.2v-6.5c0-3.3-2.4-4.9-4.9-4.9s-4.9,1.6-4.9,4.9v6.5h-8.2c-6.5,0-6.5,11.4,0,11.4h8.2v28.9c0,.3,0,.7-.2,1-1.9,5-7.8,10.2-13.6,10.2s-6.2-2.9-6.2-6.3,2.5-6.6,6.2-9.2c2.4-1.7,4.8-2.9,7.3-3.6,5.6-2.7,2.8-10.2-2.2-10.2-.9,0-1.8.2-2.7.7-2.7,1.4-5.8,2.4-8.6,4.4-6.7,4.8-10.6,9.4-10.6,17.9s8,16.8,16.7,16.8,10.8-2.5,15.1-6.2c1.5,4.1,4.6,6.3,10.7,6.3s13.7-7.7,18.8-15.1c.2,7.7,1.8,15.1,12.3,15.1s11.6-2.7,20.1-16.3c2.6-4.2-1-8.2-4.7-8.2ZM79.2,69.1c0,.3,0,.6-.2.9-.4.6-1.8,2.9-6.6,10.4-3.1,4.8-6.9,10.9-12.7,10.9s-1.7-.3-2.3-.9c-1.3-1.3-1.3-3.8-1.3-6.9,0-.5,0-.9,0-1.4v-32.1c0-.6.4-1,1-1h21.2c.6,0,1,.4,1,1v19.1Z" />
              </svg>
            ) : (
              <img
                src={logoSrc}
                alt={t("headerLogoAlt")}
                className={styles.logo}
              />
            )}
          </Link>
        </div>
        <nav className={styles.navbar}>
          <ul className={styles.nav}>
            {resolvedNavItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname === item.to ||
                  location.pathname.startsWith(`${item.to}/`);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={isActive ? styles.selected : undefined}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className={styles.controls}>
          <div className={styles.languageSwitcher}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => changeLanguage(lang.code)}
                disabled={currentlang === lang.code}
                className={`${styles.languageLink} ${
                  currentlang === lang.code ? styles.languageLinkActive : ""
                }`.trim()}
                aria-label={lang.label}
                aria-current={currentlang === lang.code ? "page" : undefined}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleThemeToggle}
            className={styles.themeToggle}
            aria-label={t("toggleDarkMode")}
          >
            <span
              className={`${styles.themeToggleIcon} ${isThemeAnimating ? styles.themeToggleIconAnimating : ""}`.trim()}
              aria-hidden="true"
            >
              {themeIcons[theme]}
            </span>
          </button>
          <span
            className={styles.visuallyHidden}
            aria-live="polite"
            aria-atomic="true"
          >
            {themeAnnouncement}
          </span>
        </div>
        <button
          type="button"
          className={styles.mobileMenuButton}
          onClick={handleOpenMobileMenu}
          aria-label={t("navMenuOpen", "Open navigation menu")}
          aria-haspopup="dialog"
          aria-expanded={isMobileMenuOpen}
          aria-controls={MOBILE_MENU_ID}
        >
          <Icon name="list" aria-hidden="true" />
        </button>
      </div>
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
        onNavigate={handleCloseMobileMenu}
        id={MOBILE_MENU_ID}
      />
    </header>
  );
};

export default Header;
