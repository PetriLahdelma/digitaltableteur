import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useLayoutEffect, useRef, useState } from "react";
import { expect, userEvent } from "storybook/test";
import {
  Stage,
  nativeStoryParameters,
} from "../NativeStory";
import { DtExpandableSectionElement } from "../../../../../packages/web-components/src/native/expandable-section";

if (!customElements.get("dt-expandable-section")) {
  customElements.define(
    "dt-expandable-section",
    DtExpandableSectionElement,
  );
}

type Args = {
  collapsedLabel: string;
  expandedLabel?: string;
  defaultExpanded?: boolean;
  expanded?: boolean;
  children?: React.ReactNode;
};

function NativeExpandableSection({
  collapsedLabel,
  expandedLabel,
  defaultExpanded,
  expanded,
  children,
}: Args) {
  const ref = useRef<DtExpandableSectionElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.collapsedLabel = collapsedLabel;
    element.expandedLabel = expandedLabel ?? "";
    element.defaultExpanded = Boolean(defaultExpanded);
    element.expanded = expanded;
  }, [collapsedLabel, defaultExpanded, expanded, expandedLabel]);

  return React.createElement("dt-expandable-section", { ref }, children);
}

function ControlledExpandableStory() {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<DtExpandableSectionElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const handleChange = (event: Event) => {
      setExpanded(
        (event as CustomEvent<{ expanded: boolean }>).detail.expanded,
      );
    };
    element.addEventListener("expanded-change", handleChange);
    return () => element.removeEventListener("expanded-change", handleChange);
  }, []);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.collapsedLabel = "Show changelog";
    element.expandedLabel = "Hide changelog";
    element.expanded = expanded;
  }, [expanded]);

  return (
    <div style={{ maxWidth: "28rem" }}>
      <p style={{ fontSize: "0.85em" }}>
        State: {expanded ? "expanded" : "collapsed"}
      </p>
      {React.createElement(
        "dt-expandable-section",
        { ref },
        React.createElement("p", null, "1.2.0 - Adds controlled mode."),
      )}
    </div>
  );
}

const meta = {
  title: "Web Components/Layout/ExpandableSection",
  component: NativeExpandableSection,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "centered",
    contractStatus: "beta",
    docs: {
      description: {
        component:
          "Native `dt-expandable-section` for stand-alone disclosure with a default slot and bubbled `expanded-change` events.",
      },
    },
  },
  args: {
    collapsedLabel: "Add project details",
    expandedLabel: "Hide project details",
    defaultExpanded: false,
    children: <p>Optional fields appear here when expanded.</p>,
  },
} satisfies Meta<typeof NativeExpandableSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector("dt-expandable-section");
    expect(customElements.get("dt-expandable-section")).toBeDefined();
    expect(host?.shadowRoot).toBeTruthy();
    const trigger = host?.shadowRoot?.querySelector<HTMLButtonElement>("button");
    await userEvent.click(trigger!);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};

export const Playground: Story = {};

export const Example: Story = {
  tags: ["example"],
  render: () => (
    <Stage width="min(30rem, 90vw)">
      <NativeExpandableSection
        collapsedLabel="Add project details"
        expandedLabel="Hide project details"
      >
        <p>Optional fields appear here when expanded.</p>
      </NativeExpandableSection>
    </Stage>
  ),
};

export const ForcedColors: Story = {
  tags: ["example"],
  globals: { forcedColors: "active" },
};

export const ShowMoreTail: Story = {
  tags: ["example"],
  render: () => (
    <div style={{ maxWidth: "28rem" }}>
      <p>The visible opening of the content stays outside the disclosure.</p>
      <NativeExpandableSection
        collapsedLabel="Show more"
        expandedLabel="Show less"
      >
        <p>The optional tail: extended details most readers can skip.</p>
        <p>Second paragraph follows the first in the same disclosure.</p>
      </NativeExpandableSection>
    </div>
  ),
};

export const ControlledDisclosure: Story = {
  tags: ["example"],
  render: () => <ControlledExpandableStory />,
};

export const VersusAccordion: Story = {
  tags: ["example"],
  render: () => (
    <div
      style={{
        maxWidth: "28rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <NativeExpandableSection collapsedLabel="Details A">
        <p>Content of A.</p>
      </NativeExpandableSection>
      <NativeExpandableSection collapsedLabel="Details B">
        <p>Content of B - open both; nothing closes.</p>
      </NativeExpandableSection>
    </div>
  ),
};
