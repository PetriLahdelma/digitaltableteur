import type { Meta, StoryObj } from "@storybook/react-vite";
import { AspectRatio } from "./AspectRatio";
import contract from "./AspectRatio.contract.json";

const defaultArgs = {
  ratio: "16:9" as const,
  children: (
    <div className="flex h-full w-full items-center justify-center bg-primary/20 text-sm text-muted-foreground">
      16:9 media slot
    </div>
  ),
};

const meta = {
  title: "Atoms/AspectRatio",
  component: AspectRatio,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: {
      control: false,
      description: "Media or placeholder content inside the ratio box",
    },
    ratio: {
      control: "select",
      options: ["1:1", "4:3", "16:9", "21:9", "3:2", "2:3"],
      description: "Width-to-height ratio token",
      table: { defaultValue: { summary: "16:9" } },
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ width: 320 }}>
      <AspectRatio ratio="16:9">
        <img
          src="https://picsum.photos/640/360"
          alt="Case study hero frame"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
