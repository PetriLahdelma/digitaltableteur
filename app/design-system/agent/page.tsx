import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const metadata: Metadata = {
  title: "Design System Agent Demo | Digitaltableteur",
  description:
    "Public proof surface for @dt intent retrieval, pattern composition recipes, MCP tools, and local agent eval benchmarks.",
  alternates: { canonical: "/design-system/agent" },
};

export const revalidate = 3600;

type GoldenCase = { id: string; query: string };
type PatternRecipe = {
  name: string;
  publicImport: string;
  useWhen?: string[];
  avoidWhen?: string[];
};

function loadJson<T>(relativePath: string): T {
  const path = join(process.cwd(), relativePath);
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

/** Read-only agentic DS proof — no layout chrome changes. */
export default function DesignSystemAgentPage() {
  const goldenIntents = loadJson<{ cases: GoldenCase[] }>(
    "scripts/design-system/agent-eval/golden-intents.json",
  );
  const patternRecipes = loadJson<{ patterns: PatternRecipe[] }>(
    "scripts/design-system/pattern-composition.recipes.json",
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 font-body text-foreground">
      <p className="font-body text-sm text-muted-foreground">Agent-native design system</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        Design system agent demo
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Machine-readable contracts, intent benchmarks, and MCP tools so agents reuse{" "}
        <code className="text-xs">@dt/*</code> before inventing markup.{" "}
        <Link href="/colophon" className="text-foreground underline underline-offset-2">
          Colophon
        </Link>{" "}
        covers the full stack.
      </p>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">MCP &amp; docs</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed">
          <li>
            MCP:{" "}
            <a href="/mcp" className="underline underline-offset-2">
              /mcp
            </a>
          </li>
          <li>
            Card:{" "}
            <a
              href="/.well-known/mcp/server-card.json"
              className="underline underline-offset-2"
            >
              /.well-known/mcp/server-card.json
            </a>
          </li>
          <li>
            Agent card:{" "}
            <a href="/.well-known/agent.json" className="underline underline-offset-2">
              /.well-known/agent.json
            </a>
          </li>
          <li>
            Case study (repo):{" "}
            <code className="text-xs">docs/AGENTIC_DS_CASE_STUDY.md</code>
          </li>
          <li>
            Catalog policy (repo):{" "}
            <code className="text-xs">docs/CATALOG-POLICY.md</code>
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">Intent golden set</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {goldenIntents.cases.length} queries verified by{" "}
          <code className="text-xs">npm run agent:eval</code>.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {goldenIntents.cases.slice(0, 8).map((c) => (
            <li key={c.id} className="rounded-md border border-border bg-muted/30 px-3 py-2">
              <span className="font-mono text-xs text-muted-foreground">{c.id}</span>
              <span className="ml-2">&ldquo;{c.query}&rdquo;</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">Pattern recipes</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          MCP tool <code className="text-xs">suggest_pattern_for_layout</code>
        </p>
        <ul className="mt-4 space-y-4">
          {patternRecipes.patterns.map((p) => (
            <li key={p.name} className="rounded-md border border-border p-4">
              <p className="font-display font-semibold">{p.publicImport}</p>
              {p.useWhen?.[0] ? (
                <p className="mt-1 text-sm text-muted-foreground">{p.useWhen[0]}</p>
              ) : null}
              {p.avoidWhen?.[0] ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Avoid: {p.avoidWhen[0]}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">Local verification</h2>
        <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed">
          {`npm run build:tokens
npm run agent:eval
npm run agentic-ds-audit
npm run ds:mcp`}
        </pre>
      </section>
    </main>
  );
}
