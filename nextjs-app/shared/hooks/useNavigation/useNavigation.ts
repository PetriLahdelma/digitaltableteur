"use client";

import { useState, useCallback, useEffect } from "react";
import { useNavigationPathname } from "../../lib/navigation";

export interface UseNavigationReturn {
  isMobileMenuOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
}

export function useNavigation(): UseNavigationReturn {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = useNavigationPathname() ?? "";

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll and set data attribute when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.dataset.mobileMenuOpen = "true";
    } else {
      document.body.style.overflow = "";
      delete document.body.dataset.mobileMenuOpen;
    }
    return () => {
      document.body.style.overflow = "";
      delete document.body.dataset.mobileMenuOpen;
    };
  }, [isMobileMenuOpen]);

  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(
    () => setMobileMenuOpen((prev) => !prev),
    []
  );

  return {
    isMobileMenuOpen,
    openMobileMenu,
    closeMobileMenu,
    toggleMobileMenu,
  };
}
