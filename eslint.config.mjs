// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import {
  DT_USAGE_ESLINT_FILE_GLOBS,
  DT_USAGE_ESLINT_IGNORES,
  DT_USAGE_ESLINT_IMPORT_PATTERNS,
} from "./scripts/design-system/dt-usage-rules.mjs";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      ".claude/",
      ".sanity/",
      ".history/",
      "__visual__/",
      "debug-env.js",
      "digitaltableteur-blog/",
      "node_modules/",
      "private/",
      "sanity-output/",
      "scripts/",
      // Generated Figma variable payloads (build:figma-variables) — not authored.
      "nextjs-app/shared/foundations/figma/phases/",
      "nextjs-app/digitaltableteur-blog/",
      "dist/",
      "storybook-static/",
      "coverage/",
      ".vercel/",
      "*.min.js",
      "*.bundle.js",
      "build/",
      ".next/",
      ".cache/",
    ],
  },
  ...compat.extends(
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
  ),
  ...compat.config({
    env: {
      browser: true,
      es2021: true,
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: ["react", "@typescript-eslint", "prettier", "react-hooks"],
    rules: {
      quotes: ["error", "double"],
      "jsx-quotes": ["error", "prefer-double"],
      "prettier/prettier": [
        "error",
        { singleQuote: false, jsxSingleQuote: false },
      ],
      "no-undef": "off",
      "no-unused-vars": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  }),
  {
    files: [
      "**/*.stories.ts",
      "**/*.stories.tsx",
      "**/*.stories.js",
      "**/*.stories.jsx",
      "**/*.stories.mjs",
    ],
    rules: {
      "storybook/no-renderer-packages": "off",
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off",
      "react/no-children-prop": "off",
      "prettier/prettier": "off",
    },
  },
  ...storybook.configs["flat/recommended"],
  {
    files: DT_USAGE_ESLINT_FILE_GLOBS,
    ignores: DT_USAGE_ESLINT_IGNORES,
    rules: {
      "prettier/prettier": "off",
      "no-restricted-imports": [
        "error",
        { patterns: DT_USAGE_ESLINT_IMPORT_PATTERNS },
      ],
    },
  },
];
