"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { NavLink } from "@digitaltableteur/react";
import { Container } from "@/nextjs-app/shared/components/Container";
import { useNavigation } from "@/nextjs-app/shared/hooks/useNavigation";
import { usePersistentTheme } from "@/nextjs-app/shared/hooks/usePersistentTheme";
import { useToast } from "@/providers/ToastProvider";
import { IconButton } from "@/nextjs-app/shared/components/IconButton";
import { LanguageSwitcher } from "@/nextjs-app/shared/components/LanguageSwitcher";
import { List, Sun, Moon, CircleHalf } from "@phosphor-icons/react";
import { MobileDrawer } from "./MobileDrawer";
import styles from "./SiteHeader.module.css";
import type { Theme } from "@dt/ThemeProvider";

export interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
}

export interface SiteHeaderProps {
  /** Navigation items (href, label, exact); the site default when unset. */
  navItems?: NavItem[];
  /** Optional wrapper class. */
  className?: string;
}

const defaultNavItems: NavItem[] = [
  { href: "/", label: "navHome", exact: true },
  { href: "/work", label: "navWork" },
  { href: "/about", label: "navAbout" },
  { href: "/pricing", label: "navPricing" },
  { href: "/blog", label: "navBlog" },
  { href: "/contact", label: "navContact" },
];

const themeIcons: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  hcb: CircleHalf,
  hcw: CircleHalf,
};

const languages = [
  {
    code: "en",
    labelKey: "langEN",
    ariaLabelKey: "langEN_ariaLabel",
    announcementKey: "languageName.en",
  },
  {
    code: "fi",
    labelKey: "langFI",
    ariaLabelKey: "langFI_ariaLabel",
    announcementKey: "languageName.fi",
  },
  {
    code: "sv",
    labelKey: "langSV",
    ariaLabelKey: "langSV_ariaLabel",
    announcementKey: "languageName.sv",
  },
];

const themeNames: Record<Theme, string> = {
  light: "themeNameLight",
  dark: "themeNameDark",
  hcb: "themeNameHcb",
  hcw: "themeNameHcw",
};

/**
 * SiteHeader component.
 */
