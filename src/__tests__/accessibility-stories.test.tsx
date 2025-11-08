/// <reference types="vite/client" />
import React from "react";
import { describe, it, expect, beforeAll, vi } from "vitest";
import { render } from "@testing-library/react";
import axe from "axe-core";
import { composeStories, setProjectAnnotations } from "@storybook/react";
import type { ComponentType } from "react";

import * as previewAnnotations from "../../.storybook/preview";

// Apply global Storybook decorators (ThemeProvider, I18n, etc.)
setProjectAnnotations(previewAnnotations);

type CSFModule = {
  default: unknown;
  [key: string]: unknown;
};

const storyModules = import.meta.glob(
  ["../components/**/*.stories.@(ts|tsx)", "../stories/**/*.stories.@(ts|tsx)"],
  { eager: true },
) as Record<string, CSFModule>;

const axeOptions = {
  rules: {
    "color-contrast": { enabled: false }, // mocked fonts/icons can produce noise; verified manually in Storybook UI
  },
};

async function runAxe(container: HTMLElement) {
  await new Promise((resolve) => setTimeout(resolve, 0));
  const results = await axe.run(container, axeOptions);
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
    const composedStories = composeStories(moduleExports as any) as Record<
      string,
      ComponentType
    >;

    for (const [storyName, Story] of Object.entries(composedStories)) {
      const storyParameters = (Story as any).parameters ?? {};
      if (storyParameters?.a11y?.disable) {
        continue;
      }

      it(`${path} – ${storyName} has no detectable accessibility violations`, async () => {
        const StoryComponent = Story as ComponentType;
        const { container } = render(<StoryComponent />);
        await new Promise((resolve) => setTimeout(resolve, 0));
        await runAxe(container);
      });
    }
  }
});
