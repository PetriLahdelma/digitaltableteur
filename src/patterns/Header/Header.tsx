import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import "../../styles/variables.css";
import "../../styles/fonts.css";
import Logo from "../../assets/images/01jy60fd46fxwvk450w70bmyzm_1750401080.webp";
import { type Theme } from "@dt/ThemeProvider";
import { IoMoon, IoSunnySharp } from "react-icons/io5";
import { MdOutlineContrast } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { usePersistentTheme } from "../../hooks/usePersistentTheme";

const themeIcons: Record<Theme, React.ReactNode> = {
  light: <IoSunnySharp />,
  dark: <IoMoon />,
  hcb: <MdOutlineContrast />,
  hcw: <MdOutlineContrast />,
};

type HeaderProps = {
  navItems?: HeaderNavItem[];
  onThemeCycle?: (nextTheme: Theme) => void;
  onLanguageChange?: (code: string) => void;
};

export type HeaderNavItem = {
  to: string;
  label: string;
  exact?: boolean;
};

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

const Header: React.FC<HeaderProps> = ({
  navItems,
  onThemeCycle,
  onLanguageChange,
}) => {
  const { theme, cycleTheme } = usePersistentTheme();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const leftRef = React.useRef<HTMLDivElement | null>(null);
  const controlsRef = React.useRef<HTMLDivElement | null>(null);
  const [navOffset, setNavOffset] = React.useState(0);
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
      { to: "/blog", label: t("navBlog") },
      { to: "/contact", label: t("navContact") },
    ],
    [t],
  );
  const resolvedNavItems = navItems ?? defaultNavItems;

  // On mount, check for cookie and set language if needed
  React.useEffect(() => {
    const cookieLang = getCookie("i18next");
    if (cookieLang && i18n.language.split("-")[0] !== cookieLang) {
      i18n.changeLanguage(cookieLang);
    }
  }, [i18n]);

  React.useLayoutEffect(() => {
    let rafId: number | null = null;

    const computeOffset = () => {
      if (typeof window === "undefined") return;
      if (!leftRef.current || !controlsRef.current) {
        setNavOffset(0);
        return;
      }
      if (window.innerWidth <= 600) {
        setNavOffset(0);
        return;
      }
      const leftWidth = leftRef.current.getBoundingClientRect().width;
      const rightWidth = controlsRef.current.getBoundingClientRect().width;
      setNavOffset((rightWidth - leftWidth) / 2);
    };

    const scheduleCompute = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        computeOffset();
      });
    };

    computeOffset();
    window.addEventListener("resize", scheduleCompute);

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => computeOffset());
      if (leftRef.current) resizeObserver.observe(leftRef.current);
      if (controlsRef.current) resizeObserver.observe(controlsRef.current);
    }

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", scheduleCompute);
      resizeObserver?.disconnect();
    };
  }, []);

  const currentlang = i18n.language.split("-")[0];
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
  React.useEffect(() => {
    setHasMounted(true);
  }, []);
  React.useEffect(() => {
    if (!hasMounted) return;
    const label = themeNames[theme] ?? theme;
    setThemeAnnouncement(t("headerThemeAnnouncement", { theme: label }));
  }, [hasMounted, theme, themeNames, t]);

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
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div ref={leftRef} className={styles.left}>
          <Link to="/" className={styles.logoLink}>
            <img src={Logo} alt={t("headerLogoAlt")} className={styles.logo} />
          </Link>
        </div>
        <nav
          className={styles.navbar}
          style={{
            transform:
              navOffset === 0 ? undefined : `translateX(${navOffset}px)`,
          }}
        >
          <ul className={styles.nav}>
            {resolvedNavItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
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
        <div ref={controlsRef} className={styles.controls}>
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
                aria-current={currentlang === lang.code ? "true" : undefined}
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
      </div>
    </header>
  );
};

export default Header;
