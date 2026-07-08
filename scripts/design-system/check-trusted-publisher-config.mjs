#!/usr/bin/env node
/**
 * Verify npm Trusted Publisher readiness for the design-system packages.
 *
 * npm matches GitHub OIDC publishes by repository, workflow filename, and
 * optional environment. This guard keeps that configuration explicit before
 * maintainers wire each npm package to the GitHub Actions publisher.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const WORKFLOW = join(ROOT, ".github/workflows/ds-publish.yml");
const OUT_DIR = join(ROOT, ".omx/state/design-system/trusted-publisher");
const OUT_JSON = join(OUT_DIR, "latest.json");
const OUT_MD = join(OUT_DIR, "handoff.md");
const OUT_PATHSPEC = join(OUT_DIR, "publish-pathspec.txt");
const OUT_EXCLUDED_DIRTY = join(OUT_DIR, "excluded-dirty-paths.txt");
const REPORT = process.argv.includes("--report");
const EXPECTED_REPOSITORY_URL =
  "git+https://github.com/PetriLahdelma/digitaltableteur.git";
const PACKAGES = [
  { dir: "packages/tokens", name: "@digitaltableteur/tokens" },
  { dir: "packages/tokens-css", name: "@digitaltableteur/tokens-css" },
  { dir: "packages/react", name: "@digitaltableteur/react" },
];
const WORKFLOW_RELATIVE = ".github/workflows/ds-publish.yml";
const REQUIRED_REPOSITORY_PATHS = [
  ".github/scripts/write-npm-read-config.sh",
  ".github/workflows/ds-publish.yml",
  "nextjs-app/shared/components/AlertBanner/AlertBanner.module.css",
  "nextjs-app/shared/components/AlertBanner/AlertBanner.tsx",
  "nextjs-app/shared/components/Avatar/Avatar.tsx",
  "nextjs-app/shared/components/Avatar/avatar.module.css",
  "nextjs-app/shared/components/AvatarGroup/AvatarGroup.module.css",
  "nextjs-app/shared/components/AvatarGroup/AvatarGroup.tsx",
  "nextjs-app/shared/components/Badge/Badge.module.css",
  "nextjs-app/shared/components/Badge/Badge.tsx",
  "nextjs-app/shared/components/Badge/index.ts",
  "nextjs-app/shared/components/Breadcrumb/Breadcrumb.module.css",
  "nextjs-app/shared/components/Breadcrumb/Breadcrumb.tsx",
  "nextjs-app/shared/components/Button/Button.module.css",
  "nextjs-app/shared/components/Button/Button.tsx",
  "nextjs-app/shared/components/Button/index.ts",
  "nextjs-app/shared/components/ButtonGroup/ButtonGroup.module.css",
  "nextjs-app/shared/components/ButtonGroup/ButtonGroup.tsx",
  "nextjs-app/shared/components/Card/Card.module.css",
  "nextjs-app/shared/components/Card/Card.tsx",
  "nextjs-app/shared/components/CategoryFilter/CategoryFilter.tsx",
  "nextjs-app/shared/components/CategoryFilter/index.ts",
  "nextjs-app/shared/components/Checkbox/Checkbox.module.css",
  "nextjs-app/shared/components/Checkbox/Checkbox.tsx",
  "nextjs-app/shared/components/CheckboxGroup/CheckboxGroup.module.css",
  "nextjs-app/shared/components/CheckboxGroup/CheckboxGroup.tsx",
  "nextjs-app/shared/components/CodeBlockWindow/CodeBlockWindow.module.css",
  "nextjs-app/shared/components/CodeBlockWindow/CodeBlockWindow.tsx",
  "nextjs-app/shared/components/Combobox/Combobox.tsx",
  "nextjs-app/shared/components/Combobox/ComboboxField.module.css",
  "nextjs-app/shared/components/Combobox/comboboxOptions.ts",
  "nextjs-app/shared/components/Combobox/index.ts",
  "nextjs-app/shared/components/Combobox/useComboboxDropdown.ts",
  "nextjs-app/shared/components/Container/Container.module.css",
  "nextjs-app/shared/components/Container/Container.tsx",
  "nextjs-app/shared/components/Container/index.ts",
  "nextjs-app/shared/components/CookieConsent/CookieConsent.module.css",
  "nextjs-app/shared/components/CookieConsent/CookieConsent.tsx",
  "nextjs-app/shared/components/CookieConsent/CookieConsentBanner.module.css",
  "nextjs-app/shared/components/CookieConsent/CookieConsentBanner.tsx",
  "nextjs-app/shared/components/Divider/Divider.module.css",
  "nextjs-app/shared/components/Divider/Divider.tsx",
  "nextjs-app/shared/components/Divider/index.ts",
  "nextjs-app/shared/components/EmptyState/EmptyState.module.css",
  "nextjs-app/shared/components/EmptyState/EmptyState.tsx",
  "nextjs-app/shared/components/ExpandableSection/ExpandableSection.module.css",
  "nextjs-app/shared/components/ExpandableSection/ExpandableSection.tsx",
  "nextjs-app/shared/components/ExpandableSection/index.ts",
  "nextjs-app/shared/components/FileUpload/FileUpload.module.css",
  "nextjs-app/shared/components/FileUpload/FileUpload.tsx",
  "nextjs-app/shared/components/FlexBox/FlexBox.tsx",
  "nextjs-app/shared/components/FormField/FormField.module.css",
  "nextjs-app/shared/components/FormField/FormField.tsx",
  "nextjs-app/shared/components/FormField/index.ts",
  "nextjs-app/shared/components/Gallery/Gallery.module.css",
  "nextjs-app/shared/components/Gallery/Gallery.tsx",
  "nextjs-app/shared/components/Grid/Grid.module.css",
  "nextjs-app/shared/components/Grid/Grid.tsx",
  "nextjs-app/shared/components/GroupLabel/GroupLabel.module.css",
  "nextjs-app/shared/components/GroupLabel/GroupLabel.tsx",
  "nextjs-app/shared/components/HelperText/HelperText.module.css",
  "nextjs-app/shared/components/HelperText/HelperText.tsx",
  "nextjs-app/shared/components/HelperText/index.ts",
  "nextjs-app/shared/components/Icon/Icon.module.css",
  "nextjs-app/shared/components/Icon/Icon.tsx",
  "nextjs-app/shared/components/Icon/iconAliases.ts",
  "nextjs-app/shared/components/Icon/iconRegistry.discovered.ts",
  "nextjs-app/shared/components/Icon/iconRegistry.ts",
  "nextjs-app/shared/components/Icon/index.ts",
  "nextjs-app/shared/components/IconButton/IconButton.tsx",
  "nextjs-app/shared/components/IconButton/index.ts",
  "nextjs-app/shared/components/Kbd/Kbd.module.css",
  "nextjs-app/shared/components/Kbd/Kbd.tsx",
  "nextjs-app/shared/components/Label/Label.module.css",
  "nextjs-app/shared/components/Label/Label.tsx",
  "nextjs-app/shared/components/Label/index.ts",
  "nextjs-app/shared/components/LanguageSwitcher/LanguageSwitcher.module.css",
  "nextjs-app/shared/components/LanguageSwitcher/LanguageSwitcher.tsx",
  "nextjs-app/shared/components/LanguageSwitcher/index.ts",
  "nextjs-app/shared/components/Link/Link.module.css",
  "nextjs-app/shared/components/Link/Link.tsx",
  "nextjs-app/shared/components/Link/index.ts",
  "nextjs-app/shared/components/List/List.module.css",
  "nextjs-app/shared/components/List/List.tsx",
  "nextjs-app/shared/components/MacWindowFrame/MacWindowFrame.module.css",
  "nextjs-app/shared/components/MacWindowFrame/MacWindowFrame.tsx",
  "nextjs-app/shared/components/Menu/Menu.module.css",
  "nextjs-app/shared/components/Menu/Menu.tsx",
  "nextjs-app/shared/components/Menu/index.ts",
  "nextjs-app/shared/components/Modal/Modal.module.css",
  "nextjs-app/shared/components/Modal/Modal.tsx",
  "nextjs-app/shared/components/Modal/index.ts",
  "nextjs-app/shared/components/MultiCombobox/MultiCombobox.module.css",
  "nextjs-app/shared/components/MultiCombobox/MultiCombobox.tsx",
  "nextjs-app/shared/components/MultiCombobox/index.ts",
  "nextjs-app/shared/components/NavLink/NavLink.tsx",
  "nextjs-app/shared/components/NavLink/index.ts",
  "nextjs-app/shared/components/NavMenuList/NavMenuList.module.css",
  "nextjs-app/shared/components/NavMenuList/NavMenuList.tsx",
  "nextjs-app/shared/components/Pagination/Pagination.tsx",
  "nextjs-app/shared/components/Pagination/index.ts",
  "nextjs-app/shared/components/PhoneInput/PhoneInput.module.css",
  "nextjs-app/shared/components/PhoneInput/PhoneInput.tsx",
  "nextjs-app/shared/components/Progress/Progress.module.css",
  "nextjs-app/shared/components/Progress/Progress.tsx",
  "nextjs-app/shared/components/Radio/Radio.module.css",
  "nextjs-app/shared/components/Radio/Radio.tsx",
  "nextjs-app/shared/components/Radio/index.ts",
  "nextjs-app/shared/components/RadioGroup/RadioGroup.module.css",
  "nextjs-app/shared/components/RadioGroup/RadioGroup.tsx",
  "nextjs-app/shared/components/ReadingProgress/ReadingProgress.module.css",
  "nextjs-app/shared/components/ReadingProgress/ReadingProgress.tsx",
  "nextjs-app/shared/components/ReadingProgress/index.ts",
  "nextjs-app/shared/components/Section/Section.contract.json",
  "nextjs-app/shared/components/Section/Section.tsx",
  "nextjs-app/shared/components/Section/index.ts",
  "nextjs-app/shared/components/Select/Select.module.css",
  "nextjs-app/shared/components/Select/Select.tsx",
  "nextjs-app/shared/components/Select/SelectOption.module.css",
  "nextjs-app/shared/components/Select/SelectOption.tsx",
  "nextjs-app/shared/components/Skeleton/Skeleton.module.css",
  "nextjs-app/shared/components/Skeleton/Skeleton.tsx",
  "nextjs-app/shared/components/Skeleton/index.ts",
  "nextjs-app/shared/components/SkipLink/SkipLink.module.css",
  "nextjs-app/shared/components/SkipLink/SkipLink.tsx",
  "nextjs-app/shared/components/SkipLink/index.ts",
  "nextjs-app/shared/components/Spinner/Spinner.module.css",
  "nextjs-app/shared/components/Spinner/Spinner.tsx",
  "nextjs-app/shared/components/Spinner/index.ts",
  "nextjs-app/shared/components/Stack/Stack.tsx",
  "nextjs-app/shared/components/Stack/index.ts",
  "nextjs-app/shared/components/StatusDot/StatusDot.module.css",
  "nextjs-app/shared/components/StatusDot/StatusDot.tsx",
  "nextjs-app/shared/components/StatusDot/index.ts",
  "nextjs-app/shared/components/Switch/Switch.module.css",
  "nextjs-app/shared/components/Switch/Switch.tsx",
  "nextjs-app/shared/components/Tabs/Tabs.module.css",
  "nextjs-app/shared/components/Tabs/Tabs.tsx",
  "nextjs-app/shared/components/Tabs/index.ts",
  "nextjs-app/shared/components/Text/Text.module.css",
  "nextjs-app/shared/components/Text/Text.tsx",
  "nextjs-app/shared/components/Text/index.ts",
  "nextjs-app/shared/components/TextArea/TextArea.module.css",
  "nextjs-app/shared/components/TextArea/TextArea.tsx",
  "nextjs-app/shared/components/TextArea/index.ts",
  "nextjs-app/shared/components/TextInput/TextInput.module.css",
  "nextjs-app/shared/components/TextInput/TextInput.tsx",
  "nextjs-app/shared/components/TextInput/index.ts",
  "nextjs-app/shared/components/ThemeProvider/ThemeProvider.tsx",
  "nextjs-app/shared/components/Title/Title.module.css",
  "nextjs-app/shared/components/Title/Title.tsx",
  "nextjs-app/shared/components/Title/index.ts",
  "nextjs-app/shared/components/Toast/Toast.module.css",
  "nextjs-app/shared/components/Toast/Toast.tsx",
  "nextjs-app/shared/components/Toast/index.ts",
  "nextjs-app/shared/components/ValueCard/ValueCard.tsx",
  "nextjs-app/shared/components/ValueCard/index.ts",
  "nextjs-app/shared/components/VisuallyHidden/VisuallyHidden.module.css",
  "nextjs-app/shared/components/VisuallyHidden/VisuallyHidden.tsx",
  "nextjs-app/shared/components/VisuallyHidden/index.ts",
  "nextjs-app/shared/custom.d.ts",
  "nextjs-app/shared/foundations/token-catalog.json",
  "nextjs-app/shared/foundations/tokens/README.md",
  "nextjs-app/shared/foundations/tokens/production/README.md",
  "nextjs-app/shared/foundations/tokens/production/color.json",
  "nextjs-app/shared/foundations/tokens/production/elevation.json",
  "nextjs-app/shared/foundations/tokens/production/focus.json",
  "nextjs-app/shared/foundations/tokens/production/layout.json",
  "nextjs-app/shared/foundations/tokens/production/motion.json",
  "nextjs-app/shared/foundations/tokens/production/other.json",
  "nextjs-app/shared/foundations/tokens/production/radius.json",
  "nextjs-app/shared/foundations/tokens/production/size.json",
  "nextjs-app/shared/foundations/tokens/production/space.json",
  "nextjs-app/shared/foundations/tokens/production/typography.json",
  "nextjs-app/shared/hooks/useFocusTrap.ts",
  "nextjs-app/shared/hooks/useMediaQuery.ts",
  "nextjs-app/shared/hooks/useOverflow.ts",
  "nextjs-app/shared/hooks/useScrollLock.ts",
  "nextjs-app/shared/lib/animation.tsx",
  "nextjs-app/shared/lib/cn.ts",
  "nextjs-app/shared/lib/cookieConsent/CookieConsentContext.tsx",
  "nextjs-app/shared/lib/cookieConsent/index.ts",
  "nextjs-app/shared/lib/cookieConsent/storage.ts",
  "nextjs-app/shared/lib/cookieConsent/types.ts",
  "nextjs-app/shared/lib/gsap/motion-safe.ts",
  "nextjs-app/shared/lib/imageComponent.tsx",
  "nextjs-app/shared/lib/imageSrc.ts",
  "nextjs-app/shared/lib/layer.tsx",
  "nextjs-app/shared/lib/linkComponent.tsx",
  "nextjs-app/shared/lib/navigation.tsx",
  "nextjs-app/shared/lib/toast.tsx",
  "nextjs-app/shared/lib/translation.tsx",
  "nextjs-app/shared/styles/variables.css",
  "nextjs-app/shared/types/css.d.ts",
  "nextjs-app/shared/types/lucide-react.d.ts",
  "nextjs-app/shared/types/mdx.d.ts",
  "nextjs-app/shared/types/react-helmet-async.d.ts",
  "nextjs-app/shared/types/web-vitals.d.ts",
  "nextjs-app/shared/utils/deprecationWarning.ts",
  "nextjs-app/shared/utils/emailSuggestion.ts",
  "nextjs-app/shared/utils/semanticIcons.tsx",
  "nextjs-app/shared/utils/sizeNormalization.ts",
  "package-lock.json",
  "package.json",
  "packages/react/CHANGELOG.md",
  "packages/react/README.md",
  "packages/react/package.json",
  "packages/react/public-api.manifest.json",
  "packages/react/src/index.ts",
  "packages/react/src/package-env.d.ts",
  "packages/react/tsconfig.types.json",
  "packages/react/vite.config.ts",
  "packages/tokens-css/CHANGELOG.md",
  "packages/tokens-css/LICENSE",
  "packages/tokens-css/README.md",
  "packages/tokens-css/package.json",
  "packages/tokens/CHANGELOG.md",
  "packages/tokens/LICENSE",
  "packages/tokens/README.md",
  "packages/tokens/package.json",
  "scripts/design-system/assemble-react-package-types.mjs",
  "scripts/design-system/assemble-token-packages.mjs",
  "scripts/design-system/astryx-roadmap.state.json",
  "scripts/design-system/build-token-css.mjs",
  "scripts/design-system/build-tokens.mjs",
  "scripts/design-system/check-npm-consumer-install.mjs",
  "scripts/design-system/check-package-publish-dry-run.mjs",
  "scripts/design-system/check-package-registry-resolution.mjs",
  "scripts/design-system/check-package-registry-status.mjs",
  "scripts/design-system/check-package-release-notes.mjs",
  "scripts/design-system/check-package-tarball-contents.mjs",
  "scripts/design-system/check-react-package.mjs",
  "scripts/design-system/check-react-public-api.mjs",
  "scripts/design-system/check-react-public-surface.mjs",
  "scripts/design-system/check-react-publish-clearance.mjs",
  "scripts/design-system/check-react-publish-preflight.mjs",
  "scripts/design-system/check-react-publish-review-packet.mjs",
  "scripts/design-system/check-react-registry-install.mjs",
  "scripts/design-system/check-registry-token-install.mjs",
  "scripts/design-system/check-token-packages.mjs",
  "scripts/design-system/check-trusted-publisher-config.mjs",
  "scripts/design-system/export-dtcg-from-css.mjs",
  "scripts/design-system/extract-variables-catalog.mjs",
  "scripts/design-system/generate-theme.mjs",
  "scripts/design-system/themes/acme.brand.json"
];

function relativePath(path) {
  return relative(ROOT, path);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function requireWorkflowIncludes(source, needle, errors) {
  if (!source.includes(needle)) {
    errors.push(`ds-publish.yml is missing ${needle}`);
  }
}

function formatWorkflowStatus(report) {
  if (report.workflowTrackedByGit && report.workflowCommittedInHead) {
    return "ready: workflow is tracked by git and present in HEAD";
  }
  const missing = [];
  if (!report.workflowTrackedByGit) missing.push("not tracked by git");
  if (!report.workflowCommittedInHead) missing.push("not present in HEAD");
  return `blocked: workflow is ${missing.join(" and ")}`;
}

function formatPackageRows(packages) {
  return packages
    .map((pkg) => {
      const repository = pkg.repository ?? {};
      return `| \`${pkg.name}\` | \`${pkg.dir}\` | \`${repository.directory ?? "missing"}\` |`;
    })
    .join("\n");
}

function formatRepositoryPathRows(paths) {
  return paths
    .map((row) => {
      const status = row.ready ? "ready" : row.blockers.join(", ");
      return `| \`${row.path}\` | ${status} |`;
    })
    .join("\n");
}

function formatExcludedDirtyRows(paths) {
  if (!paths.length) return "| none |";
  return paths.map((path) => `| \`${path}\` |`).join("\n");
}

function writeHandoff(report) {
  const markdown = `# Trusted Publisher handoff

Generated: ${report.generatedAt}
Status: ${report.errors.length ? "blocked" : "ready"}

This file is generated by \`npm run check:trusted-publisher\`. It contains only
non-secret npm Trusted Publisher setup values for the private
\`@digitaltableteur\` packages.

## npm form values

- Publisher: ${report.publisher}
- Organization or user: \`${report.githubOwner}\`
- Repository: \`${report.githubRepository}\`
- Workflow filename: \`${report.workflowFilename}\`
- Environment name: ${report.npmEnvironmentName ?? "leave blank"}
- Allowed action: ${report.allowedActions.join(", ")}

## GitHub workflow state

- Workflow path: \`${report.workflowPath}\`
- Git state: ${formatWorkflowStatus(report)}
- Required before OIDC publish: commit and push the workflow plus every path in the repository commit-scope table to \`${report.githubOwner}/${report.githubRepository}\`.

## Repository commit scope

GitHub Actions checks out the repository commit, not this local working tree.
Every path below must be tracked, present in HEAD, and free of uncommitted
changes before npm Trusted Publisher can validate the same package state that
local machines verified.

| Path | Status |
| --- | --- |
${formatRepositoryPathRows(report.repositoryPaths)}

## Commit pathspec

The publish transport must be committed from an exact path list because this
worktree may contain unrelated local edits. This guard writes a pathspec file
for review; it does not stage anything.

- Publish pathspec: \`${report.publishPathspecPath}\`
- Excluded dirty paths: \`${report.excludedDirtyPathsPath}\`
- Required paths: ${report.repositoryPathCount}
- Required paths commit-ready: ${report.repositoryReadyPathCount}/${report.repositoryPathCount}
- Dirty paths outside publish scope: ${report.excludedDirtyPathCount}

After reviewing the pathspec and diffs, the intended staging shape is:

~~~bash
git add --pathspec-from-file=${report.publishPathspecPath}
~~~

Do not stage token-bearing \`.npm-userconfig\` values, generated \`.omx/state\`
files, or unrelated local work as part of the publish transport commit. The
tracked \`.npm-userconfig\` must remain non-secret.

## Dirty paths outside publish scope

| Path |
| --- |
${formatExcludedDirtyRows(report.excludedDirtyPaths)}

## Package mapping

| Package | Workspace | npm repository.directory |
| --- | --- | --- |
${formatPackageRows(report.packages)}

## Publish controls

- Keep the workflow manual-only through \`workflow_dispatch\`.
- Keep \`id-token: write\`. The workflow may use \`secrets.NPM_READ_TOKEN\`
  only for private package install/registry smoke reads; publish steps must stay
  OIDC-only and must not receive \`NPM_TOKEN\`, \`NODE_AUTH_TOKEN\`, or
  \`NPM_READ_TOKEN\`.
- Keep npm publish commands restricted: \`npm publish --access restricted\`.
- Keep \`@digitaltableteur/react\` behind \`check:react-publish-clearance\` and \`check:react-public-surface -- --require-publishable\`.
- Local machines remain the CI-quality authority; GitHub Actions is only the npm OIDC transport.

## Current guard errors

${report.errors.length ? report.errors.map((error) => `- ${error}`).join("\n") : "- none"}
`;

  writeFileSync(OUT_MD, markdown);
}

function isTrackedByGit(path) {
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", path], {
      cwd: ROOT,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function existsInHead(path) {
  try {
    execFileSync("git", ["cat-file", "-e", `HEAD:${path}`], {
      cwd: ROOT,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function differsFromHead(path) {
  try {
    execFileSync("git", ["diff", "--quiet", "--", path], {
      cwd: ROOT,
      stdio: "ignore",
    });
    return false;
  } catch {
    return true;
  }
}

function repositoryPathState(path) {
  const localExists = existsSync(join(ROOT, path));
  const trackedByGit = isTrackedByGit(path);
  const committedInHead = existsInHead(path);
  const hasUncommittedChanges =
    localExists && trackedByGit && committedInHead ? differsFromHead(path) : false;
  const ready = localExists && trackedByGit && committedInHead && !hasUncommittedChanges;
  const blockers = [];

  if (!localExists) blockers.push("missing locally");
  if (!trackedByGit) blockers.push("not tracked by git");
  if (!committedInHead) blockers.push("not present in HEAD");
  if (hasUncommittedChanges) blockers.push("differs from HEAD");

  return {
    path,
    localExists,
    trackedByGit,
    committedInHead,
    hasUncommittedChanges,
    ready,
    blockers,
  };
}

function gitDirtyPaths() {
  const output = execFileSync(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=all"],
    {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const paths = [];
  for (const line of output.split("\n")) {
    if (!line.trim()) continue;
    const rawPath = line.slice(3);
    if (rawPath.includes(" -> ")) {
      paths.push(...rawPath.split(" -> "));
    } else {
      paths.push(rawPath);
    }
  }
  return [...new Set(paths)].sort();
}

const errors = [];
const packageRows = [];
let workflowTrackedByGit = false;
let workflowCommittedInHead = false;
const repositoryPaths = REQUIRED_REPOSITORY_PATHS.map(repositoryPathState);
const requiredPathSet = new Set(REQUIRED_REPOSITORY_PATHS);
const excludedDirtyPaths = gitDirtyPaths().filter(
  (path) => !requiredPathSet.has(path) && !path.startsWith(".omx/"),
);

for (const row of repositoryPaths) {
  if (!row.ready) {
    errors.push(
      `Repository path ${row.path} is not commit-ready (${row.blockers.join(", ")}).`,
    );
  }
}

if (!existsSync(WORKFLOW)) {
  errors.push("Trusted Publisher workflow is missing: .github/workflows/ds-publish.yml");
} else {
  workflowTrackedByGit = isTrackedByGit(WORKFLOW_RELATIVE);
  workflowCommittedInHead = existsInHead(WORKFLOW_RELATIVE);
  if (!workflowTrackedByGit) {
    errors.push(
      "Trusted Publisher workflow exists locally but is not tracked by git; npm requires .github/workflows/ds-publish.yml to exist in the GitHub repository.",
    );
  }
  if (!workflowCommittedInHead) {
    errors.push(
      "Trusted Publisher workflow exists locally but is not present in the current commit; commit and push .github/workflows/ds-publish.yml before using npm OIDC publishing.",
    );
  }

  const workflow = readFileSync(WORKFLOW, "utf8");
  for (const required of [
    "workflow_dispatch:",
    "id-token: write",
    "contents: read",
    "runs-on: ubuntu-latest",
    "node-version: 24",
    "package-manager-cache: false",
    "Verify npm Trusted Publisher CLI support",
    "npm ${version} supports Trusted Publisher OIDC",
    ">=11.5.1",
    "NPM_READ_TOKEN: ${{ secrets.NPM_READ_TOKEN }}",
    "bash .github/scripts/write-npm-read-config.sh",
    "NPM_CONFIG_USERCONFIG=\"$RUNNER_TEMP/npm-read.npmrc\" npm ci",
    "npm run check:trusted-publisher",
    "npm run check:token-packages",
    "npm run check:react-package",
    "npm run check:package-release-notes",
    "npm run check:package-registry-resolution",
    "npm run check:package-tarballs",
    "NPM_CONFIG_USERCONFIG=\"$RUNNER_TEMP/npm-publish.npmrc\" npm run check:package-publish-dry-run",
    "npm run check:npm-consumer-install",
    "npm run check:react-public-surface",
    "npm run check:react-public-api",
    "npm run check:react-publish-clearance",
    "npm run check:react-public-surface -- --require-publishable",
    "NPM_CONFIG_USERCONFIG=\"$RUNNER_TEMP/npm-publish.npmrc\" npm publish --dry-run --access restricted",
    "NPM_CONFIG_USERCONFIG=\"$RUNNER_TEMP/npm-publish.npmrc\" npm publish --access restricted",
    "NPM_CONFIG_USERCONFIG=\"$RUNNER_TEMP/npm-read.npmrc\" npm run check:react-registry-install",
    "packages/tokens",
    "packages/tokens-css",
    "packages/react",
  ]) {
    requireWorkflowIncludes(workflow, required, errors);
  }

  if (/\n\s+push:|\n\s+schedule:|\n\s+pull_request:/.test(workflow)) {
    errors.push("ds-publish.yml must stay manual-only via workflow_dispatch.");
  }
  if (/self-hosted/.test(workflow)) {
    errors.push("ds-publish.yml must use GitHub-hosted runners for npm Trusted Publisher OIDC.");
  }
  if (/NPM_TOKEN|NODE_AUTH_TOKEN/.test(workflow)) {
    errors.push("ds-publish.yml must use OIDC Trusted Publisher auth, not npm tokens.");
  }
}

for (const pkgDef of PACKAGES) {
  const packageJsonPath = join(ROOT, pkgDef.dir, "package.json");
  if (!existsSync(packageJsonPath)) {
    errors.push(`${pkgDef.dir}/package.json is missing`);
    continue;
  }

  const pkg = readJson(packageJsonPath);
  const row = {
    name: pkg.name,
    dir: pkgDef.dir,
    repository: pkg.repository ?? null,
  };
  packageRows.push(row);

  if (pkg.name !== pkgDef.name) {
    errors.push(`${pkgDef.dir} expected package name ${pkgDef.name}, got ${pkg.name}`);
  }
  if (pkg.repository?.type !== "git") {
    errors.push(`${pkg.name} repository.type must be git for Trusted Publisher matching.`);
  }
  if (pkg.repository?.url !== EXPECTED_REPOSITORY_URL) {
    errors.push(
      `${pkg.name} repository.url must be ${EXPECTED_REPOSITORY_URL} for GitHub Trusted Publisher matching.`,
    );
  }
  if (pkg.repository?.directory !== pkgDef.dir) {
    errors.push(`${pkg.name} repository.directory must be ${pkgDef.dir}.`);
  }
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_PATHSPEC, `${REQUIRED_REPOSITORY_PATHS.join("\n")}\n`);
writeFileSync(OUT_EXCLUDED_DIRTY, `${excludedDirtyPaths.join("\n")}${excludedDirtyPaths.length ? "\n" : ""}`);
const report = {
  generatedAt: new Date().toISOString(),
  publisher: "GitHub Actions",
  githubOwner: "PetriLahdelma",
  githubRepository: "digitaltableteur",
  workflowFilename: "ds-publish.yml",
  workflowPath: WORKFLOW_RELATIVE,
  handoffPath: relativePath(OUT_MD),
  publishPathspecPath: relativePath(OUT_PATHSPEC),
  excludedDirtyPathsPath: relativePath(OUT_EXCLUDED_DIRTY),
  workflowTrackedByGit,
  workflowCommittedInHead,
  repositoryPaths,
  repositoryPathCount: repositoryPaths.length,
  repositoryReadyPathCount: repositoryPaths.filter((row) => row.ready).length,
  repositoryNotReadyPathCount: repositoryPaths.filter((row) => !row.ready).length,
  excludedDirtyPaths,
  excludedDirtyPathCount: excludedDirtyPaths.length,
  npmEnvironmentName: null,
  allowedActions: ["npm publish"],
  packages: packageRows,
  errors,
};
writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
writeHandoff(report);

if (REPORT) {
  console.log(JSON.stringify(report, null, 2));
}

if (errors.length) {
  console.error("Trusted Publisher configuration guard failed:");
  for (const error of errors) console.error(`  - ${error}`);
  console.error(`Report: ${relativePath(OUT_JSON)}`);
  console.error(`Handoff: ${relativePath(OUT_MD)}`);
  process.exit(1);
}

console.log(
  "✓ Trusted Publisher configuration verified (GitHub Actions, PetriLahdelma/digitaltableteur, workflow ds-publish.yml)",
);
console.log(`  Report: ${relativePath(OUT_JSON)}`);
console.log(`  Handoff: ${relativePath(OUT_MD)}`);
