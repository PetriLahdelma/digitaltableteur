import React, { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import usageReport from "../../foundations/dist/component-usage.json";
import styles from "./Documentation.module.css";

type UsageRow = {
  name: string;
  kind: string;
  status: string | null;
  governed?: boolean;
  exported?: boolean;
  directImportCount: number;
  directImporters: string[];
  packageImportCount?: number;
  packageImporters?: string[];
  prodPageCount: number;
  prodPages: string[];
};

type UsageSummary = {
  catalogCount: number;
  governedCount: number;
  exportedCount: number;
  strictConsumedCount: number;
  transitiveConsumedCount: number;
};

type SortKey = "name" | "directImportCount" | "prodPageCount";

const report = usageReport as {
  generatedAt: string;
  summary?: UsageSummary;
  components: UsageRow[];
};
const rows = report.components;
const generatedAt = report.generatedAt;

// Prefer the report's own summary; fall back to computing it from the rows so
// the page still renders against a report generated before the summary block
// (and before the governed/exported per-row fields) existed.
const computeSummary = (): UsageSummary => {
  const governed = rows.filter((row) => row.governed ?? row.status !== null);
  return {
    catalogCount: rows.length,
    governedCount: governed.length,
    exportedCount: rows.filter((row) => row.exported).length,
    strictConsumedCount: governed.filter(
      (row) => (row.packageImportCount ?? 0) > 0,
    ).length,
    transitiveConsumedCount: governed.filter(
      (row) => row.exported && row.prodPageCount > 0,
    ).length,
  };
};
const summary = report.summary ?? computeSummary();

const ComponentUsageContent = () => {
  const [sortKey, setSortKey] = useState<SortKey>("directImportCount");
  const [onlyUnused, setOnlyUnused] = useState(false);

  const sorted = useMemo(() => {
    const filtered = onlyUnused
      ? rows.filter((row) => row.directImportCount === 0)
      : rows;
    return [...filtered].sort((a, b) =>
      sortKey === "name"
        ? a.name.localeCompare(b.name)
        : b[sortKey] - a[sortKey] || a.name.localeCompare(b.name),
    );
  }, [sortKey, onlyUnused]);

  return (
    <article className={styles.wrapper}>
      <header className={styles.header}>
        <h1>Component Usage</h1>
        <p className={styles.lead}>
          Real adoption data from the production codebase, measured over the{" "}
          <strong>{summary.governedCount} governed</strong> (contract-bearing)
          components rather than the raw catalog, which also lists non-component
          dirs and bespoke one-off page components. Two honest consumption
          signals: components this repo imports directly from the npm barrel
          (strict dogfooding), and components that ship in the package and reach
          a production page (transitive).
        </p>
      </header>

      <section className={styles.section}>
        <div className={styles.principleGrid}>
          <div className={styles.principle}>
            <h3>{summary.governedCount}</h3>
            <p>
              Governed components{" "}
              <span style={{ opacity: 0.6 }}>
                (of {summary.catalogCount} catalog entries)
              </span>
            </p>
          </div>
          <div className={styles.principle}>
            <h3>
              {summary.transitiveConsumedCount}/{summary.governedCount}
            </h3>
            <p>
              Shipped in <code>@digitaltableteur/react</code> and rendered in
              production (transitive)
            </p>
          </div>
          <div className={styles.principle}>
            <h3>
              {summary.strictConsumedCount}/{summary.governedCount}
            </h3>
            <p>
              Directly imported from <code>@digitaltableteur/react</code> as a
              runtime value (strict dogfooding)
            </p>
          </div>
          <div className={styles.principle}>
            <h3>{summary.exportedCount}</h3>
            <p>Exported from the package barrel</p>
          </div>
          <div className={styles.principle}>
            <h3>{new Date(generatedAt).toLocaleDateString("en-GB")}</h3>
            <p>
              Generated{" "}
              {new Date(generatedAt).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className={styles.principle}>
            <h3>Regenerate</h3>
            <p>
              <code>npm run report:component-usage</code>
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <label>
            Sort by{" "}
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
            >
              <option value="directImportCount">direct imports</option>
              <option value="prodPageCount">prod pages</option>
              <option value="name">name</option>
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={onlyUnused}
              onChange={(event) => setOnlyUnused(event.target.checked)}
            />{" "}
            only zero-import components
          </label>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Component</th>
              <th>Kind</th>
              <th>Status</th>
              <th>In package</th>
              <th>Direct imports</th>
              <th>Prod pages</th>
              <th>Importers</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={`${row.kind}-${row.name}`}>
                <td>
                  <code>{row.name}</code>
                </td>
                <td>{row.kind}</td>
                <td>{row.status ?? "—"}</td>
                <td>{row.exported ? "✓" : "—"}</td>
                <td>{row.directImportCount}</td>
                <td>{row.prodPageCount}</td>
                <td>
                  {row.directImporters.length > 0 ? (
                    <details>
                      <summary>
                        {row.directImporters.length} file
                        {row.directImporters.length === 1 ? "" : "s"}
                      </summary>
                      <ul>
                        {row.directImporters.map((path) => (
                          <li key={path}>
                            <code>{path}</code>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </article>
  );
};

const meta: Meta = {
  title: "Docs/ComponentUsage",
  parameters: {
    layout: "fullscreen",
    vitest: {
      skip: true, // Documentation showcase; data-driven, no behavior to test.
    },
  },
};

export default meta;

type Story = StoryObj<typeof ComponentUsageContent>;

export const Usage: Story = {
  render: () => <ComponentUsageContent />,
};
