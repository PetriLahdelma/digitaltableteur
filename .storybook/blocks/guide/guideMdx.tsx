import React, {
  Children,
  createContext,
  isValidElement,
  useContext,
} from "react";
import type { ComponentType, ReactNode } from "react";
import {
  AnchorMdx,
  CodeOrSourceMdx,
  HeadersMdx,
} from "@storybook/addon-docs/blocks";
import Code from "@dt/Code";
import CodeBlock from "@dt/CodeBlock";
import Link from "@dt/Link";
import Table from "@dt/Table";
import TableCell from "@dt/TableCell";
import TableHeaderCell from "@dt/TableHeaderCell";
import TableRow from "@dt/TableRow";
import Text from "@dt/Text";
import Title from "@dt/Title";
import { managerHref } from "../managerHref";
import styles from "./GuidePage.module.css";

/**
 * Markdown-to-DS mapping for guide pages.
 *
 * MDX resolves its components when the MDX file renders, above any wrapper a
 * page puts around its content, so a provider inside `GuidePage` comes too
 * late. These components are registered globally in `parameters.docs.
 * components` instead and choose at render time: inside a `GuidePage` they
 * render DS components; everywhere else they render exactly what Storybook
 * would (code/source blocks, anchor links, linked headers, plain elements),
 * so component docs pages are untouched.
 */
export const GuideContext = createContext(false);

type Props = {
  children?: ReactNode;
  className?: string;
  href?: string;
  id?: string;
};

const slug = (value: ReactNode): string =>
  textOf(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const textOf = (node: ReactNode): string =>
  Children.toArray(node)
    .map((part) => {
      if (typeof part === "string" || typeof part === "number")
        return String(part);
      if (isValidElement<{ children?: ReactNode }>(part))
        return textOf(part.props.children);
      return "";
    })
    .join("");

/**
 * `?path=/docs/...` links point at another Storybook page. Docs render inside
 * the preview iframe, so they go to the manager document instead.
 */
export function GuideAnchor({
  href = "#",
  children,
  underline = "always",
}: Props & { underline?: "always" | "hover" | "none" }) {
  const internal = href.startsWith("?path=");
  return (
    <Link
      href={internal ? managerHref(href.slice("?path=".length)) : href}
      target={internal ? "_top" : undefined}
      size="inherit"
      underline={underline}
    >
      {children}
    </Link>
  );
}

/**
 * Long paths and commands may wrap on a phone, but only after a slash, dot
 * or colon, never inside a name: "nextjs-app/shared/|locales/|en/".
 */
function breakable(children: ReactNode): ReactNode {
  if (typeof children !== "string" || children.length < 24) return children;
  return children.split(/(?<=[/.:])/).map((part, index) => (
    <React.Fragment key={index}>
      {index > 0 ? <wbr /> : null}
      {part}
    </React.Fragment>
  ));
}

function GuidePre({ children }: Props) {
  const child = Children.toArray(children)[0];
  if (!isValidElement<Props>(child)) return <pre>{children}</pre>;
  const language = child.props.className?.replace(/^language-/, "") || "text";
  const code = textOf(child.props.children).replace(/\n$/, "");
  return (
    <div className={styles.block}>
      <CodeBlock code={code} language={language} copyable />
    </div>
  );
}

/**
 * Markdown tables have no caption, so the column headings become the hidden
 * accessible name. `GuideTable` takes a real caption; prefer it.
 */
function GuideMdTable({ children }: Props) {
  const caption = textOf(Children.toArray(children)[0]).trim() || "Table";
  return (
    <div className={styles.block}>
      <Table caption={caption} hideCaption size="md">
        {children}
      </Table>
    </div>
  );
}

const guide: Record<string, ComponentType<Props>> = {
  h1: ({ children }) => (
    <Title as="h1" size="m" lineHeight="tight" className={styles.title}>
      {children}
    </Title>
  ),
  h2: ({ children }) => (
    <Title
      as="h2"
      size="xs"
      lineHeight="snug"
      id={slug(children)}
      className={styles.h2}
    >
      {children}
    </Title>
  ),
  h3: ({ children }) => (
    <Title as="h3" size="xxs" lineHeight="snug" className={styles.h3}>
      {children}
    </Title>
  ),
  p: ({ children }) => (
    <Text as="p" size="s" className={styles.p}>
      {children}
    </Text>
  ),
  a: ({ href, children }) => <GuideAnchor href={href}>{children}</GuideAnchor>,
  code: ({ children }) => <Code size="inherit">{breakable(children)}</Code>,
  pre: GuidePre,
  ul: ({ children }) => <ul className={styles.list}>{children}</ul>,
  ol: ({ children }) => <ol className={styles.orderedList}>{children}</ol>,
  li: ({ children }) => <li className={styles.item}>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className={styles.quote}>{children}</blockquote>
  ),
  hr: () => <hr className={styles.rule} />,
  table: GuideMdTable,
  tr: ({ children }) => <TableRow>{children}</TableRow>,
  th: ({ children }) => (
    <TableHeaderCell scope="col">{children}</TableHeaderCell>
  ),
  td: ({ children }) => (
    <TableCell
      className={textOf(children).length <= 28 ? styles.nowrap : undefined}
    >
      {children}
    </TableCell>
  ),
};

const storybookDefaults: Record<string, ComponentType<Props>> = {
  code: CodeOrSourceMdx as ComponentType<Props>,
  a: AnchorMdx as ComponentType<Props>,
  ...(HeadersMdx as Record<string, ComponentType<Props>>),
};

const pick = (tag: string): ComponentType<Props> => {
  const Guide = guide[tag];
  const Fallback = storybookDefaults[tag];
  function GuideAware(props: Props) {
    if (useContext(GuideContext)) return <Guide {...props} />;
    return Fallback ? <Fallback {...props} /> : React.createElement(tag, props);
  }
  GuideAware.displayName = `GuideAware(${tag})`;
  return GuideAware;
};

export const guideDocsComponents: Record<
  string,
  ComponentType<Props>
> = Object.fromEntries(Object.keys(guide).map((tag) => [tag, pick(tag)]));
