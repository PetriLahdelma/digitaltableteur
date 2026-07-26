"use client";

import React, { useMemo, useState } from "react";
import styles from "./DataTable.module.css";

export type DataTableSortDirection = "ascending" | "descending";

export type DataTableSort = {
  columnId: string;
  direction: DataTableSortDirection;
};

export type DataTableColumn<Row> = {
  /** Stable column identifier used by sorting and React keys. */
  id: string;
  /** Visible column heading. */
  header: React.ReactNode;
  /** Reads the comparable/display value when cell is not supplied. */
  accessor?: (row: Row) => React.ReactNode;
  /** Custom cell renderer. */
  cell?: (row: Row) => React.ReactNode;
  /** Enables the three-state ascending/descending/unsorted cycle. */
  sortable?: boolean;
  /** Cell alignment. @default "start" */
  align?: "start" | "center" | "end";
};

export interface DataTableProps<Row> {
  /** Table rows. */
  data: Row[];
  /** Ordered column definitions. */
  columns: DataTableColumn<Row>[];
  /** Stable row identifier. */
  getRowId: (row: Row) => string;
  /** Accessible table name rendered as a caption. */
  caption: string;
  /** Visually hides the caption while retaining the accessible name. */
  hideCaption?: boolean;
  /** Controlled sort state. */
  sort?: DataTableSort | null;
  /** Initial uncontrolled sort state. */
  defaultSort?: DataTableSort | null;
  /** Receives sort changes. */
  onSortChange?: (sort: DataTableSort | null) => void;
  /** Controlled selected row identifiers; enables selection. */
  selectedRowIds?: string[];
  /** Initial uncontrolled selection; also enables selection. */
  defaultSelectedRowIds?: string[];
  /** Receives selected row identifiers; also enables selection. */
  onSelectionChange?: (rowIds: string[]) => void;
  /** Accessible row label used by selection checkboxes. */
  getRowLabel?: (row: Row) => string;
  /** Empty-state cell content. */
  emptyState?: React.ReactNode;
  /** Alternating row surfaces. */
  striped?: boolean;
  /** Density scale. @default "md" */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const comparableValue = (value: React.ReactNode): string | number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") return value.toLocaleLowerCase();
  return String(value ?? "").toLocaleLowerCase();
};

function nextSort(
  current: DataTableSort | null,
  columnId: string,
): DataTableSort | null {
  if (current?.columnId !== columnId) {
    return { columnId, direction: "ascending" };
  }
  if (current.direction === "ascending") {
    return { columnId, direction: "descending" };
  }
  return null;
}

/** Accessible data table with optional sorting and row selection. */
export function DataTable<Row>({
  data,
  columns,
  getRowId,
  caption,
  hideCaption = false,
  sort: controlledSort,
  defaultSort = null,
  onSortChange,
  selectedRowIds,
  defaultSelectedRowIds = [],
  onSelectionChange,
  getRowLabel = (row) => getRowId(row),
  emptyState = "No data",
  striped = false,
  size = "md",
  className,
}: DataTableProps<Row>) {
  const [internalSort, setInternalSort] = useState<DataTableSort | null>(
    defaultSort,
  );
  const [internalSelection, setInternalSelection] = useState<string[]>(
    defaultSelectedRowIds,
  );
  const currentSort =
    controlledSort === undefined ? internalSort : controlledSort;
  const selectionEnabled =
    selectedRowIds !== undefined ||
    defaultSelectedRowIds.length > 0 ||
    onSelectionChange !== undefined;
  const currentSelection =
    selectedRowIds === undefined ? internalSelection : selectedRowIds;

  const sortedRows = useMemo(() => {
    if (!currentSort) return data;
    const column = columns.find(
      (candidate) => candidate.id === currentSort.columnId,
    );
    if (!column?.accessor) return data;
    const direction = currentSort.direction === "ascending" ? 1 : -1;
    return [...data].sort((left, right) => {
      const leftValue = comparableValue(column.accessor?.(left));
      const rightValue = comparableValue(column.accessor?.(right));
      if (leftValue === rightValue) return 0;
      return leftValue > rightValue ? direction : -direction;
    });
  }, [columns, currentSort, data]);

  const updateSort = (columnId: string) => {
    const value = nextSort(currentSort, columnId);
    if (controlledSort === undefined) setInternalSort(value);
    onSortChange?.(value);
  };

  const updateSelection = (rowIds: string[]) => {
    if (selectedRowIds === undefined) setInternalSelection(rowIds);
    onSelectionChange?.(rowIds);
  };

  const allRowIds = data.map(getRowId);
  const allSelected =
    allRowIds.length > 0 &&
    allRowIds.every((rowId) => currentSelection.includes(rowId));
  const partiallySelected =
    !allSelected && allRowIds.some((rowId) => currentSelection.includes(rowId));

  const rootClassName = [
    styles.wrapper,
    styles[size],
    striped ? styles.striped : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName}>
      <table className={styles.table}>
        <caption
          className={hideCaption ? styles.visuallyHidden : styles.caption}
        >
          {caption}
        </caption>
        <thead>
          <tr>
            {selectionEnabled ? (
              <th className={styles.selectionCell} scope="col">
                <SelectionCheckbox
                  checked={allSelected}
                  indeterminate={partiallySelected}
                  label="Select all rows"
                  onChange={() => updateSelection(allSelected ? [] : allRowIds)}
                />
              </th>
            ) : null}
            {columns.map((column) => {
              const active = currentSort?.columnId === column.id;
              return (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={active ? currentSort.direction : undefined}
                  data-align={column.align ?? "start"}
                >
                  {column.sortable ? (
                    <button
                      className={styles.sortButton}
                      type="button"
                      onClick={() => updateSort(column.id)}
                    >
                      {column.header}
                      <span className={styles.sortIndicator} aria-hidden="true">
                        {active
                          ? currentSort.direction === "ascending"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td
                className={styles.empty}
                colSpan={columns.length + (selectionEnabled ? 1 : 0)}
              >
                {emptyState}
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => {
              const rowId = getRowId(row);
              const selected = currentSelection.includes(rowId);
              return (
                <tr key={rowId} data-selected={selected || undefined}>
                  {selectionEnabled ? (
                    <td className={styles.selectionCell}>
                      <SelectionCheckbox
                        checked={selected}
                        label={`Select ${getRowLabel(row)}`}
                        onChange={() =>
                          updateSelection(
                            selected
                              ? currentSelection.filter(
                                  (candidate) => candidate !== rowId,
                                )
                              : [...currentSelection, rowId],
                          )
                        }
                      />
                    </td>
                  ) : null}
                  {columns.map((column) => (
                    <td key={column.id} data-align={column.align ?? "start"}>
                      {column.cell?.(row) ?? column.accessor?.(row) ?? null}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function SelectionCheckbox({
  checked,
  indeterminate = false,
  label,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  label: string;
  onChange: () => void;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      className={styles.checkbox}
      type="checkbox"
      checked={checked}
      aria-label={label}
      onChange={onChange}
    />
  );
}

DataTable.displayName = "DataTable";

export default DataTable;
