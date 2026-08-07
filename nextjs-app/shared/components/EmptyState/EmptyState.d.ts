import React from "react";
export type EmptyStateSize = "sm" | "md" | "lg";
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Phosphor icon name rendered decoratively above the title. */
    icon?: string;
    /** Short headline stating what is empty. */
    title: string;
    /** One or two sentences explaining why, or what to do next. */
    description?: string;
    /** Heading tag for the title. @default "h2" */
    headingLevel?: "h2" | "h3" | "h4";
    /** Size token. @default "md" */
    size?: EmptyStateSize;
    /** Action slot — typically one primary Button, optionally a secondary. */
    children?: React.ReactNode;
}
/** Placeholder block for empty lists, searches, and first-run screens. */
export declare const EmptyState: React.ForwardRefExoticComponent<EmptyStateProps & React.RefAttributes<HTMLDivElement>>;
export default EmptyState;
//# sourceMappingURL=EmptyState.d.ts.map