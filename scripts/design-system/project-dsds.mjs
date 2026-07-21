#!/usr/bin/env node
/**
 * Project the design system into Design System Doc Spec (DSDS) documents.
 *
 * https://designsystemdocspec.org — a JSON schema for design-system documentation that
 * sits above DTCG (token values) and Custom Elements Manifest (code APIs).
 *
 * This is a PROJECTION, not a migration. The contracts and spec.md files remain the
 * source of truth. The projection exists to answer one question: what does our
 * documentation carry that an external schema has no place to put, and vice versa?
 * Everything that does not fit is recorded in the residue report rather than dropped,
 * because the residue is the interesting output.
 *
 * Usage:
 *   node scripts/design-system/project-dsds.mjs                 # write + report
 *   node scripts/design-system/project-dsds.mjs --out <dir>
 *   node scripts/design-system/project-dsds.mjs --report-only
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, globSync } from "node:fs";
import { resolve, dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { partitionRelationEntries } from "./relation-entry-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BLOCKS = join(ROOT, "nextjs-app/shared/foundations/dist/component-agent-blocks.json");
const CATALOG = join(ROOT, "nextjs-app/shared/foundations/token-catalog.json");
const DSDS_VERSION = "0.15.2";
const SCHEMA_URL = `https://designsystemdocspec.org/v${DSDS_VERSION}/dsds.bundled.schema.json`;

const argOut = process.argv.indexOf("--out");
const OUT_DIR = argOut > -1 ? resolve(process.argv[argOut + 1]) : join(ROOT, "nextjs-app/shared/foundations/dist/dsds");
const REPORT_ONLY = process.argv.includes("--report-only");

/** Fields we carry that DSDS core has no home for. Recorded, then namespaced. */
/** Real component names, set in main(). Used to tell entity refs from anti-patterns. */
let KNOWN_COMPONENTS = new Set();

const RESIDUE = new Map();
function residue(field, componentName, note) {
  if (!RESIDUE.has(field)) RESIDUE.set(field, { field, count: 0, components: [], note });
  const r = RESIDUE.get(field);
  r.count += 1;
  if (r.components.length < 5) r.components.push(componentName);
}

/** DSDS identifiers are kebab-case. */
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[_\s]+/g, "-").toLowerCase();

/** Map our status vocabulary onto the DSDS statusValue enum. */
function mapStatus(status) {
  switch (status) {
    case "alpha": return "experimental";
    case "beta": return "beta";
    case "stable": return "stable";
    case "deprecated": return "deprecated";
    default: return "experimental";
  }
}

/** props -> DSDS `api` block. */
function apiBlock(block, name) {
  const properties = Object.entries(block.props ?? {}).map(([id, p]) => {
    const prop = {
      identifier: id,
      type: p.type === "union" && p.values ? p.values.map((v) => JSON.stringify(v)).join(" | ") : p.type,
      required: p.optional === false,
    };
    // apiProperty requires a description. A prop documented only by its type has none,
    // so the projection must invent one or drop the prop.
    prop.description = p.description || `The ${id} prop.`;
    if (!p.description) residue("api prop: no description", name, "DSDS apiProperty requires `description`. Props typed but undocumented cannot be represented without fabricating prose.");
    if (p.defaultValue !== undefined) prop.defaultValue = String(p.defaultValue);
    return prop;
  });
  if (!properties.length) return null;
  return { kind: "api", properties };
}

/** guidelines -> DSDS `guidelines` block, levels map 1:1 onto RFC 2119. */
function guidelinesBlock(block, name) {
  const items = (block.guidelines ?? []).map((g) => {
    // conformanceLevel is must|should|should-not|must-not. RFC 2119 also defines MAY,
    // and DSDS deliberately omits it, so an optional allowance has no level to carry.
    let level = g.level;
    if (level === "may") {
      level = "should";
      residue("guideline level: may", name, "DSDS conformanceLevel omits 'may'. A genuinely optional allowance must be upgraded to 'should', which overstates it.");
    }
    const item = { level, guidance: g.guidance };
    if (g.rationale) item.rationale = g.rationale;
    return item;
  });
  const all = [...items, ...contentGuidelines(block)];
  if (!all.length) return null;
  return { kind: "guidelines", items: all };
}

