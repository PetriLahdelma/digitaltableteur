import React from "react";
import Grid from "./Grid";

export default {
  title: "Components/Grid",
  component: Grid,
  argTypes: {
    columns: {
      control: { type: "number", min: 1, max: 12 },
      defaultValue: 3,
      description: "Number of columns in the grid",
    },
    gap: {
      control: "text",
      defaultValue: "1.5rem",
      description: "Gap between grid items (CSS value)",
    },
    rowGap: {
      control: "text",
      defaultValue: "2rem",
      description: "Row gap (CSS value)",
    },
    colGap: {
      control: "text",
      defaultValue: "0.5rem",
      description: "Column gap (CSS value)",
    },
    align: {
      control: "select",
      options: ["start", "center", "end", "stretch"],
      description: "Align items vertically",
    },
    justify: {
      control: "select",
      options: ["start", "center", "end", "stretch"],
      description: "Justify items horizontally",
    },
  },
};

import type { ComponentProps } from "react";
import type { StoryFn } from "@storybook/react-vite";

const Template: StoryFn<ComponentProps<typeof Grid>> = (
  args: ComponentProps<typeof Grid>,
) => (
  <div style={{ maxWidth: "90%", overflow: "hidden" }}>
    <Grid
      {...args}
      style={{
        background: "var(--storybook-bg)",
        padding: 24,
        overflow: "hidden",
      }}
    >
      <Grid.Item
        style={{
          background: "var(--storybook-blue)",
          color: "var(--storybook-white)",
          padding: 16,
        }}
      >
        1
      </Grid.Item>
      <Grid.Item
        style={{
          background: "var(--storybook-cyan)",
          color: "var(--storybook-white)",
          padding: 16,
        }}
      >
        2
      </Grid.Item>
      <Grid.Item
        style={{
          background: "var(--storybook-pink)",
          color: "var(--storybook-white)",
          padding: 16,
        }}
      >
        3
      </Grid.Item>
    </Grid>
  </div>
);

export const Basic = Template.bind({});
Basic.args = {
  columns: 3,
  gap: "1.5rem",
};

export const Spans = () => (
  <div style={{ maxWidth: "90%", overflow: "hidden" }}>
    <Grid
      columns={4}
      gap="1rem"
      style={{
        background: "var(--storybook-bg)",
        padding: 24,
        overflow: "hidden",
      }}
    >
      <Grid.Item
        span={2}
        style={{
          background: "var(--storybook-blue)",
          color: "var(--storybook-white)",
          padding: 16,
        }}
      >
        Span 2
      </Grid.Item>
      <Grid.Item
        style={{
          background: "var(--storybook-cyan)",
          color: "var(--storybook-white)",
          padding: 16,
        }}
      >
        Normal
      </Grid.Item>
      <Grid.Item
        span={2}
        style={{
          background: "var(--storybook-pink)",
          color: "var(--storybook-white)",
          padding: 16,
        }}
      >
        Span 2
      </Grid.Item>
      <Grid.Item
        style={{
          background: "var(--storybook-purple)",
          color: "var(--storybook-white)",
          padding: 16,
        }}
      >
        Normal
      </Grid.Item>
    </Grid>
  </div>
);

export const Nested = () => (
  <div style={{ maxWidth: "90%", overflow: "hidden" }}>
    <Grid
      columns={2}
      gap="2rem"
      style={{
        background: "var(--storybook-bg)",
        padding: 24,
        overflow: "hidden",
      }}
    >
      <Grid.Item
        style={{
          background: "var(--storybook-blue)",
          color: "var(--storybook-white)",
          padding: 16,
        }}
      >
        Parent 1
      </Grid.Item>
      <Grid columns={3} gap="0.5rem">
        <Grid.Item
          style={{
            background: "var(--storybook-cyan)",
            color: "var(--storybook---storybook-white)",
            padding: 12,
          }}
        >
          A
        </Grid.Item>
        <Grid.Item
          style={{
            background: "var(--storybook-pink)",
            color: "var(--storybook-white)",
            padding: 12,
          }}
        >
          B
        </Grid.Item>
        <Grid.Item
          style={{
            background: "var(--storybook-purple)",
            color: "var(--storybook-white)",
            padding: 12,
          }}
        >
          C
        </Grid.Item>
      </Grid>
    </Grid>
  </div>
);

export const RowAndColGap = Template.bind({});
RowAndColGap.args = {
  columns: 3,
  rowGap: "2rem",
  colGap: "0.5rem",
};

export const Alignment = Template.bind({});
Alignment.args = {
  columns: 3,
  align: "center",
  justify: "center",
};
