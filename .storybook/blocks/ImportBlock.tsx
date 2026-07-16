import React, { useCallback, useState } from "react";
import type { DtContract } from "../lib/contracts";
import styles from "./ImportBlock.module.css";

/**
 * Copyable import line derived from the contract name. The `@dt/*` alias is
 * the sanctioned import path (see repo CLAUDE.md paths section).
 */
export function ImportBlock({
  contract,
  implementation = "react",
  tagName,
}: {
  contract: DtContract;
  implementation?: "react" | "web-component";
  tagName?: string;
}) {
  const line =
    implementation === "web-component" && tagName
      ? `import "@digitaltableteur/web-components";\n\n<${tagName}></${tagName}>`
      : `import { ${contract.name} } from "@dt/${contract.name}";`;
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard
      ?.writeText(line)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {
        // Clipboard denied (permissions/iframe); the line is selectable text.
      });
  }, [line]);

  return (
    <div className={styles.wrapper} data-doc-block="import">
      <pre className={styles.pre}>
        <code>{line}</code>
      </pre>
      <button type="button" className={styles.copy} onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
