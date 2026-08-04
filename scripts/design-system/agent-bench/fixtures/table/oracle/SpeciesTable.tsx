"use client";

import { useState } from "react";
import { DataTable, type DataTableColumn } from "@dt/DataTable";
import { species, type Species } from "./species";

const columns: DataTableColumn<Species>[] = [
  { id: "name", header: "Name", accessor: (row) => row.name, sortable: true },
  {
    id: "family",
    header: "Family",
    accessor: (row) => row.family,
    sortable: true,
  },
  {
    id: "wingspanCm",
    header: "Wingspan (cm)",
    accessor: (row) => row.wingspanCm,
    sortable: true,
    align: "end",
  },
];

export default function SpeciesTable() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <DataTable<Species>
      data={species}
      columns={columns}
      getRowId={(row) => row.id}
      caption="Bird species and wingspans"
      selectedRowIds={selected}
      onSelectionChange={setSelected}
    />
  );
}
