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
  | "ERR_DATA_UNAVAILABLE";

export type CliOptions = {
  cwd?: string;
  dataDirectory?: string;
  limit?: number;
  section?: "all" | "usage" | "props" | "examples" | "theming";
  story?: string;
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
