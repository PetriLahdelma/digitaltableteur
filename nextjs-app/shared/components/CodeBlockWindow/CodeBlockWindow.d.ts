import React from "react";
export interface CodeBlockWindowProps {
    /** Optional title or filename shown in the header */
    title?: string;
    /** Optional caption rendered below the code */
    caption?: string;
    /** Language label shown in the header */
    language?: string;
    /** Force line numbers on/off (defaults to presence in Shiki output) */
    showLineNumbers?: boolean;
    /** Article prose layout — 80% width, 35vh max height, wrap + vertical scroll */
    context?: "default" | "article";
    /** Optional className passthrough */
    className?: string;
    /** Code block content (expected Shiki <pre><code>) */
    children: React.ReactNode;
}
/**
 * CodeBlockWindow component.
 */
export declare const CodeBlockWindow: React.FC<CodeBlockWindowProps>;
export default CodeBlockWindow;
//# sourceMappingURL=CodeBlockWindow.d.ts.map