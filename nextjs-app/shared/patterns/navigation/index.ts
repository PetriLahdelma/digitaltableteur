// Navigation components barrel export

// Site-wide navigation
export { SiteHeader, type SiteHeaderProps, type NavItem } from "../SiteHeader";
export { MobileDrawer } from "../SiteHeader";
export { SiteFooter, type SiteFooterProps } from "../SiteFooter";

// Navigation primitives
export { NavLink, type NavLinkProps } from "@digitaltableteur/react";
export { SkipLink, type SkipLinkProps } from "@/nextjs-app/shared/components/SkipLink";

// Navigation hooks
export {
  useNavigation,
  type UseNavigationReturn,
} from "@/nextjs-app/shared/hooks/useNavigation";
