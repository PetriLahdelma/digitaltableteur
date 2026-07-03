import React from "react";
import Icon from "@dt/Icon";
import Text from "@dt/Text";
import type { DtContract } from "../lib/contracts";
import { Section } from "./Section";
import styles from "./A11ySection.module.css";

function VerificationBadge({
  label,
  verified,
  note,
}: {
  label: string;
  verified: boolean | undefined;
  note?: string;
}) {
  if (verified === undefined) return null;
  return (
    <span
      className={`${styles.verification} ${verified ? styles.ok : styles.pending}`}
      title={note}
    >
      <Icon name={verified ? "check-circle" : "circle-dashed"} decorative />
      {label}
    </span>
  );
}

/** Accessibility contract: keyboard, ARIA requirements, verification flags. */
export function A11ySection({ contract }: { contract: DtContract }) {
  const a11y = contract.a11y;
  if (!a11y) return null;

  const keyboard = a11y.keyboard ?? [];
  const aria = a11y.ariaRequirements ?? [];

  return (
    <Section block="a11y" heading="Accessibility">
      <div className={styles.grid}>
        {keyboard.length > 0 ? (
          <div>
            <Text as="h3" size="s" className={styles.subheading}>
              Keyboard
            </Text>
            <div className={styles.keys}>
              {keyboard.map((key) => (
                <kbd key={key} className={styles.kbd}>
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ) : null}
        {aria.length > 0 ? (
          <div>
            <Text as="h3" size="s" className={styles.subheading}>
              ARIA
            </Text>
            <ul className={styles.ariaList}>
              {aria.map((requirement) => (
                <li key={requirement}>
                  <Text as="span" size="s">
                    {requirement}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <div className={styles.verifications}>
        <VerificationBadge
          label="Forced colors verified"
          verified={a11y.forcedColorsVerified}
        />
        <VerificationBadge
          label="Accessibility tree verified"
          verified={a11y.accessibilityTreeVerified}
        />
        <VerificationBadge
          label="Reduced motion"
          verified={a11y.reducedMotion}
        />
        <VerificationBadge
          label="Reviewed"
          verified={a11y.reviewed}
          note={a11y.reviewedNote}
        />
        <VerificationBadge
          label="Screen reader verified"
          verified={a11y.screenReaderVerified}
          note={a11y.screenReaderNote}
        />
      </div>
    </Section>
  );
}
