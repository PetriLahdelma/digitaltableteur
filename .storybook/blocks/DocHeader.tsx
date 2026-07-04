import React from "react";
import Title from "@dt/Title";
import Text from "@dt/Text";
import Link from "@dt/Link";
import type { DtContract } from "../lib/contracts";
import { StatusPill } from "./StatusPill";
import styles from "./DocHeader.module.css";

/**
 * Docs-page masthead, stacked: the component group on its own row, then the
 * name with its lifecycle status, then the Figma source link. The contract's
 * `description` doubles as the standfirst and sits above the Figma link so the
 * link stays last.
 */
export function DocHeader({ contract }: { contract: DtContract }) {
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
        <StatusPill status={contract.status} />
      </div>
      {contract.description ? (
        <Text as="p" size="l" lineHeight="relaxed" className={styles.standfirst}>
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
