/**
 * Beta-tier Storybook sources for breadth-tranche components.
 * Consumed by port-breadth-beta.mjs — one template per component name.
 */

function playTab(storyName) {
  return `
${storyName}.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};`;
}

function playClickButton(storyName) {
  return `
${storyName}.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button"));
};`;
}

function betaStory({
  title,
  component,
  importLines,
  layout = "centered",
  defaultArgsBlock,
  argTypesBlock,
  exampleBlock,
  playOnPlayground = false,
  defaultRender,
}) {
  const renderDefault = defaultRender ? `\n  render: ${defaultRender},` : "";
  const play =
    playOnPlayground === "tab"
      ? playTab("Playground")
      : playOnPlayground === "click"
        ? playClickButton("Playground")
        : "";
  const testImports = playOnPlayground
    ? `import { userEvent, within } from "storybook/test";\n`
    : "";

  return `${testImports}${importLines}
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./${component}.contract.json";

${defaultArgsBlock}

const meta = {
  title: "${title}",
  component: ${component},
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "${layout}",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
${argTypesBlock}
  },
  args: defaultArgs,
} satisfies Meta<typeof ${component}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {${renderDefault} };
export const Playground: Story = {${renderDefault} };
${play}

${exampleBlock}

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,${defaultRender ? `\n  render: ${defaultRender},` : ""}
};
`;
}

const STORY_BUILDERS = {
  HomeHero(title) {
    return betaStory({
      title,
      component: "HomeHero",
      layout: "fullscreen",
      importLines: `import { HomeHero } from "./HomeHero";`,
      defaultArgsBlock: `const defaultArgs = {
  scrollTargetId: "services",
};`,
      argTypesBlock: `    scrollTargetId: {
      control: "text",
      description: "ID of the section targeted by the scroll indicator",
      table: { defaultValue: { summary: "services" } },
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
      table: { disable: true },
    },`,
      exampleBlock: `export const Example: Story = {
  name: "Example (homepage hero)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <HomeHero scrollTargetId="services" />,
};`,
      playOnPlayground: "tab",
    });
  },

  CTASection(title) {
    return betaStory({
      title,
      component: "CTASection",
      layout: "fullscreen",
      importLines: `import { CTASection } from "./CTASection";`,
      defaultArgsBlock: `const defaultArgs = {
  title: "Ready to scale your design system?",
  description:
    "We help teams ship accessible, token-driven UI with GenAI-ready specs.",
  primaryAction: { label: "Book a call", href: "/contact" },
  secondaryAction: { label: "View work", href: "/work" },
  background: "brand" as const,
  align: "center" as const,
};`,
      argTypesBlock: `    title: { control: "text", description: "Main headline" },
    description: { control: "text", description: "Supporting description" },
    primaryAction: { control: "object", description: "Primary CTA (label + href or onClick)" },
    secondaryAction: { control: "object", description: "Optional secondary CTA" },
    background: {
      control: "select",
      options: ["primary", "gradient", "dark", "muted", "brand"],
      description: "Band background treatment",
      table: { defaultValue: { summary: "primary" } },
    },
    align: {
      control: "radio",
      options: ["left", "center"],
      description: "Text alignment",
      table: { defaultValue: { summary: "center" } },
    },
    className: { control: "text", description: "Wrapper class names", table: { disable: true } },
    id: { control: "text", description: "Section id for in-page anchors", table: { disable: true } },`,
      exampleBlock: `export const Example: Story = {
  name: "Example (homepage contact CTA)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => (
    <CTASection
      id="contact-cta"
      title="Ready to create something extraordinary?"
      primaryAction={{ label: "Let's talk", href: "/contact" }}
      background="primary"
      align="center"
    />
  ),
};`,
    });
  },

  ServicesSection(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DesignSystemsIcon,
  UxInterfacesIcon,
  AiSolutionsIcon,
} from "../../components/icons/service-icons";
import { ServicesSection } from "./ServicesSection";
import contract from "./ServicesSection.contract.json";

const sampleServices = [
  {
    icon: <UxInterfacesIcon />,
    title: "UX & interfaces",
    description: "Research-led product UI for web and mobile.",
  },
  {
    icon: <DesignSystemsIcon />,
    title: "Design systems",
    description: "Tokens, components, and governance that scale.",
  },
  {
    icon: <AiSolutionsIcon />,
    title: "GenAI experiences",
    description: "Human-centered flows with trustworthy AI patterns.",
  },
];

const defaultArgs = {
  title: "What we do",
  description: "Strategy, systems, and shipping — end to end.",
  services: sampleServices,
  columns: 3 as const,
  cardVariant: "bordered" as const,
};

const meta = {
  title: "${title}",
  component: ServicesSection,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    title: { control: "text", description: "Section heading" },
    description: { control: "text", description: "Lead copy below the heading" },
    services: { control: false, description: "Service tiles (icon, title, description)" },
    columns: {
      control: "radio",
      options: [2, 3, 4],
      description: "Responsive column count",
      table: { defaultValue: { summary: "3" } },
    },
    cardVariant: {
      control: "select",
      options: ["default", "bordered", "elevated", "minimal"],
      description: "ServiceCard surface variant",
      table: { defaultValue: { summary: "default" } },
    },
    className: { control: "text", description: "Section class names", table: { disable: true } },
    id: { control: "text", description: "Section id", table: { defaultValue: { summary: "services" } } },
  },
  args: defaultArgs,
} satisfies Meta<typeof ServicesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};

