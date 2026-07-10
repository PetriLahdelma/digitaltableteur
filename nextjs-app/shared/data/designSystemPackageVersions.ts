import reactPackage from "../../../node_modules/@digitaltableteur/react/package.json";
import tokensPackage from "../../../node_modules/@digitaltableteur/tokens/package.json";
import tokensCssPackage from "../../../node_modules/@digitaltableteur/tokens-css/package.json";

export const DESIGN_SYSTEM_PACKAGE_VERSIONS = {
  react: reactPackage.version,
  tokens: tokensPackage.version,
  "tokens-css": tokensCssPackage.version,
} as const;
