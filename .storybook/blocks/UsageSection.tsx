import React from "react";
import Text from "@dt/Text";
import type { DtContract } from "../lib/contracts";
import { Section } from "./Section";
import styles from "./UsageSection.module.css";

/**
 * `usage.description` rendered as paragraphs (split on blank lines).
 * Contract prose is deliberately plain; if Phase 3 content starts using
 * markup, swap the split for the addon-docs `Markdown` block.
 */
export function UsageSection({ contract }: { contract: DtContract }) {
  const description = contract.usage?.description?.trim();
  if (!description) return null;

  return (
    <Section block="usage" heading="Usage">
      <div className={styles.body}>
        {description.split(/\n\s*\n/).map((paragraph, index) => (
          <Text as="p" key={index} lineHeight="relaxed">
            {paragraph}
          </Text>
        ))}
      </div>
    </Section>
  );
}
