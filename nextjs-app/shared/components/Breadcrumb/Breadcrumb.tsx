"use client";

import React from "react";
import Link from "@dt/Link";
import Icon from "@dt/Icon";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@dt/Menu";
import styles from "./Breadcrumb.module.css";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbProps = {
  /** Breadcrumb items in root-to-current order (label, optional href); the last renders as plain text. */
  items: BreadcrumbItem[];
  /** Accessible name for the nav landmark. @default "Breadcrumb" */
  "aria-label"?: string;
  /**
   * Underline mode forwarded to the Link for each trail item — the same
   * contract as Link: "always" shows the wavy underline permanently, "hover"
   * reveals it on hover and keyboard focus, "none" omits it. @default "always"
   */
  underline?: "always" | "hover" | "none";
  /**
   * Static collapse cap. When set to a positive number smaller than the item
   * count, the middle items collapse into an ellipsis menu WITHOUT measuring:
   * the first `maxItems - 2` leading items and the current item stay visible.
   * Leave unset (or 0) for automatic width-based collapse (the default).
   */
  maxItems?: number;
  /** Accessible name for the ellipsis menu trigger. @default "Show N hidden breadcrumbs" */
  collapseLabel?: string;
  /**
   * Render the first item as a house icon instead of its text label. The
   * item's label becomes the icon's accessible name, so screen readers still
   * announce it (e.g. "Home"). @default false
   */
  homeIcon?: boolean;
};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/**
 * How many leading items to show before the ellipsis when the trail overflows,
 * or null to show every item. The current (last) item is always shown; hidden
 * items are those between the returned count and the current item. Pure so the
 * fit math is unit-testable without a DOM.
 */
export function computeLeadingCount(params: {
  /** Per-item natural widths from the measurer; leading widths include their separator, the last is the current label. */
  itemWidths: number[];
  /** Width of the ellipsis item (button + separator). */
  ellipsisWidth: number;
  /** Gap between list items. */
  listGap: number;
  /** Available container width. */
  available: number;
}): number | null {
  const { itemWidths, ellipsisWidth, listGap, available } = params;
  const n = itemWidths.length;
  if (n <= 3) return null;
  // Unmeasured (SSR / jsdom without layout) — never collapse.
  if (available <= 0 || itemWidths.some((w) => w <= 0)) return null;

  const fullWidth =
    itemWidths.reduce((sum, w) => sum + w, 0) + listGap * (n - 1);
  if (fullWidth <= available) return null;

  const currentWidth = itemWidths[n - 1];
  for (let leading = n - 2; leading >= 1; leading -= 1) {
    let width = ellipsisWidth + currentWidth + listGap * (leading + 1);
    for (let i = 0; i < leading; i += 1) width += itemWidths[i];
    if (width <= available) return leading;
  }
  // Even one leading item overflows — still show first / … / current.
  return 1;
}

function staticLeadingCount(count: number, maxItems: number): number | null {
  if (count <= maxItems || count <= 3) return null;
  return Math.min(Math.max(1, maxItems - 2), count - 2);
}

