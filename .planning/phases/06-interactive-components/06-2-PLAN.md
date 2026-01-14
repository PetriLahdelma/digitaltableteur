# Phase 06-2: Navigation Components Enhancement

> **Phase**: 06 (Interactive Components)
> **Plan**: 2 of 2
> **Status**: Ready
> **Estimated Tasks**: 10

---

## Objective

Create Tailwind-first navigation components for Next.js App Router, replacing the legacy react-router-dom based navigation. This plan focuses on Header, MobileMenu, and Footer with proper client/server component patterns and GSAP animation integration.

**Deliverables:**
1. Tailwind-first Header component for Next.js
2. Animated MobileMenu with Sheet/Drawer pattern
3. Tailwind-first Footer component
4. Navigation utilities (NavLink, useActiveRoute)
5. Navigation components barrel export

---

## Existing Infrastructure

### Legacy Navigation (CSS Modules + react-router-dom)
| Component | Location | Issue |
|-----------|----------|-------|
| Header | `nextjs-app/shared/patterns/Header/Header.tsx` | Uses react-router-dom |
| MobileMenu | `nextjs-app/shared/patterns/Header/MobileMenu.tsx` | Uses react-router-dom |
| Footer | `nextjs-app/shared/patterns/Footer/Footer.tsx` | Basic, not Tailwind-first |

### Design System (Phase 01-05)
- Tailwind CSS 4.x configured
- Typography: Syne + Satoshi (font-heading, font-body)
- Animation primitives: FadeIn, SlideIn from Phase 03
- Layout primitives: Container, Stack from Phase 04

**Goal:** Create Next.js-native navigation with Tailwind styling and animations.

---

## Context

**Files to read before executing:**

```
nextjs-app/shared/patterns/Header/Header.tsx           # Legacy header (reference)
nextjs-app/shared/patterns/Header/MobileMenu.tsx       # Legacy mobile menu (reference)
nextjs-app/shared/patterns/Footer/Footer.tsx           # Legacy footer (reference)
nextjs-app/shared/components/NavMenuList/NavMenuList.tsx # Navigation list
app/layout.tsx                                          # Root layout
nextjs-app/shared/locales/en/translation.json          # i18n keys
```

---

## Tasks

### Task 1: Create NavLink Component

**Action**: Create Next.js-native navigation link with active state

**Create folder**: `nextjs-app/shared/components/NavLink/`

```typescript
// NavLink.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface NavLinkProps {
  href: string;
  children: ReactNode;
  exact?: boolean;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}

export function NavLink({
  href,
  children,
  exact = false,
  className,
  activeClassName = "text-foreground",
  inactiveClassName = "text-muted-foreground hover:text-foreground",
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "font-body text-text-m transition-colors",
        className,
        isActive ? activeClassName : inactiveClassName
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
```

Create `index.ts` barrel export.

**Verification**: NavLink highlights correctly based on current route

---

### Task 2: Create useNavigation Hook

**Action**: Create navigation state hook for mobile menu and theme

**Create folder**: `nextjs-app/shared/hooks/useNavigation/`

```typescript
// useNavigation.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";

export interface UseNavigationReturn {
  isMobileMenuOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
}

export function useNavigation(): UseNavigationReturn {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(() => setMobileMenuOpen((prev) => !prev), []);

  return {
    isMobileMenuOpen,
    openMobileMenu,
    closeMobileMenu,
    toggleMobileMenu,
  };
}
```

Create `index.ts` barrel export.

**Verification**: Hook manages mobile menu state correctly

---

### Task 3: Create SiteHeader Component

**Action**: Create Tailwind-first header for Next.js

**Create folder**: `nextjs-app/shared/patterns/SiteHeader/`

```typescript
// SiteHeader.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { NavLink } from "@/nextjs-app/shared/components/NavLink";
import { useNavigation } from "@/nextjs-app/shared/hooks/useNavigation";
import { usePersistentTheme } from "@/nextjs-app/shared/hooks/usePersistentTheme";
import { IconButton } from "@/nextjs-app/shared/components/ui";
import { List, Sun, Moon, CircleHalf } from "@phosphor-icons/react";
import { MobileDrawer } from "./MobileDrawer";

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

const themeIcons = {
  light: Sun,
  dark: Moon,
  hcb: CircleHalf,
  hcw: CircleHalf,
} as const;

export function SiteHeader({ navItems = defaultNavItems, className }: SiteHeaderProps) {
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
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-title-s font-bold">Digitaltableteur</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6" aria-label={t("navMenuAccessibleLabel")}>
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
                  "px-2 py-1 text-text-s font-body uppercase transition-colors",
                  currentLang === code
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
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
                  isThemeAnimating && "animate-spin"
                )}
              />
            }
            label={t("toggleDarkMode")}
            onClick={handleThemeToggle}
            variant="ghost"
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
      </div>

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
```

