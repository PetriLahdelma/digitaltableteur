import React from "react";
import * as componentRegistry from "../../nextjs-app/shared/components/index";
import {
  DOC_TIER_1_CATEGORIES,
  // eslint-disable-next-line import/no-relative-packages -- repo-internal single source for doc tiers
} from "../../scripts/design-system/doc-tiers.mjs";
import Button from "@dt/Button";
import Text from "@dt/Text";
import Title from "@dt/Title";
import { getContractByName, storyIdFromTitle } from "../lib/contracts";
import { managerHref } from "./managerHref";
import { StatusPill } from "./StatusPill";
import styles from "./ComponentsGallery.module.css";

type Registry = Record<string, React.ComponentType<Record<string, unknown>>>;

/**
 * Preview-only component registry.
 *
 * The public barrel (`components/index`) intentionally omits many Tier 1
 * components — layout primitives, form parts, and portal/utility components
 * that are consumed via their `@dt/<Name>` paths rather than re-exported. The
 * gallery, however, needs EVERY Tier 1 component, so it resolves each card's
 * component from its own folder barrel (`<Name>/index.ts`), taking the default
 * export or the export named after the component. Globbing `index.ts` (rather
 * than `*.tsx`) structurally excludes stories, tests, and test templates, none
 * of which should ever be pulled into the docs bundle.
 */
const previewModules = import.meta.glob(
  "../../nextjs-app/shared/components/*/index.ts",
  { eager: true },
);
const previewRegistry: Registry = {};
for (const [path, mod] of Object.entries(previewModules)) {
  const match = path.match(/\/([^/]+)\/index\.ts$/);
  if (!match) continue;
  const name = match[1];
  const record = mod as Record<string, unknown>;
  const comp = record.default ?? record[name];
  // Accept plain function components AND forwardRef/memo objects (which carry a
  // `$$typeof` tag rather than being `typeof "function"`).
  const isRenderable =
    typeof comp === "function" ||
    (typeof comp === "object" && comp !== null && "$$typeof" in comp);
  if (isRenderable) {
    previewRegistry[name] = comp as React.ComponentType<Record<string, unknown>>;
  }
}

function resolveComponent(name: string) {
  return (
    (componentRegistry as unknown as Registry)[name] ?? previewRegistry[name]
  );
}

/**
 * Per-component preview tuning. A handful of components have no honest static
 * render from their raw playground defaults:
 *  - `props`   merge over the contract defaults (e.g. keep a toast in flow).
 *  - `fill`    stretch full-bleed marks (a rule/bar) so they are visible.
 *  - `wrapClassName` extra class on the preview wrapper (e.g. un-hide SkipLink).
 *  - `render`  a fully representative preview, built from real DS primitives,
 *              for portal/overlay components that cannot render inside a card.
 */
type PreviewSpec = {
  props?: Record<string, unknown>;
  fill?: boolean;
  wrapClassName?: string;
  render?: (
    defaults: Record<string, unknown>,
    Component: React.ComponentType<Record<string, unknown>> | undefined,
  ) => React.ReactNode;
};

/** Mini dialog built from real DS primitives; the live Modal portals full-screen. */
function ModalPreview(defaults: Record<string, unknown>) {
  const title = (defaults.title as string) ?? "Confirm changes";
  const description = defaults.description as string | undefined;
  return (
    <span className={styles.modalPreview}>
      <Title as="span" size="xs" className={styles.modalPreviewTitle}>
        {title}
      </Title>
      {description ? (
        <Text as="span" size="xs" lineHeight="snug" className={styles.dense}>
          {description}
        </Text>
      ) : null}
      <span className={styles.modalPreviewActions}>
        <Button variant="secondary" size="sm">
          Cancel
        </Button>
        <Button variant="primary" size="sm">
          Confirm
        </Button>
      </span>
    </span>
  );
}

