import React from "react";
import * as componentRegistry from "../../nextjs-app/shared/components/index";
import {
  DOC_TIER_1_CATEGORIES,
  // eslint-disable-next-line import/no-relative-packages -- repo-internal single source for doc tiers
} from "../../scripts/design-system/doc-tiers.mjs";
import Text from "@dt/Text";
import Title from "@dt/Title";
import { getContractByName, storyIdFromTitle } from "../lib/contracts";
import { managerHref } from "./managerHref";
import { StatusPill } from "./StatusPill";
import styles from "./ComponentsGallery.module.css";

type Registry = Record<string, React.ComponentType<Record<string, unknown>>>;

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
  const defaults = contract?.playground?.defaults;
  const Component = (componentRegistry as unknown as Registry)[name];
  const canPreview = Boolean(defaults && Component);

  return (
    <a className={styles.card} href={href} target="_top">
      <span className={styles.preview} aria-hidden="true">
        {canPreview ? (
          <PreviewBoundary fallback={<Monogram name={name} />}>
            <span className={styles.previewInner}>
              <Component {...(defaults as Record<string, unknown>)} />
            </span>
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
