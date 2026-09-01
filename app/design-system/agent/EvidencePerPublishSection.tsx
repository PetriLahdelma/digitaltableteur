import {
  Table,
  TableCell,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
} from "@digitaltableteur/react";
import DtLink from "@dt/Link";
import styles from "./agent.module.css";

/**
 * The seven per-publish evidence artifacts, rendered verbatim from
 * public/ds-health/*.json (Astryx-gap Phase 4). Every number on this page is
 * derived from the committed artifacts — never hand-written — and each raw
 * file carries its own provenance stamp (source commit, generator, tree
 * state). The publish preflight regenerates all seven, so a published
 * package version always ships with the evidence that measured it.
 */

type BundleEvidence = {
  package: { name: string; version: string };
  totals: {
    js: { self: { gzipBytes: number }; withDeps: { gzipBytes: number } };
    css: { gzipBytes: number };
  };
  entries: Record<string, { components: Record<string, unknown> }>;
};

type CompatibilityManifest = {
  exercised: Record<string, string | null>;
};

type SsrEvidence = {
  totals: {
    ssrPass: number;
    ssrError: number;
    hydrationClean: number;
    skipped: number;
  };
};

type OverrideEvidence = {
  totals: { pass: number; fail: number; themingVarsDeclared: number };
  encapsulation: {
    matrix: { pairsMeasured: number; pairsAffected: number };
  };
};

type InteractionEvidence = {
  totals: { measured: number; recipes: number };
};

type CompatMatrix = {
  dimensions: { react: { declaredRange: string; combosExercised: string[] } };
  totals: { divergence: number };
};

type WcParity = {
  roster: { enforcedCount: number };
  totals: { comparisons: number; visualParity: string; geometryParity: string };
  coverage: { nativeTags: number };
};

export type EvidenceArtifacts = {
  bundle: BundleEvidence;
  compatibility: CompatibilityManifest;
  ssr: SsrEvidence;
  override: OverrideEvidence;
  interaction: InteractionEvidence;
  compatMatrix: CompatMatrix;
  wcParity: WcParity;
};

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} kB`;

export function EvidencePerPublishSection({
  artifacts,
}: {
  artifacts: EvidenceArtifacts;
}) {
  const { bundle, compatibility, ssr, override, interaction, compatMatrix, wcParity } =
    artifacts;
  const exportCount = Object.values(bundle.entries).reduce(
    (sum, entry) => sum + Object.keys(entry.components).length,
    0,
  );

  const rows: { name: string; records: string; headline: string; file: string }[] = [
    {
      name: "Bundle cost",
      records:
        "Minified+gzip bytes per exported component, in two honest modes: the package's own code (self) and the marginal cost to a consumer that satisfies the peer contract (withDeps).",
      headline: `${exportCount} exports · package self ${kb(bundle.totals.js.self.gzipBytes)} JS + ${kb(bundle.totals.css.gzipBytes)} CSS gzip`,
      file: "bundle-evidence.json",
    },
    {
      name: "SSR + hydration",
      records:
        "renderToString in plain Node (no DOM globals), then hydrateRoot over that HTML with zero recoverable hydration errors.",
      headline: `${ssr.totals.ssrPass} SSR pass · ${ssr.totals.hydrationClean} hydrate clean · ${ssr.totals.ssrError} provider-required errors`,
      file: "ssr-evidence.json",
    },
    {
      name: "Override precedence",
      records:
        "A consumer's single-class className override wins over component base styles in real Chromium (the owner-decided contract), plus the container × child encapsulation matrix on child-pinned properties.",
      headline: `${override.totals.pass} pass · ${override.totals.fail} fail · ${override.encapsulation.matrix.pairsMeasured} matrix pairs, ${override.encapsulation.matrix.pairsAffected} affected`,
      file: "override-evidence.json",
    },
    {
      name: "Interaction cost",
      records:
        "Mount/re-render commit cost (flushSync, informational) and DOM render weight per component, plus interaction recipes over the data primitives' documented hot paths.",
      headline: `${interaction.totals.measured} measured · ${interaction.totals.recipes} recipes completed`,
      file: "interaction-evidence.json",
    },
    {
      name: "React peer-range matrix",
      records: `The declared react range (${compatMatrix.dimensions.react.declaredRange}) exercised at its endpoints in isolated consumer installs; outcome sets must match across combos.`,
      headline: `react ${compatMatrix.dimensions.react.combosExercised.join(" & ")} · ${compatMatrix.totals.divergence} divergent components`,
      file: "compat-matrix.json",
    },
    {
      name: "Web-component parity",
      records:
        "React↔native rendered parity (pixels + geometry across the viewport/theme matrix); enforced components fail the publish on regression.",
      headline: `${wcParity.roster.enforcedCount} enforced clean · fleet visual ${wcParity.totals.visualParity}, geometry ${wcParity.totals.geometryParity} of ${wcParity.totals.comparisons}`,
      file: "wc-parity.json",
    },
    {
      name: "Compatibility manifest",
      records:
        "The toolchain combinations ACTUALLY exercised by the gates — resolved versions, never ranges. Absence means untested, not incompatible.",
      headline: `react ${compatibility.exercised.react} · next ${compatibility.exercised.next} · typescript ${compatibility.exercised.typescript}`,
      file: "compatibility-manifest.json",
    },
  ];

  return (
    <section className="mt-12">
      <Title level={2} size="s">
        Evidence per publish
      </Title>
      <Text as="p" size="s" lineHeight="relaxed" className={styles.lede}>
        Seven artifacts regenerate inside the publish preflight and ship
        stamped at the published version — currently{" "}
        <code className="text-xs">
          {bundle.package.name}@{bundle.package.version}
        </code>
        . Numbers below are derived from the committed artifacts, never
        hand-written; each raw file carries its own provenance (source commit,
        generator, tree state), and timings live outside the stamped substance
        because they vary by machine.
      </Text>

      <div className="mt-4 overflow-x-auto">
        <Table caption="Per-publish evidence artifacts" size="sm">
          <thead>
            <TableRow>
              <TableHeaderCell>Artifact</TableHeaderCell>
              <TableHeaderCell>What it records</TableHeaderCell>
              <TableHeaderCell>Headline</TableHeaderCell>
              <TableHeaderCell>Raw</TableHeaderCell>
            </TableRow>
          </thead>
          <tbody>
            {rows.map((row) => (
              <TableRow key={row.file}>
                <TableCell>{row.name}</TableCell>
                <TableCell>
                  <span className={styles.recordText}>{row.records}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs">{row.headline}</span>
                </TableCell>
                <TableCell>
                  <DtLink href={`/ds-health/${row.file}`} size="sm">
                    JSON
                  </DtLink>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </div>
    </section>
  );
}