/** Resting tooltip bubble; the live Tooltip renders its content through a portal. */
function TooltipPreview(defaults: Record<string, unknown>) {
  return (
    <span className={styles.tooltipPreview}>
      {(defaults.children as string) ?? "Helpful hint about this action."}
    </span>
  );
}

/** A visible gap framed by two rules; the live Spacer is an invisible box. */
function SpacerPreview(
  defaults: Record<string, unknown>,
  Component: React.ComponentType<Record<string, unknown>> | undefined,
) {
  return (
    <span className={styles.spacerPreview}>
      <span className={styles.spacerRule} />
      {Component ? <Component {...defaults} /> : null}
      <span className={styles.spacerRule} />
    </span>
  );
}

const PREVIEW_SPECS: Record<string, PreviewSpec> = {
  // Toast fixes itself to the viewport by default; `inline` keeps it in flow.
  Toast: { props: { inline: true } },
  // Full-bleed marks collapse to zero width when centered — let them stretch.
  Divider: { fill: true },
  Progress: { fill: true },
  Skeleton: { fill: true },
  // AspectRatio sizes from its container width; give it one to fill.
  AspectRatio: { fill: true },
  // SkipLink is off-screen until focused; the wrapper restores it in flow.
  SkipLink: { wrapClassName: styles.skipLinkPreview },
  Spacer: { render: SpacerPreview, fill: true },
  Modal: { render: ModalPreview },
  Tooltip: { render: TooltipPreview },
};

class PreviewBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Monogram({ name }: { name: string }) {
  return (
    <span className={styles.monogram} aria-hidden="true">
      {name.slice(0, 2)}
    </span>
  );
}

/** Exported for tests: renders one gallery card; monograms when no preview is possible. */
export function GalleryCard({ name, category }: { name: string; category: string }) {
  const contract = getContractByName(name);
  const href = managerHref(
    `/docs/${storyIdFromTitle(`${category}/${name}`)}--docs`,
  );
  const spec = PREVIEW_SPECS[name];
  const defaults = contract?.playground?.defaults;
  const Component = resolveComponent(name);

  let previewNode: React.ReactNode = null;
  if (spec?.render) {
    previewNode = spec.render(defaults ?? {}, Component);
  } else if (Component && defaults) {
    const previewProps = { ...defaults, ...(spec?.props ?? {}) };
    previewNode = <Component {...previewProps} />;
  }
  const canPreview = Boolean(previewNode);

  const previewInnerClassName = [
    styles.previewInner,
    spec?.fill ? styles.fill : null,
    spec?.wrapClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a className={styles.card} href={href} target="_top">
      <span className={styles.preview} aria-hidden="true">
        {canPreview ? (
          <PreviewBoundary fallback={<Monogram name={name} />}>
            <span className={previewInnerClassName}>{previewNode}</span>
          </PreviewBoundary>
        ) : (
          <Monogram name={name} />
        )}
      </span>
      <span className={styles.meta}>
        <span className={styles.nameRow}>
          <Text as="span" size="s" className={styles.name}>
            {name}
          </Text>
          {contract ? <StatusPill status={contract.status} /> : null}
        </span>
        <Text as="span" size="xs" lineHeight="snug" className={styles.dense}>
          {contract?.dense ?? contract?.description ?? ""}
        </Text>
      </span>
    </a>
  );
}

/**
 * The "/components" index feel inside Storybook: one card per Tier 1
 * component, grouped by sidebar category, with a live mini preview rendered
 * from the contract's playground.defaults when available.
 */
export function ComponentsGallery() {
  return (
    <div className={styles.gallery} data-doc-block="components-gallery">
      {Object.entries(DOC_TIER_1_CATEGORIES).map(([category, names]) => (
        <section key={category} className={styles.section}>
          <Title as="h2" size="xs" className={styles.heading}>
            {category}
          </Title>
          <div className={styles.grid}>
            {(names as string[]).map((name) => (
              <GalleryCard key={name} name={name} category={category} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
