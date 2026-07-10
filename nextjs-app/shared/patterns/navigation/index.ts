// Navigation components barrel export

// Site-wide navigation
export { SiteHeader, type SiteHeaderProps, type NavItem } from "../SiteHeader";
export { MobileDrawer } from "../SiteHeader";
export { SiteFooter, type SiteFooterProps } from "../SiteFooter";

// Navigation primitives
export { NavLink, type NavLinkProps } from "../../components/NavLink";
export { SkipLink, type SkipLinkProps } from "../../components/SkipLink";

// Navigation hooks
export {
  useNavigation,
  type UseNavigationReturn,
} from "../../hooks/useNavigation";