Create `SiteHeader.module.css` for any complex animations if needed.
Create `index.ts` barrel export.

**Verification**: Header renders with navigation links and controls

---

### Task 4: Create MobileDrawer Component

**Action**: Create animated mobile navigation drawer

**Create file**: `nextjs-app/shared/patterns/SiteHeader/MobileDrawer.tsx`

```typescript
// MobileDrawer.tsx
"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { NavLink } from "@/nextjs-app/shared/components/NavLink";
import { IconButton } from "@/nextjs-app/shared/components/ui";
import { X, Sun, Moon, CircleHalf } from "@phosphor-icons/react";
import type { NavItem } from "./SiteHeader";
import type { Theme } from "@dt/ThemeProvider";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  currentLang: string;
  onLanguageChange: (code: string) => void;
  onThemeToggle: () => void;
  theme: Theme;
}

const themeIcons = {
  light: Sun,
  dark: Moon,
  hcb: CircleHalf,
  hcw: CircleHalf,
} as const;

export function MobileDrawer({
  isOpen,
  onClose,
  navItems,
  currentLang,
  onLanguageChange,
  onThemeToggle,
  theme,
}: MobileDrawerProps) {
  const { t } = useTranslation();
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const ThemeIcon = themeIcons[theme];

  // GSAP animations
  useEffect(() => {
    if (!isOpen) return;

    const ctx = gsap.context(() => {
      // Backdrop fade in
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }
      );

      // Panel slide in
      gsap.fromTo(
        panelRef.current,
        { x: "100%" },
        { x: "0%", duration: 0.3, ease: "power2.out" }
      );

      // Stagger nav items
      gsap.fromTo(
        "[data-nav-item]",
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.2, stagger: 0.05, delay: 0.15 }
      );
    });

    return () => ctx.revert();
  }, [isOpen]);

  // Focus trap and escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 bg-black/50 lg:hidden"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-[280px] max-w-[80vw] bg-background border-l border-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("navMenuAccessibleLabel")}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-heading text-title-s font-semibold">
            {t("navMenuTitle", "Menu")}
          </span>
          <IconButton
            icon={<X weight="bold" className="size-5" />}
            label={t("navMenuClose")}
            onClick={onClose}
            variant="ghost"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4" aria-label={t("navMenuLinks")}>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href} data-nav-item>
                <NavLink
                  href={item.href}
                  exact={item.exact}
                  className="block py-3 px-4 rounded-md text-title-s font-medium hover:bg-muted"
                  activeClassName="bg-muted text-foreground"
                  inactiveClassName="text-muted-foreground"
                >
                  {t(item.label)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Controls */}
        <div className="p-4 border-t border-border space-y-4">
          {/* Language */}
          <div>
            <span className="block font-body text-text-s text-muted-foreground mb-2">
              {t("navMenuLanguages")}
            </span>
            <div className="flex gap-2">
              {["en", "fi", "sv"].map((code) => (
                <button
                  key={code}
                  onClick={() => onLanguageChange(code)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-md text-text-m font-body uppercase transition-colors",
                    currentLang === code
                      ? "bg-foreground text-background font-medium"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between">
            <span className="font-body text-text-s text-muted-foreground">
              {t("navMenuTheme")}
            </span>
            <IconButton
              icon={<ThemeIcon weight="bold" className="size-5" />}
              label={t("navMenuThemeToggle")}
              onClick={onThemeToggle}
              variant="outline"
            />
          </div>

          {/* Legal Links */}
          <div className="flex gap-4 pt-2">
            <Link
              href="/privacy-policy"
              className="font-body text-text-s text-muted-foreground hover:text-foreground"
            >
              {t("navMenuCookiePolicy")}
            </Link>
            <Link
              href="/ai-use"
              className="font-body text-text-s text-muted-foreground hover:text-foreground"
            >
              {t("navMenuAiUsage")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Verification**: Mobile drawer slides in with staggered animation

---

### Task 5: Create SiteFooter Component

**Action**: Create Tailwind-first footer component

**Create folder**: `nextjs-app/shared/patterns/SiteFooter/`

```typescript
// SiteFooter.tsx
"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Container, Stack } from "@/nextjs-app/shared/components/Layout";
import { TextLink, Divider } from "@/nextjs-app/shared/components/ui";
import {
  InstagramLogo,
  FacebookLogo,
  LinkedinLogo,
  GithubLogo,
  XLogo,
  DribbbleLogo,
  Newspaper,
  MediumLogo,
} from "@phosphor-icons/react";

