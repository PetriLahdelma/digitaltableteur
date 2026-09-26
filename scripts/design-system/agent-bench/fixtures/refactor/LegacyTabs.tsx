"use client";

import { useState, type ReactNode } from "react";

export interface LegacyTabItem {
  id: string;
  title: string;
  content: ReactNode;
}

/** Hand-rolled tabs from before the design system: clickable divs, no ARIA. */
export default function LegacyTabs({ label, items }: { label: string; items: LegacyTabItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  return (
    <div className="legacy-tabs" title={label}>
      <div className="legacy-tabs__bar">
        {items.map((item) => (
          <div
            key={item.id}
            className={item.id === active ? "legacy-tab is-active" : "legacy-tab"}
            onClick={() => setActive(item.id)}
          >
            {item.title}
          </div>
        ))}
      </div>
      <div className="legacy-tabs__body">
        {items.find((item) => item.id === active)?.content}
      </div>
    </div>
  );
}
