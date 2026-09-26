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
import { benchSidecar, findPropConsumers } from "./grade.mjs";

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
      // Record the real consumers before the rename, outside the worktree.
      const consumers = await findPropConsumers(worktree, {
        component: "Badge",
        prop: "variant",
        roots: ["app", "nextjs-app/shared"],
        skipDirs: ["nextjs-app/shared/components/Badge/"],
      });
      await writeFile(
        benchSidecar(worktree, "migration-consumers"),
        JSON.stringify(consumers),
      );
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
        // Every file that passed variant to Badge when the run started
        // (recorded by prep), so acceptance matches the brief's "all
        // consumers" exactly and cannot drift as the repo changes.
        filesFrom: "migration-consumers",
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

  // --- v2 tasks (2026-09): discriminating contract-rule tasks. The v1 suite
  // saturated (both arms ~100% pass), so these target failure modes coding
  // agents actually exhibit: invented token names, modal focus management,
  // and error-to-field wiring. Each ships a "naive" plausible-but-wrong
  // solution that the selftest proves acceptance rejects.

  {
    id: "tokens-plan-card",
    category: "tokens",
    title: "Style a pricing plan card with the design tokens",
    workspace: "tests/bench-work/tokens",
    brief: `Create tests/bench-work/tokens/PlanCard.tsx (default export) and
tests/bench-work/tokens/PlanCard.module.css.

PlanCard takes { name: string; price: string; features: string[];
highlighted?: boolean } and renders the plan name as a heading, the price,
the features as a list, and a "Choose <name>" action.

Style it in PlanCard.module.css using this repository's design tokens:
surface background, text colour, border, border radius, internal padding
and gap. A highlighted card uses the primary brand colour for its border.

Constraints:
- no hardcoded colour values anywhere (hex, rgb()/hsl()/oklch(), or named
  colours)
- every CSS custom property you reference must be defined by the design
  system (or defined by you in the same files)
- colour, spacing and radius must all come from design-system tokens

The acceptance test at tests/bench-work/tokens/PlanCard.assert.test.tsx
must pass unmodified. Only add files under tests/bench-work/tokens/.`,
    async prep(worktree) {
      await copyFixture(
        "tokens",
        ["PlanCard.assert.test-template.tsx"],
        join(worktree, "tests/bench-work/tokens"),
      );
    },
    acceptance: [
      { id: "card-semantics", kind: "vitest", paths: ["tests/bench-work/tokens"] },
      {
        id: "token-discipline",
        kind: "token-discipline",
        dir: "tests/bench-work/tokens",
        requireTokenFamilies: ["--color-", "--space-", "--radius-"],
      },
      { id: "usage-clean", kind: "validate-clean", path: "tests/bench-work/tokens" },
    ],
    metrics: [
      {
        id: "ds-reuse",
        kind: "source-scan",
        dir: "tests/bench-work/tokens",
        requireAnyPattern: ["@dt/Card", "@dt/Button", "@digitaltableteur/react"],
      },
    ],
    async oracle(worktree) {
      for (const name of ["PlanCard.tsx", "PlanCard.module.css"]) {
        await copyFile(
          join(FIXTURES, "tokens/oracle", name),
          join(worktree, "tests/bench-work/tokens", name),
        );
      }
    },
    async naive(worktree) {
      for (const name of ["PlanCard.tsx", "PlanCard.module.css"]) {
        await copyFile(
          join(FIXTURES, "tokens/naive", name),
          join(worktree, "tests/bench-work/tokens", name),
        );
      }
    },
  },

  {
    id: "dialog-confirm-delete",
    category: "dialog",
    title: "Build an accessible delete-confirmation dialog",
    workspace: "tests/bench-work/dialog",
    brief: `Create tests/bench-work/dialog/DeleteProjectDialog.tsx, default-exporting a
React component that takes { projectName: string; onConfirm: () => void }.

It renders a "Delete project" button. Activating it opens a modal
confirmation dialog:
- the dialog's accessible name is "Delete <projectName>?" and its
  accessible description includes "This cannot be undone."
- focus moves into the dialog when it opens, and keyboard focus cannot
  reach the page content behind it while it is open
- Escape closes it and returns focus to the "Delete project" button
- a "Cancel" button closes it (focus returns to the trigger) without
  confirming
- a "Delete" button calls onConfirm exactly once and closes it

Use this repository's design-system components correctly if you use them.
The acceptance test at tests/bench-work/dialog/DeleteProjectDialog.assert.test.tsx
must pass unmodified. Only add files under tests/bench-work/dialog/.`,
    async prep(worktree) {
      await copyFixture(
        "dialog",
        ["DeleteProjectDialog.assert.test-template.tsx"],
        join(worktree, "tests/bench-work/dialog"),
      );
    },
    acceptance: [
      { id: "dialog-behaviour", kind: "vitest", paths: ["tests/bench-work/dialog"] },
      { id: "usage-clean", kind: "validate-clean", path: "tests/bench-work/dialog" },
      {
        id: "no-hardcoded-hex",
        kind: "source-scan",
        dir: "tests/bench-work/dialog",
        forbidPattern: "#[0-9a-fA-F]{3,8}\\b",
      },
    ],
    metrics: [
      {
        id: "ds-reuse",
        kind: "source-scan",
        dir: "tests/bench-work/dialog",
        requireAnyPattern: ["@dt/Modal", "@digitaltableteur/react"],
      },
    ],
    async oracle(worktree) {
      await copyFile(
        join(FIXTURES, "dialog/oracle/DeleteProjectDialog.tsx"),
        join(worktree, "tests/bench-work/dialog/DeleteProjectDialog.tsx"),
      );
    },
    async naive(worktree) {
      await copyFile(
        join(FIXTURES, "dialog/naive/DeleteProjectDialog.tsx"),
        join(worktree, "tests/bench-work/dialog/DeleteProjectDialog.tsx"),
      );
    },
  },

  {
    id: "form-signup-errors",
    category: "form",
    title: "Build a sign-up form with accessible validation errors",
    workspace: "tests/bench-work/form",
    brief: `Create tests/bench-work/form/SignupForm.tsx, default-exporting a React
component that takes { onSubmit: (values: { name: string; email: string })
=> void }.

It renders a form with a "Name" field, an "Email" field, and a
"Create account" submit button. On submit:
- an empty name shows the error "Enter your name"; an email without a valid
  address shows "Enter a valid email address"
- each invalid field is marked invalid for assistive technology and its
  error message is exposed as that field's accessible description
- focus moves to the first invalid field, and onSubmit is not called
- when both fields are valid, onSubmit is called once with the trimmed
  values and no field is marked invalid

Use this repository's design-system components correctly if you use them.
The acceptance test at tests/bench-work/form/SignupForm.assert.test.tsx
must pass unmodified. Only add files under tests/bench-work/form/.`,
    async prep(worktree) {
      await copyFixture(
        "form",
        ["SignupForm.assert.test-template.tsx"],
        join(worktree, "tests/bench-work/form"),
      );
    },
    acceptance: [
      { id: "form-semantics", kind: "vitest", paths: ["tests/bench-work/form"] },
      { id: "usage-clean", kind: "validate-clean", path: "tests/bench-work/form" },
    ],
    metrics: [
      {
        id: "ds-reuse",
        kind: "source-scan",
        dir: "tests/bench-work/form",
        requireAnyPattern: ["@dt/TextInput", "@digitaltableteur/react"],
      },
    ],
    async oracle(worktree) {
      await copyFile(
        join(FIXTURES, "form/oracle/SignupForm.tsx"),
        join(worktree, "tests/bench-work/form/SignupForm.tsx"),
      );
    },
    async naive(worktree) {
      await copyFile(
        join(FIXTURES, "form/naive/SignupForm.tsx"),
        join(worktree, "tests/bench-work/form/SignupForm.tsx"),
      );
    },
  },

  // --- v3 tasks (2026-09): multi-component and cross-file work. v2 tasks
  // saturated (every arm passed first try), so these require several
  // components to cooperate: shared state across tab panels, filters that
  // must reset paging, and a migration across three consumers.

  {
    id: "settings-panel",
    category: "composition",
    title: "Build a tabbed settings panel with switches and a save status",
    workspace: "tests/bench-work/settings",
    brief: `Create tests/bench-work/settings/SettingsPanel.tsx, default-exporting a React
component that takes { onSave: (settings: { emailNotifications: boolean;
weeklyDigest: boolean; darkMode: boolean }) => void }.

- Two tabs, "Notifications" and "Appearance", in a tablist labelled
  "Settings sections". Arrow keys move between tabs; Enter or Space selects.
  Only the selected tab's panel is shown, and each panel is labelled by its
  tab.
- Notifications panel: switches "Email notifications" (on by default) and
  "Weekly digest" (off by default). Appearance panel: switch "Dark mode"
  (off by default).
- Switch values persist when the user moves between tabs.
- A "Save settings" button calls onSave once with the current values and
  then shows "Settings saved" in a status message.

Use this repository's design-system components correctly if you use them.
The acceptance test at tests/bench-work/settings/SettingsPanel.assert.test.tsx
must pass unmodified. Only add files under tests/bench-work/settings/.`,
    async prep(worktree) {
      await copyFixture(
        "settings",
        ["SettingsPanel.assert.test-template.tsx"],
        join(worktree, "tests/bench-work/settings"),
      );
    },
    acceptance: [
      { id: "settings-behaviour", kind: "vitest", paths: ["tests/bench-work/settings"] },
      { id: "usage-clean", kind: "validate-clean", path: "tests/bench-work/settings" },
      {
        id: "no-hardcoded-hex",
        kind: "source-scan",
        dir: "tests/bench-work/settings",
        forbidPattern: "#[0-9a-fA-F]{3,8}\\b",
      },
    ],
    metrics: [
      {
        id: "ds-reuse",
        kind: "source-scan",
        dir: "tests/bench-work/settings",
        requireAnyPattern: ["@dt/Tabs", "@dt/Switch", "@digitaltableteur/react"],
      },
    ],
    async oracle(worktree) {
      await copyFile(
        join(FIXTURES, "settings/oracle/SettingsPanel.tsx"),
        join(worktree, "tests/bench-work/settings/SettingsPanel.tsx"),
      );
    },
    async naive(worktree) {
      await copyFile(
        join(FIXTURES, "settings/naive/SettingsPanel.tsx"),
        join(worktree, "tests/bench-work/settings/SettingsPanel.tsx"),
      );
    },
  },

  {
    id: "directory-filters",
    category: "composition",
    title: "Build a searchable, filterable, paginated project directory",
    workspace: "tests/bench-work/directory",
    brief: `Create tests/bench-work/directory/ProjectDirectory.tsx, default-exporting a
React component that lists the projects from ./projects.

- A search field labelled "Search projects" filters by name,
  case-insensitively.
- Category filter buttons "All", "Design", "Engineering", "Research": single
  select, each exposing whether it is pressed; "All" is pressed initially.
- Results in a list labelled "Projects", 5 per page, with page navigation
  whose page buttons are named "Page 1", "Page 2", ... and mark the current
  page with aria-current="page".
- Any change to the search or the category returns to page 1.
- A status message always states the result count: "23 projects",
  "1 project", "0 projects".
- With no results, show "No projects match your filters" and no page
  navigation.

Use this repository's design-system components correctly if you use them.
The acceptance test at tests/bench-work/directory/ProjectDirectory.assert.test.tsx
must pass unmodified. Only add files under tests/bench-work/directory/.`,
    async prep(worktree) {
      await copyFixture(
        "directory",
        ["projects.ts", "ProjectDirectory.assert.test-template.tsx"],
        join(worktree, "tests/bench-work/directory"),
      );
    },
    acceptance: [
      { id: "directory-behaviour", kind: "vitest", paths: ["tests/bench-work/directory"] },
      { id: "usage-clean", kind: "validate-clean", path: "tests/bench-work/directory" },
    ],
    metrics: [
      {
        id: "ds-reuse",
        kind: "source-scan",
        dir: "tests/bench-work/directory",
        requireAnyPattern: ["@dt/Pagination", "@dt/FilterChip", "@digitaltableteur/react"],
      },
    ],
    async oracle(worktree) {
      await copyFile(
        join(FIXTURES, "directory/oracle/ProjectDirectory.tsx"),
        join(worktree, "tests/bench-work/directory/ProjectDirectory.tsx"),
      );
    },
    async naive(worktree) {
      await copyFile(
        join(FIXTURES, "directory/naive/ProjectDirectory.tsx"),
        join(worktree, "tests/bench-work/directory/ProjectDirectory.tsx"),
      );
    },
  },

  {
    id: "tabs-refactor",
    category: "refactor",
    title: "Migrate three pages from hand-rolled tabs to the design-system Tabs",
    workspace: "tests/bench-work/refactor",
    brief: `tests/bench-work/refactor/ contains ProfilePage.tsx, BillingPage.tsx and
TeamPage.tsx, which all render LegacyTabs.tsx: hand-rolled tabs built from
clickable divs with no keyboard support or ARIA.

Migrate all three pages to this repository's design-system Tabs component,
then delete LegacyTabs.tsx. Every page must keep its tab labels, its panel
content, and its default export. The result must be accessible: a labelled
tablist (the old label prop), tabs that switch from the keyboard, and panels
labelled by their tabs.

The acceptance test at tests/bench-work/refactor/Pages.assert.test.tsx must
pass unmodified. Only edit files under tests/bench-work/refactor/.`,
    async prep(worktree) {
      await copyFixture(
        "refactor",
        [
          "LegacyTabs.tsx",
          "ProfilePage.tsx",
          "BillingPage.tsx",
          "TeamPage.tsx",
          "Pages.assert.test-template.tsx",
        ],
        join(worktree, "tests/bench-work/refactor"),
      );
    },
    acceptance: [
      { id: "pages-behaviour", kind: "vitest", paths: ["tests/bench-work/refactor"] },
      {
        // The brief is a migration TO the design system, so using it is the
        // task itself (as in migration-badge-rename), not a reuse metric.
        id: "legacy-removed-ds-used",
        kind: "source-scan",
        dir: "tests/bench-work/refactor",
        forbidPattern: "LegacyTabs",
        requireAnyPattern: ["@dt/Tabs", "@digitaltableteur/react"],
      },
      { id: "usage-clean", kind: "validate-clean", path: "tests/bench-work/refactor" },
    ],
    metrics: [],
    async oracle(worktree) {
      const dir = join(worktree, "tests/bench-work/refactor");
      for (const name of ["SectionTabs.tsx", "ProfilePage.tsx", "BillingPage.tsx", "TeamPage.tsx"]) {
        await copyFile(join(FIXTURES, "refactor/oracle", name), join(dir, name));
      }
      await rm(join(dir, "LegacyTabs.tsx"));
    },
    async naive(worktree) {
      const dir = join(worktree, "tests/bench-work/refactor");
      for (const name of ["SectionTabs.tsx", "ProfilePage.tsx", "BillingPage.tsx", "TeamPage.tsx"]) {
        await copyFile(join(FIXTURES, "refactor/naive", name), join(dir, name));
      }
      await rm(join(dir, "LegacyTabs.tsx"));
    },
  },
];

export function taskById(id) {
  return TASKS.find((task) => task.id === id) ?? null;
}
