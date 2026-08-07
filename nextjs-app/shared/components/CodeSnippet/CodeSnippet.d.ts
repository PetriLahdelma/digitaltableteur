import React from "react";
export type SupportedLanguage = "javascript" | "typescript" | "html" | "xml" | "python" | "go" | "rust" | "json" | "bash" | "markdown";
export type CodeSnippetVariant = "inline" | "single" | "multi";
export interface CodeSnippetProps {
    /** The code string to highlight. */
    code: string;
    /** Highlighting grammar. */
    language?: SupportedLanguage;
    /** Render a line-number gutter. */
    showLineNumbers?: boolean;
    /** Accessible name for the snippet region. */
    "aria-label"?: string;
    /** Show the copy button; keep on for reusable code. */
    allowCopy?: boolean;
    /** Layout variant: inline token, single line, or multi-line window. */
    variant?: CodeSnippetVariant;
    /** Clamp height to this many lines; longer code scrolls. 0 disables the clamp. */
    maxLines?: number;
    /** Fires after the code is copied to the clipboard. */
    onCopy?: () => void;
}
/**
 * CodeSnippet component.
 */
export declare const CodeSnippet: React.FC<CodeSnippetProps>;
export default CodeSnippet;
//# sourceMappingURL=CodeSnippet.d.ts.map