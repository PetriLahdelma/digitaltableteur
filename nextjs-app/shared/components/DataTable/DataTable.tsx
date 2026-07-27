"use client";

import React, { useCallback, useMemo } from "react";
import { Table } from "@dt/Table";
import { TableRow } from "@dt/TableRow";
import { TableHeaderCell } from "@dt/TableHeaderCell";
import { TableCell } from "@dt/TableCell";
import Checkbox from "@dt/Checkbox";
import { IconButton } from "@dt/IconButton";
import {
  useTableSortable,
  type TableSort,
} from "../../hooks/useTableSortable";
import { useTableSelection } from "../../hooks/useTableSelection";
import { useTablePagination } from "../../hooks/useTablePagination";
import styles from "./DataTable.module.css";

export type DataTableSortDirection = "ascending" | "descending";
export type DataTableSort = TableSort;

export type DataTableColumn<Row> = {
  /** Stable column identifier used by sorting and React keys. */
  id: string;
  /** Visible column heading. */
  header: React.ReactNode;
  /** Reads the comparable/display value when `cell` is not supplied. */
  accessor?: (row: Row) => React.ReactNode;
  /** Custom cell renderer. */
  cell?: (row: Row) => React.ReactNode;
  /** Comparable sort value; falls back to `accessor`. Use when `cell` renders
   * custom markup but the column still needs a sortable value. */
  sortValue?: (row: Row) => string | number | null | undefined;
  /** Enables the three-state ascending/descending/unsorted cycle. */
  sortable?: boolean;
  /** Marks this column as the row header (`<th scope="row">`) so screen readers
   * announce it as the row's context with every other cell. Use one per table. */
  rowHeader?: boolean;
  /** Cell alignment. @default "start" */
  align?: "start" | "center" | "end";
  /** Right-align with tabular figures for numeric columns. */
  numeric?: boolean;
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
  /** Rows per page; enables pagination when set. */
  pageSize?: number;
  /** Empty-state cell content. */
  emptyState?: React.ReactNode;
  /** Alternating row surfaces. */
  striped?: boolean;
  /** Pin the header row while the body scrolls. */
  stickyHeader?: boolean;
  /** Density scale. @default "md" */
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Accessible data table: typed columns with three-state sorting, optional row
 * selection and pagination, and density variants. Composes the `Table`
 * primitives and the `useTable*` hooks.
 */
export function DataTable<Row>({
  data,
  columns,
  getRowId,
  caption,
  hideCaption = false,
  sort,
  defaultSort = null,
  onSortChange,
  selectedRowIds,
  defaultSelectedRowIds,
  onSelectionChange,
  getRowLabel = (row) => getRowId(row),
  pageSize,
  emptyState = "No data",
  striped = false,
  stickyHeader = false,
  size = "md",
  className,
}: DataTableProps<Row>) {
  const columnsById = useMemo(() => {
    const map = new Map<string, DataTableColumn<Row>>();
    for (const column of columns) map.set(column.id, column);
    return map;
  }, [columns]);

  const getSortValue = useCallback(
    (row: Row, columnId: string) => {
      const column = columnsById.get(columnId);
      return column?.sortValue?.(row) ?? column?.accessor?.(row);
    },
    [columnsById],
  );

  const { sort: currentSort, sortedRows, toggleSort, getColumnSort } =
    useTableSortable({ rows: data, getSortValue, sort, defaultSort, onSortChange });

  const pagination = useTablePagination({
    rows: sortedRows,
    pageSize: pageSize ?? (sortedRows.length || 1),
  });

  const displayedRows = pageSize ? pagination.pageRows : sortedRows;

  const selectionEnabled =
    selectedRowIds !== undefined ||
    defaultSelectedRowIds !== undefined ||
    onSelectionChange !== undefined;

  // Select-all / indeterminate are scoped to the displayed page, so paginated
  // tables don't silently toggle rows the user can't see.
  const selection = useTableSelection({
    rowIds: displayedRows.map(getRowId),
    selectedIds: selectedRowIds,
    defaultSelectedIds: defaultSelectedRowIds,
    onSelectionChange,
  });

  // A sort re-orders the whole set, so return to the first page.
  const { setPage } = pagination;
  const handleSort = useCallback(
    (columnId: string) => {
      toggleSort(columnId);
      setPage(0);
    },
    [toggleSort, setPage],
  );
  const columnCount = columns.length + (selectionEnabled ? 1 : 0);

  return (
    <div className={className ? `${styles.container} ${className}` : styles.container}>
      <Table
        caption={caption}
        hideCaption={hideCaption}
        size={size}
        striped={striped}
        stickyHeader={stickyHeader}
      >
        <thead>
          <TableRow>
            {selectionEnabled ? (
              <TableHeaderCell className={styles.selectionCell} align="center">
                <Checkbox
                  aria-label="Select all rows"
                  showLabel={false}
                  checked={selection.allSelected}
                  indeterminate={selection.someSelected}
                  onCheckedChange={selection.toggleAll}
                />
              </TableHeaderCell>
            ) : null}
            {columns.map((column) => (
              <TableHeaderCell
                key={column.id}
                align={column.align ?? (column.numeric ? "end" : "start")}
                sortable={column.sortable}
                sortDirection={getColumnSort(column.id)}
                onSort={() => handleSort(column.id)}
              >
                {column.header}
              </TableHeaderCell>
            ))}
          </TableRow>
        </thead>
        <tbody>
          {displayedRows.length === 0 ? (
            <TableRow>
              <TableCell className={styles.empty} align="center" colSpan={columnCount}>
                {emptyState}
              </TableCell>
            </TableRow>
          ) : (
            displayedRows.map((row) => {
              const rowId = getRowId(row);
              const selected = selection.isSelected(rowId);
              return (
                <TableRow key={rowId} selected={selected}>
                  {selectionEnabled ? (
                    <TableCell className={styles.selectionCell} align="center">
                      <Checkbox
                        aria-label={`Select ${getRowLabel(row)}`}
                        showLabel={false}
                        checked={selected}
                        onCheckedChange={() => selection.toggleRow(rowId)}
                      />
                    </TableCell>
                  ) : null}
                  {columns.map((column) => {
                    const content =
                      column.cell?.(row) ?? column.accessor?.(row) ?? null;
                    return column.rowHeader ? (
                      <TableHeaderCell
                        key={column.id}
                        scope="row"
                        align={column.align}
                      >
                        {content}
                      </TableHeaderCell>
                    ) : (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        numeric={column.numeric}
                      >
                        {content}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </tbody>
      </Table>
      {pageSize ? (
        <div className={styles.pagination}>
          <span className={styles.paginationStatus}>
            {pagination.totalRows === 0
              ? "No rows"
              : `${pagination.fromRow}–${pagination.toRow} of ${pagination.totalRows}`}
          </span>
          <div className={styles.paginationControls}>
            <IconButton
              icon="caret-double-left"
              label="First page"
              size="sm"
              disabled={!pagination.canPreviousPage}
              onClick={pagination.firstPage}
            />
            <IconButton
              icon="caret-left"
              label="Previous page"
              size="sm"
              disabled={!pagination.canPreviousPage}
              onClick={pagination.previousPage}
            />
            <IconButton
              icon="caret-right"
              label="Next page"
              size="sm"
              disabled={!pagination.canNextPage}
              onClick={pagination.nextPage}
            />
            <IconButton
              icon="caret-double-right"
              label="Last page"
              size="sm"
              disabled={!pagination.canNextPage}
              onClick={pagination.lastPage}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

DataTable.displayName = "DataTable";

export default DataTable;
