import React from "react";
/**
 * Represents a single process phase with its activities
 */
export interface ProcessPhase {
    /** Phase name (e.g., "Discover", "Define", "Ideate", "Design") */
    title: string;
    /** List of activities or deliverables in this phase */
    activities: string[];
}
/**
 * Props for the ProcessBlock component
 */
export interface ProcessBlockProps {
    /** Array of process phases to display */
    phases: ProcessPhase[];
    /** Optional main title for the process section */
    sectionTitle?: string;
    /** Optional description or introduction text */
    description?: React.ReactNode;
    /** Background color variant */
    backgroundColor?: "light" | "white" | "transparent";
    /** Maximum width constraint */
    maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
    /** Spacing variant */
    spacing?: "compact" | "default" | "comfortable" | "spacious";
    /** Number of columns (2, 3, or 4) */
    columns?: 2 | 3 | 4;
    /** Additional CSS class */
    className?: string;
    /** Semantic HTML element to use */
    as?: "section" | "article" | "div";
    /** Accessible label for the section */
    ariaLabel?: string;
}
/**
 * ProcessBlock - A reusable design system component for displaying project process phases
 *
 * Displays a multi-column grid of process phases with their activities, commonly used in
 * case studies and work pages to showcase methodology.
 *
 * @example
 * ```tsx
 * <ProcessBlock
 *   phases={[
 *     { title: "Discover", activities: ["User Research", "Stakeholder Workshops"] },
 *     { title: "Define", activities: ["User Personas", "Journey Mapping"] },
 *   ]}
 *   sectionTitle="Our Process"
 *   columns={4}
 * />
 * ```
 */
declare const ProcessBlock: React.FC<ProcessBlockProps>;
export default ProcessBlock;
//# sourceMappingURL=ProcessBlock.d.ts.map