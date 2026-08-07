import React from "react";
export type AccordionItem = {
    id: string;
    title: string;
    content: React.ReactNode;
    /** Render the section trigger as non-interactive. */
    disabled?: boolean;
};
export type AccordionProps = {
    /** Accordion sections (id, title, content, optional disabled). */
    items: AccordionItem[];
    /**
     * "single" (default) keeps at most one section open — opening another closes
     * the previous. "multiple" lets any number stay open for side-by-side reading.
     * @default "single"
     */
    type?: "single" | "multiple";
    /**
     * "contained" (default) is a bordered card group with dividers between rows;
     * "enclosed" is the same outer border but seamless inside (no dividers);
     * "divided" is flush with hairline separators only, for inline disclosure.
     * @default "contained"
     */
    variant?: "contained" | "enclosed" | "divided";
    /** Initially open id (uncontrolled, single). */
    defaultOpenId?: string;
    /** Initially open ids (uncontrolled); wins over defaultOpenId when set. */
    defaultOpenIds?: string[];
    /** Controlled open ids. When set, the parent owns open state. */
    openIds?: string[];
    /** Called with the full set of open ids whenever it changes. */
    onOpenChange?: (openIds: string[]) => void;
    /** Optional utility classes on the container. */
    className?: string;
};
/** Expandable accordion sections with keyboard-operable triggers and a sliding reveal. */
declare const Accordion: React.FC<AccordionProps>;
export default Accordion;
//# sourceMappingURL=Accordion.d.ts.map