interface SocialLink {
  href: string;
  icon: React.ElementType;
  label: string;
}

const socialLinks: SocialLink[] = [
  { href: "https://www.instagram.com/digitaltableteur/", icon: InstagramLogo, label: "footerAriaInstagram" },
  { href: "https://www.facebook.com/digitaltableteur", icon: FacebookLogo, label: "footerAriaFacebook" },
  { href: "https://www.linkedin.com/company/digitaltableteur/", icon: LinkedinLogo, label: "footerAriaLinkedin" },
  { href: "https://medium.com/digitaltableteur", icon: MediumLogo, label: "footerAriaMedium" },
  { href: "https://x.com/dtdoesdesign", icon: XLogo, label: "footerAriaX" },
  { href: "https://github.com/PetriLahdelma", icon: GithubLogo, label: "footerAriaGithub" },
  { href: "https://substack.com/@petrilahdelma", icon: Newspaper, label: "footerAriaSubstack" },
  { href: "https://dribbble.com/digitaltableteur", icon: DribbbleLogo, label: "footerAriaDribbble" },
];

export interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("border-t border-border bg-muted/30 py-16", className)}>
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-heading text-title-m font-bold">Digitaltableteur</span>
            </Link>
            <div className="space-y-4 font-body text-text-m text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">{t("footerAddressTitle")}</p>
                <p>{t("footerAddress1")}</p>
                <p>{t("footerAddress2")}</p>
                <a
                  href="mailto:mail@digitaltableteur.com"
                  className="text-foreground hover:underline"
                >
                  mail@digitaltableteur.com
                </a>
              </div>
            </div>
          </div>

          {/* Billing Info */}
          <div>
            <p className="font-heading text-text-m font-semibold mb-3">{t("footerBillingTitle")}</p>
            <div className="font-body text-text-s text-muted-foreground space-y-1">
              <p>{t("footerBillingName")}</p>
              <p>{t("footerBillingAddress")}</p>
              <p>{t("footerBillingZip")}</p>
              <p>{t("footerBillingVat")}</p>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <p className="font-heading text-text-m font-semibold mb-3">{t("footerLegalTitle")}</p>
            <Stack gap="xs">
              <TextLink href="/privacy-policy" variant="muted" underline="hover">
                {t("footerPrivacyPolicy")}
              </TextLink>
              <TextLink href="/ai-use" variant="muted" underline="hover">
                {t("footerAiUse")}
              </TextLink>
              <TextLink href="/accessibility" variant="muted" underline="hover">
                {t("footerAccessibility")}
              </TextLink>
            </Stack>
          </div>
        </div>

        <Divider className="my-8" />

        {/* Social Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Stack direction="horizontal" gap="sm">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={t(label)}
              >
                <Icon className="size-5" />
              </a>
            ))}
          </Stack>

          <p className="font-body text-text-s text-muted-foreground">
            &copy; {currentYear} Digitaltableteur. {t("footerCopyright")}
          </p>
        </div>
      </Container>
    </footer>
  );
}
```

Create `index.ts` barrel export.

**Verification**: Footer renders with all sections and social links

---

### Task 6: Create SkipLink Component

**Action**: Create accessible skip navigation link

**Create folder**: `nextjs-app/shared/components/SkipLink/`

```typescript
// SkipLink.tsx
"use client";

import { cn } from "@/lib/utils";

export interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SkipLink({
  href = "#main-content",
  children = "Skip to main content",
  className,
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only",
        "focus:absolute focus:top-4 focus:left-4 focus:z-50",
        "focus:px-4 focus:py-2 focus:rounded-md",
        "focus:bg-foreground focus:text-background",
        "focus:font-body focus:text-text-m focus:font-medium",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring",
        className
      )}
    >
      {children}
    </a>
  );
}
```

Create `index.ts` barrel export.

**Verification**: Skip link appears on focus, navigates to main content

---

### Task 7: Create Navigation Barrel Export

**Action**: Create central export for navigation components

**Create**: `nextjs-app/shared/patterns/navigation/index.ts`

```typescript
// Re-export navigation components
export { SiteHeader, type SiteHeaderProps, type NavItem } from "../SiteHeader";
export { SiteFooter, type SiteFooterProps } from "../SiteFooter";
export { NavLink, type NavLinkProps } from "@/nextjs-app/shared/components/NavLink";
export { SkipLink, type SkipLinkProps } from "@/nextjs-app/shared/components/SkipLink";
export { useNavigation, type UseNavigationReturn } from "@/nextjs-app/shared/hooks/useNavigation";
```

**Verification**: All navigation components importable from single path

---

### Task 8: Update Root Layout with New Navigation

**Action**: Integrate new navigation components in app layout

**Edit**: `app/layout.tsx`

Replace legacy Header/Footer with new components:
```typescript
import { SiteHeader, SiteFooter, SkipLink } from "@/nextjs-app/shared/patterns/navigation";

// In the layout JSX:
<body>
  <SkipLink />
  <SiteHeader />
  <main id="main-content" className="flex-1">
    {children}
  </main>
  <SiteFooter />
</body>
```

Note: Keep legacy imports commented for fallback during testing.

**Verification**: Navigation renders on all pages

---

### Task 9: Add Navigation Demo to TailwindTest

**Action**: Add navigation component showcase (just visual examples)

**Edit**: `nextjs-app/shared/components/TailwindTest/TailwindTest.tsx`

Add section showing navigation patterns:

```typescript
// Add imports
import { NavLink, SkipLink } from "@/nextjs-app/shared/patterns/navigation";

// Add new section after Interactive Components Demo:
{/* Navigation Components Demo - Phase 06-2 */}
<div className="mt-8 pt-8 border-t border-border">
  <h3 className="font-heading text-title-m font-bold mb-6">
    Navigation Components
  </h3>

  <Stack gap="lg">
    {/* NavLink */}
    <div className="bg-muted/30 p-4 rounded-sm">
      <p className="font-body text-text-s text-muted-foreground mb-2">NavLink:</p>
      <Stack direction="horizontal" gap="md">
        <NavLink href="/" exact>Home</NavLink>
        <NavLink href="/work">Work</NavLink>
        <NavLink href="/about">About</NavLink>
        <NavLink href="/blog">Blog</NavLink>
        <NavLink href="/contact">Contact</NavLink>
      </Stack>
    </div>

    {/* SkipLink demo note */}
    <div className="bg-muted/30 p-4 rounded-sm">
      <p className="font-body text-text-s text-muted-foreground mb-2">SkipLink:</p>
      <p className="font-body text-text-m">
        Press <kbd className="px-2 py-0.5 bg-muted rounded text-text-s font-mono">Tab</kbd> at the top of the page to see the skip link.
      </p>
    </div>
  </Stack>

  <div className="mt-6 p-4 bg-muted/50 rounded-sm">
    <p className="font-body text-text-s">
      <strong className="font-heading">Navigation Stack:</strong> SiteHeader, SiteFooter, NavLink, SkipLink, MobileDrawer
    </p>
  </div>
