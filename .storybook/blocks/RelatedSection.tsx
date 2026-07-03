import React from "react";
import type { DtContract } from "../lib/contracts";
import { Section } from "./Section";
import styles from "./RelatedSection.module.css";

/**
 * `composesWith` chips. The href resolver is injected by the docs page so
 * this block stays pure; unmapped names render as static chips.
 */
export function RelatedSection({
  contract,
  hrefForComponent,
}: {
  contract: DtContract;
  hrefForComponent: (name: string) => string | null;
}) {
  const related = contract.composesWith ?? [];
  if (related.length === 0) return null;

  return (
    <Section block="related" heading="Related">
      <div className={styles.chips}>
        {related.map((name) => {
          const href = hrefForComponent(name);
          return href ? (
            <a key={name} href={href} className={styles.chip}>
              {name}
            </a>
          ) : (
            <span key={name} className={styles.chip}>
              {name}
            </span>
          );
        })}
      </div>
    </Section>
  );
}
