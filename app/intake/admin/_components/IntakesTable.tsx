"use client";

import { useMemo, useState } from "react";
import { Badge, Button, DataTable, FilterChip, FlexBox, Link, Text, Timestamp, Title, type DataTableColumn } from "@digitaltableteur/react";

import { adminCopy, type AdminCopyKey } from "@/app/lib/intake/admin-copy";
import type { AdminIntakeRow, AdminIntakeStatus } from "@/app/lib/intake/service/admin";
import type { IntakeLocale } from "@/app/lib/intake/types";

export type IntakeTableRow = Omit<AdminIntakeRow, "lastActivity"> & Readonly<{ lastActivity: string }>;

const STATUS_ORDER: AdminIntakeStatus[] = ["submitted", "reopened", "started", "invited", "expired", "revoked"];

/** Badge tone per status: what needs the owner stands out. */
const STATUS_TONE: Record<AdminIntakeStatus, "neutral" | "info" | "success" | "warning"> = {
  submitted: "success",
  reopened: "info",
  started: "info",
  invited: "neutral",
  expired: "warning",
  revoked: "neutral",
};

export function StatusBadge({ status, locale }: { status: AdminIntakeStatus; locale: IntakeLocale }) {
  return (
    <Badge size="sm" variant="secondary" tone={STATUS_TONE[status]}>
      {adminCopy(locale)(`status_${status}` as AdminCopyKey)}
    </Badge>
  );
}

/** The admin home: every intake, one row each, filterable by status. */
export function IntakesTable({ rows, locale }: { rows: IntakeTableRow[]; locale: IntakeLocale }) {
  const t = adminCopy(locale);
  const [filter, setFilter] = useState<AdminIntakeStatus | "all">("all");
  const counts = useMemo(() => {
    const byStatus = new Map<AdminIntakeStatus, number>();
    for (const row of rows) byStatus.set(row.status, (byStatus.get(row.status) ?? 0) + 1);
    return byStatus;
  }, [rows]);
  const shown = filter === "all" ? rows : rows.filter((row) => row.status === filter);

  const columns: DataTableColumn<IntakeTableRow>[] = [
    {
      id: "client",
      header: t("colClient"),
      rowHeader: true,
      sortable: true,
      sortValue: (row) => row.name.toLocaleLowerCase(),
      cell: (row) => (
        <FlexBox direction="column" gap="var(--space-internal-2)">
          <Link href={`/intake/admin/intakes/${row.inviteId}`}>{row.name}</Link>
          <Text as="span" size="s">
            {row.email}
          </Text>
        </FlexBox>
      ),
    },
    { id: "company", header: t("colCompany"), sortable: true, accessor: (row) => row.company ?? "" },
    { id: "form", header: t("colForm"), accessor: (row) => row.questionnaire },
    {
      id: "status",
      header: t("colStatus"),
      sortable: true,
      sortValue: (row) => STATUS_ORDER.indexOf(row.status),
      cell: (row) => <StatusBadge status={row.status} locale={locale} />,
    },
    {
      id: "activity",
      header: t("colActivity"),
      sortable: true,
      sortValue: (row) => row.lastActivity,
      cell: (row) => <Timestamp value={row.lastActivity} format="auto" locale={locale} />,
    },
  ];

  return (
    <FlexBox direction="column" gap="var(--space-internal-32)">
      <FlexBox direction="row" justify="space-between" align="center" gap="var(--space-internal-16)" wrap="wrap">
        <Title level={1} size="l">
          {t("intakesTitle")}
        </Title>
        <Button size="lg" icon="plus" href="/intake/admin/invite">
          {t("newInvite")}
        </Button>
      </FlexBox>
      <FlexBox direction="row" gap="var(--space-internal-8)" wrap="wrap" role="group" aria-label={t("filterLabel")}>
        <FilterChip pressed={filter === "all"} count={rows.length} onClick={() => setFilter("all")}>
          {t("filterAll")}
        </FilterChip>
        {STATUS_ORDER.filter((status) => counts.has(status)).map((status) => (
          <FilterChip key={status} pressed={filter === status} count={counts.get(status)} onClick={() => setFilter(status)}>
            {t(`status_${status}` as AdminCopyKey)}
          </FilterChip>
        ))}
      </FlexBox>
      <DataTable
        caption={t("intakesTitle")}
        hideCaption
        data={shown}
        columns={columns}
        getRowId={(row) => row.inviteId}
        defaultSort={{ columnId: "activity", direction: "descending" }}
        pageSize={25}
        emptyState={t("empty")}
      />
    </FlexBox>
  );
}
