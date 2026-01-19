"use client";

import React, { useEffect, useState, useMemo, useId } from "react";
import styles from "./Mermaid.module.css";

let mermaidConfigured = false;

const loadMermaid = async () => {
  const { default: mermaid } = await import("mermaid");
  if (!mermaidConfigured) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      themeVariables: {
        // Core colors - all pink
        primaryColor: "transparent",
        primaryTextColor: "#ED4B9B",
        primaryBorderColor: "#ED4B9B",
        lineColor: "#ED4B9B",
        secondaryColor: "transparent",
        secondaryTextColor: "#ED4B9B",
        secondaryBorderColor: "#ED4B9B",
        tertiaryColor: "transparent",
        tertiaryTextColor: "#ED4B9B",
        tertiaryBorderColor: "#ED4B9B",
        // Text
        textColor: "#ED4B9B",
        mainBkg: "transparent",
        nodeBkg: "transparent",
        nodeBorder: "#ED4B9B",
        clusterBkg: "transparent",
        clusterBorder: "#ED4B9B",
        titleColor: "#ED4B9B",
        edgeLabelBackground: "transparent",
        // Font
        fontFamily: '"JetBrains Mono", "Geist Mono", monospace',
        fontSize: "14px",
      },
      mindmap: {
        useMaxWidth: true,
        padding: 16,
      },
    });
    mermaidConfigured = true;
  }
  return mermaid;
};

export interface MermaidProps {
  /** Mermaid diagram code */
  chart: string;
  /** Optional caption for the diagram */
  caption?: string;
  /** Optional className for styling */
  className?: string;
}

export const Mermaid: React.FC<MermaidProps> = ({
  chart,
  caption,
  className,
}) => {
  const rawId = useId();
  const renderId = useMemo(
    () => `mermaid-${rawId.replace(/[:]/g, "")}`,
    [rawId],
  );
  const containerId = `${renderId}-container`;
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      setIsLoading(true);
      try {
        const mermaid = await loadMermaid();
        const result = await mermaid.render(renderId, chart);
        if (cancelled) return;
        setSvg(result.svg);
        setError(null);
        if (result.bindFunctions) {
          requestAnimationFrame(() => {
            const node = document.getElementById(containerId);
            if (node) {
              result.bindFunctions?.(node);
            }
          });
        }
      } catch (err) {
        if (!cancelled) {
          setSvg("");
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [chart, renderId, containerId]);

  return (
    <figure className={`${styles.mermaidFigure} ${className ?? ""}`}>
      {isLoading && (
        <div className={styles.loading} aria-label="Loading diagram">
          <span className={styles.loadingSpinner} />
        </div>
      )}
      {error && (
        <div className={styles.error} role="alert">
          <strong>Diagram Error:</strong> {error}
        </div>
      )}
      {svg && (
        <div
          id={containerId}
          className={styles.diagram}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
};

export default Mermaid;
