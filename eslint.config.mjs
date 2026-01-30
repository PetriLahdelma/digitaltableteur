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
      ".sanity/",
      ".history/",
      "__visual__/",
      "debug-env.js",
      "digitaltableteur-blog/",
      "node_modules/",
      "private/",
      "sanity-output/",
      "scripts/",
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
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  }),
];
