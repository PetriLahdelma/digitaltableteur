import React from "react";
import Icon from "@dt/Icon";
import Text from "@dt/Text";
import type { DtContract, ContractBestPractice } from "../lib/contracts";
import { Section } from "./Section";
import styles from "./BestPractices.module.css";

function PracticeCard({
  kind,
  items,
}: {
  kind: "do" | "dont";
  items: ContractBestPractice[];
}) {
  if (items.length === 0) return null;
  return (
    <div className={`${styles.card} ${styles[kind]}`}>
      <Text as="h3" size="s" className={styles.cardHeading}>
        {kind === "do" ? "Do" : "Don't"}
      </Text>
      <ul className={styles.list}>
        {items.map((item, index) => (
          <li key={index} className={styles.item}>
            <Icon
              name={kind === "do" ? "check-circle" : "x-circle"}
              decorative
            />
            <Text as="span" size="s" lineHeight="relaxed">
              {item.description}
            </Text>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Two-column Do / Don't guidance from `usage.bestPractices`. */
export function BestPractices({ contract }: { contract: DtContract }) {
  const practices = contract.usage?.bestPractices ?? [];
  if (practices.length === 0) return null;

  return (
    <Section block="best-practices" heading="Best practices">
      <div className={styles.columns}>
        <PracticeCard kind="do" items={practices.filter((p) => p.guidance)} />
        <PracticeCard
          kind="dont"
          items={practices.filter((p) => !p.guidance)}
        />
      </div>
    </Section>
  );
}