export const Example: Story = {
  name: "Example (homepage services)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  args: defaultArgs,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },

  HighlightSection(title) {
    return betaStory({
      title,
      component: "HighlightSection",
      layout: "fullscreen",
      importLines: `import HighlightSection from "./HighlightSection";`,
      defaultArgsBlock: `const defaultArgs = {
  title: "Component schema for GenAI design systems",
  description:
    "Keep AI-generated UI consistent with shared prop structures, naming, and token bindings.",
  variant: "dots" as const,
  size: "comfortable" as const,
  cta: [
    { label: "Download schema", href: "https://example.com/schema" },
    { label: "Read article", href: "/blog" },
  ],
};`,
      argTypesBlock: `    title: { control: "text", description: "Headline" },
    overline: { control: "text", description: "Optional eyebrow above title" },
    description: { control: "text", description: "Supporting body copy" },
    cta: { control: false, description: "Up to three CTA actions" },
    variant: {
      control: "select",
      options: ["gradient", "pattern", "dots", "solid"],
      description: "Background variant",
      table: { defaultValue: { summary: "gradient" } },
    },
    size: {
      control: "select",
      options: ["compact", "comfortable", "spacious"],
      description: "Vertical rhythm scale",
      table: { defaultValue: { summary: "comfortable" } },
    },
    className: { control: "text", description: "Section class names", table: { disable: true } },
    ariaLabel: { control: "text", description: "Accessible section label override", table: { disable: true } },`,
      exampleBlock: `export const Example: Story = {
  name: "Example (homepage GenAI highlight)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  args: {
    title: "Component Schema Template for GenAI Design Systems",
    description:
      "Enforce shared prop structures and naming so AI output stays on-brand.",
    variant: "dots",
    size: "comfortable",
    cta: [
      { label: "Download Schema", href: "https://example.com" },
      { label: "Read Article", href: "/blog" },
    ],
  },
};`,
    });
  },

  Container(title) {
    return betaStory({
      title,
      component: "Container",
      importLines: `import { Container } from "./Container";
import Text from "@dt/Text";`,
      defaultArgsBlock: `const defaultArgs = {
  size: "lg" as const,
  center: true,
  children: (
    <Text as="p" terminals="sans">
      Content constrained to the production max-width with responsive padding.
    </Text>
  ),
};`,
      argTypesBlock: `    children: { control: false, description: "Page content inside the width constraint" },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
      description: "Max-width token",
      table: { defaultValue: { summary: "lg" } },
    },
    center: { control: "boolean", description: "Center the container horizontally" },
    className: { control: "text", description: "Wrapper class names", table: { disable: true } },
    as: { control: "text", description: "Polymorphic element", table: { disable: true } },`,
      exampleBlock: `export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <Container size="lg">
      <Text as="p" terminals="sans">
        Canonical page gutter — matches marketing and app shells.
      </Text>
    </Container>
  ),
};`,
    });
  },

  NextLayout(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { NextLayout } from "./NextLayout";
import Title from "@dt/Title";
import Text from "@dt/Text";
import contract from "./NextLayout.contract.json";

const sampleMain = (
  <div style={{ padding: "var(--space-layout-24)" }}>
    <Title level={1} terminals="sans">
      Page content
    </Title>
    <Text as="p" terminals="sans">
      Production shell: skip link, header, main landmark, footer, chat, consent.
    </Text>
  </div>
);

const meta = {
  title: "${title}",
  component: NextLayout,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    className: { control: "text", description: "Layout wrapper class names", table: { disable: true } },
  },
  args: {},
} satisfies Meta<typeof NextLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <NextLayout>{sampleMain}</NextLayout>,
};
export const Playground: Story = { ...Default };
${playTab("Playground")}

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <NextLayout>{sampleMain}</NextLayout>,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  render: () => <NextLayout>{sampleMain}</NextLayout>,
};
`;
  },

  ContactFormEditorial(title) {
    return betaStory({
      title,
      component: "ContactFormEditorial",
      layout: "padded",
      importLines: `import { ContactFormEditorial } from "./ContactFormEditorial";`,
      defaultArgsBlock: `const defaultArgs = {};`,
      argTypesBlock: `    onSuccess: { action: "success", description: "Called after successful submit" },
    onError: { action: "error", description: "Called when submit fails" },
    className: { control: "text", description: "Form wrapper class names", table: { disable: true } },`,
      exampleBlock: `export const Example: Story = {
  name: "Example (contact page form)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <ContactFormEditorial />
    </div>
  ),
};`,
      playOnPlayground: "tab",
    });
  },

  Grid(title) {
    return betaStory({
      title,
      component: "Grid",
      importLines: `import Grid from "./Grid";
