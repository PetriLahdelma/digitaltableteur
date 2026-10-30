"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useId,
  type ReactNode,
} from "react";
import AlertBanner from "@dt/AlertBanner";
import { useTranslate } from "../../lib/translation";
import styles from "./Mermaid.module.css";

/**
 * Diagram colours. Each value is a CSS colour or a token reference such as
 * `var(--color-text)`; tokens keep following the active theme after render.
 */
export interface MermaidThemeColors {
  /** Text color */
  color: string;
  /** Node background color */
  nodeBg: string;
  /** Line and border color (defaults to color) */
  lineColor?: string;
}

/** Token defaults: ink text, no fill, hairline lines, in every theme. */
const DEFAULT_COLORS: MermaidThemeColors = {
  color: "var(--color-text)",
  nodeBg: "transparent",
  lineColor: "var(--color-border)",
};

/**
 * Mermaid computes derived shades from its theme variables, so it needs real
 * colours. Resolve `var(--token)` against the document; the CSS custom
 * properties on the diagram keep the token, so a theme switch still recolours
 * the rendered SVG.
 */
const resolveColor = (value: string): string => {
  const token = value.match(/^var\((--[\w-]+)\)$/)?.[1];
  if (!token || typeof document === "undefined") return value;
  const resolved = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  return resolved || "#000000";
};

let lastColorKey = "";

const loadMermaid = async (themeColors: MermaidThemeColors = DEFAULT_COLORS) => {
  const { default: mermaid } = await import("mermaid");
  const colors: MermaidThemeColors = {
    color: resolveColor(themeColors.color),
    nodeBg: resolveColor(themeColors.nodeBg),
  };
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
  /** Concise, meaningful name for the diagram */
  title: string;
  /** Short prose summary of the diagram's purpose and relationships */
  description: string;
  /** Structured or prose equivalent of every material relationship in the diagram */
  accessibleDetails: ReactNode;
  /** Label for the visible text-alternative disclosure */
  detailsLabel?: string;
  /** Optional caption for the diagram */
  caption?: string;
  /** Optional className for styling */
  className?: string;
  /** Custom theme colors */
  themeColors?: MermaidThemeColors;
}

export const Mermaid: React.FC<MermaidProps> = ({
  chart,
  title,
  description,
  accessibleDetails,
  detailsLabel,
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
  const titleId = `${renderId}-title`;
  const descriptionId = `${renderId}-description`;
  const detailsId = `${renderId}-details`;
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
      <span id={titleId} className="sr-only">
        {title}
      </span>
      <span id={descriptionId} className="sr-only">
        {description}
      </span>
      {isLoading && (
        <div className={styles.loading} role="status">
          <span className="sr-only">
            {t("mermaidLoadingLabel", "Loading diagram")}
          </span>
          <span className={styles.loadingSpinner} aria-hidden="true" />
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
          className={styles.diagramFrame}
          role="img"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          aria-details={detailsId}
        >
          <div
            id={containerId}
            className={styles.diagram}
            aria-hidden="true"
            style={
              {
                "--mermaid-color": (themeColors ?? DEFAULT_COLORS).color,
                "--mermaid-node-bg": (themeColors ?? DEFAULT_COLORS).nodeBg,
                "--mermaid-line-color": themeColors
                  ? (themeColors.lineColor ?? themeColors.color)
                  : DEFAULT_COLORS.lineColor,
              } as React.CSSProperties
            }
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      )}
      <details id={detailsId} className={styles.textAlternative}>
        <summary className={styles.textAlternativeSummary}>
          {detailsLabel ??
            t("mermaidTextAlternativeLabel", "Diagram text alternative")}
        </summary>
        <div className={styles.textAlternativeContent}>{accessibleDetails}</div>
      </details>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
};

export default Mermaid;