/** useWhen -> DSDS `use-cases`. */
function useCasesBlock(block, name) {
  const items = [
    ...(block.useWhen ?? []).map((u) => ({ description: u, stance: "recommended" })),
    ...(block.avoidWhen ?? []).map((u) => ({ description: u, stance: "discouraged" })),
  ];
  if (!items.length) return null;
  return { kind: "use-cases", items };
}

/** a11yCriteria -> DSDS `accessibility` block with criteria. */
function accessibilityBlock(block, name) {
  const unverifiedIds = [];
  const criteria = (block.a11yCriteria ?? []).map((c) => {
    const out = { identifier: c.id, statement: c.statement };
    if (c.verificationMode === "automated") {
      out.verification = "automated";
      // criterionCheck identifies the RUNNER, not the command. Our evidence is an npm
      // script; the scheme is the tool it dispatches to.
      out.check = { scheme: "npm", identifier: c.check };
    } else if (c.verificationMode === "manual") {
      out.verification = "manual";
      // DSDS forbids `check` on a manual criterion, so the note recording what a human
      // actually ran cannot sit beside the claim.
    } else {
      // "unverified" has no member in verificationMode (automated|assisted|manual).
      // Omitting the field means "automatability unknown", which is not the same claim
      // as "we know nothing proves this". The gap survives only in an extension.
      residue(
        "a11y criterion: unverified",
        name,
        "verificationMode is automated|assisted|manual, and `criterion` is a closed object with NO $extensions (unlike its parent block, which gained one in 0.15.2). So the known-gap state cannot be recorded on the criterion at all, even in a vendor namespace. It has to be hoisted to the block, breaking the link to the specific criterion.",
      );
      unverifiedIds.push(c.id);
    }
    // `note` has no criterion field. techniques[] is the closest home, but it means
    // "how to pass", not "what evidence exists", so the meaning shifts.
    if (c.note) out.techniques = [c.note];
    return out;
  });
  const requirements = block.requiredA11y ?? [];
  const keyboard = block.keyboard ?? [];
  if (!criteria.length && !requirements.length && !keyboard.length) return null;

  const out = { kind: "accessibility" };
  if (criteria.length) out.criteria = criteria;
  // Hoisted from the criteria that could not carry it themselves.
  if (unverifiedIds.length) out.$extensions = { "com.digitaltableteur": { unverifiedCriteria: unverifiedIds } };
  if (requirements.length) {
    out.ariaAttributes = requirements.map((r) => {
      const m = r.match(/^(aria-[a-z-]+|role)\s*[:=]?\s*(.*)$/i);
      return m && m[2] ? { attribute: m[1], description: m[2] } : { attribute: r, description: r };
    });
  }
  if (keyboard.length) {
    out.keyboardInteractions = keyboard.map((k) => {
      const m = k.match(/^([^\s:]+)\s*[:]\s*(.+)$/);
      return m ? { key: m[1], action: m[2] } : { key: k.split(/\s+/)[0], action: k };
    });
  }
  return out;
}

