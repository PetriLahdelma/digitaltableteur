import { ERROR_CODES } from "./errors.mjs";

export const CLI_VERSION = "0.2.0";
export const API_VERSION = 1;

export const CAPABILITY_MANIFEST = Object.freeze({
  apiVersion: API_VERSION,
  name: "dt",
  version: CLI_VERSION,
  description:
    "Digitaltableteur design-system CLI — registry search, component docs, examples, composition, diagnostics, contract diffing, and impact analysis.",
  globalOptions: [
    {
      flag: "--json",
      type: "boolean",
      description: "Print a typed JSON response envelope.",
    },
    {
      flag: "--dense",
      type: "boolean",
      description: "Print a compact human-readable response.",
    },
  ],
  commands: [
    {
      name: "search",
      arguments: [{ name: "query", required: true, variadic: true }],
      options: [{ flag: "--limit <number>", type: "number", default: 8 }],
      responseTypes: ["search"],
    },
    {
      name: "component",
      arguments: [{ name: "name", required: true }],
      options: [
        {
          flag: "--section <section>",
          type: "enum",
          choices: ["all", "usage", "props", "examples", "theming"],
          default: "all",
        },
      ],
      responseTypes: ["component.detail"],
    },
    {
      name: "example",
      arguments: [{ name: "name", required: true }],
      options: [{ flag: "--story <name>", type: "string" }],
      responseTypes: ["component.examples"],
    },
    {
      name: "compose",
      arguments: [{ name: "query", required: true, variadic: true }],
      options: [{ flag: "--limit <number>", type: "number", default: 5 }],
      responseTypes: ["composition.suggestions"],
    },
    {
      name: "manifest",
      arguments: [],
      options: [],
      responseTypes: ["manifest"],
    },
    {
      name: "doctor",
      arguments: [],
      options: [],
      responseTypes: ["doctor"],
    },
    {
      name: "diff",
      arguments: [{ name: "component", required: false }],
      options: [
        {
          flag: "--from <git-ref>",
          type: "string",
          default: "HEAD",
          description: "Baseline ref for contract comparison.",
        },
        {
          flag: "--to <git-ref|worktree>",
          type: "string",
          default: "worktree",
          description: "Target ref, or the working tree.",
        },
      ],
      responseTypes: ["diff.report"],
    },
    {
      name: "affected",
      arguments: [{ name: "components", required: true, variadic: true }],
      options: [],
      responseTypes: ["affected.report"],
    },
  ],
  errorCodes: Object.values(ERROR_CODES),
});
