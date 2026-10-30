import React, { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Code from "@dt/Code";
import Select from "@dt/Select";
import StatusDot from "@dt/StatusDot";
import Table from "@dt/Table";
import TableCell from "@dt/TableCell";
import TableHeaderCell from "@dt/TableHeaderCell";
import TableRow from "@dt/TableRow";
import Text from "@dt/Text";
import TextInput from "@dt/TextInput";
import usageReport from "../../foundations/dist/component-usage.json";
import { StatusPill } from "../../../../.storybook/blocks/StatusPill";
import type { ComponentStatus } from "../../../../.storybook/blocks/StatusPill";
import { GuideFacts, GuidePage } from "../../../../.storybook/blocks/guide/GuidePage";
import { formatDate } from "../../../../.storybook/blocks/guide/guideData";
import styles from "./ComponentUsage.module.css";

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

const statusLabel = (status: string | null) => status ?? "none";

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
).sort((a, b) => (a === "none" ? 1 : b === "none" ? -1 : a.localeCompare(b)));

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

  const header = (label: string, key: SortKey, align?: "end") => (
    <TableHeaderCell
      scope="col"
      align={align}
      sortable
      sortDirection={
        sortKey === key ? (sortDir === "asc" ? "ascending" : "descending") : "none"
      }
      onSort={() => toggleSort(key)}
    >
      {label}
    </TableHeaderCell>
  );

  return (
    <GuidePage
      kicker="Reference"
      title="Component usage"
      lede={
        <>
          How much of the system the site really uses, measured over the{" "}
          {summary.governedCount} governed components. Direct imports count
          the site importing from the npm package; production pages count
          components that reach a live page through anything.
        </>
      }
    >
      <GuideFacts
        facts={[
          {
            value: summary.strictConsumedCount,
            of: summary.governedCount,
            label: "Imported from @digitaltableteur/react",
          },
          {
            value: summary.transitiveConsumedCount,
            of: summary.governedCount,
            label: "Rendered on a production page",
          },
          {
            value: summary.exportedCount,
            of: summary.governedCount,
            label: "Exported from the package",
          },
          {
            value: summary.catalogCount,
            label: "Catalog entries",
            note: `Report from ${formatDate(generatedAt)}`,
          },
        ]}
      />

      <div className={styles.controls}>
        <TextInput
          label="Search"
          type="search"
          clearable
          placeholder="Component name or importer path"
          value={query}
          onValueChange={(value) => setQuery(String(value))}
        />
        <Select
          label="Kind"
          value={kind}
          onValueChange={setKind}
          options={[
            { value: "all", label: "All kinds" },
            ...KIND_OPTIONS.map((option) => ({ value: option, label: option })),
          ]}
        />
        <Select
          label="Status"
          value={status}
          onValueChange={setStatus}
          options={[
            { value: "all", label: "All statuses" },
            ...STATUS_OPTIONS.map((option) => ({ value: option, label: option })),
          ]}
        />
        <Select
          label="In package"
          value={inPackage}
          onValueChange={(value) => setInPackage(value as "all" | "in" | "out")}
          options={[
            { value: "all", label: "Any" },
            { value: "in", label: "Exported" },
            { value: "out", label: "Not exported" },
          ]}
        />
      </div>

      <Text as="p" size="s" className={styles.count} aria-live="polite">
        {sorted.length} of {rows.length} components
      </Text>

      <Table caption="Component usage" hideCaption size="md" stickyHeader>
        <thead>
          <TableRow>
            {header("Component", "name")}
            {header("Kind", "kind")}
            {header("Status", "status")}
            {header("In package", "exported")}
            {header("Direct imports", "directImportCount", "end")}
            {header("Prod pages", "prodPageCount", "end")}
            <TableHeaderCell scope="col">Importers</TableHeaderCell>
          </TableRow>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <TableRow key={`${row.kind}-${row.name}`}>
              <TableHeaderCell scope="row">
                <Code size="inherit">{row.name}</Code>
              </TableHeaderCell>
              <TableCell>{row.kind}</TableCell>
              <TableCell>
                {row.status ? (
                  <StatusPill status={row.status as ComponentStatus} />
                ) : (
                  <span className={styles.none}>None</span>
                )}
              </TableCell>
              <TableCell>
                {row.exported ? (
                  <StatusDot tone="success" size="md">
                    Exported
                  </StatusDot>
                ) : (
                  <span className={styles.none}>No</span>
                )}
              </TableCell>
              <TableCell numeric>{row.directImportCount}</TableCell>
              <TableCell numeric>{row.prodPageCount}</TableCell>
              <TableCell>
                {row.directImporters.length > 0 ? (
                  <details className={styles.importers}>
                    <summary>
                      {row.directImporters.length}{" "}
                      {row.directImporters.length === 1 ? "file" : "files"}
                    </summary>
                    <ul>
                      {row.directImporters.map((path) => (
                        <li key={path}>
                          <Code size="sm">{path}</Code>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <span className={styles.none}>None</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </GuidePage>
  );
};

const meta: Meta = {
  title: "Docs/Component usage",
  parameters: {
    layout: "fullscreen",
    wip: { disabled: true },
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
