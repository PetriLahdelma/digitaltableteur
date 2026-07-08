"use client";

import React, { useEffect, useState, useMemo, useId } from "react";
import AlertBanner from "@dt/AlertBanner";
import { useTranslate } from "../../lib/translation";
import styles from "./Mermaid.module.css";

export interface MermaidThemeColors {
  /** Text color */
  color: string;
  /** Node background color */
  nodeBg: string;
  /** Line and border color (defaults to color) */
  lineColor?: string;
}

const DEFAULT_COLORS: MermaidThemeColors = {
  color: "#ED4B9B",
  nodeBg: "transparent",
};

let lastColorKey = "";

const loadMermaid = async (colors: MermaidThemeColors = DEFAULT_COLORS) => {
  const { default: mermaid } = await import("mermaid");
  const colorKey = `${colors.color}-${colors.nodeBg}`;
  if (colorKey !== lastColorKey) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      themeVariables: {
        primaryColor: colors.nodeBg,
        primaryTextColor: colors.color,
        primaryBorderColor: colors.color,
        lineColor: colors.color,
        secondaryColor: colors.nodeBg,
        secondaryTextColor: colors.color,
        secondaryBorderColor: colors.color,
        tertiaryColor: colors.nodeBg,
        tertiaryTextColor: colors.color,
        tertiaryBorderColor: colors.color,
        textColor: colors.color,
        mainBkg: colors.nodeBg,
        nodeBkg: colors.nodeBg,
        nodeBorder: colors.color,
        clusterBkg: colors.nodeBg,
        clusterBorder: colors.color,
        titleColor: colors.color,
        edgeLabelBackground: "transparent",
        fontFamily: '"Geist", "Geist Sans", system-ui, sans-serif',
        fontSize: "14px",
      },
      mindmap: {
        useMaxWidth: true,
        padding: 16,
      },
    });
    lastColorKey = colorKey;
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
  /** Custom theme colors */
  themeColors?: MermaidThemeColors;
}

export const Mermaid: React.FC<MermaidProps> = ({
  chart,
  caption,
  className,
  themeColors,
}) => {
  const t = useTranslate();
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
        const mermaid = await loadMermaid(themeColors);
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
  }, [chart, renderId, containerId, themeColors]);

  return (
    <figure className={`${styles.mermaidFigure} ${className ?? ""}`}>
      {isLoading && (
        <div className={styles.loading} aria-label="Loading diagram">
          <span className={styles.loadingSpinner} />
        </div>
      )}
      {error && (
        <AlertBanner
          tone="error"
          title={t("mermaidErrorTitle", "Diagram Error")}
          description={error}
        />
      )}
      {svg && (
        <div
          id={containerId}
          className={styles.diagram}
          style={{
            "--mermaid-color": (themeColors ?? DEFAULT_COLORS).color,
            "--mermaid-node-bg": (themeColors ?? DEFAULT_COLORS).nodeBg,
            "--mermaid-line-color": (themeColors?.lineColor ?? (themeColors ?? DEFAULT_COLORS).color),
          } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
};

export default Mermaid;
