import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import "../../styles/variables.css";
import "../../styles/fonts.css";
import Logo from "../../assets/images/01jy60fd46fxwvk450w70bmyzm_1750401080.webp";
import { useTheme, type Theme } from "@dt/ThemeProvider";
import { IoMoon } from "react-icons/io5";
import { IoSunnySharp } from "react-icons/io5";
import { MdOutlineContrast, MdOutlineInvertColors } from "react-icons/md";
import { useTranslation } from "react-i18next";

// Helper to get/set cookie
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

const THEME_SEQUENCE: Theme[] = ["light", "dark", "hcb", "hcw"];
const isTheme = (value: string): value is Theme =>
  (THEME_SEQUENCE as readonly string[]).includes(value as Theme);
const getNextTheme = (value: Theme): Theme => {
  const index = THEME_SEQUENCE.indexOf(value);
  return THEME_SEQUENCE[(index + 1) % THEME_SEQUENCE.length];
};

const themeIcons: Record<Theme, React.ReactNode> = {
  light: <IoSunnySharp />,
  dark: <IoMoon />,
  hcb: <MdOutlineContrast />,
  hcw: <MdOutlineContrast />,
};

const Header = () => {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const leftRef = React.useRef<HTMLDivElement | null>(null);
  const controlsRef = React.useRef<HTMLDivElement | null>(null);
  const [navOffset, setNavOffset] = React.useState(0);
  const languages = [
    { code: "en", label: t("langEN") },
    { code: "fi", label: t("langFI") },
    { code: "sv", label: t("langSV") },
  ];
  // On mount, check for cookie and set language if needed
  React.useEffect(() => {
    const cookieLang = getCookie("i18next");
    if (cookieLang && i18n.language.split("-")[0] !== cookieLang) {
      i18n.changeLanguage(cookieLang);
    }
  }, [i18n]);
  // On mount, check for theme cookie and set theme if needed
  React.useEffect(() => {
    const cookieTheme = getCookie("dt_theme");
    if (cookieTheme && isTheme(cookieTheme) && theme !== cookieTheme) {
      setTheme(cookieTheme);
    }
  }, [setTheme, theme]);

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

    // Throttled resize handler using RAF
    const scheduleCompute = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        computeOffset();
      });
    };

    // Initial computation - immediate, no throttling needed
    computeOffset();

    // Throttle window resize events
    window.addEventListener("resize", scheduleCompute);

    // ResizeObserver is already optimized, use direct computation
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

  // Normalize language code to base (e.g., 'en-US' -> 'en')
  const currentlang = i18n.language.split("-")[0];
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setCookie("i18next", code);
    localStorage.setItem("i18nextLng", code);
  };
  const changeTheme = () => {
    const nextTheme = getNextTheme(theme);
    setCookie("dt_theme", nextTheme);
    setTheme(nextTheme);
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
            <li>
              <Link
                to="/"
                className={
                  location.pathname === "/" ? styles.selected : undefined
                }
              >
                {t("navHome")}
              </Link>
            </li>
            <li>
              <Link
                to="/work"
                className={
                  styles.navLink +
                  " " +
                  (location.pathname.startsWith("/work") ? styles.selected : "")
                }
                tabIndex={0}
                aria-current={
                  location.pathname.startsWith("/work") ? "page" : undefined
                }
              >
                {t("navWork")}
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={
                  location.pathname.startsWith("/about")
                    ? styles.selected
                    : undefined
                }
              >
                {t("navAbout")}
              </Link>
            </li>
            <li>
              <Link
                to="/blog"
                className={
                  location.pathname.startsWith("/blog")
                    ? styles.selected
                    : undefined
                }
              >
                {t("navBlog")}
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={
                  location.pathname.startsWith("/contact")
                    ? styles.selected
                    : undefined
                }
              >
                {t("navContact")}
              </Link>
            </li>
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
            onClick={changeTheme}
            className={styles.themeToggle}
            aria-label={t("toggleDarkMode")}
          >
            {themeIcons[theme]}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