export function SiteHeader({
  navItems = defaultNavItems,
  className,
}: SiteHeaderProps) {
  const { t, i18n } = useTranslation();
  const { theme, cycleTheme } = usePersistentTheme();
  const { showToast } = useToast();
  const { isMobileMenuOpen, openMobileMenu, closeMobileMenu } = useNavigation();
  const [isThemeAnimating, setIsThemeAnimating] = useState(false);
  const themeAnimationTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  useEffect(() => {
    return () => {
      if (themeAnimationTimeout.current) {
        clearTimeout(themeAnimationTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentLang = i18n?.resolvedLanguage?.split("-")[0] ?? "en";
  const ThemeIcon = themeIcons[theme];

  const handleThemeToggle = () => {
    if (!isThemeAnimating) {
      setIsThemeAnimating(true);
      themeAnimationTimeout.current = setTimeout(() => {
        setIsThemeAnimating(false);
        themeAnimationTimeout.current = null;
      }, 450);
    }
    const nextTheme = cycleTheme() as Theme;
    const label = t(themeNames[nextTheme], nextTheme);
    showToast(t("themeChanged", { theme: label }), 3000);
  };

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    document.cookie = `i18next=${code}; path=/; max-age=31536000`;
    localStorage.setItem("i18nextLng", code);

    const langLabel = languages.find((lang) => lang.code === code);
    const bundle = i18n.getResourceBundle(code, "translation") as
      | Record<string, string>
      | undefined;
    const labelKey = langLabel?.announcementKey ?? `languageName.${code}`;
    const label = bundle?.[labelKey] ?? code;
    showToast(i18n.t("languageChanged", { lng: code, language: label }), 3000);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          isScrolled
            ? "border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            : "border-b border-transparent bg-transparent",
          className,
        )}
      >
      <Container size="lg" className="flex h-20 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          // rounded-sm matches the LanguageSwitcher so the focus outline
          // renders with the same corner rounding as the other header controls.
          className="flex items-center gap-3 group rounded-sm"
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
        >
          <div
            className={cn(
              "flex items-center justify-center rounded-full transition-transform group-hover:scale-110",
              "h-10 w-10",
              "bg-[var(--logo-background)] text-[var(--logo-color)]",
            )}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 395 323"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              aria-hidden="true"
              focusable="false"
            >
            <style>{`
              @keyframes pulse-1 {
                0%, 33%, 100% { opacity: 1; }
                5%, 28% { opacity: 0.5; }
              }
              @keyframes pulse-2 {
                0%, 5%, 66%, 100% { opacity: 1; }
                33%, 61% { opacity: 0.5; }
              }
              @keyframes pulse-3 {
                0%, 61%, 100% { opacity: 1; }
                66%, 95% { opacity: 0.5; }
              }
              .logo-bar {
                transition: opacity 0.3s ease;
              }
              .logo-bar.pulse-1 {
                animation: pulse-1 0.9s ease-in-out infinite;
              }
              .logo-bar.pulse-2 {
                animation: pulse-2 0.9s ease-in-out infinite;
              }
              .logo-bar.pulse-3 {
                animation: pulse-3 0.9s ease-in-out infinite;
              }
              @media (prefers-reduced-motion: reduce) {
                .logo-bar.pulse-1,
                .logo-bar.pulse-2,
                .logo-bar.pulse-3 {
                  animation: none;
                }
              }
            `}</style>
            <g clipPath="url(#clip0_header)">
              <rect
                x="190.742"
                width="39.0494"
                height="142.681"
                fill="currentColor"
                className={cn(
                  "logo-bar",
                  isLogoHovered && "pulse-1",
                )}
              />
              <rect
                x="190.742"
                y="180.228"
                width="39.0494"
                height="142.681"
                fill="currentColor"
                className={cn(
                  "logo-bar",
                  isLogoHovered && "pulse-2",
                )}
              />
              <rect
                x="267.338"
                y="181.73"
                width="39.0494"
                height="127.662"
                transform="rotate(-90 267.338 181.73)"
                fill="currentColor"
                className={cn(
                  "logo-bar",
                  isLogoHovered && "pulse-3",
                )}
              />
              <rect y="37.5475" width="39.0494" height="246.312" fill="currentColor"/>
              <rect x="115.646" y="76.597" width="39.0494" height="168.213" fill="currentColor"/>
              <path d="M39.0493 76.597L39.0493 37.5475L118.65 37.5475L154.696 76.5969L39.0493 76.597Z" fill="currentColor"/>
              <path d="M39.0493 244.81L39.0493 283.859L118.65 283.859L154.696 244.81L39.0493 244.81Z" fill="currentColor"/>
            </g>
            <defs>
              <clipPath id="clip0_header">
                <rect width="395" height="322.909" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          </div>
          <span className="font-heading text-lg lg:text-xl font-bold tracking-tight transition-colors text-[var(--logo-text-color)] group-hover:text-primary">
            Digitaltableteur
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden lg:flex items-center gap-6"
          aria-label={t("navMenuAccessibleLabel")}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              exact={item.exact}
              className="text-base font-semibold tracking-wide hover:text-primary transition-colors"
            >
              {t(item.label)}
            </NavLink>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-2 ml-4">
          <div className="hidden lg:flex items-center">
            {/* pr-4 / pl-4 — equal inset on both sides of the divider */}
            <div className="pr-4">
              <LanguageSwitcher
                languages={languages.map((lang) => ({
                  code: lang.code,
                  label: lang.code.toUpperCase(),
                  ariaLabel: `${lang.code.toUpperCase()} — ${t(lang.ariaLabelKey)}`,
                }))}
                currentLang={currentLang}
                onLanguageChange={handleLanguageChange}
              />
            </div>

            <div className="flex items-center gap-2 border-l border-border/40 pl-4">
              <IconButton
                icon={
                  <span
                    className={cn(
                      styles.themeIcon,
                      isThemeAnimating && styles.themeIconAnimating,
                    )}
                    aria-hidden
                  >
                    <ThemeIcon weight="bold" className="size-4" />
                  </span>
                }
                label={t("toggleDarkMode")}
                onClick={handleThemeToggle}
                variant="tertiary"
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <IconButton
            icon={<List weight="bold" className="size-5" />}
            label={t("navMenuOpen", "Open navigation menu")}
            onClick={openMobileMenu}
            className="lg:hidden"
            variant="tertiary"
          />
        </div>
      </Container>
      </header>

      {/* Mobile Drawer - outside header to avoid inheriting transparent background */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        navItems={navItems}
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        onThemeToggle={handleThemeToggle}
        theme={theme}
      />
    </>
  );
}
