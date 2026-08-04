export type DtCliResponse<TType extends string, TData> = {
  type: TType;
  data: TData;
};

export type DtCliErrorCode =
  | "ERR_UNKNOWN"
  | "ERR_UNKNOWN_COMMAND"
  | "ERR_INVALID_ARGUMENT"
  | "ERR_MISSING_ARGUMENT"
  | "ERR_UNKNOWN_COMPONENT"
  | "ERR_UNKNOWN_SECTION"
  | "ERR_UNKNOWN_STORY"
  | "ERR_DATA_UNAVAILABLE"
  | "ERR_GIT_CONTEXT_UNAVAILABLE";

export type CliOptions = {
  cwd?: string;
  dataDirectory?: string;
  limit?: number;
  section?: "all" | "usage" | "props" | "examples" | "theming";
  story?: string;
  from?: string;
  to?: string;
  path?: string;
};

export type ContractChange = {
  severity: "major" | "minor" | "patch";
  kind: string;
  detail: string;
  prop?: string;
  values?: string[];
};

export type ContractDiffReport = {
  name: string;
  changes: ContractChange[];
  semver: "none" | "patch" | "minor" | "major";
};

export class DtCliError extends Error {
  code: DtCliErrorCode;
  suggestions: Array<{ name: string; reason: string }>;
}

export function search(
  query: string,
  options?: CliOptions,
): Promise<DtCliResponse<"search", { query: string; results: unknown[] }>>;
export function component(
  name: string,
  options?: CliOptions,
): Promise<DtCliResponse<"component.detail", Record<string, unknown>>>;
export function example(
  name: string,
  options?: CliOptions,
): Promise<
  DtCliResponse<
    "component.examples",
    { name: string; examples: Array<Record<string, unknown>> }
  >
>;
export function compose(
  query: string,
  options?: CliOptions,
): Promise<
  DtCliResponse<
    "composition.suggestions",
    { query: string; seeds: unknown[]; related: unknown[] }
  >
>;
export function manifest(): Promise<
  DtCliResponse<"manifest", Record<string, unknown>>
>;
export function doctor(options?: CliOptions): Promise<
  DtCliResponse<
    "doctor",
    {
      healthy: boolean;
      directory: string;
      checks: Array<{ id: string; status: "pass" | "fail"; detail: string }>;
    }
  >
>;
export function classifyContractDiff(
  name: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): ContractDiffReport;
export function diff(
  componentName?: string,
  options?: CliOptions,
): Promise<
  DtCliResponse<
    "diff.report",
    {
      from: string;
      to: string;
      componentCount: number;
      semverRecommendation: "none" | "patch" | "minor" | "major";
      components: Array<ContractDiffReport & { path: string }>;
      affectedConsumerFiles: string[] | null;
    }
  >
>;
export function affected(
  names: string[],
  options?: CliOptions,
): Promise<
  DtCliResponse<
    "affected.report",
    {
      targets: Array<{
        name: string;
        status: string | null;
        exportedFromPackage: boolean | null;
        directImporters: string[];
        composedBy: string[];
        prodPages: string[];
      }>;
      files: string[] | null;
      prodPages: string[] | null;
    }
  >
>;
export type ValidationFinding = {
  severity: "error" | "warn";
  kind:
    | "unknown-component"
    | "unknown-prop"
    | "invalid-enum-value"
    | "missing-required-prop"
    | "deprecated-component";
  file: string;
  line?: number;
  component: string;
  prop?: string;
  value?: string;
  occurrences?: number;
  message: string;
};
export function validate(
  names?: string[],
  options?: CliOptions,
): Promise<
  DtCliResponse<
    "validate.report",
    {
      path: string;
      filter: string[];
      filesScanned: number;
      usages: number;
      components: string[];
      findings: ValidationFinding[];
      summary: {
        errors: number;
        warnings: number;
        byKind: Record<string, number>;
      };
      clean: boolean;
      note?: string;
    }
  >
>;
export type UpgradeEdit = {
  kind: "prop-renamed" | "prop-removed" | "default-pinned";
  file: string;
  line: number;
  component: string;
  prop: string;
  detail: string;
  applied: boolean;
};
export type UpgradeManualItem = {
  kind: string;
  file?: string;
  line?: number;
  component: string;
  prop?: string;
  message: string;
};
export function upgrade(
  names?: string[],
  options?: CliOptions & { write?: boolean },
): Promise<
  DtCliResponse<
    "upgrade.report",
    {
      from: string;
      to: string;
      path: string;
      dryRun: boolean;
      componentsWithChanges: string[];
      componentsPlanned: string[];
      filesScanned: number;
      changedFiles: number;
      edits: UpgradeEdit[];
      manual: UpgradeManualItem[];
      summary: { edits: number; manual: number; applied: number };
    }
  >
>;
export type VerifyCheck = {
  id: "contract" | "usage" | "tests" | "types";
  component?: string;
  status: "pass" | "fail";
  detail: string;
  durationMs: number;
};
export function verify(
  names: string[],
  options?: CliOptions & { skip?: string },
): Promise<
  DtCliResponse<
    "verify.report",
    {
      components: string[];
      skipped: string[];
      checks: VerifyCheck[];
      verified: boolean;
      summary: { pass: number; fail: number; durationMs: number };
    }
  >
>;