</div>
```

**Verification**: Navigate to TailwindTest, NavLink demonstrates active state

---

### Task 10: Verify and Test

**Action**: Run dev server and verify all functionality

**Commands**:
```bash
npm run dev
npm run typecheck
npm run lint
```

**Manual Testing**:
1. Open homepage — new header renders
2. Navigation links highlight correctly
3. Mobile menu opens with animation
4. Theme toggle works
5. Language switcher works
6. Footer renders with all sections
7. Skip link appears on Tab press
8. Route changes close mobile menu

**Verification Checklist**:
- [ ] SiteHeader renders correctly
- [ ] Desktop navigation works
- [ ] MobileDrawer animation works
- [ ] Language switcher works
- [ ] Theme toggle works
- [ ] SiteFooter renders correctly
- [ ] Social links work
- [ ] SkipLink is accessible
- [ ] NavLink shows active state
- [ ] No TypeScript errors
- [ ] No console warnings

---

## Success Criteria

- [ ] SiteHeader component created
- [ ] MobileDrawer component created with GSAP
- [ ] SiteFooter component created
- [ ] NavLink component created
- [ ] SkipLink component created
- [ ] useNavigation hook created
- [ ] Navigation barrel export created
- [ ] Layout updated with new navigation
- [ ] Demo added to TailwindTest
- [ ] TypeScript compiles without errors

---

## Output

After completion:
1. Commit each component individually
2. Update `.planning/STATE.md` to mark Phase 06 complete
3. Run `/gsd:verify-work` to test navigation

---

## Notes

- **Next.js native**: Uses `next/link` and `usePathname` instead of react-router-dom
- **GSAP integration**: Mobile drawer uses GSAP for smooth animations
- **Accessibility**: SkipLink, focus trap, keyboard navigation preserved
- **i18n**: All text uses translation keys
- **Legacy fallback**: Keep old components available during testing

---

*Plan created: 2026-01-14*
*Execute with `/gsd:execute-plan 06-2`*
