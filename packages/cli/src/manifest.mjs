import { ERROR_CODES } from "./errors.mjs";

export const CLI_VERSION = "0.5.0";
export const API_VERSION = 1;

export const CAPABILITY_MANIFEST = Object.freeze({
  apiVersion: API_VERSION,
  name: "dt",
  version: CLI_VERSION,
  description:
    "Digitaltableteur design-system CLI — registry search, component docs, examples, composition, diagnostics, contract diffing, impact analysis, consumer usage validation, diff-coupled upgrade codemods, and scoped verification.",
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
    {
      name: "validate",
      arguments: [{ name: "components", required: false, variadic: true }],
      options: [
        {
          flag: "--path <directory>",
          type: "string",
          default: ".",
          description:
            "Consumer source root to scan for .tsx/.jsx design-system usage.",
        },
      ],
      responseTypes: ["validate.report"],
    },
    {
      name: "upgrade",
      arguments: [{ name: "components", required: false, variadic: true }],
      options: [
        {
          flag: "--from <git-ref>",
          type: "string",
          default: "HEAD",
          description: "Baseline ref for the contract diff driving codemods.",
        },
        {
          flag: "--to <git-ref|worktree>",
          type: "string",
          default: "worktree",
          description: "Target ref, or the working tree.",
        },
        {
          flag: "--path <directory>",
          type: "string",
          default: ".",
          description: "Consumer source root to rewrite.",
        },
        {
          flag: "--write",
          type: "boolean",
          default: false,
          description:
            "Apply the codemods. Without it the report is a dry run.",
        },
      ],
      responseTypes: ["upgrade.report"],
    },
    {
      name: "verify",
      arguments: [{ name: "components", required: true, variadic: true }],
      options: [
        {
          flag: "--path <directory>",
          type: "string",
          default: ".",
          description: "Consumer source root for the usage check.",
        },
        {
          flag: "--skip <checks>",
          type: "string",
          description:
            "Comma-separated checks to skip: contract, usage, tests, types.",
        },
      ],
      responseTypes: ["verify.report"],
    },
  ],
  errorCodes: Object.values(ERROR_CODES),
});