/** content -> DSDS `content` block. */
function contentBlock(block, name) {
  const c = block.content;
  if (!c) return null;
  // DSDS splits what we merged: the `content` block is a label dictionary plus
  // localization notes (facts), while voice and capitalization are RULES and belong in
  // `guidelines` with category "content". Our single `content` field conflated both.
  const out = { kind: "content" };
  const labels = (c.terminology ?? []).map((t) => ({
    term: t.prefer,
    definition: t.rationale || `Preferred over ${t.over.join(", ")}.`,
    alternatives: t.over,
  }));
  const localization = [];
  if (c.maxLength) {
    // `text-expansion` is a real concern member, so this has a home. What is lost is the
    // TYPE: a per-slot integer ceiling becomes prose no gate can evaluate.
    localization.push({
      concern: "text-expansion",
      description: `Character ceilings, measured on the longest locale: ${Object.entries(c.maxLength).map(([k, v]) => `${k} <= ${v}`).join(", ")}. ${c.notes ?? ""}`.trim(),
    });
    residue("content.maxLength: typed -> prose", name, "localizationEntry accepts the concern ('text-expansion') but its payload is richText. A per-slot integer ceiling degrades to a sentence, so no gate can evaluate it. The concern survives; the constraint does not.");
  }
  if (c.doNotTranslate?.length) {
    localization.push({
      concern: "do-not-translate",
      description: `Keep untranslated across all locales: ${c.doNotTranslate.join(", ")}.`,
    });
  }
  if (labels.length) out.labels = labels;
  if (localization.length) out.localization = localization;
  // anyOf requires at least one of labels/localization.
  return labels.length || localization.length ? out : null;
}

/** voice + capitalization -> guidelines(category: content), per the DSDS rule/fact split. */
function contentGuidelines(block) {
  const c = block.content;
  if (!c) return [];
  const items = [];
  if (c.voice) items.push({ level: "should", guidance: c.voice, category: "content" });
  if (c.capitalization) items.push({ level: "must", guidance: `Use ${c.capitalization} case for labels and headings.`, category: "content" });
  return items;
}

