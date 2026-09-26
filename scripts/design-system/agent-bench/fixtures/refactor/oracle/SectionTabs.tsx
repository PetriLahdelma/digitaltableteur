"use client";

import { useState, type ReactNode } from "react";
import Tabs from "@dt/Tabs";

export interface SectionTab {
  id: string;
  title: string;
  content: ReactNode;
}

/** Design-system Tabs plus the panels it expects the parent to render. */
export default function SectionTabs({ label, items }: { label: string; items: SectionTab[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const current = items.find((item) => item.id === active);
  return (
    <div>
      <Tabs
        ariaLabel={label}
        tabs={items.map(({ id, title }) => ({ key: id, label: title }))}
        activeTab={active}
        onTabChange={setActive}
      />
      {current && (
        <div role="tabpanel" id={`tabpanel-${current.id}`} aria-labelledby={`tab-${current.id}`}>
          {current.content}
        </div>
      )}
    </div>
  );
}
