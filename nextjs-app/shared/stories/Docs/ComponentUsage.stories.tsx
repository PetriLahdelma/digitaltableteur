import React, { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import usageReport from "../../foundations/dist/component-usage.json";
import styles from "./Documentation.module.css";

type UsageRow = {
  name: string;
  kind: string;
  status: string | null;
  directImportCount: number;
  directImporters: string[];
  packageImportCount?: number;
  packageImporters?: string[];
  prodPageCount: number;
  prodPages: string[];
};

type SortKey = "name" | "directImportCount" | "prodPageCount";

const rows = (usageReport as { generatedAt: string; components: UsageRow[] })
  .components;
const generatedAt = (usageReport as { generatedAt: string }).generatedAt;

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

  const unusedCount = rows.filter((row) => row.directImportCount === 0).length;
  const viaPackageCount = rows.filter(
    (row) => (row.packageImportCount ?? 0) > 0,
  ).length;

  return (
    <article className={styles.wrapper}>
      <header className={styles.header}>
        <h1>Component Usage</h1>
        <p className={styles.lead}>
          Real adoption data from the production codebase: how many source
          files import each component (statically or via dynamic import), and
          how many production pages transitively render it.
        </p>
      </header>

      <section className={styles.section}>
        <div className={styles.principleGrid}>
          <div className={styles.principle}>
            <h3>{rows.length}</h3>
            <p>Components in the catalog</p>
          </div>
          <div className={styles.principle}>
            <h3>{unusedCount}</h3>
            <p>Without any importer</p>
          </div>
          <div className={styles.principle}>
            <h3>
              {viaPackageCount}/{rows.length}
            </h3>
            <p>
              Consumed via <code>@digitaltableteur/react</code> (runtime
              imports from the npm package)
            </p>
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
