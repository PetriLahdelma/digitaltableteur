"use client";

import { useState, type ReactNode } from "react";
import Tabs from "@dt/Tabs";

// Plausible first attempt: swaps in the design-system Tabs, but renders the
// content without tabpanel semantics (Tabs only renders the tablist).
export default function SectionTabs({
  label,
  items,
}: {
  label: string;
  items: { id: string; title: string; content: ReactNode }[];
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  return (
    <div>
      <Tabs
        ariaLabel={label}
        tabs={items.map(({ id, title }) => ({ key: id, label: title }))}
        activeTab={active}
        onTabChange={setActive}
      />
      <div>{items.find((item) => item.id === active)?.content}</div>
    </div>
  );
}