import Text from "@dt/Text";`,
      defaultArgsBlock: `const defaultArgs = {
  columns: 2,
  gap: "1rem",
  children: (
    <>
      <div><Text as="p" terminals="sans">Cell A</Text></div>
      <div><Text as="p" terminals="sans">Cell B</Text></div>
      <div><Text as="p" terminals="sans">Cell C</Text></div>
      <div><Text as="p" terminals="sans">Cell D</Text></div>
    </>
  ),
};`,
      argTypesBlock: `    children: { control: false, description: "Grid cells (supports span on child props)" },
    columns: { control: "number", description: "Column count or template" },
    rows: { control: "text", description: "Row count or template", table: { disable: true } },
    gap: { control: "text", description: "Grid gap", table: { defaultValue: { summary: "1rem" } } },
    rowGap: { control: "text", description: "Row gap override", table: { disable: true } },
    colGap: { control: "text", description: "Column gap override", table: { disable: true } },
    align: { control: "text", description: "align-items", table: { disable: true } },
    justify: { control: "text", description: "justify-items", table: { disable: true } },
    className: { control: "text", description: "Grid class names", table: { disable: true } },`,
      exampleBlock: `export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <Grid columns={3} gap="1.5rem" style={{ maxWidth: 720 }}>
      <div><Text as="p" terminals="sans">Services</Text></div>
      <div><Text as="p" terminals="sans">Work</Text></div>
      <div><Text as="p" terminals="sans">About</Text></div>
    </Grid>
  ),
};`,
    });
  },

  FlexBox(title) {
    return betaStory({
      title,
      component: "FlexBox",
      importLines: `import FlexBox from "./FlexBox";
