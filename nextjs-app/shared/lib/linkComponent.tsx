"use client";

import React, {
  createContext,
  useContext,
  type AnchorHTMLAttributes,
  type ComponentType,
} from "react";

export interface LinkComponentProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

/**
 * Framework-agnostic default: a plain anchor. The host app injects its router
 * link (e.g. next/link) via `LinkProvider` so catalog components never import a
 * framework link directly. When the design system is consumed standalone with
 * no provider, links degrade gracefully to full-navigation anchors.
 */
const DefaultLink: ComponentType<LinkComponentProps> = ({
  href,
  children,
  ...rest
}) => (
  <a href={href} {...rest}>
    {children}
  </a>
);

const LinkComponentContext =
  createContext<ComponentType<LinkComponentProps>>(DefaultLink);

/** Inject the link implementation catalog components render through. */
export function LinkProvider({
  component,
  children,
}: {
  component: ComponentType<LinkComponentProps>;
  children: React.ReactNode;
}) {
  return (
    <LinkComponentContext.Provider value={component}>
      {children}
    </LinkComponentContext.Provider>
  );
}

/**
 * Design-system link. Import this instead of `next/link`; it renders the
 * injected link component (a plain `<a>` when no provider is present). Being a
 * component (not a hook) it composes inside server components too.
 */
export const Link: ComponentType<LinkComponentProps> = ({
  href,
  children,
  ...rest
}) => {
  const Component = useContext(LinkComponentContext);
  return (
    <Component href={href} {...rest}>
      {children}
    </Component>
  );
};
