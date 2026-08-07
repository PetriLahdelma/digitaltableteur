import React from "react";
export interface CommandPaletteItem {
    /** Stable id (also used for the option's DOM id). */
    id: string;
    /** Visible command label; also matched against the query. */
    label: string;
    /** Run when the command is chosen. */
    onSelect: () => void;
    /** Extra terms matched against the query. */
    keywords?: string[];
    /** Optional leading icon. */
    icon?: React.ReactNode;
}
export interface CommandPaletteProps {
    /** Whether the palette is open (controlled). */
    open: boolean;
    /** Called to request close (Escape, overlay click, or after a selection). */
    onClose: () => void;
    /** Commands to show, in order. */
    items: CommandPaletteItem[];
    /** Accessible name for the dialog + listbox. @default "Command palette" */
    label?: string;
    /** Search input placeholder. @default "Search commands…" */
    placeholder?: string;
    /** Shown when nothing matches. @default "No results" */
    emptyText?: string;
    /** Additional CSS class names for the dialog. */
    className?: string;
}
/**
 * Command palette: a modal, keyboard-driven launcher. A search input filters a
 * listbox of commands (matched on label + keywords); Arrow keys move the active
 * option, Enter runs it, Escape closes. Focus is trapped and background scroll
 * locked while open. User-facing strings are props (English defaults) so the
 * component carries no i18n dependency.
 */
export declare function CommandPalette({ open, onClose, items, label, placeholder, emptyText, className, }: CommandPaletteProps): React.ReactPortal | null;
export default CommandPalette;
//# sourceMappingURL=CommandPalette.d.ts.map