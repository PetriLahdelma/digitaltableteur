const LIFECYCLE_RANK = { alpha: 0, beta: 1, stable: 2 };

export function validateImplementationLifecycle(element, contract) {
  const status = element.implementationStatus;
  if (!(status in LIFECYCLE_RANK)) {
    throw new Error(
      `${element.tagName} has invalid implementationStatus ${status}`,
    );
  }
  if (
    contract.status in LIFECYCLE_RANK &&
    LIFECYCLE_RANK[status] > LIFECYCLE_RANK[contract.status]
  ) {
    throw new Error(
      `${element.tagName} implementationStatus ${status} cannot exceed canonical ${element.contract} status ${contract.status}`,
    );
  }

  const consumers = element.implementationConsumers ?? [];
  if (status === "stable") {
    if (consumers.length === 0) {
      throw new Error(
        `${element.tagName} stable implementation requires at least one production implementationConsumer`,
      );
    }
    if (
      element.implementationA11y?.accessibilityTreeVerified !== true ||
      element.implementationA11y?.realBrowserForcedColorsVerified !== true
    ) {
      throw new Error(
        `${element.tagName} stable implementation requires native accessibility-tree and real-browser forced-colors evidence`,
      );
    }
  } else if (consumers.length > 0) {
    throw new Error(
      `${element.tagName} implementationConsumers are stable-only evidence; complete the remaining promotion gates or leave the field empty`,
    );
  }

  for (const consumer of consumers) {
    if (
      !consumer.repo?.trim() ||
      !consumer.path?.trim() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(consumer.since ?? "")
    ) {
      throw new Error(
        `${element.tagName} implementationConsumers require repo, path, and ISO since`,
      );
    }
  }
}
