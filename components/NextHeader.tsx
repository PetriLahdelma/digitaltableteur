"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useTranslation } from "react-i18next";

import Icon from "@dt/Icon";
import { usePersistentTheme } from "@/shared/hooks/usePersistentTheme";
import styles from "@/shared/patterns/Header/Header.module.css";
import mobileStyles from "@/shared/patterns/Header/MobileMenu.module.css";
import { NextMobileMenu } from "./NextMobileMenu";
import Logo from "./icons/Logo";

const themeIcons: Record<string, React.ReactNode> = {
  light: <Icon name="sun" ariaLabel="Light theme" />,
  dark: <Icon name="moon" ariaLabel="Dark theme" />,
  hcb: <Icon name="circle-half" ariaLabel="High contrast dark" />,
  hcw: <Icon name="circle-half" ariaLabel="High contrast light" />,
};

const navItemsBase = [
  { href: "/", labelKey: "navHome", exact: true },
  { href: "/work", labelKey: "navWork" },
  { href: "/about", labelKey: "navAbout" },
  { href: "/blog", labelKey: "navBlog" },
  { href: "/contact", labelKey: "navContact" },
];

const setCookie = (name: string, value: string, days = 365) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

export function NextHeader() {
  const pathname = usePathname();
  const { t, i18n } = useTranslation();
  const { theme, cycleTheme } = usePersistentTheme();

  const [navOffset, setNavOffset] = React.useState(0);
  const leftRef = React.useRef<HTMLDivElement | null>(null);
  const controlsRef = React.useRef<HTMLDivElement | null>(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isThemeAnimating, setIsThemeAnimating] = React.useState(false);
  const animationTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const navItems = React.useMemo(
    () => navItemsBase.map((item) => ({ ...item, label: t(item.labelKey) })),
    [t],
  );

  const languages = React.useMemo(
    () => [
      { code: "en", label: t("langEN") },
      { code: "fi", label: t("langFI") },
      { code: "sv", label: t("langSV") },
    ],
    [t],
  );

  const currentLang = i18n.language.split("-")[0];
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setCookie("i18next", code);
    localStorage.setItem("i18nextLng", code);
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  React.useLayoutEffect(() => {
    let rafId: number | null = null;

    const computeOffset = () => {
      if (typeof window === "undefined") return;
      if (!leftRef.current || !controlsRef.current) {
        setNavOffset(0);
        return;
      }
      if (window.innerWidth <= 1100) {
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

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1100);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(
    () => () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    },
    [],
  );

  const handleThemeToggle = () => {
    if (!isThemeAnimating) {
      setIsThemeAnimating(true);
      animationTimeout.current = setTimeout(() => {
        setIsThemeAnimating(false);
        animationTimeout.current = null;
      }, 450);
    }
    cycleTheme();
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div ref={leftRef} className={styles.left}>
          <Link
            href="/"
            className={styles.logoLink}
            aria-label={t("headerLogoAlt", "Digitaltableteur logo")}
          >
            {isMobile ? (
              <Logo variant="filled" className={styles.logoMobile} />
            ) : (
              <Logo variant="outline" className={styles.logo} />
            )}
          </Link>
        </div>
        <nav
          className={styles.navbar}
          style={{
            transform:
              navOffset === 0 ? undefined : `translateX(${navOffset}px)`,
          }}
          aria-label={t("navMenuTitle", "Main navigation")}
          suppressHydrationWarning
        >
          <ul className={styles.nav}>
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <li key={item.href}>
                  <div className={styles.navLinkWrapper}>
                    <div className={styles.navLinkBlur} aria-hidden="true" />
                    <Link
                      href={item.href}
                      className={active ? styles.selected : undefined}
                      aria-current={active ? "page" : undefined}
                      suppressHydrationWarning
                    >
                      {item.label}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
        <div ref={controlsRef} className={styles.controls}>
          <div className={styles.languageSwitcher} suppressHydrationWarning>
            {languages.map((lang) => (
              <div key={lang.code} className={styles.languageLinkWrapper}>
                <div className={styles.languageLinkBlur} aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => changeLanguage(lang.code)}
                  disabled={currentLang === lang.code}
                  className={`${styles.languageLink} ${
                    currentLang === lang.code ? styles.languageLinkActive : ""
                  }`.trim()}
                  aria-label={lang.label}
                  aria-current={currentLang === lang.code ? "true" : undefined}
                >
                  {lang.label}
                </button>
              </div>
            ))}
          </div>
          <div className={styles.themeToggleWrapper}>
            <div className={styles.themeToggleBlur} aria-hidden="true" />
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
          </div>
        </div>
        <button
          type="button"
          className={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen(true)}
          aria-label={t("navMenuOpen", "Open navigation")}
          aria-haspopup="dialog"
          aria-expanded={isMobileMenuOpen}
        >
          <Icon name="list" aria-hidden="true" />
        </button>
      </div>
      <NextMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={() => setMobileMenuOpen(false)}
        id="dt-mobile-menu"
        navItems={navItems}
        languages={languages}
      />
    </header>
  );
}
