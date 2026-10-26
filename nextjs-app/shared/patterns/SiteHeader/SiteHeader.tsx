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
import Avatar, { type AvatarMenuItem } from "../../components/Avatar/Avatar";
import { List, Sun, Moon, CircleHalf } from "@phosphor-icons/react";
import { MobileDrawer } from "./MobileDrawer";
import styles from "./SiteHeader.module.css";
import { SITE_SUBNAV_SLOT_ID } from "./SiteSubnav";
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
  /**
   * Limits the language switchers to these codes, for an area offered in
   * fewer languages than the site (the client intake: EN and FI). All site
   * languages when unset.
   */
  languageCodes?: readonly string[];
  /**
   * The signed-in person in an account area (the client intake): an avatar
   * with their initials that opens a menu of account actions such as
   * signing out. Nothing renders when unset.
   */
  account?: SiteHeaderAccount;
}

/** The signed-in person shown at the end of the header. */
export interface SiteHeaderAccount {
  /** Display name; the avatar shows its initials. */
  name: string;
  /** Accessible name of the menu trigger, for example "Account menu for Aino". */
  menuLabel: string;
  /** Account actions, in order. */
  items: AvatarMenuItem[];
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
    // The language's own name, the same in every UI locale.
    nativeName: "English",
    announcementKey: "languageName.en",
  },
  {
    code: "fi",
    labelKey: "langFI",
    // The language's own name, the same in every UI locale.
    nativeName: "Suomi",
    announcementKey: "languageName.fi",
  },
  {
    code: "sv",
    labelKey: "langSV",
    // The language's own name, the same in every UI locale.
    nativeName: "Svenska",
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
  languageCodes,
  account,
}: SiteHeaderProps) {
  const offeredLanguages = languageCodes
    ? languages.filter((lang) => languageCodes.includes(lang.code))
    : languages;
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
    showToast(t("themeChanged", { theme: label }), {
      tone: "neutral",
      duration: 3000,
    });
  };

  const handleLanguageChange = (code: string) => {
    void changeLanguage(code);

    const langLabel = languages.find((lang) => lang.code === code);
    const bundle = getResourceBundle(code, "translation") as
      Record<string, unknown> | undefined;
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
          styles.header,
          "z-40 w-full transition-all duration-300",
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
                "h-10 w-10 lg:h-11 lg:w-11",
                "bg-[var(--logo-background)] text-[var(--logo-color)]",
              )}
            >
              <Logo
                size={24}
                animated={isLogoHovered}
                decorative
                className="h-6 w-6 lg:h-6.5 lg:w-6.5"
              />
            </div>
            <span className="font-heading text-lg lg:text-[1.375rem] font-bold tracking-tight transition-colors text-[var(--logo-text-color)] group-hover:text-primary">
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
                  languages={offeredLanguages.map((lang) => ({
                    code: lang.code,
                    label: lang.code.toUpperCase(),
                    ariaLabel: lang.nativeName,
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

            {account ? (
              <Avatar
                name={account.name}
                variant="initials"
                size="sm"
                menuItems={account.items}
                menuLabel={account.menuLabel}
              />
            ) : null}

            {/* Mobile Menu Button */}
            <IconButton
              // 32px glyph (the scale step above Button's 26px phone default):
              // Phosphor's List draws in the middle ~70% of its box, so at 26px
              // the lines read as an 18px icon.
              icon={<List weight="bold" className="size-8" />}
              label={t("navMenuOpen", "Open navigation menu")}
              onClick={openMobileMenu}
              className="lg:hidden"
              variant="tertiary"
            />
          </div>
        </Container>
        {/* Phone-only slot: SiteSubnav portals the page nav bar here on scroll up. */}
        <div id={SITE_SUBNAV_SLOT_ID} className={styles.subnavSlot} />
      </header>

      {/* Mobile Drawer - outside header to avoid inheriting transparent background */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        navItems={navItems}
        currentLang={currentLang}
        languageCodes={offeredLanguages.map((lang) => lang.code)}
        onLanguageChange={handleLanguageChange}
        onThemeToggle={handleThemeToggle}
        theme={theme}
      />
    </>
  );
}