function projectComponent(name, block) {
  const identifier = kebab(name);
  const documentBlocks = [];
  const agentDocumentBlocks = [];

  const imports = block.preferredImport
    ? { kind: "imports", items: [{ language: "tsx", package: block.preferredImport, code: `import { ${name} } from "${block.preferredImport}";` }] }
    : null;
  for (const b of [imports, apiBlock(block, name), guidelinesBlock(block, name), useCasesBlock(block, name), accessibilityBlock(block, name), contentBlock(block, name)]) {
    if (b) documentBlocks.push(b);
  }

  // replacementFor / prefersOver each hold two kinds of thing. Only the entity references
  // are graph edges; the anti-patterns ("raw <button>") are guidance and were never
  // entities. Emitting both as relationships is what made the edges look unresolvable.
  const relationships = [];
  for (const c of block.composesWith ?? []) relationships.push({ relation: "composes", target: kebab(c) });

  const replaceParts = partitionRelationEntries(block.replacementFor ?? [], KNOWN_COMPONENTS);
  const prefersParts = partitionRelationEntries(block.prefersOver ?? [], KNOWN_COMPONENTS);
  for (const r of replaceParts.entities) {
    relationships.push({ relation: "replaces", target: kebab(r.target) });
  }
  for (const p of prefersParts.entities) {
    relationships.push({ relation: "alternative-to", target: kebab(p.target) });
  }

  // Agent-only rules: hard constraints, look-alike disambiguation, and the anti-patterns
  // that have no entity to point at.
  const agentItems = [];
  for (const f of block.forbiddenUse ?? []) agentItems.push({ level: "must-not", guidance: f });
  for (const r of block.compositionRules ?? []) agentItems.push({ level: "must-not", guidance: r });
  for (const a of replaceParts.antiPatterns) {
    agentItems.push({ level: "should-not", guidance: `Use ${name} instead of ${a.description}.` });
  }
  for (const a of prefersParts.antiPatterns) {
    agentItems.push({ level: "should", guidance: `Prefer ${name} over ${a.description}.` });
  }
  for (const p of prefersParts.entities) {
    agentItems.push({
      level: "should",
      guidance: `Prefer ${name} over ${p.target}${p.context ? ` ${p.context}` : ""}.`,
    });
  }
  if (agentItems.length) agentDocumentBlocks.push({ kind: "guidelines", items: agentItems });

  const metadata = { summary: (block.intent || "").slice(0, 300) };
  if (block.governance) {
    metadata.governance = {};
    if (block.governance.owner) metadata.governance.owner = block.governance.owner;
    if (block.governance.lastReviewed) metadata.governance.lastReviewed = block.governance.lastReviewed;
  }
  // docOrigin: DSDS keys this by block name. Ours is keyed by field, which is finer.
  if (block.docOrigin) {
    // docOriginValue: authored | generated | extracted | reconstructed.
    // authorshipValue: human | ai-assisted | ai-generated | machine-assisted | machine-generated.
    const ORIGIN = { generated: "generated", authored: "authored", derived: "generated" };
    const AUTHORSHIP = { "machine-generated": "machine-generated", "human-authored": "human", mixed: "machine-assisted" };
    metadata.docOrigin = { overall: "authored", authorship: "human", blocks: {} };
    const mapping = { api: "props", guidelines: "guidelines", "use-cases": "useWhen", accessibility: "a11yCriteria" };
    for (const [dsdsBlock, ourField] of Object.entries(mapping)) {
      const o = block.docOrigin[ourField];
      if (!o) continue;
      if (o.origin === "derived") {
        residue("docOrigin: derived", name, "docOriginValue is authored|generated|extracted|reconstructed. A block computed by a rule set FROM authored input is none of these: 'generated' implies read from source, and the distinction between 'a machine read this' and 'a machine inferred this from what a human wrote' is lost.");
      }
      metadata.docOrigin.blocks[dsdsBlock] = {
        origin: ORIGIN[o.origin] ?? "authored",
        authorship: AUTHORSHIP[o.authorship] ?? "human",
      };
    }
  }

  // Fields with no DSDS home.
  const ext = {};
  const noHome = [
    ["requiredStories", "Story coverage requirements. DSDS links to Storybook but does not model which stories must exist."],
    ["consumers", "Which app routes consume this component. No DSDS adoption/usage surface."],
    ["tier", "Atomic-design tier. DSDS has category but no tier taxonomy."],
    ["radixPrimitive", "Underlying headless primitive. No DSDS field for implementation substrate."],
    ["lightDarkVerified", "Theme verification flag. DSDS themes are entities, not per-component verification state."],
    ["declaredPropCount", "Prop-count metric used by our controls-coverage gate."],
    ["cvaVariants", "CVA variant axes, distinct from prop-derived variants."],
    ["subParts", "Named internal parts. DSDS anatomy models parts, but as prose items rather than addressable sub-component identifiers."],
    ["tokens", "Which design tokens this component consumes. DSDS points components at tokens only through prose; there is no typed component-to-token edge."],
  ];
  for (const [field, note] of noHome) {
    if (block[field] !== undefined && block[field] !== null) {
      residue(field, name, note);
      ext[field] = block[field];
    }
  }

  const entity = { kind: "component", identifier, name, description: block.intent || name };
  if (documentBlocks.length) entity.documentBlocks = documentBlocks;
  if (agentDocumentBlocks.length) entity.agentDocumentBlocks = agentDocumentBlocks;
  if (relationships.length) entity.relationships = relationships;
  entity.metadata = metadata;
  if (Object.keys(ext).length) entity.$extensions = { "com.digitaltableteur": ext };
  return entity;
}

