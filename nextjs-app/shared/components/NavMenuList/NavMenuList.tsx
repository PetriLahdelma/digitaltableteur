"use client";

import React from "react";
import { Link } from "../../lib/linkComponent";
import { useNavigationPathname } from "@digitaltableteur/react";
import styles from "./NavMenuList.module.css";

export type NavMenuItem = {
  to: string;
  label: string;
  exact?: boolean; // if true, use exact match, else startsWith for active state
};

export interface NavMenuListProps {
  items: NavMenuItem[];
  onNavigate?: () => void;
  activeClassName?: string; // override default active styling class
  listClassName?: string;
  itemClassName?: string; // applied to every link
}

/**
 * Reusable navigation list for mobile / other menus.
 * Determines active state based on current location and applies an active class.
 */
const NavMenuList: React.FC<NavMenuListProps> = ({
  items,
  onNavigate,
  activeClassName,
  listClassName,
  itemClassName,
}) => {
  const pathname = useNavigationPathname() ?? "/";
  return (
    <ul className={listClassName ?? styles.nav}>
      {items.map((item) => {
        const isActive = item.exact
          ? pathname === item.to
          : pathname === item.to || pathname.startsWith(`${item.to}/`);
        const linkClass = [styles.navLink, itemClassName]
          .filter(Boolean)
          .join(" ");
        const finalClass = [
          linkClass,
          isActive && (activeClassName ?? styles.navLinkActive),
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <li key={item.to} className={styles.navItem}>
            <Link
              href={item.to}
              className={finalClass}
              aria-current={isActive ? "page" : undefined}
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavMenuList;
