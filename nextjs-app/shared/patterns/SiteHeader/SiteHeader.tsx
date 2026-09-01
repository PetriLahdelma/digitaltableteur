"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "../../lib/cn";
import { Link as RouterLink } from "../../lib/linkComponent";
import { useLocalization } from "../../lib/translation";
import { NavLink } from "../../components/NavLink";
import { Container } from "../../components/Container";
import Logo from "../../components/Logo";
import { useNavigation } from "../../hooks/useNavigation";
import { usePersistentTheme } from "../../hooks/usePersistentTheme";
import { useToast } from "../../lib/toast";
import { IconButton } from "../../components/IconButton";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { List, Sun, Moon, CircleHalf } from "@phosphor-icons/react";
import { MobileDrawer } from "./MobileDrawer";
import styles from "./SiteHeader.module.css";
import type { Theme } from "../../components/ThemeProvider";

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
  const {
    translate: t,
    resolvedLanguage,
    changeLanguage,
    getResourceBundle,
  } = useLocalization();
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

  const currentLang = resolvedLanguage.split("-")[0] ?? "en";
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
    showToast(t("themeChanged", { theme: label }), { tone: "neutral", duration: 3000 });
  };

  const handleLanguageChange = (code: string) => {
    void changeLanguage(code);

    const langLabel = languages.find((lang) => lang.code === code);
    const bundle = getResourceBundle(code, "translation") as
      | Record<string, unknown>
      | undefined;
    const labelKey = langLabel?.announcementKey ?? `languageName.${code}`;
    const label =
      typeof bundle?.[labelKey] === "string" ? bundle[labelKey] : code;

    // Only the change confirmation: toasts stack now (ToastStack), so
    // LanguageNotice's own content-language toast shows alongside instead of
    // replacing this one — appending it here would read twice.
    showToast(
      t("languageChanged", {
        lng: code,
        language: label,
      }),
      { tone: "neutral", duration: 3000 },
    );
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
        <RouterLink
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
            <Logo
              size={24}
              animated={isLogoHovered}
              decorative
              className="h-6 w-6"
            />
          </div>
          <span className="font-heading text-lg lg:text-xl font-bold tracking-tight transition-colors text-[var(--logo-text-color)] group-hover:text-primary">
            Digitaltableteur
          </span>
        </RouterLink>

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
                    <ThemeIcon weight="bold" />
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
            icon={<List weight="bold" />}
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
