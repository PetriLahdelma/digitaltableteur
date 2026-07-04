import contract from "./ImagePlaceholder.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import {
  Controls,
  Description,
  Heading,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/addon-docs/blocks";
import ImagePlaceholder, { ImagePlaceholderPresets } from "./ImagePlaceholder";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";

const meta: Meta<typeof ImagePlaceholder> = {
  title: "Site/ImagePlaceholder",
  component: ImagePlaceholder,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-image-placeholder",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "centered",
    llm: { schema },
    docs: {
      page: () => (
        <>
          <Primary />
          <Title />
          <Subtitle />
          <Description />
          <Controls />
          <Stories />
          <Heading>LLM Schema</Heading>
          <CodeSnippet
            code={JSON.stringify(schema, null, 2)}
            language="json"
            variant="multi"
            maxLines={20}
            showLineNumbers={true}
            allowCopy={true}
          />
        </>
      ),
    },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
};

export default meta;
type Story = StoryObj<typeof ImagePlaceholder>;

export const Default: Story = {
  tags: ["beta-matrix"],
  args: {
    width: 800,
    height: 400,
    alt: "Default placeholder",
    variant: "gradient",
    showDimensions: true,
    showIcon: true,
  },
};

export const WithCaption: Story = {
  args: {
    width: 800,
    height: 400,
    alt: "Placeholder with caption",
    caption: "This is a placeholder image with a descriptive caption",
    variant: "gradient",
    showDimensions: true,
    showIcon: true,
  },
};

export const WithCustomText: Story = {
  args: {
    width: 800,
    height: 400,
    alt: "Placeholder with custom text",
    text: "Portfolio Screenshot",
    caption: "Example project visualization",
    variant: "medium",
    showDimensions: false,
    showIcon: true,
  },
};

export const LightVariant: Story = {
  args: {
    width: 800,
    height: 400,
    alt: "Light variant placeholder",
    variant: "light",
    showDimensions: true,
    showIcon: true,
  },
};

export const DarkVariant: Story = {
  args: {
    width: 800,
    height: 400,
    alt: "Dark variant placeholder",
    variant: "dark",
    showDimensions: true,
    showIcon: true,
  },
};

export const MinimalDesign: Story = {
  args: {
    width: 800,
    height: 400,
    alt: "Minimal placeholder",
    variant: "gradient",
    showDimensions: false,
    showIcon: false,
  },
};

// Preset-based stories demonstrating common use cases
export const LandscapeFormat: Story = {
  args: {
    ...ImagePlaceholderPresets.landscape,
    alt: "Landscape format (16:9)",
    text: "Landscape 16:9",
    variant: "gradient",
    showDimensions: true,
    showIcon: true,
  },
};

export const PortraitFormat: Story = {
  args: {
    ...ImagePlaceholderPresets.portrait,
    alt: "Portrait format (3:4)",
    text: "Portrait 3:4",
    variant: "medium",
    showDimensions: true,
    showIcon: true,
  },
};

export const SquareFormat: Story = {
  args: {
    ...ImagePlaceholderPresets.square,
    alt: "Square format (1:1)",
    text: "Square 1:1",
    variant: "light",
    showDimensions: true,
    showIcon: true,
  },
};

// Helsinki Design System specific presets
export const HelsinkiWireframe: Story = {
  args: {
    ...ImagePlaceholderPresets.wireframe,
    alt: "Helsinki Design System wireframe format",
    caption: "Early wireframes and information architecture",
    variant: "gradient",
    showDimensions: true,
    showIcon: true,
  },
};

export const HelsinkiComponent: Story = {
  args: {
    ...ImagePlaceholderPresets.component,
    alt: "Helsinki Design System component format",
    caption: "Mobile implementation example",
    variant: "light",
    showDimensions: true,
    showIcon: true,
  },
};

export const HelsinkiDetail: Story = {
  args: {
    ...ImagePlaceholderPresets.detail,
    alt: "Helsinki Design System detail format",
    caption: "Research findings visualization",
    variant: "medium",
    showDimensions: true,
    showIcon: true,
  },
};

export const HelsinkiStructure: Story = {
  args: {
    ...ImagePlaceholderPresets.structure,
    alt: "Helsinki Design System structure diagram",
    caption: "Component architecture and contribution flow",
    variant: "gradient",
    showDimensions: true,
    showIcon: true,
  },
};

export const CardCoverFormat: Story = {
  args: {
    ...ImagePlaceholderPresets.cardCover,
    alt: "Card cover format",
    caption: "Project screenshot placeholder",
    variant: "gradient",
    showDimensions: true,
    showIcon: true,
  },
};

// Multiple placeholders in a grid
export const GridLayout: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "1rem",
        maxWidth: "800px",
      }}
    >
      <ImagePlaceholder
        {...ImagePlaceholderPresets.detail}
        alt="Research phase"
        caption="Research findings"
        variant="light"
      />
      <ImagePlaceholder
        {...ImagePlaceholderPresets.detail}
        alt="Design phase"
        caption="Goal setting"
        variant="medium"
      />
      <ImagePlaceholder
        {...ImagePlaceholderPresets.detail}
        alt="Development phase"
        caption="Journey mapping"
        variant="gradient"
      />
      <ImagePlaceholder
        {...ImagePlaceholderPresets.detail}
        alt="Testing phase"
        caption="Prototype testing"
        variant="dark"
      />
    </div>
  ),
};

// Responsive demonstration
export const ResponsiveSizes: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        maxWidth: "600px",
      }}
    >
      <ImagePlaceholder
        width={600}
        height={400}
        alt="Large placeholder"
        text="Large"
        variant="gradient"
      />
      <ImagePlaceholder
        width={400}
        height={300}
        alt="Medium placeholder"
        text="Medium"
        variant="medium"
      />
      <ImagePlaceholder
        width={200}
        height={150}
        alt="Small placeholder"
        text="Small"
        variant="light"
      />
    </div>
  ),
};

// All variants comparison
export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxWidth: "600px",
      }}
    >
      <ImagePlaceholder
        width={600}
        height={300}
        alt="Light variant"
        text="Light"
        variant="light"
        showDimensions={false}
      />
      <ImagePlaceholder
        width={600}
        height={300}
        alt="Medium variant"
        text="Medium"
        variant="medium"
        showDimensions={false}
      />
      <ImagePlaceholder
        width={600}
        height={300}
        alt="Dark variant"
        text="Dark"
        variant="dark"
        showDimensions={false}
      />
      <ImagePlaceholder
        width={600}
        height={300}
        alt="Gradient variant"
        text="Gradient"
        variant="gradient"
        showDimensions={false}
      />
    </div>
  ),
};

export const Playground = Default;
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
