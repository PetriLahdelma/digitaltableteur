import reactPackage from "../../../packages/react/package.json";
import tokensPackage from "../../../packages/tokens/package.json";
import tokensCssPackage from "../../../packages/tokens-css/package.json";

export const DESIGN_SYSTEM_PACKAGE_VERSIONS = {
  react: reactPackage.version,
  tokens: tokensPackage.version,
  "tokens-css": tokensCssPackage.version,
} as const;
