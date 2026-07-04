"use client";

import React from "react";
import styles from "./Accordion.module.css";
import Icon from "@dt/Icon";

export type AccordionItem = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export type AccordionProps = {
  /** Accordion sections (id, title, content). */
  items: AccordionItem[];
  /** Initially expanded item id. */
  defaultOpenId?: string;
};

/** Expandable accordion sections with keyboard-operable triggers. */
const Accordion: React.FC<AccordionProps> = ({ items, defaultOpenId }) => {
  const [openId, setOpenId] = React.useState<string | null>(
    defaultOpenId ?? null,
  );

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <div className={styles.accordion}>
      {items.map((item) => {
        const open = item.id === openId;
        return (
          <div
            key={item.id}
            className={`${styles.item} ${open ? styles.open : ""}`.trim()}
          >
            <button
              type="button"
              id={`trigger-${item.id}`}
              className={styles.trigger}
              aria-expanded={open}
              aria-controls={`panel-${item.id}`}
              onClick={() => toggle(item.id)}
            >
              <span>{item.title}</span>
              <span className={styles.icon} aria-hidden>
                <Icon name="caret-right" />
              </span>
            </button>
            <div
              id={`panel-${item.id}`}
              className={styles.content}
              role="region"
              aria-labelledby={`trigger-${item.id}`}
              hidden={!open}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
