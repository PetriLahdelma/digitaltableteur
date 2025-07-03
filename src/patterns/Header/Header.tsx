import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import "../../styles/variables.css";
import "../../styles/fonts.css";
import Logo from "../../assets/images/01jy60fd46fxwvk450w70bmyzm_1750401080.webp";
import { useTheme } from "../../components/ThemeProvider/ThemeProvider";
import { WiMoonAltNew } from "react-icons/wi";
import { IoSunnySharp } from "react-icons/io5";
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

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const location = useLocation();
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
    if (cookieTheme && theme !== cookieTheme) {
      // Only toggle if the cookie value differs from the current theme
      toggleTheme();
    }
  }, [theme]);
  // Normalize language code to base (e.g., 'en-US' -> 'en')
  const currentlang = i18n.language.split("-")[0];
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setCookie("i18next", code);
    localStorage.setItem("i18nextLng", code);
  };
  const changeTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setCookie("dt_theme", newTheme);
    toggleTheme();
  };
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link to="/" className={styles.logoLink}>
          <img src={Logo} alt="Digitaltableteur Logo" className={styles.logo} />
        </Link>
        <nav className={styles.navbar}>
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
                  location.pathname.startsWith("/work")
                    ? styles.selected
                    : undefined
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
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div className={styles.languageSwitcher}>
            {languages.map((lang, idx) => (
              <span
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                style={{
                  cursor: currentlang === lang.code ? "default" : "pointer",
                  opacity: currentlang === lang.code ? 0.5 : 1,
                  textDecoration: "none",
                  borderBottom:
                    currentlang === lang.code
                      ? "2px solid"
                      : "2px solid transparent",
                  marginRight: idx < languages.length - 1 ? 8 : 0,
                  transition: "border-color 0.2s",
                }}
                className={styles.languageLink}
                tabIndex={0}
                aria-label={lang.label}
                aria-current={currentlang === lang.code ? "true" : undefined}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && currentlang !== lang.code)
                    changeLanguage(lang.code);
                }}
              >
                {lang.label}
              </span>
            ))}
          </div>
          <button
            onClick={changeTheme}
            className={styles.themeToggle}
            aria-label={t("toggleDarkMode")}
          >
            {theme === "dark" ? <WiMoonAltNew /> : <IoSunnySharp />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
