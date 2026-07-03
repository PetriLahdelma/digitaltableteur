import React from "react";
import type { DtContract } from "../lib/contracts";
import { Section } from "./Section";
import styles from "./AnatomySection.module.css";

/** Element / Required / Description table from `usage.anatomy`. */
export function AnatomySection({ contract }: { contract: DtContract }) {
  const anatomy = contract.usage?.anatomy ?? [];
  if (anatomy.length === 0) return null;

  return (
    <Section block="anatomy" heading="Anatomy">
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Element</th>
            <th scope="col">Required</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {anatomy.map((item) => (
            <tr key={item.name}>
              <th scope="row">{item.name}</th>
              <td className={item.required ? styles.required : styles.optional}>
                {item.required ? "Yes" : "No"}
              </td>
              <td>{item.description ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}
