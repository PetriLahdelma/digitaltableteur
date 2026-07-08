#!/usr/bin/env node
/**
 * Consolidated human-review evidence packet for publishing @digitaltableteur/react.
 *
 * This guard is intentionally non-mutating: it validates the latest automated
 * evidence and writes a review packet, but it does not clear approvals or
 * publish anything. Roadmap checkpoints 1.5, 1.6, and 5.1 still require
 * explicit human clearance before check:react-publish-ready can pass.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const STATE_PATH = join(ROOT, "scripts/design-system/astryx-roadmap.state.json");
const I18N_REPORT_PATH = join(
  ROOT,
  ".omx/state/design-system/i18n-navigation-review/latest/report.json",
);
const I18N_REVIEW_PATH = join(
  ROOT,
  ".omx/state/design-system/i18n-navigation-review/latest/review.md",
);
const API_REPORT_PATH = join(ROOT, ".omx/state/design-system/react-public-api/latest.json");
const SURFACE_REPORT_PATH = join(
  ROOT,
  ".omx/state/design-system/react-public-surface/latest.json",
);
const RELEASE_REPORT_PATH = join(
  ROOT,
  ".omx/state/design-system/package-release-notes/latest.json",
);
const TARBALL_REPORT_PATH = join(
  ROOT,
  ".omx/state/design-system/package-tarball-contents/latest.json",
);
const PUBLISH_DRY_RUN_REPORT_PATH = join(
  ROOT,
  ".omx/state/design-system/package-publish-dry-run/latest.json",
);
const TRUSTED_PUBLISHER_REPORT_PATH = join(
  ROOT,
  ".omx/state/design-system/trusted-publisher/latest.json",
);
const NPM_CONSUMER_INSTALL_REPORT_PATH = join(
  ROOT,
  ".omx/state/design-system/npm-consumer-install/latest.json",
);
const REGISTRY_TOKEN_INSTALL_REPORT_PATH = join(
  ROOT,
  ".omx/state/design-system/registry-token-install/latest.json",
);
const REACT_REGISTRY_INSTALL_REPORT_PATH = join(
  ROOT,
  ".omx/state/design-system/react-registry-install/latest.json",
);
const PACKAGE_REGISTRY_STATUS_REPORT_PATH = join(
  ROOT,
  ".omx/state/design-system/package-registry-status/latest.json",
);
const SITE_PACKAGE_DOGFOOD_REPORT_PATH = join(
  ROOT,
  ".omx/state/design-system/site-package-dogfood/latest.json",
);
const CLEARANCE_HANDOFF_PATH = ".omx/state/design-system/react-publish-clearance/handoff.md";
const OUT_DIR = join(ROOT, ".omx/state/design-system/react-publish-review");
const OUT_JSON = join(ROOT, ".omx/state/design-system/react-publish-review/latest.json");
const OUT_MD = join(ROOT, ".omx/state/design-system/react-publish-review/latest.md");
const OUT_HTML = join(ROOT, ".omx/state/design-system/react-publish-review/latest.html");

const REQUIRED_LANGUAGES = ["en", "fi", "sv"];
const REQUIRED_VIEWPORTS = ["desktop", "mobile"];
const REQUIRED_PACKAGES = [
  "@digitaltableteur/tokens",
  "@digitaltableteur/tokens-css",
  "@digitaltableteur/react",
];
const REQUIRED_RUNTIME_EXPORTS = [
  "LayerProvider",
  "LinkProvider",
  "NavigationProvider",
  "TranslationProvider",
  "useLayer",
  "useOverflow",
  "useScrollOverflow",
];
const MIN_REACT_RUNTIME_EXPORTS = 105;
const MIN_REACT_PUBLIC_SURFACE_EXPORTS = 61;

function relativePath(path) {
  return relative(ROOT, path);
}

function resolveRootPath(path) {
  return isAbsolute(path) ? path : join(ROOT, path);
}

function readJson(path, label, errors) {
  if (!existsSync(path)) {
    errors.push(`${label} is missing at ${relativePath(path)}.`);
    return null;
  }

  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    errors.push(`${label} is not valid JSON at ${relativePath(path)}: ${error.message}`);
    return null;
  }
}

function hasAll(values, required) {
  const set = new Set(values);
  return required.filter((value) => !set.has(value));
}

function taskStatusLine(id, task) {
  const status = task?.status ?? "missing";
  const approved = task?.approval?.clearedBy && task?.approval?.on ? "approved" : "unapproved";
  return `${id}: ${status} (${approved})`;
}

function isApprovedDone(task) {
  return task?.status === "done" && task?.approval?.clearedBy && task?.approval?.on;
}

function pendingClearanceErrors(state) {
  const tasks = state?.tasks ?? {};
  const errors = [];

  for (const id of ["1.5", "1.6"]) {
    if (!isApprovedDone(tasks[id])) {
      errors.push(
        `checkpoint ${id} is not cleared for React publish (${taskStatusLine(id, tasks[id])})`,
      );
    }
  }

  const publishTask = tasks["5.1"];
  const note = publishTask?.approval?.note ?? "";
  if (
    !publishTask?.approval?.clearedBy ||
    !publishTask?.approval?.on ||
    !/@digitaltableteur\/react/.test(note) ||
    /react remains unpublished|token-package registry smoke/i.test(note)
  ) {
    errors.push(
      `checkpoint 5.1 does not record explicit @digitaltableteur/react publish clearance (${taskStatusLine("5.1", publishTask)})`,
    );
  }

  return errors;
}

function checkbox(checked) {
  return checked ? "[x]" : "[ ]";
}

function validateI18nReport(report, errors) {
  if (!report) return null;

  const rows = Array.isArray(report.rows) ? report.rows : [];
  const failedRows = rows.filter((row) => row.ok !== true);
  const languages = [...new Set(rows.map((row) => row.language ?? row.locale).filter(Boolean))].sort();
  const viewports = [...new Set(rows.map((row) => row.viewport).filter(Boolean))].sort();
  const kinds = [...new Set(rows.map((row) => row.kind).filter(Boolean))].sort();
  const screenshotRows = rows.filter((row) => row.screenshot);
  const missingScreenshots = screenshotRows
    .map((row) => row.screenshot)
    .filter((screenshot) => !existsSync(resolveRootPath(screenshot)));

  if (!existsSync(I18N_REVIEW_PATH)) {
    errors.push(`i18n/navigation review markdown is missing at ${relativePath(I18N_REVIEW_PATH)}.`);
  }
  if ((report.summary?.failed ?? failedRows.length) !== 0 || failedRows.length !== 0) {
    errors.push(
      `i18n/navigation review has failures: summary.failed=${report.summary?.failed ?? "unknown"}, failedRows=${failedRows.length}.`,
    );
  }
  if ((report.summary?.total ?? rows.length) < 27) {
    errors.push(`i18n/navigation review has only ${report.summary?.total ?? rows.length} rows; expected at least 27.`);
  }
  for (const missing of hasAll(languages, REQUIRED_LANGUAGES)) {
    errors.push(`i18n/navigation review is missing language ${missing}.`);
  }
  for (const missing of hasAll(viewports, REQUIRED_VIEWPORTS)) {
    errors.push(`i18n/navigation review is missing viewport ${missing}.`);
  }
  for (const missing of hasAll(kinds, ["navigation", "route"])) {
    errors.push(`i18n/navigation review is missing ${missing} coverage.`);
  }
  if (screenshotRows.length < 24) {
    errors.push(`i18n/navigation review has only ${screenshotRows.length} screenshots; expected at least 24.`);
  }
  for (const screenshot of missingScreenshots) {
    errors.push(`i18n/navigation review references a missing screenshot: ${screenshot}.`);
  }

  return {
    generatedAt: report.generatedAt,
    baseUrl: report.baseUrl,
    summary: report.summary,
    languages,
    viewports,
    kinds,
    screenshotCount: screenshotRows.length,
    reviewMarkdown: relativePath(I18N_REVIEW_PATH),
    screenshotDir: ".omx/state/design-system/i18n-navigation-review/latest/screenshots",
  };
}

function validateApiReport(report, errors) {
  if (!report) return null;

  const runtimeExports = Array.isArray(report.runtimeExports) ? report.runtimeExports : [];
  const missingRuntimeExports = REQUIRED_RUNTIME_EXPORTS.filter(
    (exportName) => !runtimeExports.includes(exportName),
  );

  if (report.packageName !== "@digitaltableteur/react") {
    errors.push(`React public API report names ${report.packageName}; expected @digitaltableteur/react.`);
  }
  if (!report.packageExports?.["."] || !report.packageExports?.["./style.css"]) {
    errors.push("React public API report does not include both . and ./style.css package exports.");
  }
  if (runtimeExports.length < MIN_REACT_RUNTIME_EXPORTS) {
    errors.push(
      `React public API report has ${runtimeExports.length} runtime exports; expected at least ${MIN_REACT_RUNTIME_EXPORTS}.`,
    );
  }
  for (const exportName of missingRuntimeExports) {
    errors.push(`React public API report is missing required export ${exportName}.`);
  }

  return {
    packageName: report.packageName,
    packageVersion: report.packageVersion,
    runtimeExportCount: runtimeExports.length,
    packageExports: Object.keys(report.packageExports ?? {}).sort(),
    requiredRuntimeExports: REQUIRED_RUNTIME_EXPORTS,
  };
}

function validateSurfaceReport(report, errors) {
  if (!report) return null;

  const alphaExports = Array.isArray(report.alphaExports) ? report.alphaExports : [];
  if ((report.alphaCeiling ?? null) !== 0) {
    errors.push(`React public surface alphaCeiling is ${report.alphaCeiling}; expected 0.`);
  }
  if (alphaExports.length !== 0) {
    errors.push(`React public surface exposes alpha contracts: ${alphaExports.join(", ")}.`);
  }
  if ((report.summary?.total ?? 0) < MIN_REACT_PUBLIC_SURFACE_EXPORTS) {
    errors.push(
      `React public surface summary total is ${report.summary?.total ?? 0}; expected at least ${MIN_REACT_PUBLIC_SURFACE_EXPORTS}.`,
    );
  }

  return {
    generatedAt: report.generatedAt,
    summary: report.summary,
    alphaCeiling: report.alphaCeiling,
    alphaExports,
  };
}

function validateReleaseReport(report, errors) {
  if (!report) return null;

  const releaseErrors = Array.isArray(report.errors) ? report.errors : [];
  const packages = Array.isArray(report.packages) ? report.packages : [];
  const names = packages.map((row) => row.name).filter(Boolean);

  if (releaseErrors.length) {
    errors.push(`Package release metadata has errors: ${releaseErrors.join("; ")}`);
  }
  if (!names.includes("@digitaltableteur/react")) {
    errors.push("Package release metadata report does not include @digitaltableteur/react.");
  }

  return {
    generatedAt: report.generatedAt,
    packageNames: names,
    reactPackage: packages.find((row) => row.name === "@digitaltableteur/react") ?? null,
    errorCount: releaseErrors.length,
  };
}

function validateTarballReport(report, errors) {
  if (!report) return null;

  const reportErrors = Array.isArray(report.errors) ? report.errors : [];
  const packages = Array.isArray(report.packages) ? report.packages : [];
  const names = packages.map((row) => row.name).filter(Boolean);

  if (reportErrors.length) {
    errors.push(`Package tarball contents report has errors: ${reportErrors.join("; ")}`);
  }
  for (const packageName of REQUIRED_PACKAGES) {
    if (!names.includes(packageName)) {
      errors.push(`Package tarball contents report does not include ${packageName}.`);
    }
  }
  for (const row of packages) {
    const rowErrors = Array.isArray(row.errors) ? row.errors : [];
    if (rowErrors.length) {
      errors.push(`${row.name} tarball contents errors: ${rowErrors.join("; ")}`);
    }
    if ((row.missingFiles?.length ?? 0) !== 0) {
      errors.push(`${row.name} tarball is missing required files: ${row.missingFiles.join(", ")}`);
    }
    if ((row.unexpectedFiles?.length ?? 0) !== 0) {
      errors.push(`${row.name} tarball contains unexpected files: ${row.unexpectedFiles.join(", ")}`);
    }
    if ((row.forbiddenFiles?.length ?? 0) !== 0) {
      errors.push(`${row.name} tarball contains forbidden files: ${row.forbiddenFiles.join(", ")}`);
    }
  }

  return {
    generatedAt: report.generatedAt,
    packageNames: names,
    errorCount: reportErrors.length,
    packages: packages.map((row) => ({
      name: row.name,
      version: row.version,
      entryCount: row.entryCount,
      fileCount: row.fileCount,
      unpackedSize: row.unpackedSize,
      tarballSize: row.tarballSize,
      missingFileCount: row.missingFiles?.length ?? 0,
      unexpectedFileCount: row.unexpectedFiles?.length ?? 0,
      forbiddenFileCount: row.forbiddenFiles?.length ?? 0,
    })),
  };
}

function validatePublishDryRunReport(report, errors) {
  if (!report) return null;

  const reportErrors = Array.isArray(report.errors) ? report.errors : [];
  const packages = Array.isArray(report.packages) ? report.packages : [];
  const names = packages.map((row) => row.name).filter(Boolean);

  if (!String(report.commandShape ?? "").includes("npm publish")) {
    errors.push("Package publish dry-run report does not record the npm publish command shape.");
  }
  if (!String(report.commandShape ?? "").includes("--access restricted")) {
    errors.push("Package publish dry-run report does not record restricted access.");
  }
  if (reportErrors.length) {
    errors.push(`Package publish dry-run report has errors: ${reportErrors.join("; ")}`);
  }
  for (const packageName of REQUIRED_PACKAGES) {
    if (!names.includes(packageName)) {
      errors.push(`Package publish dry-run report does not include ${packageName}.`);
    }
  }
  for (const row of packages) {
    const rowErrors = Array.isArray(row.errors) ? row.errors : [];
    if (rowErrors.length) {
      errors.push(`${row.name} publish dry-run errors: ${rowErrors.join("; ")}`);
    }
    if (row.id !== `${row.name}@${row.version}`) {
      errors.push(`${row.name} publish dry-run id ${row.id} does not match ${row.name}@${row.version}.`);
    }
    if (!row.integrity || !row.shasum) {
      errors.push(`${row.name} publish dry-run did not report integrity and shasum.`);
    }
    if ((row.missingFiles?.length ?? 0) !== 0) {
      errors.push(`${row.name} publish dry-run is missing required files: ${row.missingFiles.join(", ")}`);
    }
  }

  return {
    generatedAt: report.generatedAt,
    commandShape: report.commandShape,
    packageNames: names,
    errorCount: reportErrors.length,
    packages: packages.map((row) => ({
      name: row.name,
      version: row.version,
      id: row.id,
      entryCount: row.entryCount,
      fileCount: row.fileCount,
      unpackedSize: row.unpackedSize,
      size: row.size,
      hasIntegrity: Boolean(row.integrity),
      hasShasum: Boolean(row.shasum),
      missingFileCount: row.missingFiles?.length ?? 0,
    })),
  };
}

function validateTrustedPublisherReport(report, errors) {
  if (!report) return null;

  const reportErrors = Array.isArray(report.errors) ? report.errors : [];
  const packages = Array.isArray(report.packages) ? report.packages : [];
  const repositoryPaths = Array.isArray(report.repositoryPaths)
    ? report.repositoryPaths
    : [];
  const names = packages.map((row) => row.name).filter(Boolean);
  const notReadyRepositoryPaths = repositoryPaths.filter((row) => row.ready !== true);

  if (reportErrors.length) {
    errors.push(`Trusted Publisher report has errors: ${reportErrors.join("; ")}`);
  }
  if (report.publisher !== "GitHub Actions") {
    errors.push(`Trusted Publisher report uses ${report.publisher}; expected GitHub Actions.`);
  }
  if (report.githubOwner !== "PetriLahdelma" || report.githubRepository !== "digitaltableteur") {
    errors.push(
      `Trusted Publisher report points to ${report.githubOwner}/${report.githubRepository}; expected PetriLahdelma/digitaltableteur.`,
    );
  }
  if (report.workflowFilename !== "ds-publish.yml") {
    errors.push(`Trusted Publisher report uses workflow ${report.workflowFilename}; expected ds-publish.yml.`);
  }
  if (!Array.isArray(report.allowedActions) || !report.allowedActions.includes("npm publish")) {
    errors.push("Trusted Publisher report does not allow npm publish.");
  }
  if (report.handoffPath !== ".omx/state/design-system/trusted-publisher/handoff.md") {
    errors.push("Trusted Publisher report does not point to the generated handoff.md.");
  }
  for (const packageName of REQUIRED_PACKAGES) {
    if (!names.includes(packageName)) {
      errors.push(`Trusted Publisher report does not include ${packageName}.`);
    }
  }

  return {
    generatedAt: report.generatedAt,
    publisher: report.publisher,
    githubOwner: report.githubOwner,
    githubRepository: report.githubRepository,
    workflowFilename: report.workflowFilename,
    handoffPath: report.handoffPath,
    npmEnvironmentName: report.npmEnvironmentName,
    allowedActions: report.allowedActions ?? [],
    packageNames: names,
    repositoryPathCount: repositoryPaths.length,
    repositoryReadyPathCount: repositoryPaths.length - notReadyRepositoryPaths.length,
    repositoryNotReadyPathCount: notReadyRepositoryPaths.length,
    errorCount: reportErrors.length,
  };
}

function validateNpmConsumerInstallReport(report, errors) {
  if (!report) return null;

  const reportErrors = Array.isArray(report.errors) ? report.errors : [];
  const packages = Array.isArray(report.packages) ? report.packages : [];
  const names = packages.map((row) => row.name).filter(Boolean);

  if (report.status !== "passed") {
    errors.push(`npm consumer install report status is ${report.status}; expected passed.`);
  }
  if (reportErrors.length) {
    errors.push(`npm consumer install report has errors: ${reportErrors.join("; ")}`);
  }
  for (const packageName of REQUIRED_PACKAGES) {
    if (!names.includes(packageName)) {
      errors.push(`npm consumer install report does not include ${packageName}.`);
    }
  }
  if ((report.consumer?.tokenCount ?? 0) < 180) {
    errors.push(`npm consumer install report has tokenCount=${report.consumer?.tokenCount ?? "missing"}; expected at least 180.`);
  }
  if ((report.consumer?.reactExports ?? 0) < MIN_REACT_RUNTIME_EXPORTS) {
    errors.push(
      `npm consumer install report has reactExports=${report.consumer?.reactExports ?? "missing"}; expected at least ${MIN_REACT_RUNTIME_EXPORTS}.`,
    );
  }
  for (const field of [
    "tokenCssResolved",
    "tokenCssRootResolved",
    "acmeThemeResolved",
    "acmeThemeWithExtResolved",
    "reactCssResolved",
  ]) {
    if (report.consumer?.[field] !== true) {
      errors.push(`npm consumer install report did not resolve ${field}.`);
    }
  }
  if (report.consumer?.typecheck !== "passed") {
    errors.push("npm consumer install report did not record a passed strict TypeScript consumer.");
  }

  return {
    generatedAt: report.generatedAt,
    status: report.status,
    packageNames: names,
    packageCount: packages.length,
    tokenCount: report.consumer?.tokenCount ?? 0,
    reactExports: report.consumer?.reactExports ?? 0,
    typecheck: report.consumer?.typecheck ?? "missing",
    errorCount: reportErrors.length,
  };
}

function validateRegistryTokenInstallReport(report, errors) {
  if (!report) return null;

  const reportErrors = Array.isArray(report.errors) ? report.errors : [];
  const packages = Array.isArray(report.packages) ? report.packages : [];
  const names = packages.map((row) => row.name).filter(Boolean);

  if (report.status !== "passed") {
    errors.push(`registry token install report status is ${report.status}; expected passed.`);
  }
  if (report.registry !== "https://registry.npmjs.org/") {
    errors.push(`registry token install report uses ${report.registry}; expected https://registry.npmjs.org/.`);
  }
  if (reportErrors.length) {
    errors.push(`registry token install report has errors: ${reportErrors.join("; ")}`);
  }
  for (const packageName of ["@digitaltableteur/tokens", "@digitaltableteur/tokens-css"]) {
    if (!names.includes(packageName)) {
      errors.push(`registry token install report does not include ${packageName}.`);
    }
  }
  for (const row of packages) {
    if (row.expectedVersion !== row.registryVersion) {
      errors.push(`${row.name} registry version ${row.registryVersion} does not match expected ${row.expectedVersion}.`);
    }
    if (row.orgAccess !== "read-write") {
      errors.push(`${row.name} org access ${row.orgAccess ?? "missing"} does not match expected read-write.`);
    }
    if (row.accessStatus !== "private") {
      errors.push(`${row.name} access status ${row.accessStatus ?? "missing"} does not match expected private.`);
    }
  }
  if ((report.consumer?.tokenCount ?? 0) < 180) {
    errors.push(`registry token install report has tokenCount=${report.consumer?.tokenCount ?? "missing"}; expected at least 180.`);
  }
  if (report.consumer?.tokensCssResolvedFromNodeModules !== true) {
    errors.push("registry token install report did not resolve tokens CSS from node_modules.");
  }
  if (report.consumer?.acmeThemeResolvedFromNodeModules !== true) {
    errors.push("registry token install report did not resolve the Acme theme from node_modules.");
  }

  return {
    generatedAt: report.generatedAt,
    status: report.status,
    registry: report.registry,
    packageNames: names,
    packageAccess: packages.map((row) => ({
      name: row.name,
      expectedVersion: row.expectedVersion,
      registryVersion: row.registryVersion,
      orgAccess: row.orgAccess ?? "missing",
      accessStatus: row.accessStatus ?? "missing",
    })),
    tokenCount: report.consumer?.tokenCount ?? 0,
    tokensCssResolvedFromNodeModules: report.consumer?.tokensCssResolvedFromNodeModules === true,
    acmeThemeResolvedFromNodeModules: report.consumer?.acmeThemeResolvedFromNodeModules === true,
    errorCount: reportErrors.length,
  };
}

function validateReactRegistryInstallReport(report, errors) {
  if (!report) return null;

  const reportErrors = Array.isArray(report.errors) ? report.errors : [];
  const packages = Array.isArray(report.packages) ? report.packages : [];
  const reactRow = packages.find((row) => row.name === "@digitaltableteur/react");

  if (report.registry !== "https://registry.npmjs.org/") {
    errors.push(`react registry install report uses ${report.registry}; expected https://registry.npmjs.org/.`);
  }
  if (report.expectedReactState !== "unpublished") {
    errors.push(
      `react registry install report expectedReactState is ${report.expectedReactState}; expected unpublished before the publish workflow runs.`,
    );
  }
  if (reportErrors.length) {
    errors.push(`react registry install report has errors: ${reportErrors.join("; ")}`);
  }
  if (!reactRow) {
    errors.push("react registry install report does not include @digitaltableteur/react.");
  } else {
    if (report.status !== "expected-unpublished") {
      errors.push(
        `react registry install report status is ${report.status}; expected expected-unpublished before React publish clearance.`,
      );
    }
    if (reactRow.actualState !== "unpublished" || reactRow.registryVersion != null) {
      errors.push(
        `@digitaltableteur/react registry smoke saw ${reactRow.actualState}@${reactRow.registryVersion}; expected unpublished before clearance.`,
      );
    }
  }

  return {
    generatedAt: report.generatedAt,
    status: report.status,
    registry: report.registry,
    expectedReactState: report.expectedReactState,
    reactPackage: reactRow
      ? {
          expectedVersion: reactRow.expectedVersion,
          registryVersion: reactRow.registryVersion,
          actualState: reactRow.actualState,
          orgAccess: reactRow.orgAccess ?? "missing",
        }
      : null,
    reactExports: report.consumer?.reactExports ?? 0,
    reactCssResolvedFromNodeModules: report.consumer?.reactCssResolvedFromNodeModules === true,
    tokenCssResolvedFromNodeModules: report.consumer?.tokenCssResolvedFromNodeModules === true,
    typecheck: report.consumer?.typecheck ?? "not-run",
    errorCount: reportErrors.length,
  };
}

function validatePackageRegistryStatusReport(report, errors) {
  if (!report) return null;

  const reportErrors = Array.isArray(report.errors) ? report.errors : [];
  const packages = Array.isArray(report.packages) ? report.packages : [];
  const tokenRows = packages.filter((row) =>
    ["@digitaltableteur/tokens", "@digitaltableteur/tokens-css"].includes(row.name),
  );
  const reactRow = packages.find((row) => row.name === "@digitaltableteur/react");

  if (report.status !== "passed") {
    errors.push(`package registry status report status is ${report.status}; expected passed.`);
  }
  if (report.registry !== "https://registry.npmjs.org/") {
    errors.push(`package registry status report uses ${report.registry}; expected https://registry.npmjs.org/.`);
  }
  if (reportErrors.length) {
    errors.push(`package registry status report has errors: ${reportErrors.join("; ")}`);
  }
  if (report.expectedReactState !== "unpublished") {
    errors.push(`package registry status expectedReactState is ${report.expectedReactState}; expected unpublished before clearance.`);
  }
  for (const packageName of ["@digitaltableteur/tokens", "@digitaltableteur/tokens-css"]) {
    const row = tokenRows.find((item) => item.name === packageName);
    if (!row) {
      errors.push(`package registry status report does not include ${packageName}.`);
      continue;
    }
    if (row.actualState !== "published" || row.registryVersion !== row.expectedVersion) {
      errors.push(`${packageName} registry state is ${row.actualState}@${row.registryVersion}; expected published@${row.expectedVersion}.`);
    }
    if (row.accessStatus !== "private" || row.orgAccess !== "read-write") {
      errors.push(`${packageName} registry access is ${row.accessStatus ?? "missing"}/${row.orgAccess ?? "missing"}; expected private/read-write.`);
    }
  }
  if (!reactRow) {
    errors.push("package registry status report does not include @digitaltableteur/react.");
  } else if (reactRow.actualState !== "unpublished" || reactRow.exactVersionPublished !== false) {
    errors.push(`@digitaltableteur/react@${reactRow.expectedVersion} registry state is ${reactRow.actualState}; expected unpublished before clearance.`);
  }

  return {
    generatedAt: report.generatedAt,
    status: report.status,
    registry: report.registry,
    expectedReactState: report.expectedReactState,
    packages: packages.map((row) => ({
      name: row.name,
      expectedVersion: row.expectedVersion,
      actualState: row.actualState,
      registryVersion: row.registryVersion,
      latestVersion: row.latestVersion,
      accessStatus: row.accessStatus,
      orgAccess: row.orgAccess,
    })),
    errorCount: reportErrors.length,
  };
}

function validateSitePackageDogfoodReport(report, errors) {
  if (!report) return null;

  const reportErrors = Array.isArray(report.errors) ? report.errors : [];
  const rows = Array.isArray(report.rows) ? report.rows : [];
  const failedRows = rows.filter((row) => row.ok !== true);
  const languages = report.summary?.languages ?? [];
  const categories = report.summary?.categories ?? [];

  if (report.status !== "passed") {
    errors.push(`site package dogfood report status is ${report.status}; expected passed.`);
  }
  if (reportErrors.length) {
    errors.push(`site package dogfood report has errors: ${reportErrors.join("; ")}`);
  }
  if ((report.summary?.total ?? rows.length) < 10) {
    errors.push(`site package dogfood report has only ${report.summary?.total ?? rows.length} checks; expected at least 10.`);
  }
  if ((report.summary?.failed ?? failedRows.length) !== 0 || failedRows.length !== 0) {
    errors.push(
      `site package dogfood report has failures: summary.failed=${report.summary?.failed ?? "unknown"}, failedRows=${failedRows.length}.`,
    );
  }
  for (const language of REQUIRED_LANGUAGES) {
    if (!languages.includes(language)) {
      errors.push(`site package dogfood report is missing language ${language}.`);
    }
  }
  for (const category of ["i18n", "navigation", "content-language-notice", "media", "production-consumer"]) {
    if (!categories.includes(category)) {
      errors.push(`site package dogfood report is missing category ${category}.`);
    }
  }

  return {
    generatedAt: report.generatedAt,
    status: report.status,
    baseUrl: report.baseUrl,
    summary: report.summary,
    errorCount: reportErrors.length,
  };
}

function formatTask(task) {
  if (!task) return "missing";
  const approval = task.approval
    ? `${task.approval.clearedBy ?? "unknown"} on ${task.approval.on ?? "unknown"}`
    : "no approval";
  return `${task.status ?? "missing"}; ${approval}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function htmlScreenshotSrc(path) {
  return relative(dirname(OUT_HTML), resolveRootPath(path));
}

function routeSortKey(row) {
  const languageOrder = new Map(REQUIRED_LANGUAGES.map((language, index) => [language, index]));
  const viewportOrder = new Map(REQUIRED_VIEWPORTS.map((viewport, index) => [viewport, index]));
  const routeOrder = new Map(
    ["home", "contact", "work-detail", "blog-detail"].map((route, index) => [route, index]),
  );
  return [
    languageOrder.get(row.language ?? row.locale) ?? 99,
    viewportOrder.get(row.viewport) ?? 99,
    routeOrder.get(row.route) ?? 99,
  ].join(":");
}

function buildHtml(report, i18nReport) {
  const rows = Array.isArray(i18nReport?.rows) ? i18nReport.rows : [];
  const screenshotRows = rows
    .filter((row) => row.kind === "route" && row.screenshot)
    .sort((a, b) => routeSortKey(a).localeCompare(routeSortKey(b)));
  const navigationRows = rows.filter((row) => row.kind === "navigation");
  const clearance = report.clearance;
  const packageRows = report.evidence.packagePublishDryRun?.packages ?? [];
  const registryAccessSummary =
    report.evidence.registryTokenInstall?.packageAccess
      ?.map((row) => `${row.name}@${row.registryVersion} (${row.accessStatus}/${row.orgAccess})`)
      .join(", ") ?? "missing";
  const registryStatusSummary =
    report.evidence.packageRegistryStatus?.packages
      ?.map((row) => {
        const version = row.registryVersion ?? row.expectedVersion ?? "unknown";
        const access = row.accessStatus && row.orgAccess ? ` ${row.accessStatus}/${row.orgAccess}` : "";
        return `${row.name}@${version} ${row.actualState}${access}`;
      })
      .join(", ") ?? "missing";

  const screenshotCards = screenshotRows
    .map((row) => {
      const language = row.language ?? row.locale ?? "unknown";
      const src = htmlScreenshotSrc(row.screenshot);
      const title = `${language.toUpperCase()} / ${row.viewport} / ${row.route}`;
      const summary = row.summary?.h1?.length
        ? `<p>H1: ${escapeHtml(row.summary.h1.join(" / "))}</p>`
        : "";
      return `<article class="shot">
        <h3>${escapeHtml(title)}</h3>
        <a href="${escapeHtml(src)}"><img src="${escapeHtml(src)}" alt="${escapeHtml(title)} screenshot" loading="lazy"></a>
        ${summary}
        <p><code>${escapeHtml(row.path ?? "")}</code></p>
      </article>`;
    })
    .join("\n");

  const navigationCards = navigationRows
    .map((row) => {
      const language = row.language ?? row.locale ?? "unknown";
      const checks = Array.isArray(row.checks) ? row.checks : [];
      return `<article class="nav-check">
        <h3>${escapeHtml(language.toUpperCase())} / ${escapeHtml(row.viewport)}</h3>
        <ul>${checks.map((check) => `<li>${escapeHtml(check)}</li>`).join("")}</ul>
      </article>`;
    })
    .join("\n");

  const packageCards = packageRows
    .map((row) => `<article class="pkg-check">
        <h3>${escapeHtml(row.name)}@${escapeHtml(row.version)}</h3>
        <p>Publish dry-run: ${escapeHtml(row.entryCount)} entries, ${escapeHtml(row.fileCount)} files, integrity ${row.hasIntegrity ? "yes" : "no"}, shasum ${row.hasShasum ? "yes" : "no"}.</p>
        <p>Required files missing: ${escapeHtml(row.missingFileCount)}</p>
      </article>`)
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>React publish review packet</title>
  <style>
    :root {
      color-scheme: light dark;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: Canvas;
      color: CanvasText;
    }

    body {
      margin: 0;
      padding: 32px;
    }

    main {
      max-width: 1440px;
      margin-inline: auto;
    }

    h1,
    h2,
    h3 {
      margin-block: 0 12px;
    }

    p {
      margin-block: 0 12px;
      max-width: 80ch;
    }

    code {
      font: 0.85em ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }

    .summary,
    .clearance,
    .pkg-grid,
    .nav-grid,
    .shot-grid {
      display: grid;
      gap: 16px;
      margin-block: 24px 40px;
    }

    .summary {
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }

    .metric,
    .clearance,
    .pkg-check,
    .nav-check,
    .shot {
      border: 1px solid color-mix(in srgb, CanvasText 16%, transparent);
      border-radius: 8px;
      padding: 16px;
      background: color-mix(in srgb, Canvas 94%, CanvasText 6%);
    }

    .metric strong {
      display: block;
      font-size: 1.5rem;
      line-height: 1.2;
    }

    .pending {
      color: #a15c00;
    }

    .shot-grid {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      align-items: start;
    }

    .nav-grid {
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    }

    .pkg-grid {
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    }

    .shot img {
      display: block;
      width: 100%;
      height: auto;
      border: 1px solid color-mix(in srgb, CanvasText 12%, transparent);
      background: white;
    }

    .shot p:last-child,
    .nav-check ul {
      margin-block-end: 0;
    }

    @media (max-width: 720px) {
      body {
        padding: 18px;
      }
    }
  </style>
</head>
<body>
  <main>
    <h1>React publish review packet</h1>
    <p>Generated: ${escapeHtml(report.generatedAt)}</p>
    <p>Status: <strong>${escapeHtml(report.status)}</strong></p>
    <p>This packet does not clear approvals and does not publish packages. It consolidates automated evidence for human review before <code>@digitaltableteur/react</code> publication.</p>

    <section class="summary" aria-label="Automated evidence summary">
      <div class="metric"><strong>${escapeHtml(report.evidence.i18n?.summary?.passed ?? 0)}/${escapeHtml(report.evidence.i18n?.summary?.total ?? 0)}</strong>i18n/navigation checks passed</div>
      <div class="metric"><strong>${escapeHtml(report.evidence.i18n?.screenshotCount ?? 0)}</strong>screenshots captured</div>
      <div class="metric"><strong>${escapeHtml(report.evidence.publicApi?.runtimeExportCount ?? 0)}</strong>runtime exports frozen</div>
      <div class="metric"><strong>${escapeHtml(report.evidence.publicSurface?.alphaExports?.length ?? 0)}</strong>alpha exports in public surface</div>
      <div class="metric"><strong>${escapeHtml(report.evidence.packagePublishDryRun?.packageNames?.length ?? 0)}</strong>package publish dry-runs verified</div>
      <div class="metric"><strong>${escapeHtml(report.evidence.trustedPublisher?.publisher ?? "missing")}</strong>Trusted Publisher transport</div>
      <div class="metric"><strong>${escapeHtml(report.evidence.trustedPublisher?.repositoryReadyPathCount ?? 0)}/${escapeHtml(report.evidence.trustedPublisher?.repositoryPathCount ?? 0)}</strong>publish paths commit-ready</div>
      <div class="metric"><strong>${escapeHtml(report.evidence.npmConsumerInstall?.reactExports ?? 0)}</strong>exports consumed from packed tarballs</div>
      <div class="metric"><strong>${escapeHtml(report.evidence.registryTokenInstall?.tokenCount ?? 0)}</strong>published-registry tokens consumed</div>
      <div class="metric"><strong>${escapeHtml(report.evidence.reactRegistryInstall?.status ?? "missing")}</strong>React registry smoke state</div>
      <div class="metric"><strong>${escapeHtml(report.evidence.sitePackageDogfood?.summary?.passed ?? 0)}/${escapeHtml(report.evidence.sitePackageDogfood?.summary?.total ?? 0)}</strong>package dogfood browser checks passed</div>
    </section>

    <section class="clearance" aria-label="Human clearance checklist">
      <h2>Human Clearance Checklist</h2>
      <p>Approval handoff: <code>${escapeHtml(CLEARANCE_HANDOFF_PATH)}</code>.</p>
      <p>${checkbox(clearance.tasks["1.5"].approvedDone)} 1.5 i18n multi-locale/browser review approved (${escapeHtml(formatTask(clearance.tasks["1.5"].task))}).</p>
      <p>${checkbox(clearance.tasks["1.6"].approvedDone)} 1.6 navigation behavior review approved (${escapeHtml(formatTask(clearance.tasks["1.6"].task))}).</p>
      <p>${checkbox(clearance.tasks["5.1"].reactPublishApproved)} 5.1 explicit <code>@digitaltableteur/react</code> publish clearance recorded (${escapeHtml(formatTask(clearance.tasks["5.1"].task))}).</p>
      <p class="pending">${escapeHtml(clearance.pending.join(" | ") || "No pending clearance recorded.")}</p>
    </section>

    <section aria-label="Package publish readiness">
      <h2>Package Publish Readiness</h2>
      <p>Command shape: <code>${escapeHtml(report.evidence.packagePublishDryRun?.commandShape ?? "missing")}</code></p>
      <p>Trusted Publisher: ${escapeHtml(report.evidence.trustedPublisher?.githubOwner ?? "missing")}/${escapeHtml(report.evidence.trustedPublisher?.githubRepository ?? "missing")} via <code>${escapeHtml(report.evidence.trustedPublisher?.workflowFilename ?? "missing")}</code>. Handoff: <code>${escapeHtml(report.evidence.trustedPublisher?.handoffPath ?? "missing")}</code>. Commit-ready paths: ${escapeHtml(report.evidence.trustedPublisher?.repositoryReadyPathCount ?? 0)}/${escapeHtml(report.evidence.trustedPublisher?.repositoryPathCount ?? 0)}.</p>
      <p>Registry status: ${escapeHtml(registryStatusSummary)}.</p>
      <p>Local tarball consumer: ${escapeHtml(report.evidence.npmConsumerInstall?.packageCount ?? 0)} packages installed, strict TypeScript ${escapeHtml(report.evidence.npmConsumerInstall?.typecheck ?? "missing")}.</p>
      <p>Published-token registry consumer: ${escapeHtml(registryAccessSummary)} from ${escapeHtml(report.evidence.registryTokenInstall?.registry ?? "missing")}.</p>
      <p>React registry consumer: ${escapeHtml(report.evidence.reactRegistryInstall?.status ?? "missing")} for expected state ${escapeHtml(report.evidence.reactRegistryInstall?.expectedReactState ?? "missing")}; React package ${escapeHtml(report.evidence.reactRegistryInstall?.reactPackage?.actualState ?? "missing")}@${escapeHtml(report.evidence.reactRegistryInstall?.reactPackage?.registryVersion ?? report.evidence.reactRegistryInstall?.reactPackage?.expectedVersion ?? "unknown")}.</p>
      <p>Package-consumed app dogfood: ${escapeHtml(report.evidence.sitePackageDogfood?.summary?.passed ?? 0)}/${escapeHtml(report.evidence.sitePackageDogfood?.summary?.total ?? 0)} browser checks passed against ${escapeHtml(report.evidence.sitePackageDogfood?.baseUrl ?? "missing")}.</p>
      <div class="pkg-grid">${packageCards}</div>
    </section>

    <section aria-label="Navigation checks">
      <h2>Navigation Checks</h2>
      <div class="nav-grid">${navigationCards}</div>
    </section>

    <section aria-label="Screenshot contact sheet">
      <h2>Screenshot Contact Sheet</h2>
      <div class="shot-grid">${screenshotCards}</div>
    </section>
  </main>
</body>
</html>
`;
}

function buildMarkdown(report) {
  const clearance = report.clearance;
  const registryAccessSummary =
    report.evidence.registryTokenInstall?.packageAccess
      ?.map((row) => `${row.name}@${row.registryVersion} (${row.accessStatus}/${row.orgAccess})`)
      .join(", ") ?? "unknown";
  const registryStatusSummary =
    report.evidence.packageRegistryStatus?.packages
      ?.map((row) => {
        const version = row.registryVersion ?? row.expectedVersion ?? "unknown";
        const access = row.accessStatus && row.orgAccess ? ` ${row.accessStatus}/${row.orgAccess}` : "";
        return `${row.name}@${version} ${row.actualState}${access}`;
      })
      .join(", ") ?? "unknown";

  return `# React publish review packet

Generated: ${report.generatedAt}
Status: ${report.status}

This packet does not clear approvals and does not publish packages. It only consolidates the current automated evidence for human review before \`@digitaltableteur/react\` publication.

## Automated Evidence

- i18n/navigation: ${report.evidence.i18n?.summary?.passed ?? 0}/${report.evidence.i18n?.summary?.total ?? 0} passed, ${report.evidence.i18n?.summary?.failed ?? 0} failed, languages ${report.evidence.i18n?.languages?.join(", ") ?? "unknown"}, viewports ${report.evidence.i18n?.viewports?.join(", ") ?? "unknown"}.
- Screenshots: ${report.evidence.i18n?.screenshotCount ?? 0} files under \`${report.evidence.i18n?.screenshotDir ?? "missing"}\`.
- Review markdown: \`${report.evidence.i18n?.reviewMarkdown ?? "missing"}\`.
- Review contact sheet: \`${relativePath(OUT_HTML)}\`.
- Public API: ${report.evidence.publicApi?.runtimeExportCount ?? 0} runtime exports for \`${report.evidence.publicApi?.packageName ?? "unknown"}\`; package exports ${report.evidence.publicApi?.packageExports?.map((entry) => `\`${entry}\``).join(", ") ?? "unknown"}.
- Public surface: ${report.evidence.publicSurface?.summary?.total ?? 0} contract exports, alpha ceiling ${report.evidence.publicSurface?.alphaCeiling ?? "unknown"}, alpha exports ${report.evidence.publicSurface?.alphaExports?.length ?? "unknown"}.
- Release metadata: ${report.evidence.releaseMetadata?.packageNames?.join(", ") ?? "unknown"}; errors ${report.evidence.releaseMetadata?.errorCount ?? "unknown"}.
- Tarball contents: ${report.evidence.packageTarballs?.packageNames?.join(", ") ?? "unknown"}; errors ${report.evidence.packageTarballs?.errorCount ?? "unknown"}.
- Publish dry-run: \`${report.evidence.packagePublishDryRun?.commandShape ?? "missing"}\`; packages ${report.evidence.packagePublishDryRun?.packageNames?.join(", ") ?? "unknown"}; errors ${report.evidence.packagePublishDryRun?.errorCount ?? "unknown"}.
- Trusted Publisher: ${report.evidence.trustedPublisher?.publisher ?? "unknown"} for ${report.evidence.trustedPublisher?.githubOwner ?? "unknown"}/${report.evidence.trustedPublisher?.githubRepository ?? "unknown"} via \`${report.evidence.trustedPublisher?.workflowFilename ?? "unknown"}\`; handoff \`${report.evidence.trustedPublisher?.handoffPath ?? "missing"}\`; commit-ready paths ${report.evidence.trustedPublisher?.repositoryReadyPathCount ?? 0}/${report.evidence.trustedPublisher?.repositoryPathCount ?? 0}; allowed actions ${(report.evidence.trustedPublisher?.allowedActions ?? []).join(", ") || "unknown"}.
- Package registry status: ${registryStatusSummary}; expected React state ${report.evidence.packageRegistryStatus?.expectedReactState ?? "unknown"}; errors ${report.evidence.packageRegistryStatus?.errorCount ?? "unknown"}.
- Local tarball consumer install: ${report.evidence.npmConsumerInstall?.packageNames?.join(", ") ?? "unknown"}; ${report.evidence.npmConsumerInstall?.reactExports ?? "unknown"} React exports consumed; strict TypeScript ${report.evidence.npmConsumerInstall?.typecheck ?? "unknown"}; errors ${report.evidence.npmConsumerInstall?.errorCount ?? "unknown"}.
- Published-token registry install: ${registryAccessSummary} from ${report.evidence.registryTokenInstall?.registry ?? "unknown"}; token count ${report.evidence.registryTokenInstall?.tokenCount ?? "unknown"}; errors ${report.evidence.registryTokenInstall?.errorCount ?? "unknown"}.
- React registry install smoke: status ${report.evidence.reactRegistryInstall?.status ?? "unknown"}; expected React state ${report.evidence.reactRegistryInstall?.expectedReactState ?? "unknown"}; package state ${report.evidence.reactRegistryInstall?.reactPackage?.actualState ?? "unknown"}@${report.evidence.reactRegistryInstall?.reactPackage?.registryVersion ?? report.evidence.reactRegistryInstall?.reactPackage?.expectedVersion ?? "unknown"}; React exports ${report.evidence.reactRegistryInstall?.reactExports ?? "not-run"}; strict TypeScript ${report.evidence.reactRegistryInstall?.typecheck ?? "not-run"}; errors ${report.evidence.reactRegistryInstall?.errorCount ?? "unknown"}.
- Package dogfood browser smoke: ${report.evidence.sitePackageDogfood?.summary?.passed ?? 0}/${report.evidence.sitePackageDogfood?.summary?.total ?? 0} passed against ${report.evidence.sitePackageDogfood?.baseUrl ?? "unknown"}; categories ${report.evidence.sitePackageDogfood?.summary?.categories?.join(", ") ?? "unknown"}.

## Human Clearance Checklist

Approval handoff: \`${CLEARANCE_HANDOFF_PATH}\`.

- ${checkbox(clearance.tasks["1.5"].approvedDone)} 1.5 i18n multi-locale/browser review approved (${formatTask(clearance.tasks["1.5"].task)}).
- ${checkbox(clearance.tasks["1.6"].approvedDone)} 1.6 navigation behavior review approved (${formatTask(clearance.tasks["1.6"].task)}).
- ${checkbox(clearance.tasks["5.1"].reactPublishApproved)} 5.1 explicit \`@digitaltableteur/react\` publish clearance recorded (${formatTask(clearance.tasks["5.1"].task)}).

## Pending Clearance

${clearance.pending.length ? clearance.pending.map((item) => `- ${item}`).join("\n") : "- None recorded; check:react-publish-ready can run the strict automated gates."}

## Re-run Commands

\`\`\`bash
npm run check:react-publish-preflight
npm run check:react-publish-review
npm run check:react-publish-ready
\`\`\`

## Guard Errors

${report.errors.length ? report.errors.map((item) => `- ${item}`).join("\n") : "- None."}
`;
}

const errors = [];
const state = readJson(STATE_PATH, "roadmap state", errors);
const i18nReport = readJson(I18N_REPORT_PATH, "i18n/navigation review report", errors);
const apiReport = readJson(API_REPORT_PATH, "React public API report", errors);
const surfaceReport = readJson(SURFACE_REPORT_PATH, "React public surface report", errors);
const releaseReport = readJson(RELEASE_REPORT_PATH, "package release metadata report", errors);
const tarballReport = readJson(TARBALL_REPORT_PATH, "package tarball contents report", errors);
const publishDryRunReport = readJson(
  PUBLISH_DRY_RUN_REPORT_PATH,
  "package publish dry-run report",
  errors,
);
const trustedPublisherReport = readJson(
  TRUSTED_PUBLISHER_REPORT_PATH,
  "Trusted Publisher report",
  errors,
);
const npmConsumerInstallReport = readJson(
  NPM_CONSUMER_INSTALL_REPORT_PATH,
  "npm consumer install report",
  errors,
);
const registryTokenInstallReport = readJson(
  REGISTRY_TOKEN_INSTALL_REPORT_PATH,
  "registry token install report",
  errors,
);
const reactRegistryInstallReport = readJson(
  REACT_REGISTRY_INSTALL_REPORT_PATH,
  "react registry install report",
  errors,
);
const packageRegistryStatusReport = readJson(
  PACKAGE_REGISTRY_STATUS_REPORT_PATH,
  "package registry status report",
  errors,
);
const sitePackageDogfoodReport = readJson(
  SITE_PACKAGE_DOGFOOD_REPORT_PATH,
  "site package dogfood report",
  errors,
);

const tasks = state?.tasks ?? {};
const pendingClearance = pendingClearanceErrors(state);
const publishTask = tasks["5.1"];
const publishNote = publishTask?.approval?.note ?? "";
const reactPublishApproved =
  Boolean(publishTask?.approval?.clearedBy && publishTask?.approval?.on) &&
  /@digitaltableteur\/react/.test(publishNote) &&
  !/react remains unpublished|token-package registry smoke/i.test(publishNote);
const evidence = {
  i18n: validateI18nReport(i18nReport, errors),
  publicApi: validateApiReport(apiReport, errors),
  publicSurface: validateSurfaceReport(surfaceReport, errors),
  releaseMetadata: validateReleaseReport(releaseReport, errors),
  packageTarballs: validateTarballReport(tarballReport, errors),
  packagePublishDryRun: validatePublishDryRunReport(publishDryRunReport, errors),
  trustedPublisher: validateTrustedPublisherReport(trustedPublisherReport, errors),
  npmConsumerInstall: validateNpmConsumerInstallReport(npmConsumerInstallReport, errors),
  registryTokenInstall: validateRegistryTokenInstallReport(registryTokenInstallReport, errors),
  reactRegistryInstall: validateReactRegistryInstallReport(
    reactRegistryInstallReport,
    errors,
  ),
  packageRegistryStatus: validatePackageRegistryStatusReport(packageRegistryStatusReport, errors),
  sitePackageDogfood: validateSitePackageDogfoodReport(sitePackageDogfoodReport, errors),
};

const report = {
  generatedAt: new Date().toISOString(),
  status: errors.length
    ? "failed"
    : pendingClearance.length
      ? "evidence-ready-clearance-pending"
      : "publish-clearance-recorded",
  note: "This packet does not clear approvals.",
  evidence,
  clearance: {
    pending: pendingClearance,
    tasks: {
      "1.5": {
        approvedDone: isApprovedDone(tasks["1.5"]),
        task: tasks["1.5"] ?? null,
      },
      "1.6": {
        approvedDone: isApprovedDone(tasks["1.6"]),
        task: tasks["1.6"] ?? null,
      },
      "5.1": {
        reactPublishApproved,
        task: tasks["5.1"] ?? null,
      },
    },
  },
  inputs: {
    state: relativePath(STATE_PATH),
    i18nReport: relativePath(I18N_REPORT_PATH),
    i18nReview: relativePath(I18N_REVIEW_PATH),
    publicApi: relativePath(API_REPORT_PATH),
    publicSurface: relativePath(SURFACE_REPORT_PATH),
    releaseMetadata: relativePath(RELEASE_REPORT_PATH),
    packageTarballs: relativePath(TARBALL_REPORT_PATH),
    packagePublishDryRun: relativePath(PUBLISH_DRY_RUN_REPORT_PATH),
    trustedPublisher: relativePath(TRUSTED_PUBLISHER_REPORT_PATH),
    npmConsumerInstall: relativePath(NPM_CONSUMER_INSTALL_REPORT_PATH),
    registryTokenInstall: relativePath(REGISTRY_TOKEN_INSTALL_REPORT_PATH),
    reactRegistryInstall: relativePath(REACT_REGISTRY_INSTALL_REPORT_PATH),
    packageRegistryStatus: relativePath(PACKAGE_REGISTRY_STATUS_REPORT_PATH),
    sitePackageDogfood: relativePath(SITE_PACKAGE_DOGFOOD_REPORT_PATH),
  },
  outputs: {
    json: relativePath(OUT_JSON),
    markdown: relativePath(OUT_MD),
    html: relativePath(OUT_HTML),
  },
  errors,
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(OUT_MD, buildMarkdown(report));
writeFileSync(OUT_HTML, buildHtml(report, i18nReport));

if (errors.length) {
  console.error("React publish review packet guard failed:");
  for (const error of errors) console.error(`  - ${error}`);
  console.error(`Packet: ${relativePath(OUT_MD)}`);
  process.exit(1);
}

console.log(`✓ React publish review evidence verified (${report.status})`);
if (pendingClearance.length) {
  console.log("  Human clearance remains pending:");
  for (const item of pendingClearance) console.log(`  - ${item}`);
}
console.log(`  Packet: ${relativePath(OUT_MD)}`);
console.log(`  Contact sheet: ${relativePath(OUT_HTML)}`);
