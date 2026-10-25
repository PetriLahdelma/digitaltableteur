import React from "react";
import type { CodeLineState } from "./lines";

/**
 * Helpers for a pre-highlighted Shiki tree (rehype-pretty-code output:
 * <pre data-language><code data-line-numbers?><span data-line> lines).
 *
 * Children that cross a server→client component boundary arrive on the client
 * as React Flight "lazy" nodes ($$typeof react.lazy) during hydration, NOT as
 * plain elements. React renders them fine, but React.isValidElement returns
 * false, so every introspection below would silently fail on the client while
 * succeeding in SSR, producing a hydration mismatch. Fulfilled lazy nodes are
 * unwrapped before inspecting; unresolved ones are left alone, so
 * introspection degrades the same way on both passes.
 */
const REACT_LAZY_TYPE = Symbol.for("react.lazy");

type FlightLazyNode = {
  $$typeof: symbol;
  _payload?: { status?: string; value?: React.ReactNode };
};

type DataProps = { [key: string]: unknown; children?: React.ReactNode };

const isFlightLazyNode = (node: unknown): node is FlightLazyNode =>
  typeof node === "object" &&
  node !== null &&
  (node as FlightLazyNode).$$typeof === REACT_LAZY_TYPE;

export function resolveFlightNode(node: React.ReactNode): React.ReactNode {
  let current = node;
  for (let hops = 0; hops < 10 && isFlightLazyNode(current); hops += 1) {
    const payload = current._payload;
    if (!payload || payload.status !== "fulfilled") return current;
    current = payload.value as React.ReactNode;
  }
  return current;
}

const has = (props: DataProps, attribute: string) =>
  Object.prototype.hasOwnProperty.call(props, attribute);

const elementOf = (node: React.ReactNode) => {
  const resolved = resolveFlightNode(node);
  return React.isValidElement<DataProps>(resolved) ? resolved : null;
};

/**
 * State of one Shiki line. Authors mark callouts in the MDX meta string: a
 * line range highlights, and a range given the id "added" or "removed"
 * marks a diff (rehype-pretty-code writes the id to
 * data-highlighted-line-id).
 */
export function shikiLineState(props: DataProps): CodeLineState {
  if (!has(props, "data-highlighted-line")) return "default";
  const id = props["data-highlighted-line-id"];
  if (id === "added" || id === "removed") return id;
  return "highlighted";
}

const textOf = (node: React.ReactNode): string => {
  const resolved = resolveFlightNode(node);
  if (typeof resolved === "string" || typeof resolved === "number") {
    return String(resolved);
  }
  if (Array.isArray(resolved)) return resolved.map(textOf).join("");
  const element = elementOf(resolved);
  return element ? textOf(element.props.children) : "";
};

/** The <code> inside the <pre>, even when MDX maps `code` to a component. */
const isCodeElement = (element: React.ReactElement<DataProps>) =>
  element.type === "code" || has(element.props, "data-language");

/**
 * A unified-diff line's state from its leading character. Shiki colours a
 * `diff` block but leaves the +/- in the text; the block turns them into
 * added and removed rows like it does for a `language="diff"` string.
 */
const diffState = (text: string): CodeLineState => {
  if (text.startsWith("+") && !text.startsWith("+++")) return "added";
  if (text.startsWith("-") && !text.startsWith("---")) return "removed";
  return "default";
};

const hasDiffMarker = (text: string) =>
  diffState(text) !== "default" || text.startsWith(" ");

/** Drops the first character of a line's text (the diff marker). */
const dropFirstChar = (node: React.ReactNode): [React.ReactNode, boolean] => {
  const resolved = resolveFlightNode(node);
  if (typeof resolved === "string") {
    return resolved.length ? [resolved.slice(1), true] : [resolved, false];
  }
  if (Array.isArray(resolved)) {
    let done = false;
    const next = resolved.map((child) => {
      if (done) return child;
      const [result, dropped] = dropFirstChar(child);
      done = dropped;
      return result;
    });
    return [next, done];
  }
  const element = elementOf(resolved);
  if (!element) return [node, false];
  const [children, dropped] = dropFirstChar(element.props.children);
  return [
    dropped ? React.cloneElement(element, undefined, children) : element,
    dropped,
  ];
};

