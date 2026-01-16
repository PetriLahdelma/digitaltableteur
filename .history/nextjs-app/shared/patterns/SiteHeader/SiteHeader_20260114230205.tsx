"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { NavLink } from "@/nextjs-app/shared/components/NavLink";
import { Container } from "@/nextjs-app/shared/components/Container";
import { useNavigation } from "@/nextjs-app/shared/hooks/useNavigation";
import { usePersistentTheme } from "@/nextjs-app/shared/hooks/usePersistentTheme";
import { IconButton } from "@/nextjs-app/shared/components/IconButton";
import { List, Sun, Moon, CircleHalf } from "@phosphor-icons/react";
import { MobileDrawer } from "./MobileDrawer";
import type { Theme } from "@dt/ThemeProvider";

export interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
}

export interface SiteHeaderProps {
  navItems?: NavItem[];
  className?: string;
}

const defaultNavItems: NavItem[] = [
  { href: "/", label: "navHome", exact: true },
  { href: "/work", label: "navWork" },
  { href: "/about", label: "navAbout" },
  { href: "/blog", label: "navBlog" },
  { href: "/contact", label: "navContact" },
];

const themeIcons: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  hcb: CircleHalf,
  hcw: CircleHalf,
};

export function SiteHeader({
  navItems = defaultNavItems,
  className,
}: SiteHeaderProps) {
  const { t, i18n } = useTranslation();
  const { theme, cycleTheme } = usePersistentTheme();
  const { isMobileMenuOpen, openMobileMenu, closeMobileMenu } = useNavigation();
  const [isThemeAnimating, setIsThemeAnimating] = useState(false);

  const currentLang = i18n?.resolvedLanguage?.split("-")[0] ?? "en";
  const ThemeIcon = themeIcons[theme];

  const handleThemeToggle = () => {
    if (!isThemeAnimating) {
      setIsThemeAnimating(true);
      setTimeout(() => setIsThemeAnimating(false), 450);
    }
    cycleTheme();
  };

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    document.cookie = `i18next=${code}; path=/; max-age=31536000`;
    localStorage.setItem("i18nextLng", code);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <Container size="lg" className="flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-title-s font-bold">
            Digitaltableteur
          </span>
          <Image
            src="/dt-logo.svg"
            alt={t("headerLogoAlt", "Digitaltableteur logo")}
            width={32}
            height={32}
            className="h-8 w-8"
          />
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
              className="text-text-m font-medium"
            >
              {t(item.label)}
            </NavLink>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Language Switcher - Desktop */}
          <div className="hidden lg:flex items-center gap-1 mr-2">
            {["en", "fi", "sv"].map((code) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code)}
                disabled={currentLang === code}
                className={cn(
                  "px-2 py-1 text-text-s font-heading text-title-s font-bold uppercase transition-colors cursor-pointer disabled:cursor-default",
                  currentLang === code
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {code}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <IconButton
            icon={
              <ThemeIcon
                weight="bold"
                className={cn(
                  "size-5 transition-transform",
                  isThemeAnimating && "animate-spin",
                )}
              />
            }
            label={t("toggleDarkMode")}
            onClick={handleThemeToggle}
            variant="ghost"
            className="cursor-pointer"
          />

          {/* Mobile Menu Button */}
          <IconButton
            icon={<List weight="bold" className="size-5" />}
            label={t("navMenuOpen")}
            onClick={openMobileMenu}
            className="lg:hidden"
            variant="ghost"
          />
        </div>
      </Container>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        navItems={navItems}
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        onThemeToggle={handleThemeToggle}
        theme={theme}
      />
    </header>
  );
}
