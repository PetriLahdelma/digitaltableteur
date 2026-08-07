import { type ReactNode } from "react";
export interface ExpandableSectionProps {
    /** Trigger label when collapsed */
    collapsedLabel: string;
    /** Trigger label when expanded (optional, defaults to collapsedLabel) */
    expandedLabel?: string;
    /** Whether the section is initially expanded */
    defaultExpanded?: boolean;
    /** Controlled expanded state */
    expanded?: boolean;
    /** Callback when expansion state changes */
    onExpandedChange?: (expanded: boolean) => void;
    /** Content to reveal */
    children: ReactNode;
    /** Additional className for the container */
    className?: string;
}
export declare function ExpandableSection({ collapsedLabel, expandedLabel, defaultExpanded, expanded: controlledExpanded, onExpandedChange, children, className, }: ExpandableSectionProps): import("react").JSX.Element;
export declare namespace ExpandableSection {
    var displayName: string;
}
//# sourceMappingURL=ExpandableSection.d.ts.map