import Text from "@dt/Text";`,
      defaultArgsBlock: `const defaultArgs = {
  direction: "row" as const,
  gap: "1rem",
  align: "center" as const,
  children: (
    <>
      <Text as="span" terminals="sans">Alpha</Text>
      <Text as="span" terminals="sans">Beta</Text>
      <Text as="span" terminals="sans">Gamma</Text>
    </>
  ),
};`,
      argTypesBlock: `    children: { control: false, description: "Flex items" },
    direction: {
      control: "select",
      options: ["row", "row-reverse", "column", "column-reverse"],
      description: "flex-direction",
      table: { defaultValue: { summary: "row" } },
    },
    wrap: {
      control: "select",
      options: ["nowrap", "wrap", "wrap-reverse"],
      description: "flex-wrap",
      table: { defaultValue: { summary: "nowrap" } },
    },
    justify: {
      control: "select",
      options: ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"],
      description: "justify-content",
    },
    align: {
      control: "select",
      options: ["stretch", "flex-start", "flex-end", "center", "baseline"],
      description: "align-items",
      table: { defaultValue: { summary: "stretch" } },
    },
    gap: { control: "text", description: "Shorthand gap" },
    rowGap: { control: "text", description: "Row gap override", table: { disable: true } },
    columnGap: { control: "text", description: "Column gap override", table: { disable: true } },
    alignContent: { control: "text", description: "align-content", table: { disable: true } },
    className: { control: "text", description: "Wrapper class names", table: { disable: true } },
    style: { control: "object", description: "Inline style override", table: { disable: true } },`,
      exampleBlock: `export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <FlexBox direction="column" gap="0.75rem" align="stretch" style={{ maxWidth: 320 }}>
      <Text as="p" terminals="sans">Stacked editorial row</Text>
      <Text as="p" terminals="sans">Second line with deliberate rhythm</Text>
    </FlexBox>
  ),
};`,
    });
  },

  ThemeProvider(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import Button from "@dt/Button";
import Text from "@dt/Text";
import { ThemeProvider, useTheme } from "./ThemeProvider";
import contract from "./ThemeProvider.contract.json";

function ThemeToggleDemo() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div style={{ display: "grid", gap: "1rem", padding: "1.5rem" }}>
      <Text as="p" terminals="sans">
        Active theme: <strong>{theme}</strong>
      </Text>
      <Button variant="primary" onClick={toggleTheme}>
        Cycle theme
      </Button>
    </div>
  );
}

const meta = {
  title: "${title}",
  component: ThemeProvider,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    className: { control: "text", description: "Provider wrapper class names", table: { disable: true } },
  },
  args: {},
} satisfies Meta<typeof ThemeProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ThemeProvider>
      <ThemeToggleDemo />
    </ThemeProvider>
  ),
};
export const Playground: Story = { ...Default };
${playClickButton("Playground")}

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <ThemeProvider>
      <ThemeToggleDemo />
    </ThemeProvider>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  render: () => (
    <ThemeProvider>
      <ThemeToggleDemo />
    </ThemeProvider>
  ),
};
`;
  },

  HeroSection(title) {
    return betaStory({
      title,
      component: "HeroSection",
      layout: "fullscreen",
      importLines: `import { HeroSection } from "./HeroSection";
import { Container } from "../../components/Container";
import Title from "@dt/Title";
import Text from "@dt/Text";`,
      defaultArgsBlock: `const defaultArgs = {
  background: "gradient" as const,
  minHeight: "hero" as const,
  align: "center" as const,
  justify: "center" as const,
  children: (
    <Container size="lg">
      <Title level={1} terminals="sans">Hero shell</Title>
      <Text as="p" terminals="sans">Composable full-bleed marketing hero wrapper.</Text>
    </Container>
  ),
};`,
      argTypesBlock: `    children: { control: false, description: "Hero content slot" },
    background: {
      control: "select",
      options: ["gradient", "solid", "image", "transparent"],
      description: "Background treatment",
      table: { defaultValue: { summary: "gradient" } },
    },
    backgroundImage: { control: "text", description: "Image URL when background is image" },
    minHeight: {
      control: "select",
      options: ["screen", "hero", "half", "auto"],
      description: "Minimum block height",
      table: { defaultValue: { summary: "hero" } },
    },
    align: {
      control: "select",
      options: ["start", "center", "end"],
      description: "Vertical alignment of content",
    },
    justify: {
      control: "select",
      options: ["start", "center", "end"],
      description: "Horizontal alignment of content",
    },
    className: { control: "text", description: "Section class names", table: { disable: true } },
    as: { control: "text", description: "Polymorphic element", table: { disable: true } },
    ariaLabel: { control: "text", description: "Accessible name", table: { disable: true } },`,
      exampleBlock: `export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => (
    <HeroSection background="gradient" minHeight="half" align="center" justify="center">
      <Container size="lg">
        <Title level={1} terminals="sans">Marketing hero frame</Title>
      </Container>
    </HeroSection>
  ),
};`,
    });
  },

  DesignSprintsSection(title) {
    return betaStory({
      title,
      component: "DesignSprintsSection",
      layout: "fullscreen",
      importLines: `import { DesignSprintsSection } from "./DesignSprintsSection";`,
      defaultArgsBlock: `const defaultArgs = {
  id: "design-sprints",
};`,
      argTypesBlock: `    id: { control: "text", description: "Section anchor id", table: { defaultValue: { summary: "design-sprints" } } },
    className: { control: "text", description: "Section class names", table: { disable: true } },`,
      exampleBlock: `export const Example: Story = {
  name: "Example (homepage design sprints)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <DesignSprintsSection id="design-sprints" />,
};`,
    });
  },

  WorkMagneticField(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { WorkMagneticField } from "./WorkMagneticField";
import contract from "./WorkMagneticField.contract.json";

const sampleProjects = [
  {
    title: "SAP Build Apps Design System",
    slug: "sap-build-apps",
    thumbnail: "/images/portfolio/sap-build-apps/Build Product Icon_1000px.png",
    category: "Design Systems",
    tags: ["Enterprise", "Low-Code"],
  },
  {
    title: "Helsinki Design System",
    slug: "helsinki-design-system",
    thumbnail: "/images/portfolio/helsinki-design-system/HDS_logo.png",
    category: "Design Systems",
    tags: ["Accessibility", "React"],
  },
  {
    title: "New Things Co",
    slug: "new-things-co",
    thumbnail: "/images/portfolio/new_things_co/new_things_co_item.webp",
    category: "Branding",
    tags: ["Branding", "Web Design"],
  },
];

const defaultArgs = {
  title: "Selected work",
  projects: sampleProjects,
  showViewAll: true,
};

const meta = {
  title: "${title}",
  component: WorkMagneticField,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    title: { control: "text", description: "Section heading" },
    projects: { control: false, description: "Portfolio cards with magnetic hover" },
    showViewAll: { control: "boolean", description: "Show link to full work index" },
    className: { control: "text", description: "Section class names", table: { disable: true } },
    id: { control: "text", description: "Section id", table: { defaultValue: { summary: "work" } } },
  },
  args: defaultArgs,
} satisfies Meta<typeof WorkMagneticField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};

