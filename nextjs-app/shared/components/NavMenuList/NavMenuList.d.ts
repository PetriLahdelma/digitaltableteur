import React from "react";
export type NavMenuItem = {
    to: string;
    label: string;
    exact?: boolean;
};
export interface NavMenuListProps {
    items: NavMenuItem[];
    onNavigate?: () => void;
    activeClassName?: string;
    listClassName?: string;
    itemClassName?: string;
}
/**
 * Reusable navigation list for mobile / other menus.
 * Determines active state based on current location and applies an active class.
 */
declare const NavMenuList: React.FC<NavMenuListProps>;
export default NavMenuList;
//# sourceMappingURL=NavMenuList.d.ts.map