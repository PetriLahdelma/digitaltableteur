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

type SortKey =
  | "name"
  | "kind"
  | "status"
  | "exported"
  | "directImportCount"
  | "prodPageCount";

const NUMERIC_SORT_KEYS: SortKey[] = [
  "exported",
  "directImportCount",
  "prodPageCount",
];

const statusLabel = (status: string | null) => status ?? "—";

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

const KIND_OPTIONS = Array.from(new Set(rows.map((row) => row.kind))).sort();
const STATUS_OPTIONS = Array.from(
  new Set(rows.map((row) => statusLabel(row.status))),
).sort((a, b) => (a === "—" ? 1 : b === "—" ? -1 : a.localeCompare(b)));

const ComponentUsageContent = () => {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [inPackage, setInPackage] = useState<"all" | "in" | "out">("all");
  const [sortKey, setSortKey] = useState<SortKey>("directImportCount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const sortValue = (row: UsageRow): string | number => {
      switch (sortKey) {
        case "name":
          return row.name.toLowerCase();
        case "kind":
          return row.kind;
        case "status":
          return statusLabel(row.status);
        case "exported":
          return row.exported ? 1 : 0;
        default:
          return row[sortKey];
      }
    };
    const q = query.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (kind !== "all" && row.kind !== kind) return false;
      if (status !== "all" && statusLabel(row.status) !== status) return false;
      if (inPackage === "in" && !row.exported) return false;
      if (inPackage === "out" && row.exported) return false;
      if (q) {
        const haystack = [row.name, ...row.directImporters]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      const av = sortValue(a);
      const bv = sortValue(b);
      let cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      if (cmp === 0) cmp = a.name.localeCompare(b.name);
      return cmp * dir;
    });
  }, [query, kind, status, inPackage, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(NUMERIC_SORT_KEYS.includes(key) ? "desc" : "asc");
  };

  const sortableHeader = (label: string, key: SortKey) => (
    <th aria-sort={sortKey === key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        className={styles.sortHeader}
        onClick={() => toggleSort(key)}
      >
        {label}
        <span
          className={
            sortKey === key ? styles.sortIndicator : styles.sortIndicatorIdle
          }
          aria-hidden="true"
        >
          {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );

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
              <span className={styles.subtle}>
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
        <div className={styles.usageControls}>
          <div className={`${styles.usageControl} ${styles.usageControlGrow}`}>
            <label className={styles.usageControlLabel} htmlFor="usage-search">
              Search
            </label>
            <input
              id="usage-search"
              type="search"
              className={styles.usageInput}
              placeholder="Component name or importer path…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className={styles.usageControl}>
            <label className={styles.usageControlLabel} htmlFor="usage-kind">
              Kind
            </label>
            <select
              id="usage-kind"
              className={styles.usageSelect}
              value={kind}
              onChange={(event) => setKind(event.target.value)}
            >
              <option value="all">All kinds</option>
              {KIND_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.usageControl}>
            <label className={styles.usageControlLabel} htmlFor="usage-status">
              Status
            </label>
            <select
              id="usage-status"
              className={styles.usageSelect}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.usageControl}>
            <label className={styles.usageControlLabel} htmlFor="usage-package">
              In package
            </label>
            <select
              id="usage-package"
              className={styles.usageSelect}
              value={inPackage}
              onChange={(event) =>
                setInPackage(event.target.value as "all" | "in" | "out")
              }
            >
              <option value="all">Any</option>
              <option value="in">Exported</option>
              <option value="out">Not exported</option>
            </select>
          </div>
        </div>
        <p className={styles.resultCount}>
          {sorted.length} of {rows.length} components
        </p>
        <table className={styles.table}>
          <thead>
            <tr>
              {sortableHeader("Component", "name")}
              {sortableHeader("Kind", "kind")}
              {sortableHeader("Status", "status")}
              {sortableHeader("In package", "exported")}
              {sortableHeader("Direct imports", "directImportCount")}
              {sortableHeader("Prod pages", "prodPageCount")}
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
