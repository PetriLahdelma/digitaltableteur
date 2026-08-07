import { type ReactNode } from "react";
export interface NavLinkProps {
    /** Route path for next/link. */
    href: string;
    /** Navigation link label. */
    children: ReactNode;
    /** Match href exactly for the active state instead of by prefix. @default false */
    exact?: boolean;
    /** Base class names applied in every state. */
    className?: string;
    /** Class names applied when the route is active. */
    activeClassName?: string;
    /** Class names applied when the route is inactive. */
    inactiveClassName?: string;
}
export declare function NavLink({ href, children, exact, className, activeClassName, inactiveClassName, }: NavLinkProps): import("react").JSX.Element;
//# sourceMappingURL=NavLink.d.ts.map