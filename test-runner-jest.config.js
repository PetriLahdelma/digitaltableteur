import { getJestConfig } from "@storybook/test-runner";

// The default Jest configuration comes from @storybook/test-runner
const testRunnerConfig = getJestConfig();

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
export default {
  ...testRunnerConfig,
  // This repo is a hybrid monorepo with multiple nested package.json files.
  // Jest's haste map considers package.json `name` collisions fatal by default.
  // The test runner does not rely on haste module resolution, so disable the
  // collision hard-error to keep Storybook interaction tests usable.
  haste: {
    ...(testRunnerConfig.haste ?? {}),
    throwOnModuleCollision: false,
  },
  // Avoid scanning the largest non-story code trees and agent worktrees.
  modulePathIgnorePatterns: [
    ...(testRunnerConfig.modulePathIgnorePatterns ?? []),
    "<rootDir>/.claude/worktrees/",
    "<rootDir>/digitaltableteur-blog/",
    "<rootDir>/vite-app/",
    "<rootDir>/akaunting/",
    "<rootDir>/dist/",
    "<rootDir>/.next/",
  ],
  /** Add your own overrides below, and make sure
   *  to merge testRunnerConfig properties with your own
   * @see https://jestjs.io/docs/configuration
   */
};
