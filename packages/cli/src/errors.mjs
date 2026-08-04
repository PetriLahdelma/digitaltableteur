export const ERROR_CODES = Object.freeze({
  UNKNOWN: "ERR_UNKNOWN",
  UNKNOWN_COMMAND: "ERR_UNKNOWN_COMMAND",
  INVALID_ARGUMENT: "ERR_INVALID_ARGUMENT",
  MISSING_ARGUMENT: "ERR_MISSING_ARGUMENT",
  UNKNOWN_COMPONENT: "ERR_UNKNOWN_COMPONENT",
  UNKNOWN_SECTION: "ERR_UNKNOWN_SECTION",
  UNKNOWN_STORY: "ERR_UNKNOWN_STORY",
  DATA_UNAVAILABLE: "ERR_DATA_UNAVAILABLE",
  GIT_CONTEXT_UNAVAILABLE: "ERR_GIT_CONTEXT_UNAVAILABLE",
});

export class DtCliError extends Error {
  constructor(message, code = ERROR_CODES.UNKNOWN, suggestions = []) {
    super(message);
    this.name = "DtCliError";
    this.code = code;
    this.suggestions = suggestions;
  }
}

export function errorEnvelope(error) {
  const normalized =
    error instanceof DtCliError
      ? error
      : new DtCliError(error instanceof Error ? error.message : String(error));
  return {
    error: normalized.message,
    code: normalized.code,
    ...(normalized.suggestions.length > 0
      ? { suggestions: normalized.suggestions }
      : {}),
  };
}
