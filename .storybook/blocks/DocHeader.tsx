import React from "react";
import Title from "@dt/Title";
import Text from "@dt/Text";
import Link from "@dt/Link";
import Icon from "@dt/Icon";
import type { DtContract } from "../lib/contracts";
import { StatusPill } from "./StatusPill";
import styles from "./DocHeader.module.css";

/**
 * Docs-page masthead: component name, lifecycle status, group and the Figma
 * source link. The contract's `description` doubles as the standfirst.
 */
export function DocHeader({ contract }: { contract: DtContract }) {
  const figma =
    typeof contract.figma === "string" && contract.figma.startsWith("http")
      ? contract.figma
      : null;

  return (
    <header className={styles.header} data-doc-block="doc-header">
      <div className={styles.titleRow}>
        <Title as="h1" size="l" className={styles.title}>
          {contract.displayName ?? contract.name}
        </Title>
        <StatusPill status={contract.status} />
        {contract.group ? (
          <Text as="span" size="s" className={styles.group}>
            {contract.group}
          </Text>
        ) : null}
        {figma ? (
          <Link href={figma} target="_blank" className={styles.figma}>
            <Icon name="figma-logo" decorative /> Figma
          </Link>
        ) : null}
      </div>
      {contract.description ? (
        <Text as="p" size="l" lineHeight="relaxed" className={styles.standfirst}>
          {contract.description}
        </Text>
      ) : null}
    </header>
  );
}
