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
  // CI runs ~250 story files per pass in long-lived Jest workers whose heap
  // only grows; on the farm container they reached V8's ~2 GB ceiling
  // (Mark-Compact thrash, then a crashed pass) and, together with the
  // Storybook dev server, tripped the container's OOM killer (exit 137).
  // Recycle a worker once it holds more than 1 GB between test files.
  workerIdleMemoryLimit: "1GB",
  /** Add your own overrides below, and make sure
   *  to merge testRunnerConfig properties with your own
   * @see https://jestjs.io/docs/configuration
   */
};
