import React from "react";
import Title from "@dt/Title";
import Text from "@dt/Text";
import Link from "@dt/Link";
import type { DtContract } from "../lib/contracts";
import {
  reactComponentStoryHref,
  webComponentStoryHref,
} from "../lib/web-components";
import { StatusPill } from "./StatusPill";
import type { ComponentStatus } from "./StatusPill";
import styles from "./DocHeader.module.css";

/**
 * Docs-page masthead, stacked: the component group on its own row, then the
 * name with its lifecycle status, then the Figma source link. The contract's
 * `description` doubles as the standfirst and sits above the Figma link so the
 * link stays last.
 */
export function DocHeader({
  contract,
  implementation = "react",
  implementationStatus,
}: {
  contract: DtContract;
  implementation?: "react" | "web-component";
  implementationStatus?: ComponentStatus;
}) {
  const figma =
    typeof contract.figma === "string" && contract.figma.startsWith("http")
      ? contract.figma
      : null;
  return (
    <header className={styles.header} data-doc-block="doc-header">
      {contract.group ? (
        <Text as="span" size="s" className={styles.group}>
          {contract.group}
        </Text>
      ) : null}
      <div className={styles.titleRow}>
        <Title as="h1" size="l" className={styles.title}>
          {contract.displayName ?? contract.name}
        </Title>
        {implementation === "web-component" && implementationStatus ? (
          <div
            className={styles.lifecycleStatuses}
            aria-label="Lifecycle status"
          >
            <span className={styles.lifecycleStatus}>
              <span className={styles.lifecycleLabel}>API</span>
              <StatusPill status={contract.status} />
            </span>
            <span className={styles.lifecycleStatus}>
              <span className={styles.lifecycleLabel}>Implementation</span>
              <StatusPill status={implementationStatus} />
            </span>
          </div>
        ) : (
          <StatusPill status={contract.status} />
        )}
      </div>
      <ImplementationSwitch
        componentName={contract.name}
        implementation={implementation}
      />
      {contract.description ? (
        <Text
          as="p"
          size="l"
          lineHeight="relaxed"
          className={styles.standfirst}
        >
          {contract.description}
        </Text>
      ) : null}
      {figma ? (
        <Link
          href={figma}
          target="_blank"
          underline="none"
          className={styles.figma}
        >
          View in Figma
        </Link>
      ) : null}
    </header>
  );
}

export function ImplementationSwitch({
  componentName,
  implementation = "react",
}: {
  componentName: string;
  implementation?: "react" | "web-component";
}) {
  const webComponentHref = webComponentStoryHref(componentName);
  const reactComponentHref = reactComponentStoryHref(componentName);
  if (!webComponentHref) return null;

  return (
    <nav className={styles.implementations} aria-label="Implementation">
      {implementation === "react" ? (
        <span className={styles.currentImplementation} aria-current="page">
          React
        </span>
      ) : (
        <a href={reactComponentHref ?? undefined} target="_top">
          React
        </a>
      )}
      {implementation === "web-component" ? (
        <span className={styles.currentImplementation} aria-current="page">
          Web component
        </span>
      ) : (
        <a href={webComponentHref} target="_top">
          Web component
        </a>
      )}
    </nav>
  );
}
