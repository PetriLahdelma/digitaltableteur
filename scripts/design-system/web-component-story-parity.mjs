export function evaluateStoryParity({
  reactStories,
  nativeStories,
  equivalents = [],
  exclusions = [],
}) {
  const react = new Set(reactStories);
  const native = new Set(nativeStories);
  const covered = new Set(reactStories.filter((story) => native.has(story)));
  const errors = [];

  const reactDecisions = new Set();
  for (const decision of equivalents) {
    if (!react.has(decision.react)) {
      errors.push(
        `stale equivalent for missing React story "${decision.react}"`,
      );
    }
    if (!native.has(decision.native)) {
      errors.push(
        `equivalent "${decision.react}" points to missing native story "${decision.native}"`,
      );
    }
    if (reactDecisions.has(decision.react)) {
      errors.push(
        `duplicate parity decision for React story "${decision.react}"`,
      );
    }
    reactDecisions.add(decision.react);
    if (react.has(decision.react) && native.has(decision.native)) {
      covered.add(decision.react);
    }
  }

  for (const decision of exclusions) {
    if (!react.has(decision.react)) {
      errors.push(
        `stale exclusion for missing React story "${decision.react}"`,
      );
    }
    if (!decision.reason || decision.reason.trim().length < 16) {
      errors.push(
        `exclusion for "${decision.react}" needs a concrete reason (16+ characters)`,
      );
    }
    if (reactDecisions.has(decision.react)) {
      errors.push(
        `duplicate parity decision for React story "${decision.react}"`,
      );
    }
    reactDecisions.add(decision.react);
    if (react.has(decision.react)) covered.add(decision.react);
  }

  const missing = reactStories.filter((story) => !covered.has(story));
  const parity =
    reactStories.length === 0 ? 1 : covered.size / reactStories.length;

  return { errors, missing, parity };
}