function main() {
  if (!existsSync(BLOCKS)) {
    console.error("FAIL: run `npm run build:agent-blocks` first.");
    process.exit(1);
  }
  const { components } = JSON.parse(readFileSync(BLOCKS, "utf8"));

  // Contracts carry status/governance/content that agent-blocks partly drop.
  const contracts = new Map();
  for (const f of globSync(join(ROOT, "nextjs-app/shared/**/*.contract.json"))) {
    try {
      const c = JSON.parse(readFileSync(f, "utf8"));
      if (c.name) contracts.set(c.name, c);
    } catch {}
  }

  KNOWN_COMPONENTS = new Set(Object.keys(components));

  const entities = [];
  for (const [name, block] of Object.entries(components)) {
    const contract = contracts.get(name) ?? {};
    // Contract-only fields must take part in the residue count, otherwise the projection
    // flatters itself by only measuring what the agent-block layer already carries.
    const merged = {
      ...block,
      content: block.content ?? contract.content ?? null,
      requiredStories: contract.requiredStories,
      consumers: contract.consumers,
      tier: contract.tier,
      radixPrimitive: contract.radixPrimitive,
      lightDarkVerified: contract.lightDarkVerified,
      subParts: contract.subParts,
      tokens: contract.tokens,
    };
    const entity = projectComponent(name, merged);
    if (contract.status) {
      const overall = mapStatus(contract.status);
      // DSDS requires the object form for deprecated, with a notice saying what to use
      // instead. Our contracts carry deprecatedReason, which satisfies it.
      entity.metadata.status =
        overall === "deprecated"
          ? { overall, deprecationNotice: contract.deprecatedReason || "Deprecated; see the replacement component." }
          : overall;
    }
    if (contract.figma) entity.metadata.links = [{ kind: "design", url: contract.figma }];
    entities.push(entity);
  }

  const doc = {
    $schema: SCHEMA_URL,
    dsdsVersion: DSDS_VERSION,
    systemInfo: { organization: "Digitaltableteur", name: "Digitaltableteur Design System", url: "https://digitaltableteur.com" },
    entityGroups: [{ name: "Components", description: `Projected from ${entities.length} component contracts and agent blocks.`, entities }],
  };

  if (!REPORT_ONLY) {
    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(join(OUT_DIR, "components.dsds.json"), `${JSON.stringify(doc, null, 2)}\n`);
    const residueReport = [...RESIDUE.values()].sort((a, b) => b.count - a.count);
    writeFileSync(join(OUT_DIR, "residue.json"), `${JSON.stringify({ generatedFrom: entities.length, residue: residueReport }, null, 2)}\n`);
  }

  console.log(`\nDSDS projection — ${entities.length} components -> ${DSDS_VERSION}\n`);
  const counts = entities.reduce((acc, e) => {
    for (const b of e.documentBlocks ?? []) acc[b.kind] = (acc[b.kind] ?? 0) + 1;
    return acc;
  }, {});
  console.log("document blocks emitted:");
  for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(16)} ${v}`);
  console.log(`  agentDocumentBlocks  ${entities.filter((e) => e.agentDocumentBlocks).length}`);

  // --- DSDS semantic conformance layer ---
  // Schema validity is necessary but not sufficient. A conforming consumer "MUST treat
  // unresolvable references as defects", so the projection checks the same things the
  // spec's reference validator does.
  const ids = new Set(entities.map((e) => e.identifier));
  const dupes = entities.map((e) => e.identifier).filter((id, i, a) => a.indexOf(id) !== i);
  const unresolved = new Map();
  let edges = 0;
  for (const e of entities) {
    for (const r of e.relationships ?? []) {
      edges += 1;
      if (!ids.has(r.target)) unresolved.set(r.target, (unresolved.get(r.target) ?? 0) + 1);
    }
  }
  const unresolvedCount = [...unresolved.values()].reduce((a, b) => a + b, 0);

  console.log("\nsemantic conformance:");
  console.log(`  identifiers unique       ${dupes.length === 0 ? `yes (${ids.size})` : `NO (${dupes.length} dupes)`}`);
  console.log(`  relationship edges       ${edges}`);
  console.log(`  unresolved targets       ${unresolvedCount} across ${unresolved.size} distinct`);
  if (unresolved.size) {
    for (const [t, n] of [...unresolved.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)) {
      console.log(`      ${t} (${n})`);
    }
  }

  console.log("\nresidue (carried in $extensions or lost):");
  for (const r of [...RESIDUE.values()].sort((a, b) => b.count - a.count)) {
    console.log(`  ${String(r.count).padStart(4)}  ${r.field}`);
  }
  if (!REPORT_ONLY) console.log(`\nwritten: ${OUT_DIR}\n`);
}

main();
