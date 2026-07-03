import React from "react";
import type { DtContract } from "../lib/contracts";
import { Section } from "./Section";
import styles from "./ThemingSection.module.css";

const TOKEN_CATEGORY_LABELS: Record<string, string> = {
  colors: "color",
  spacing: "spacing",
  radii: "radius",
  shadows: "shadow",
  zIndex: "z-index",
  typography: "typography",
};

type Row = { name: string; detail: string };

/**
 * CSS custom properties the component consumes. Prefers hand-authored
 * `theming.vars` (name + description + default); falls back to the
 * contract's `tokens` inventory. The spec's build-step CSS grep against
 * token-catalog.json is deferred to the Phase 4 registry work.
 */
export function ThemingSection({ contract }: { contract: DtContract }) {
  const vars = contract.theming?.vars ?? [];
  const rows: Row[] =
    vars.length > 0
      ? vars.map((v) => ({
          name: v.name,
          detail: `${v.description} (default: ${v.default})`,
        }))
      : Object.entries(contract.tokens ?? {}).flatMap(([category, names]) =>
          (names ?? []).map((name) => ({
            name,
            detail: TOKEN_CATEGORY_LABELS[category] ?? category,
          })),
        );

  if (rows.length === 0) return null;

  return (
    <Section block="theming" heading="Theming">
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col">{vars.length > 0 ? "Description" : "Category"}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>
                <code className={styles.token}>{row.name}</code>
              </td>
              <td className={styles.detail}>{row.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}
