import React, { type AnchorHTMLAttributes, type ComponentType } from "react";
export interface LinkComponentProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
}
/** Inject the link implementation catalog components render through. */
export declare function LinkProvider({ component, children, }: {
    component: ComponentType<LinkComponentProps>;
    children: React.ReactNode;
}): React.JSX.Element;
/**
 * Design-system link. Import this instead of `next/link`; it renders the
 * injected link component (a plain `<a>` when no provider is present). Being a
 * component (not a hook) it composes inside server components too.
 */
export declare const Link: ComponentType<LinkComponentProps>;
//# sourceMappingURL=linkComponent.d.ts.map