/** Breadcrumb navigation trail with current page indication and overflow collapse. */
const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  "aria-label": ariaLabel = "Breadcrumb",
  underline = "always",
  maxItems,
  collapseLabel,
  homeIcon = false,
}) => {
  const isStatic = typeof maxItems === "number" && maxItems > 0;
  const navRef = React.useRef<HTMLElement | null>(null);
  const measureRef = React.useRef<HTMLOListElement | null>(null);
  const [autoLeading, setAutoLeading] = React.useState<number | null>(null);

  const staticLeading = React.useMemo(
    () => (isStatic ? staticLeadingCount(items.length, maxItems as number) : null),
    [isStatic, items.length, maxItems],
  );

  const measure = React.useCallback(() => {
    const nav = navRef.current;
    const measurer = measureRef.current;
    if (!nav || !measurer) return;
    const available = nav.clientWidth;
    const itemWidths = Array.from(
      measurer.querySelectorAll<HTMLElement>("[data-measure-item]"),
    ).map((el) => el.offsetWidth);
    const ellipsisEl = measurer.querySelector<HTMLElement>(
      "[data-measure-ellipsis]",
    );
    const ellipsisWidth = ellipsisEl ? ellipsisEl.offsetWidth : 0;
    const listGap =
      parseFloat(getComputedStyle(measurer).columnGap || "0") || 0;
    setAutoLeading(
      computeLeadingCount({ itemWidths, ellipsisWidth, listGap, available }),
    );
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (isStatic) return;
    measure();
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(nav);
    return () => observer.disconnect();
  }, [isStatic, measure, items]);

  if (!items?.length) return null;
  const lastIndex = items.length - 1;
  const leadingCount = isStatic ? staticLeading : autoLeading;
  const isCollapsed = leadingCount != null;

  const renderItemContent = (
    item: BreadcrumbItem,
    idx: number,
    isLast: boolean,
  ) => {
    const isLink = Boolean(item.href) && !isLast;
    // First item optionally renders as a house icon; its label is the icon's
    // accessible name. Icons carry no wavy underline.
    if (homeIcon && idx === 0) {
      const icon = <Icon name="house" ariaLabel={item.label} size="sm" />;
      return isLink ? (
        <Link
          href={item.href as string}
          size="sm"
          underline="none"
          className={`${styles.link} ${styles.homeLink}`}
        >
          {icon}
        </Link>
      ) : (
        <span className={`${styles.current} ${styles.homeLink}`}>{icon}</span>
      );
    }
    return isLink ? (
      <Link
        href={item.href as string}
        size="sm"
        underline={underline}
        className={styles.link}
      >
        {item.label}
      </Link>
    ) : (
      <span className={styles.current}>{item.label}</span>
    );
  };

  const renderEllipsis = (hidden: BreadcrumbItem[]) => (
    <Menu>
      <MenuTrigger asChild>
        <button
          type="button"
          className={styles.ellipsis}
          aria-label={
            collapseLabel ||
            `Show ${hidden.length} hidden breadcrumb${
              hidden.length === 1 ? "" : "s"
            }`
          }
        >
          <span className={styles.ellipsisDots} aria-hidden="true">
            …
          </span>
          <span className={styles.ellipsisCaret} aria-hidden="true">
            <Icon name="caret-down" rotate={180} ariaLabel="" size="sm" />
          </span>
        </button>
      </MenuTrigger>
      <MenuContent align="start">
        {hidden.map((item, idx) => (
          <MenuItem
            key={`${item.label}-${idx}`}
            href={item.href}
            disabled={!item.href}
          >
            {item.label}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );

  const collapsed = isCollapsed
    ? {
        leading: items.slice(0, leadingCount as number),
        hidden: items.slice(leadingCount as number, lastIndex),
        current: items[lastIndex],
      }
    : null;

  return (
    <nav className={styles.breadcrumb} aria-label={ariaLabel} ref={navRef}>
      <ol className={styles.list}>
        {collapsed ? (
          <>
            {collapsed.leading.map((item, idx) => (
              <li key={`${item.label}-${idx}`} className={styles.item}>
                {renderItemContent(item, idx, false)}
                <span className={styles.separator}>/</span>
              </li>
            ))}
            <li className={styles.item}>
              {renderEllipsis(collapsed.hidden)}
              <span className={styles.separator}>/</span>
            </li>
            <li className={styles.item}>
              <span className={styles.current}>{collapsed.current.label}</span>
            </li>
          </>
        ) : (
          items.map((item, idx) => {
            const isLast = idx === lastIndex;
            return (
              <li key={`${item.label}-${idx}`} className={styles.item}>
                {renderItemContent(item, idx, isLast)}
                {!isLast && <span className={styles.separator}>/</span>}
              </li>
            );
          })
        )}
      </ol>

      {!isStatic && items.length > 3 && (
        <ol
          ref={measureRef}
          className={`${styles.list} ${styles.measurer}`}
          aria-hidden="true"
          inert
          data-measurer
        >
          {items.map((item, idx) => {
            const isLast = idx === lastIndex;
            return (
              <li
                key={`m-${item.label}-${idx}`}
                className={styles.item}
                data-measure-item
              >
                {renderItemContent(item, idx, isLast)}
                {!isLast && <span className={styles.separator}>/</span>}
              </li>
            );
          })}
          <li className={styles.item} data-measure-ellipsis>
            <span className={styles.ellipsis}>
              <span className={styles.ellipsisDots}>…</span>
            </span>
            <span className={styles.separator}>/</span>
          </li>
        </ol>
      )}
    </nav>
  );
};

export default Breadcrumb;
