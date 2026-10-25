import React from "react";
import { cn } from "../../lib/cn";
import styles from "./Code.module.css";

export type CodeSize = "sm" | "md" | "lg";

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Match the surrounding text: `sm` beside Body xxs/xs, `md` beside s/m,
   * `lg` beside l.
   * @default "md"
   */
  size?: CodeSize;
}

/**
 * Inline code for a function name, prop, file path or CLI flag inside prose.
 * Renders a semantic <code>; static, never interactive. For a block of code
 * use CodeBlock, and for a copyable command use Snippet.
 */
export const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ size = "md", className, children, ...rest }, ref) => (
    <code
      ref={ref}
      className={cn(styles.code, styles[size], className)}
      {...rest}
    >
      {children}
    </code>
  ),
);

Code.displayName = "Code";

export default Code;
