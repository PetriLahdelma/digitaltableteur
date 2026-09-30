"use client";

import { useRef, useEffect } from "react";
import { useTranslate } from "../../lib/translation";
import { Link as RouterLink } from "../../lib/linkComponent";
import { gsap } from "gsap";
import { cn } from "../../lib/cn";
import { NavLink } from "../../components/NavLink";
import { IconButton } from "../../components/IconButton";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { X, Sun, Moon, CircleHalf } from "@phosphor-icons/react";
import type { NavItem } from "./SiteHeader";
import type { Theme } from "../../components/ThemeProvider";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  currentLang: string;
  onLanguageChange: (code: string) => void;
  onThemeToggle: () => void;
  theme: Theme;
}

const themeIcons: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  hcb: CircleHalf,
  hcw: CircleHalf,
};

export function MobileDrawer({
  isOpen,
  onClose,
  navItems,
  currentLang,
  onLanguageChange,
  onThemeToggle,
  theme,
}: MobileDrawerProps) {
  const t = useTranslate();
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const ThemeIcon = themeIcons[theme];

  useEffect(() => {
    if (!isOpen) return;

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) onClose();
    };

    if (desktopQuery.matches) {
      onClose();
      return;
    }

    desktopQuery.addEventListener("change", closeAtDesktop);
    return () =>
      desktopQuery.removeEventListener("change", closeAtDesktop);
  }, [isOpen, onClose]);

  useFocusTrap(panelRef, isOpen);

  // GSAP animations
  useEffect(() => {
    if (!isOpen) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        // Skip animations for reduced motion
        gsap.set(backdropRef.current, { opacity: 1 });
        gsap.set(panelRef.current, { x: "0%" });
        gsap.set("[data-nav-item]", { opacity: 1, x: 0 });
      } else {
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
      }
    });

    return () => ctx.revert();
  }, [isOpen]);

  // Escape closes the modal drawer; focus containment and restoration are
  // handled by the shared trap used by every custom modal surface.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="absolute right-0 top-0 h-dvh max-h-dvh w-[280px] max-w-[80vw] overflow-hidden bg-background border-l border-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("navMenuAccessibleLabel")}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between p-4 border-b border-border">
          <span className="font-heading text-title-s font-semibold">
            {t("navMenuTitle", "Menu")}
          </span>
          <IconButton
            icon={<X weight="bold" />}
            label={t("navMenuClose")}
            onClick={onClose}
            variant="tertiary"
          />
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          data-mobile-drawer-scroll-region
        >
          {/* Navigation */}
          <nav className="p-4" aria-label={t("navMenuLinks")}>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href} data-nav-item>
                  <NavLink
                    href={item.href}
                    exact={item.exact}
                    // Close on tap: the route-change effect in useNavigation only
                    // fires once the RSC payload lands, which on a slow mobile
                    // connection left the drawer open with no feedback for
                    // seconds (Sentry rage-click on /blog).
                    onClick={onClose}
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
                {[
                  { code: "en", ariaLabel: t("langEN_ariaLabel") },
                  { code: "fi", ariaLabel: t("langFI_ariaLabel") },
                  { code: "sv", ariaLabel: t("langSV_ariaLabel") },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => onLanguageChange(lang.code)}
                    aria-label={`${lang.code.toUpperCase()} — ${lang.ariaLabel}`}
                    aria-pressed={currentLang === lang.code}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-md text-text-m font-body uppercase transition-colors",
                      currentLang === lang.code
                        ? "bg-foreground text-background font-medium"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {lang.code.toUpperCase()}
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
                icon={<ThemeIcon weight="bold" />}
                label={t("navMenuThemeToggle")}
                onClick={onThemeToggle}
                variant="secondary"
              />
            </div>

            {/* Legal Links */}
            <div className="flex gap-4 pt-2">
              <RouterLink
                href="/privacy-policy"
                className="font-body text-text-s text-muted-foreground hover:text-foreground"
              >
                {t("navMenuCookiePolicy")}
              </RouterLink>
              <RouterLink
                href="/ai-use"
                className="font-body text-text-s text-muted-foreground hover:text-foreground"
              >
                {t("navMenuAiUsage")}
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