export const Example: Story = {
  name: "Example (homepage work grid)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  args: defaultArgs,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },

  ContactPageContentEditorial(title) {
    return betaStory({
      title,
      component: "ContactPageContentEditorial",
      layout: "fullscreen",
      importLines: `import { ContactPageContentEditorial } from "./ContactPageContentEditorial";`,
      defaultArgsBlock: `const defaultArgs = {};`,
      argTypesBlock: `    className: { control: "text", description: "Page wrapper class names", table: { disable: true } },`,
      exampleBlock: `export const Example: Story = {
  name: "Example (contact page layout)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <ContactPageContentEditorial />,
};`,
    });
  },

  Section(title) {
    return betaStory({
      title,
      component: "Section",
      importLines: `import { Section } from "./Section";
import Text from "@dt/Text";`,
      defaultArgsBlock: `const defaultArgs = {
  spacing: "md" as const,
  background: "default" as const,
  children: (
    <Text as="p" terminals="sans">
      Semantic section with tokenized vertical spacing.
    </Text>
  ),
};`,
      argTypesBlock: `    children: { control: false, description: "Section content" },
    spacing: {
      control: "select",
      options: ["none", "sm", "md", "lg", "xl"],
      description: "Block padding scale",
      table: { defaultValue: { summary: "md" } },
    },
    background: {
      control: "select",
      options: ["default", "muted", "accent", "inverse"],
      description: "Surface background token",
      table: { defaultValue: { summary: "default" } },
    },
    className: { control: "text", description: "Section class names", table: { disable: true } },
    id: { control: "text", description: "Section id", table: { disable: true } },`,
      exampleBlock: `export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <Section spacing="lg" background="muted" id="example-section">
      <Text as="p" terminals="sans">Used across marketing patterns for vertical rhythm.</Text>
    </Section>
  ),
};`,
    });
  },

  Stack(title) {
    return betaStory({
      title,
      component: "Stack",
      importLines: `import { Stack } from "./Stack";
import Text from "@dt/Text";`,
      defaultArgsBlock: `const defaultArgs = {
  direction: "vertical" as const,
  gap: "md" as const,
  children: (
    <>
      <Text as="p" terminals="sans">First item</Text>
      <Text as="p" terminals="sans">Second item</Text>
    </>
  ),
};`,
      argTypesBlock: `    children: { control: false, description: "Stacked children" },
    direction: {
      control: "select",
      options: ["vertical", "horizontal"],
      description: "Stack axis",
      table: { defaultValue: { summary: "vertical" } },
    },
    gap: {
      control: "select",
      options: ["none", "xs", "sm", "md", "lg", "xl"],
      description: "Gap token between items",
      table: { defaultValue: { summary: "md" } },
    },
    align: {
      control: "select",
      options: ["start", "center", "end", "stretch"],
      description: "Cross-axis alignment",
    },
    justify: {
      control: "select",
      options: ["start", "center", "end", "between", "around"],
      description: "Main-axis distribution",
    },
    wrap: { control: "boolean", description: "Allow wrapping on horizontal stacks" },
    className: { control: "text", description: "Stack class names", table: { disable: true } },
    as: { control: "text", description: "Polymorphic element", table: { disable: true } },`,
      exampleBlock: `export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <Stack direction="vertical" gap="sm">
      <Text as="p" terminals="sans">Hero copy block</Text>
      <Text as="p" terminals="sans">Supporting line with consistent spacing</Text>
    </Stack>
  ),
};`,
    });
  },

  ServiceCard(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { Sparkle } from "@phosphor-icons/react";
import { ServiceCard } from "./ServiceCard";
import contract from "./ServiceCard.contract.json";

const defaultArgs = {
  icon: <Sparkle weight="duotone" className="size-8 text-primary" aria-hidden />,
  title: "Design systems",
  description: "Tokens, components, and governance that scale with your product.",
  variant: "bordered" as const,
};

const meta = {
  title: "${title}",
  component: ServiceCard,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    icon: { control: false, description: "Leading service icon" },
    title: { control: "text", description: "Card title" },
    description: { control: "text", description: "Supporting copy" },
    href: { control: "text", description: "Optional link destination" },
    variant: {
      control: "select",
      options: ["default", "bordered", "elevated", "minimal"],
      description: "Surface treatment",
      table: { defaultValue: { summary: "default" } },
    },
    iconPosition: {
      control: "select",
      options: ["top", "left"],
      description: "Icon placement",
      table: { defaultValue: { summary: "top" } },
    },
    className: { control: "text", description: "Card class names", table: { disable: true } },
  },
  args: defaultArgs,
} satisfies Meta<typeof ServiceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
${playTab("Playground")}

export const Example: Story = {
  name: "Example (services grid tile)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => <ServiceCard {...defaultArgs} />,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },

  FormFieldEditorial(title) {
    return betaStory({
      title,
      component: "FormFieldEditorial",
      importLines: `import { FormFieldEditorial } from "./FormFieldEditorial";`,
      defaultArgsBlock: `const defaultArgs = {
  label: "Your name",
  type: "text" as const,
  required: true,
  placeholder: "Alex Example",
};`,
      argTypesBlock: `    label: { control: "text", description: "Uppercase field label" },
    type: {
      control: "select",
      options: ["text", "email", "tel", "textarea", "select"],
      description: "Control type",
      table: { defaultValue: { summary: "text" } },
    },
    error: { control: "text", description: "Error message (role=alert)" },
    required: { control: "boolean", description: "Required indicator" },
    placeholder: { control: "text", description: "Input placeholder" },
    className: { control: "text", description: "Field wrapper class names", table: { disable: true } },
    id: { control: "text", description: "Stable id override", table: { disable: true } },`,
      exampleBlock: `export const Example: Story = {
  name: "Example (editorial contact field)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <FormFieldEditorial label="Email" type="email" required placeholder="you@company.com" />
    </div>
  ),
};`,
      playOnPlayground: "tab",
    });
  },

  SkipLink(title) {
    return betaStory({
      title,
      component: "SkipLink",
      importLines: `import { SkipLink } from "./SkipLink";`,
      defaultArgsBlock: `const defaultArgs = {
  href: "#main-content",
  children: "Skip to main content",
};`,
      argTypesBlock: `    href: {
      control: "text",
      description: "Target fragment for main content",
      table: { defaultValue: { summary: "#main-content" } },
    },
    children: { control: "text", description: "Visible link text on focus" },
    className: { control: "text", description: "Link class names", table: { disable: true } },`,
      exampleBlock: `export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => <SkipLink />,
};`,
      playOnPlayground: "tab",
    });
  },

  ClientLogoMarquee(title) {
    return betaStory({
      title,
      component: "ClientLogoMarquee",
      layout: "fullscreen",
      importLines: `import { ClientLogoMarquee } from "./ClientLogoMarquee";`,
      defaultArgsBlock: `const defaultArgs = {
  ariaLabel: "Selected clients",
};`,
      argTypesBlock: `    ariaLabel: { control: "text", description: "Accessible name for the logo region" },`,
      exampleBlock: `export const Example: Story = {
  name: "Example (homepage client strip)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <ClientLogoMarquee ariaLabel="Selected clients" />,
};`,
    });
  },

  CookieConsent(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import CookieConsent from "./CookieConsent";
import contract from "./CookieConsent.contract.json";

const meta = {
  title: "${title}",
  component: CookieConsent,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    className: { control: "text", description: "Banner class names", table: { disable: true } },
  },
  args: {},
} satisfies Meta<typeof CookieConsent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
${playTab("Playground")}

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <CookieConsent />,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
};
`;
  },

  EnhancedProjectCard(title) {
    return betaStory({
      title,
      component: "EnhancedProjectCard",
      importLines: `import { EnhancedProjectCard } from "./EnhancedProjectCard";`,
      defaultArgsBlock: `const defaultArgs = {
  title: "SAP Build Apps Design System",
  slug: "sap-build-apps",
  thumbnail: "/images/portfolio/sap-build-apps/Build Product Icon_1000px.png",
  category: "Design Systems",
  tags: ["Enterprise", "Low-Code"],
  aspectRatio: "video" as const,
  showCategory: true,
  showDescription: true,
};`,
      argTypesBlock: `    title: { control: "text", description: "Project title" },
    slug: { control: "text", description: "Detail page slug" },
    thumbnail: { control: "text", description: "Poster image URL" },
    videoThumbnail: { control: "text", description: "Optional hover video URL" },
    description: { control: "text", description: "Short description on hover" },
    category: { control: "text", description: "Category label" },
    tags: { control: "object", description: "Tag list" },
    aspectRatio: {
      control: "select",
      options: ["square", "video", "portrait", "landscape"],
      description: "Media aspect ratio",
      table: { defaultValue: { summary: "video" } },
    },
    showCategory: { control: "boolean", description: "Show category in caption" },
    showDescription: { control: "boolean", description: "Reveal description on hover" },
    autoPlayVideo: { control: "boolean", description: "Autoplay video thumbnail loop" },
    className: { control: "text", description: "Card class names", table: { disable: true } },`,
      exampleBlock: `export const Example: Story = {
  name: "Example (work grid card)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <EnhancedProjectCard {...defaultArgs} />
    </div>
  ),
};`,
      playOnPlayground: "tab",
    });
  },

  WorkPreviewSection(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { WorkPreviewSection } from "./WorkPreviewSection";
import contract from "./WorkPreviewSection.contract.json";

const sampleProjects = [
  {
    title: "SAP Build Apps Design System",
    slug: "sap-build-apps",
    thumbnail: "/images/portfolio/sap-build-apps/Build Product Icon_1000px.png",
    category: "Design Systems",
    tags: ["Enterprise"],
  },
  {
    title: "Helsinki Design System",
    slug: "helsinki-design-system",
    thumbnail: "/images/portfolio/helsinki-design-system/HDS_logo.png",
    category: "Design Systems",
    tags: ["Accessibility"],
  },
];

const defaultArgs = {
  title: "Selected work",
  projects: sampleProjects,
  layout: "grid" as const,
  showViewAll: true,
};

const meta = {
  title: "${title}",
  component: WorkPreviewSection,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    title: { control: "text", description: "Section heading" },
    projects: { control: false, description: "Project cards" },
    layout: {
      control: "select",
      options: ["grid", "asymmetric", "featured"],
      description: "Grid composition",
      table: { defaultValue: { summary: "grid" } },
    },
    showViewAll: { control: "boolean", description: "Link to full work index" },
    className: { control: "text", description: "Section class names", table: { disable: true } },
    id: { control: "text", description: "Section id", table: { defaultValue: { summary: "work" } } },
  },
  args: defaultArgs,
} satisfies Meta<typeof WorkPreviewSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  args: defaultArgs,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },

  ContactHero(title) {
    return betaStory({
      title,
      component: "ContactHero",
      layout: "fullscreen",
      importLines: `import { ContactHero } from "./ContactHero";`,
      defaultArgsBlock: `const defaultArgs = {
  title: "Let's build something thoughtful",
  subtitle: "Tell us about your product, timeline, and team.",
  background: "minimal" as const,
  compact: true,
};`,
      argTypesBlock: `    title: { control: "text", description: "Hero headline" },
    subtitle: { control: "text", description: "Supporting line" },
    background: {
      control: "select",
      options: ["gradient", "minimal"],
      description: "Background treatment",
      table: { defaultValue: { summary: "minimal" } },
    },
    compact: { control: "boolean", description: "Use shorter min-height" },
    className: { control: "text", description: "Section class names", table: { disable: true } },`,
      exampleBlock: `export const Example: Story = {
  name: "Example (contact page hero)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  args: defaultArgs,
};`,
    });
  },

  AboutPageContent(title) {
    return betaStory({
      title,
      component: "AboutPageContent",
      layout: "fullscreen",
      importLines: `import { AboutPageContent } from "./AboutPageContent";`,
      defaultArgsBlock: `const defaultArgs = {
  showCTA: true,
};`,
      argTypesBlock: `    showCTA: { control: "boolean", description: "Render bottom CTA band" },
    className: { control: "text", description: "Page wrapper class names", table: { disable: true } },`,
      exampleBlock: `export const Example: Story = {
  name: "Example (about page)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <AboutPageContent showCTA />,
};`,
    });
  },

  FadeIn(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { FadeIn } from "./FadeIn";
import Text from "@dt/Text";
import contract from "./FadeIn.contract.json";

const defaultArgs = {
  direction: "up" as const,
  children: (
    <Text as="p" terminals="sans">
      Fades in on scroll
    </Text>
  ),
};

const meta = {
  title: "${title}",
  component: FadeIn,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: { control: false, description: "Content revealed on scroll" },
    direction: {
      control: "select",
      options: ["up", "down", "left", "right", "none"],
      description: "Motion direction",
      table: { defaultValue: { summary: "up" } },
    },
    delay: { control: "number", description: "Animation delay in seconds" },
    duration: { control: "number", description: "Tween duration in seconds" },
    distance: { control: "number", description: "Travel distance in pixels" },
    threshold: { control: "text", description: "ScrollTrigger position", table: { disable: true } },
    className: { control: "text", description: "Wrapper class names", table: { disable: true } },
    as: { control: "text", description: "Polymorphic element", table: { disable: true } },
  },
  args: defaultArgs,
} satisfies Meta<typeof FadeIn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <FadeIn direction="up">
      <Text as="p" terminals="sans">
        Production scroll reveal used across marketing sections.
      </Text>
    </FadeIn>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },

  ArticleCard(title) {
    return betaStory({
      title,
      component: "ArticleCard",
      importLines: `import ArticleCard from "./ArticleCard";`,
      defaultArgsBlock: `const defaultArgs = {
  title: "Design systems that survive contact with AI",
  lead: "How we keep generated UI on-brand with schemas, tokens, and review gates.",
  link: "/blog/design-systems-ai",
  readTime: "6 min read",
};`,
      argTypesBlock: `    title: { control: "text", description: "Article headline" },
    lead: { control: "text", description: "Deck / summary line" },
    link: { control: "text", description: "Article URL" },
    readTime: { control: "text", description: "Estimated reading time label" },
    loading: { control: "boolean", description: "Skeleton loading state" },
    className: { control: "text", description: "Card class names", table: { disable: true } },`,
      exampleBlock: `export const Example: Story = {
  name: "Example (blog index teaser)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <ArticleCard {...defaultArgs} />
    </div>
  ),
};`,
      playOnPlayground: "tab",
    });
  },
};

export function getStorySource(name, title) {
  const builder = STORY_BUILDERS[name];
  return builder ? builder(title) : null;
}
