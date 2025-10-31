import React from "react";
import { describe, it, expect, beforeAll, vi } from "vitest";
import { render } from "@testing-library/react";
import axe from "axe-core";
import { composeStories, setProjectAnnotations } from "@storybook/react";

import * as previewAnnotations from "../../.storybook/preview";

// Apply global Storybook decorators (ThemeProvider, I18n, etc.)
setProjectAnnotations(previewAnnotations);

const storyModules = import.meta.glob(
  ["../components/**/*.stories.@(ts|tsx)", "../stories/**/*.stories.@(ts|tsx)"],
  { eager: true },
) as Record<string, Record<string, unknown>>;

async function runAxe(container: HTMLElement) {
  const results = await axe.run(container);
  const formattedViolations = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    nodes: violation.nodes.map((node) => ({
      target: node.target,
      failureSummary: node.failureSummary,
    })),
  }));
  expect(formattedViolations).toEqual([]);
}

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn();
});

describe("Storybook accessibility", () => {
  for (const [path, moduleExports] of Object.entries(storyModules)) {
    const composedStories = composeStories(moduleExports as any);

    for (const [storyName, Story] of Object.entries(composedStories)) {
      const storyParameters = (Story as any).parameters ?? {};
      if (storyParameters?.a11y?.disable) {
        continue;
      }

      it(`${path} – ${storyName} has no detectable accessibility violations`, async () => {
        const { container } = render(<Story />);
        await new Promise((resolve) => setTimeout(resolve, 0));
        await runAxe(container);
      });
    }
  }
});
