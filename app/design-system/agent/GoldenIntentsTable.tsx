"use client";

import { DataTable, type DataTableColumn } from "../../../nextjs-app/shared/components/DataTable/DataTable";

export type GoldenIntentCase = {
  id: string;
  query: string;
  /** 12 cases assert the exact top-1 result… */
  expectedTop1?: string;
  /** …and 8 assert membership in the top 3. */
  expectedInTop3?: string[];
};

const expectation = (row: GoldenIntentCase): string =>
  row.expectedTop1 ?? row.expectedInTop3?.join(", ") ?? "";

const columns: DataTableColumn<GoldenIntentCase>[] = [
  {
    id: "id",
    header: "Case",
    accessor: (row) => row.id,
    sortable: true,
    rowHeader: true,
  },
  {
    id: "query",
    header: "Intent query",
    accessor: (row) => `“${row.query}”`,
    sortValue: (row) => row.query,
    sortable: true,
  },
  {
    id: "expected",
    header: "Expected result",
    accessor: (row) =>
      row.expectedTop1 ? `${row.expectedTop1} (top 1)` : `${expectation(row)} (in top 3)`,
    sortValue: expectation,
    sortable: true,
  },
];

/**
 * The full intent golden set as a sortable table. Every case shown here is
 * asserted by `npm run agent:eval` against the production ranker; the page
 * renders the same JSON the eval reads, so the list can never drift from the
 * enforced set.
 */
export function GoldenIntentsTable({ cases }: { cases: GoldenIntentCase[] }) {
  return (
    <DataTable<GoldenIntentCase>
      caption={`Intent golden set (${cases.length} cases)`}
      hideCaption
      data={cases}
      columns={columns}
      getRowId={(row) => row.id}
      size="sm"
      striped
    />
  );
}
