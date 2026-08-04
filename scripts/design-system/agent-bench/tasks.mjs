/**
 * Agent benchmark task suite (Astryx-gap Phase 3). Each task is a realistic
 * brief with a seeded workspace and machine-checkable acceptance. Acceptance
 * must be affordance-neutral: a hand-rolled solution meeting the brief's
 * semantics passes just like a design-system one. Design-system reuse is
 * reported as a metric, never as a gate.
 *
 * Workspaces live under tests/bench-work/<task>/ inside a disposable
 * worktree — the tests/ prefix keeps copied assertion tests inside the repo
 * vitest include globs.
 */
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const FIXTURES = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "fixtures",
);

async function copyFixture(task, names, workspace) {
  await mkdir(workspace, { recursive: true });
  for (const name of names) {
    const target = name.replace(".test-template.", ".test.");
    await copyFile(join(FIXTURES, task, name), join(workspace, target));
  }
}

async function renameInFile(path, from, to) {
  const source = await readFile(path, "utf8");
  await writeFile(
    path,
    source.replace(new RegExp(`\\b${from}\\b`, "g"), to),
  );
}

export const TASKS = [
  {
    id: "migration-badge-rename",
    category: "migration",
    title: "Migrate Badge consumers across a prop rename",
    workspace: null, // operates on real consumer files inside the worktree
    brief: `The Badge component's \`variant\` prop has been renamed to \`emphasis\`.
The component, its stories, and its contract are already updated.

Migrate ALL remaining consumer usages of Badge across the repository
(app/ and nextjs-app/shared/, including story files) so they match the new
contract. Finding the consumers is part of the task — Badge is imported
both as \`@dt/Badge\` and as a named import from
\`@digitaltableteur/react\`.

Do not modify the Badge component itself
(nextjs-app/shared/components/Badge/). Preserve every existing prop value.
Only Badge usages are in scope; leave other components (for example
Button, which also has a variant prop) untouched.`,
    async prep(worktree) {
      await renameInFile(
        join(worktree, "nextjs-app/shared/components/Badge/Badge.tsx"),
        "variant",
        "emphasis",
      );
      await renameInFile(
        join(worktree, "nextjs-app/shared/components/Badge/Badge.stories.tsx"),
        "variant",
        "emphasis",
      );
      const contractPath = join(
        worktree,
        "nextjs-app/shared/components/Badge/Badge.contract.json",
      );
      const contract = JSON.parse(await readFile(contractPath, "utf8"));
      const props = {};
      for (const [key, value] of Object.entries(contract.props)) {
        props[key === "variant" ? "emphasis" : key] = value;
      }
      contract.props = props;
      await writeFile(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
      // Regenerate the registry so scanners and dt commands inside the
      // worktree see the renamed contract (both arms get the same state).
      await execFileAsync("npm", ["run", "-s", "build:tokens"], {
        cwd: worktree,
        maxBuffer: 32 * 1024 * 1024,
      });
    },
    acceptance: [
      {
        id: "consumers-migrated",
        kind: "usage-scan",
        component: "Badge",
        forbidProp: "variant",
        requireProp: "emphasis",
        // Every repo file with a formerly-variant Badge usage; acceptance
        // scope now matches the brief's "all consumers" exactly.
        files: [
          "app/dev/tailwind-test/TailwindTest.tsx",
          "nextjs-app/shared/components/CookieConsent/CookieConsent.tsx",
          "nextjs-app/shared/components/MultiCombobox/MultiCombobox.tsx",
          "nextjs-app/shared/components/OpenHours/OpenHours.tsx",
          "nextjs-app/shared/components/pages/Pseo/PseoClusterBadges.tsx",
          "nextjs-app/shared/components/pages/Pseo/PseoPillarMetaBadgeLinks.tsx",
          "nextjs-app/shared/components/pages/Work/Illustrations/IllustrationsPage.tsx",
          "nextjs-app/shared/stories/Docs/ComponentUsage.stories.tsx",
          "nextjs-app/shared/stories/TestHealth.stories.tsx",
        ],
      },
      {
        id: "no-stale-variant-findings-shared",
        kind: "validate-no-finding",
        components: ["Badge"],
        path: "nextjs-app/shared",
        prop: "variant",
      },
      {
        id: "no-stale-variant-findings-app",
        kind: "validate-no-finding",
        components: ["Badge"],
        path: "app",
        prop: "variant",
      },
      {
        id: "consumer-tests-pass",
        kind: "vitest",
        paths: [
          "nextjs-app/shared/components/CookieConsent",
          "nextjs-app/shared/components/MultiCombobox",
          "nextjs-app/shared/components/OpenHours",
        ],
      },
    ],
    metrics: [],
    async oracle(worktree) {
      await execFileAsync(
        "node",
        ["packages/cli/src/cli.mjs", "upgrade", "Badge", "--path", ".", "--write"],
        { cwd: worktree, maxBuffer: 32 * 1024 * 1024 },
      );
    },
  },

  {
    id: "repair-status-panel",
    category: "repair",
    title: "Repair contract violations in a status panel",
    workspace: "tests/bench-work/repair",
    brief: `tests/bench-work/repair/StatusPanel.tsx uses design-system components in
ways that violate their contracts, and some intended content is missing.

Repair the file so that:
- every design-system component usage matches its contract (valid prop
  values, required props supplied), and
- the panel communicates: pipeline stage "Building", release channel
  "Stable", and the L keyboard shortcut for logs.

Only edit tests/bench-work/repair/StatusPanel.tsx.`,
    async prep(worktree) {
      await copyFixture(
        "repair",
        ["StatusPanel.tsx", "StatusPanel.assert.test-template.tsx"],
        join(worktree, "tests/bench-work/repair"),
      );
    },
    acceptance: [
      {
        id: "usage-clean",
        kind: "validate-clean",
        path: "tests/bench-work/repair",
      },
      {
        id: "panel-renders-intended-content",
        kind: "vitest",
        paths: ["tests/bench-work/repair"],
      },
    ],
    metrics: [],
    async oracle(worktree) {
      await copyFile(
        join(FIXTURES, "repair/oracle/StatusPanel.tsx"),
        join(worktree, "tests/bench-work/repair/StatusPanel.tsx"),
      );
    },
  },

  {
    id: "table-species",
    category: "table",
    title: "Build a sortable, selectable species table",
    workspace: "tests/bench-work/table",
    brief: `Create tests/bench-work/table/SpeciesTable.tsx, default-exporting a React
component that renders the dataset from ./species as an accessible data
table.

Requirements:
- a table with a caption naming the dataset
- one row per species showing name, family, and wingspan
- sorting by column: activating a column header cycles the sort and the
  header exposes the state via aria-sort ("ascending"/"descending")
- row selection via checkboxes with accessible names starting "Select"

The acceptance test at tests/bench-work/table/SpeciesTable.assert.test.tsx
must pass unmodified. Only add files under tests/bench-work/table/.`,
    async prep(worktree) {
      await copyFixture(
        "table",
        ["species.ts", "SpeciesTable.assert.test-template.tsx"],
        join(worktree, "tests/bench-work/table"),
      );
    },
    acceptance: [
      {
        id: "table-semantics",
        kind: "vitest",
        paths: ["tests/bench-work/table"],
      },
      {
        id: "usage-clean",
        kind: "validate-clean",
        path: "tests/bench-work/table",
      },
    ],
    metrics: [
      {
        id: "ds-reuse",
        kind: "source-scan",
        dir: "tests/bench-work/table",
        requireAnyPattern: ["@dt/DataTable", "@digitaltableteur/react"],
      },
    ],
    async oracle(worktree) {
      await copyFile(
        join(FIXTURES, "table/oracle/SpeciesTable.tsx"),
        join(worktree, "tests/bench-work/table/SpeciesTable.tsx"),
      );
    },
  },

  {
    id: "tree-taxonomy",
    category: "tree",
    title: "Build a keyboard-navigable taxonomy tree",
    workspace: "tests/bench-work/tree",
    brief: `Create tests/bench-work/tree/TaxonomyTree.tsx, default-exporting a React
component that renders the dataset from ./taxonomy as an accessible tree.

Requirements:
- role="tree" with treeitem semantics
- branches start collapsed, expose aria-expanded, and expand on activation
  to reveal their children
- ArrowDown moves focus to the next visible item (roving focus)

The acceptance test at tests/bench-work/tree/TaxonomyTree.assert.test.tsx
must pass unmodified. Only add files under tests/bench-work/tree/.`,
    async prep(worktree) {
      await copyFixture(
        "tree",
        ["taxonomy.ts", "TaxonomyTree.assert.test-template.tsx"],
        join(worktree, "tests/bench-work/tree"),
      );
    },
    acceptance: [
      {
        id: "tree-semantics",
        kind: "vitest",
        paths: ["tests/bench-work/tree"],
      },
      {
        id: "usage-clean",
        kind: "validate-clean",
        path: "tests/bench-work/tree",
      },
    ],
    metrics: [
      {
        id: "ds-reuse",
        kind: "source-scan",
        dir: "tests/bench-work/tree",
        requireAnyPattern: ["@dt/TreeView", "@digitaltableteur/react"],
      },
    ],
    async oracle(worktree) {
      await copyFile(
        join(FIXTURES, "tree/oracle/TaxonomyTree.tsx"),
        join(worktree, "tests/bench-work/tree/TaxonomyTree.tsx"),
      );
    },
  },

  {
    id: "forced-colors-chip",
    category: "forced-colors",
    title: "Make a status chip survive forced-colors mode",
    workspace: "tests/bench-work/forced-colors",
    brief: `tests/bench-work/forced-colors/LegacyChip.tsx renders service status chips
whose only status signal is a hardcoded background colour. In Windows High
Contrast (forced-colors) mode backgrounds are stripped, so every status
looks identical — and hardcoded hex values bypass the design token system.

Fix the chip so that:
- each status stays distinguishable in forced-colors mode (through text or
  explicit forced-colors handling, not background colour alone)
- no hardcoded hex colours remain anywhere under
  tests/bench-work/forced-colors/
- the component keeps its public API ({ status }) and renders the same
  labels

Only edit files under tests/bench-work/forced-colors/.`,
    async prep(worktree) {
      await copyFixture(
        "forced-colors",
        [
          "LegacyChip.tsx",
          "LegacyChip.module.css",
          "LegacyChip.assert.test-template.tsx",
        ],
        join(worktree, "tests/bench-work/forced-colors"),
      );
    },
    acceptance: [
      {
        id: "labels-render",
        kind: "vitest",
        paths: ["tests/bench-work/forced-colors"],
      },
      {
        id: "no-hardcoded-hex",
        kind: "source-scan",
        dir: "tests/bench-work/forced-colors",
        forbidPattern: "#[0-9a-fA-F]{3,8}\\b",
      },
      {
        id: "forced-colors-strategy",
        kind: "source-scan",
        dir: "tests/bench-work/forced-colors",
        requireAnyPattern: [
          "forced-colors",
          "@dt/Badge",
          "@dt/StatusDot",
          "@digitaltableteur/react",
        ],
      },
      {
        id: "usage-clean",
        kind: "validate-clean",
        path: "tests/bench-work/forced-colors",
      },
    ],
    metrics: [
      {
        id: "ds-reuse",
        kind: "source-scan",
        dir: "tests/bench-work/forced-colors",
        requireAnyPattern: ["@dt/Badge", "@dt/StatusDot"],
      },
    ],
    async oracle(worktree) {
      await copyFile(
        join(FIXTURES, "forced-colors/oracle/LegacyChip.tsx"),
        join(worktree, "tests/bench-work/forced-colors/LegacyChip.tsx"),
      );
      await rm(
        join(worktree, "tests/bench-work/forced-colors/LegacyChip.module.css"),
      );
    },
  },
];

export function taskById(id) {
  return TASKS.find((task) => task.id === id) ?? null;
}
