import React, { useEffect, useRef, useState } from "react";
import styles from "./FoundationDoc.module.css";
import catalog from "../token-catalog.json";

export type TokenRef = {
  name: string;
  value: string;
  usage?: string;
};

export function FoundationPage({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <article className={styles.page}>
      <header className={styles.section}>
        <h1 className={styles.sectionTitle} style={{ fontSize: "var(--font-size-title-m)" }}>
          {title}
        </h1>
        <p className={styles.lead}>{lead}</p>
        <p className={styles.callout}>
          Source of truth: <code>{catalog.source}</code> — {catalog.tokenCount} tokens in the
          light-theme <code>:root</code> block. Storybook themes mirror production (
          <code>ThemeProvider</code>: light, dark, HCB, HCW).
        </p>
      </header>
      {children}
    </article>
  );
}

export function DocSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {description ? <p className={styles.sectionDesc}>{description}</p> : null}
      {children}
    </section>
  );
}

function useResolvedToken(token: string, themeClass?: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [resolved, setResolved] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const prop = token.replace(/^--/, "");
    setResolved(cs.getPropertyValue(prop).trim() || "—");
  }, [token, themeClass]);

  return { ref, resolved };
}

export function ColorSwatch({
  token,
  label,
  themeClass = "",
}: {
  token: string;
  label: string;
  themeClass?: string;
}) {
  const { ref, resolved } = useResolvedToken(token, themeClass);

  return (
    <figure className={styles.swatch}>
      <div
        ref={ref}
        className={`${styles.swatchChip} ${themeClass}`.trim()}
        style={{ background: `var(${token})` }}
        aria-hidden
      />
      <figcaption className={styles.swatchMeta}>
        <strong>{label}</strong>
        <code>{token}</code>
        {resolved ? <span className={styles.swatchResolved}>{resolved}</span> : null}
      </figcaption>
    </figure>
  );
}

export function SwatchGrid({ children }: { children: React.ReactNode }) {
  return <div className={styles.swatchGrid}>{children}</div>;
}

export function TokenTable({ tokens }: { tokens: TokenRef[] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col">Light :root value</th>
            <th scope="col">Usage</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr key={t.name}>
              <td>
                <code>{t.name}</code>
              </td>
              <td>
                <code>{t.value}</code>
              </td>
              <td>{t.usage || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SpaceScale({ prefix, keys }: { prefix: string; keys: readonly string[] }) {
  return (
    <div>
      {keys.map((k) => {
        const token = `--${prefix}-${k}`;
        return (
          <div key={token} className={styles.spaceRow}>
            <div
              className={styles.spaceBar}
              style={{ inlineSize: `var(${token})` }}
              aria-hidden
            />
            <code>{token}</code>
          </div>
        );
      })}
    </div>
  );
}

export function ThemePanel({
  themeClass,
  label,
  children,
}: {
  themeClass: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.themePanel} ${themeClass}`.trim()}>
      <div className={styles.themeLabel}>{label}</div>
      {children}
    </div>
  );
}

export function TypeSpecimen({
  sample,
  token,
  meta,
  style,
}: {
  sample: string;
  token: string;
  meta: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={styles.typeRow}>
      <div className={styles.typeSample} style={style}>
        {sample}
      </div>
      <div className={styles.typeMeta}>
        <code>{token}</code> · {meta}
      </div>
    </div>
  );
}

export function MotionDemo({
  label,
  duration,
  easing,
}: {
  label: string;
  duration: string;
  easing: string;
}) {
  const [active, setActive] = useState(false);

  return (
    <div className={styles.motionRow}>
      <button
        type="button"
        onClick={() => {
          setActive(false);
          requestAnimationFrame(() => setActive(true));
        }}
        style={{
          fontFamily: "var(--font-text)",
          fontSize: "var(--font-size-text-s)",
          padding: "var(--space-internal-8) var(--space-internal-12)",
        }}
      >
        Replay
      </button>
      <div
        className={styles.motionDemo}
        style={{
          transform: active ? "translateX(120px)" : "translateX(0)",
          transition: `transform ${duration} ${easing}`,
        }}
        aria-hidden
      />
      <code>
        {label} — {duration} / {easing}
      </code>
    </div>
  );
}

export function getCatalogGroups(category: string, subgroup?: string) {
  return catalog.groups.filter(
    (g) => g.category === category && (!subgroup || g.subgroup === subgroup),
  );
}



export type ContrastResult = {
  id: string;
  label: string;
  fg: string;
  bg: string;
  themeId: string;
  fgRaw?: string;
  bgRaw?: string;
  ratio: number | null;
  level: string;
  pass: boolean | null;
};

export function ContrastMatrix({
  rows,
  themeLabel,
  themeClass = "",
}: {
  rows: ContrastResult[];
  themeLabel: string;
  themeClass?: string;
}) {
  return (
    <div className={`${styles.themePanel} ${themeClass}`.trim()} style={{ marginBlockEnd: "var(--space-layout-24)" }}>
      <div className={styles.themeLabel}>{themeLabel}</div>
      <div className={styles.tableWrap}>
        <table className={styles.contrastTable}>
          <thead>
            <tr>
              <th scope="col">Pair</th>
              <th scope="col">Sample</th>
              <th scope="col">Ratio</th>
              <th scope="col">WCAG</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <div>{row.label}</div>
                  <code style={{ fontSize: "0.65rem" }}>
                    {row.fg} / {row.bg}
                  </code>
                </td>
                <td>
                  <span
                    className={styles.contrastSample}
                    style={{ color: `var(${row.fg})`, background: `var(${row.bg})` }}
                  >
                    Aa
                  </span>
                </td>
                <td>{row.ratio ?? "—"}</td>
                <td>
                  {row.pass === null ? (
                    "N/A"
                  ) : (
                    <span className={row.pass ? styles.contrastPass : styles.contrastFail}>
                      {row.level}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function GridColumnDemo() {
  return (
    <div className={styles.gridDemo}>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className={styles.gridCol}>
          {i + 1}
        </div>
      ))}
    </div>
  );
}

export function TokenCatalogSearch() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = catalog.groups.flatMap((g) =>
    g.tokens.filter(
      (t) =>
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.usage.toLowerCase().includes(q) ||
        t.value.toLowerCase().includes(q),
    ),
  );

  return (
    <div>
      <input
        className={styles.searchInput}
        type="search"
        placeholder="Search tokens by name, value, or usage…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search design tokens"
      />
      <p className={styles.sectionDesc}>
        Showing {filtered.length} of {catalog.tokenCount} tokens
        {catalog.usageCoverage ? ` (${catalog.usageCoverage} documented)` : ""}
      </p>
      <TokenTable tokens={filtered} />
    </div>
  );
}

export const FOUNDATION_THEMES = catalog.themes;
export const FOUNDATION_CONTRAST = catalog.contrastByTheme;