export interface ShikiSummary {
  /** Copy text: every line but removed ones, without diff markers. */
  text: string;
  /** data-language on the <pre>, if any. */
  language?: string;
  /** The code element carries data-line-numbers (MDX `showLineNumbers`). */
  lineNumbers: boolean;
  /** At least one line is marked added or removed. */
  hasDiff: boolean;
}

/** Walks a Shiki tree once for everything the block chrome needs. */
export function summarizeShikiTree(root: React.ReactNode): ShikiSummary {
  const lines: string[] = [];
  const summary: ShikiSummary = { text: "", lineNumbers: false, hasDiff: false };

  const visit = (node: React.ReactNode) => {
    const resolved = resolveFlightNode(node);
    if (Array.isArray(resolved)) {
      resolved.forEach(visit);
      return;
    }
    const element = elementOf(resolved);
    if (!element) return;
    const props = element.props;
    if (element.type === "pre" && typeof props["data-language"] === "string") {
      summary.language = props["data-language"] as string;
    }
    if (element.type !== "pre" && has(props, "data-line-numbers")) {
      summary.lineNumbers = true;
    }
    if (has(props, "data-line")) {
      let text = textOf(props.children);
      if (text === " ") text = "";
      let state = shikiLineState(props);
      if (summary.language === "diff" && state === "default") {
        state = diffState(text);
        if (hasDiffMarker(text)) text = text.slice(1);
      }
      if (state === "added" || state === "removed") summary.hasDiff = true;
      if (state !== "removed") lines.push(text);
      return;
    }
    visit(props.children);
  };

  visit(root);
  summary.text = lines.join("\n").trimEnd();
  return summary;
}

export interface ShikiClassNames {
  pre: string;
  code: string;
}

/**
 * Adds the block's classes to the <pre> and <code>, and a localized label to
 * added and removed lines for the sign column's alternative text. In a
 * `diff` block the +/- markers become row states and leave the text.
 */
export function decorateShikiTree(
  root: React.ReactNode,
  classNames: ShikiClassNames,
  signLabels: { added: string; removed: string },
): React.ReactNode {
  const pre = elementOf(root);
  if (!pre || pre.type !== "pre") return root;
  const isDiff = pre.props["data-language"] === "diff";

  const decorateLine = (rawLine: React.ReactNode) => {
    const line = elementOf(rawLine);
    if (!line || !has(line.props, "data-line")) return rawLine;
    let state = shikiLineState(line.props);
    let children = line.props.children;
    if (isDiff && state === "default") {
      const text = textOf(children);
      state = diffState(text);
      if (hasDiffMarker(text)) [children] = dropFirstChar(children);
    }
    if (state !== "added" && state !== "removed") {
      return children === line.props.children
        ? rawLine
        : React.cloneElement(line, undefined, children);
    }
    return React.cloneElement(
      line,
      {
        "data-highlighted-line": "",
        "data-highlighted-line-id": state,
        "data-sign-label": signLabels[state],
      } as DataProps,
      children,
    );
  };

  const children = React.Children.map(pre.props.children, (rawChild) => {
    const child = elementOf(rawChild);
    if (!child || !isCodeElement(child)) return rawChild;
    return React.cloneElement(
      child,
      {
        className: [classNames.code, child.props.className]
          .filter(Boolean)
          .join(" "),
      } as DataProps,
      React.Children.map(child.props.children, decorateLine),
    );
  });

  // rehype-pretty-code makes every <pre> a tab stop; the block's body becomes
  // one only when it actually scrolls, so the pre drops its own.
  return React.cloneElement(
    pre,
    {
      className: [classNames.pre, pre.props.className].filter(Boolean).join(" "),
      tabIndex: undefined,
    } as DataProps,
    children,
  );
}
