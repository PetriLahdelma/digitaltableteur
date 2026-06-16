import { getJestConfig } from "@storybook/test-runner";

// The default Jest configuration comes from @storybook/test-runner
const testRunnerConfig = getJestConfig();

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
export default {
  ...testRunnerConfig,
  // Avoid scanning large non-story code trees and agent worktrees.
  modulePathIgnorePatterns: [
    ...(testRunnerConfig.modulePathIgnorePatterns ?? []),
    "<rootDir>/.claude/worktrees/",
    "<rootDir>/digitaltableteur-blog/",
    "<rootDir>/akaunting/",
    "<rootDir>/dist/",
    "<rootDir>/.next/",
  ],
  /** Add your own overrides below, and make sure
   *  to merge testRunnerConfig properties with your own
   * @see https://jestjs.io/docs/configuration
   */
};
