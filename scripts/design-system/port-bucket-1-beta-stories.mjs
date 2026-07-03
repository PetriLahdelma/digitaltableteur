/**
 * Beta-tier Storybook sources for Bucket-1 components.
 * Consumed by port-bucket-1-beta.mjs — one template per component name.
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

const STORY_BUILDERS = {
  AspectRatio(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
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
  title: "${title}",
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
`;
  },

  Center(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { Center } from "./Center";
import contract from "./Center.contract.json";

const defaultArgs = {
  children: (
    <span className="rounded bg-muted px-4 py-2 text-sm">Centered content</span>
  ),
};

const meta = {
  title: "${title}",
  component: Center,
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
      description: "Content to center inside the flex container",
    },
    className: {
      control: "text",
      description: "Additional CSS class names (often a height constraint)",
      table: { disable: true },
    },
    as: {
      control: "text",
      description: "Polymorphic wrapper element",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Center>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <Center className="h-40 w-full max-w-md rounded border border-border bg-muted/30">
      <span className="text-sm text-muted-foreground">Empty-state slot</span>
    </Center>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },

  Display(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { Display } from "./Display";
import contract from "./Display.contract.json";

const defaultArgs = {
  children: "Design systems that ship",
  as: "h1" as const,
};

const meta = {
  title: "${title}",
  component: Display,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: {
      control: "text",
      description: "Hero display copy",
    },
    as: {
      control: "select",
      options: ["h1", "h2", "p", "span", "div"],
      description: "Semantic element override",
      table: { defaultValue: { summary: "h1" } },
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Display>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <Display>Clarity at marketing scale</Display>
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },

  Heading(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from "./Heading";
import contract from "./Heading.contract.json";

const defaultArgs = {
  children: "Section heading",
  level: 2 as const,
  size: "lg" as const,
};

const meta = {
  title: "${title}",
  component: Heading,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: {
      control: "text",
      description: "Heading text content",
    },
    level: {
      control: "select",
      options: [1, 2, 3, 4, 5, 6],
      description: "Semantic heading level (document outline)",
      table: { defaultValue: { summary: "2" } },
    },
    size: {
      control: "select",
      options: ["display", "xl", "lg", "md", "sm", "xs"],
      description: "Visual size decoupled from semantic level",
      table: { defaultValue: { summary: "lg" } },
    },
    as: {
      control: "text",
      description: "Override rendered tag (h1–h6)",
      table: { disable: true },
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <Heading level={2} size="lg">
        What we believe
      </Heading>
      <Heading level={3} size="md">
        Accessibility is a product feature
      </Heading>
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },

  TextLink(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { TextLink } from "./TextLink";
import contract from "./TextLink.contract.json";

const defaultArgs = {
  href: "/privacy-policy",
  children: "Privacy policy",
  variant: "muted" as const,
  underline: "hover" as const,
  external: false,
};

const meta = {
  title: "${title}",
  component: TextLink,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    href: {
      control: "text",
      description: "Destination URL",
    },
    children: {
      control: "text",
      description: "Link text (accessible name)",
    },
    variant: {
      control: "select",
      options: ["default", "muted", "accent"],
      description: "Color variant for inline prose",
      table: { defaultValue: { summary: "default" } },
    },
    underline: {
      control: "select",
      options: ["always", "hover", "none"],
      description: "Underline visibility",
      table: { defaultValue: { summary: "hover" } },
    },
    external: {
      control: "boolean",
      description: "Opens in a new tab with rel security attrs when true",
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof TextLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};
${playTab("Playground")}

export const Example: Story = {
  name: "Example (footer legal row)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <nav
      aria-label="Legal"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem 1.5rem",
        fontSize: "0.875rem",
      }}
    >
      <TextLink href="/privacy-policy" variant="muted" underline="hover">
        Privacy policy
      </TextLink>
      <TextLink href="/imprint" variant="muted" underline="hover">
        Imprint
      </TextLink>
      <TextLink href="/ai-use" variant="muted" underline="hover">
        AI use
      </TextLink>
      <TextLink href="/accessibility" variant="muted" underline="hover">
        Accessibility
      </TextLink>
    </nav>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },

  NavLink(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { NavLink } from "./NavLink";
import contract from "./NavLink.contract.json";

const defaultArgs = {
  href: "/work",
  children: "Work",
  exact: false,
};

const meta = {
  title: "${title}",
  component: NavLink,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    href: {
      control: "text",
      description: "Route path for next/link",
    },
    children: {
      control: "text",
      description: "Navigation link label",
    },
    exact: {
      control: "boolean",
      description: "Match href exactly for aria-current='page'",
    },
    className: {
      control: "text",
      description: "Base CSS class names",
      table: { disable: true },
    },
    activeClassName: {
      control: "text",
      description: "Class when route is active",
      table: { disable: true },
    },
    inactiveClassName: {
      control: "text",
      description: "Class when route is inactive",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof NavLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};
${playTab("Playground")}

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <nav aria-label="Primary" style={{ display: "flex", gap: "1.25rem" }}>
      <NavLink href="/" exact>
        Home
      </NavLink>
      <NavLink href="/work">Work</NavLink>
      <NavLink href="/about">About</NavLink>
      <NavLink href="/contact">Contact</NavLink>
    </nav>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },

  IconButton(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { List, Moon } from "@phosphor-icons/react";
import { IconButton } from "./IconButton";
import contract from "./IconButton.contract.json";

const defaultArgs = {
  icon: <Moon weight="bold" className="size-5" aria-hidden />,
  label: "Toggle dark mode",
  variant: "ghost" as const,
  size: "md" as const,
  disabled: false,
};

const meta = {
  title: "${title}",
  component: IconButton,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    icon: {
      control: false,
      description: "Decorative icon glyph (aria-hidden in component)",
    },
    label: {
      control: "text",
      description: "Required accessible name (aria-label)",
    },
    variant: {
      control: "select",
      options: ["default", "ghost", "outline"],
      description: "Visual button variant",
      table: { defaultValue: { summary: "ghost" } },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Circular hit-target size",
      table: { defaultValue: { summary: "md" } },
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
    onClick: {
      action: "clicked",
      description: "Click handler",
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};
${playTab("Playground")}

export const Example: Story = {
  name: "Example (site header toolbar)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem",
      }}
    >
      <IconButton {...defaultArgs} />
      <IconButton
        icon={<List weight="bold" className="size-5" aria-hidden />}
        label="Open navigation menu"
        variant="ghost"
        size="md"
      />
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },

  Spacer(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spacer } from "./Spacer";
import contract from "./Spacer.contract.json";

const defaultArgs = {
  size: "md" as const,
  axis: "vertical" as const,
};

const meta = {
  title: "${title}",
  component: Spacer,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl", "2xl"],
      description: "Tokenized gap size",
      table: { defaultValue: { summary: "md" } },
    },
    axis: {
      control: "select",
      options: ["vertical", "horizontal"],
      description: "Block (vertical) or inline (horizontal) axis",
      table: { defaultValue: { summary: "vertical" } },
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Spacer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span className="text-sm">First block</span>
      <Spacer size="md" axis="vertical" />
      <span className="text-sm">Second block after deliberate gap</span>
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },

  GroupLabel(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import GroupLabel from "./GroupLabel";
import contract from "./GroupLabel.contract.json";

const defaultArgs = {
  htmlFor: "newsletter-options",
  children: "Notification preferences",
  required: false,
  disabled: false,
};

const meta = {
  title: "${title}",
  component: GroupLabel,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    htmlFor: {
      control: "text",
      description: "ID of the grouped control for label association",
    },
    children: {
      control: "text",
      description: "Group legend text",
    },
    tooltipText: {
      control: "text",
      description: "Optional browser tooltip",
    },
    required: {
      control: "boolean",
      description: "Shows required asterisk",
    },
    disabled: {
      control: "boolean",
      description: "Muted disabled styling",
    },
    title: {
      control: "text",
      description: "Native title attribute override",
      table: { disable: true },
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof GroupLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
      <GroupLabel htmlFor="contact-topic">What can we help with?</GroupLabel>
      <div id="contact-topic" role="group" aria-labelledby="contact-topic-label">
        <p className="text-sm text-muted-foreground">Checkbox group slots here</p>
      </div>
    </fieldset>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },
  FormField(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormField } from "./FormField";
import { TextInput } from "../TextInput/TextInput";
import contract from "./FormField.contract.json";

const defaultArgs = {
  label: "Email address",
  helperText: "We reply within two business days",
  required: true,
  children: <TextInput type="email" placeholder="you@company.com" />,
};

const meta = {
  title: "${title}",
  component: FormField,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    label: { control: "text", description: "Visible field label" },
    children: {
      control: false,
      description: "Single form control (input, select, textarea)",
    },
    error: { control: "text", description: "Submit-time error message" },
    helperText: { control: "text", description: "Hint text wired via aria-describedby" },
    required: { control: "boolean", description: "Required field indicator" },
    disabled: { control: "boolean", description: "Disabled fieldset styling" },
    className: {
      control: "text",
      description: "Wrapper class names",
      table: { disable: true },
    },
    id: {
      control: "text",
      description: "Stable id override",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ width: 360 }}>
      <FormField label="Full name" required helperText="As on your business card">
        <TextInput placeholder="Alex Example" />
      </FormField>
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },

  FormGroup(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormGroup } from "./FormGroup";
import { CheckboxField } from "../CheckboxField/CheckboxField";
import contract from "./FormGroup.contract.json";

const defaultArgs = {
  legend: "Areas of interest",
  description: "Pick all that apply",
  children: (
    <>
      <CheckboxField label="Design systems" defaultChecked />
      <CheckboxField label="Accessibility audits" />
    </>
  ),
};

const meta = {
  title: "${title}",
  component: FormGroup,
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
      description: "Grouped controls inside the fieldset",
    },
    legend: { control: "text", description: "Fieldset legend / accessible group name" },
    description: { control: "text", description: "Optional helper copy below legend" },
    className: {
      control: "text",
      description: "Fieldset class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof FormGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <FormGroup legend="Contact reason" description="Choose one or more topics">
      <CheckboxField label="New project" />
      <CheckboxField label="Workshop / training" />
      <CheckboxField label="Speaking" />
    </FormGroup>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },

  CheckboxField(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { CheckboxField } from "./CheckboxField";
import contract from "./CheckboxField.contract.json";

const defaultArgs = {
  label: "Subscribe to product updates",
  description: "Occasional notes — no spam",
  defaultChecked: false,
};

const meta = {
  title: "${title}",
  component: CheckboxField,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    label: { control: "text", description: "Checkbox label" },
    description: { control: "text", description: "Helper copy under label" },
    checked: { control: "boolean", description: "Controlled checked state" },
    defaultChecked: {
      control: "boolean",
      description: "Initial checked state (uncontrolled)",
    },
    onCheckedChange: {
      action: "checkedChange",
      description: "Change handler",
    },
    disabled: { control: "boolean", description: "Disabled state" },
    required: { control: "boolean", description: "Required indicator" },
    error: { control: "text", description: "Error message (role=alert)" },
    className: {
      control: "text",
      description: "Row wrapper class names",
      table: { disable: true },
    },
    id: {
      control: "text",
      description: "Stable input id",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof CheckboxField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};
${playClickButton("Playground")}

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <CheckboxField
      label="I agree to the privacy policy"
      description="Required to submit the contact form"
      required
    />
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },

  Pagination(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { fn, userEvent, within } from "storybook/test";
import { Pagination } from "./Pagination";
import contract from "./Pagination.contract.json";

function PaginationDemo(
  args: React.ComponentProps<typeof Pagination>,
) {
  const [page, setPage] = useState(args.currentPage ?? 1);
  return (
    <Pagination
      {...args}
      currentPage={page}
      onPageChange={(p) => {
        setPage(p);
        args.onPageChange?.(p);
      }}
    />
  );
}

const defaultArgs = {
  currentPage: 2,
  totalPages: 8,
  onPageChange: fn(),
  siblingCount: 1,
};

const meta = {
  title: "${title}",
  component: Pagination,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    currentPage: { control: "number", description: "Active page (1-indexed)" },
    totalPages: { control: "number", description: "Total page count" },
    onPageChange: {
      action: "pageChange",
      description: "Page change callback",
    },
    siblingCount: {
      control: "number",
      description: "Pages shown on each side of current",
      table: { defaultValue: { summary: "1" } },
    },
    className: {
      control: "text",
      description: "Nav wrapper class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <PaginationDemo {...args} />,
};
export const Playground: Story = {
  render: (args) => <PaginationDemo {...args} />,
};
${playTab("Playground")}

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => <PaginationDemo currentPage={3} totalPages={12} onPageChange={fn()} />,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
  render: (args) => <PaginationDemo {...args} />,
};
`;
  },

  CategoryFilter(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { fn, userEvent, within } from "storybook/test";
import { CategoryFilter } from "./CategoryFilter";
import contract from "./CategoryFilter.contract.json";

const categories = [
  { value: "all", label: "All" },
  { value: "design", label: "Design" },
  { value: "accessibility", label: "Accessibility" },
  { value: "engineering", label: "Engineering" },
];

function CategoryFilterDemo(
  args: Omit<React.ComponentProps<typeof CategoryFilter>, "activeCategory" | "onCategoryChange"> & {
    activeCategory?: string;
  },
) {
  const [active, setActive] = useState(args.activeCategory ?? "all");
  return (
    <CategoryFilter
      {...args}
      activeCategory={active}
      onCategoryChange={(v) => {
        setActive(v);
        args.onCategoryChange?.(v);
      }}
    />
  );
}

const defaultArgs = {
  categories,
  activeCategory: "all",
  onCategoryChange: fn(),
  variant: "pills" as const,
  size: "md" as const,
};

const meta = {
  title: "${title}",
  component: CategoryFilter,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    categories: {
      control: false,
      description: "Filter options (value + label)",
    },
    activeCategory: {
      control: "text",
      description: "Currently selected category value",
    },
    onCategoryChange: {
      action: "categoryChange",
      description: "Selection change handler",
    },
    variant: {
      control: "select",
      options: ["pills", "underline", "minimal"],
      description: "Visual treatment",
      table: { defaultValue: { summary: "pills" } },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Control size",
      table: { defaultValue: { summary: "md" } },
    },
    className: {
      control: "text",
      description: "Nav wrapper class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof CategoryFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <CategoryFilterDemo {...args} />,
};
export const Playground: Story = {
  render: (args) => <CategoryFilterDemo {...args} />,
};
${playTab("Playground")}

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <CategoryFilterDemo
      categories={categories}
      activeCategory="design"
      onCategoryChange={fn()}
      variant="pills"
    />
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
  render: (args) => <CategoryFilterDemo {...args} />,
};
`;
  },

  ExpandableSection(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { userEvent, within } from "storybook/test";
import { ExpandableSection } from "./ExpandableSection";
import contract from "./ExpandableSection.contract.json";

function ExpandableSectionDemo(
  args: React.ComponentProps<typeof ExpandableSection>,
) {
  const [open, setOpen] = useState(args.defaultExpanded ?? false);
  return (
    <ExpandableSection
      {...args}
      expanded={open}
      onExpandedChange={setOpen}
    />
  );
}

const defaultArgs = {
  collapsedLabel: "Add project details",
  expandedLabel: "Hide project details",
  defaultExpanded: false,
  children: (
    <p className="text-sm text-muted-foreground">
      Optional fields appear here when expanded.
    </p>
  ),
};

const meta = {
  title: "${title}",
  component: ExpandableSection,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    collapsedLabel: {
      control: "text",
      description: "Trigger label when collapsed",
    },
    expandedLabel: {
      control: "text",
      description: "Trigger label when expanded",
    },
    defaultExpanded: {
      control: "boolean",
      description: "Initial open state (uncontrolled)",
    },
    expanded: {
      control: "boolean",
      description: "Controlled open state",
    },
    onExpandedChange: {
      action: "expandedChange",
      description: "Open state change handler",
    },
    children: {
      control: false,
      description: "Disclosed panel content",
    },
    className: {
      control: "text",
      description: "Container class names",
      table: { disable: true },
    },
    staggerDelay: {
      control: "number",
      description: "Child animation stagger in ms",
      table: { defaultValue: { summary: "60" } },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof ExpandableSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <ExpandableSectionDemo {...args} />,
};
export const Playground: Story = {
  render: (args) => <ExpandableSectionDemo {...args} />,
};
${playClickButton("Playground")}

export const Example: Story = {
  name: "Example (contact form editorial)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => {
    const [tier2, setTier2] = useState(false);
    const [tier3, setTier3] = useState(false);
    return (
      <div style={{ maxWidth: 480, display: "grid", gap: "0.75rem" }}>
        <ExpandableSection
          collapsedLabel="Add project details"
          expandedLabel="Hide project details"
          expanded={tier2}
          onExpandedChange={setTier2}
        >
          <div style={{ display: "grid", gap: "0.5rem", paddingBlockStart: "0.75rem" }}>
            <label className="text-sm">Budget range</label>
            <select className="rounded border px-2 py-1 text-sm">
              <option>Select…</option>
              <option>Under €10k</option>
            </select>
            <ExpandableSection
              collapsedLabel="+ Tell us more"
              expandedLabel="− Hide"
              expanded={tier3}
              onExpandedChange={setTier3}
            >
              <textarea
                className="mt-2 w-full rounded border p-2 text-sm"
                rows={3}
                placeholder="What should we read first?"
              />
            </ExpandableSection>
          </div>
        </ExpandableSection>
      </div>
    );
  },
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
  render: (args) => <ExpandableSectionDemo {...args} />,
};
`;
  },

  AnimatedDialog(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { userEvent, within } from "storybook/test";
import {
  AnimatedDialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./AnimatedDialog";
import contract from "./AnimatedDialog.contract.json";

function AnimatedDialogDemo(
  args: React.ComponentProps<typeof AnimatedDialog>,
) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </button>
      <AnimatedDialog {...args} open={open} onOpenChange={setOpen}>
        {args.children}
      </AnimatedDialog>
    </>
  );
}

const dialogBody = (
  <>
    <DialogHeader>
      <DialogTitle>Archive this project?</DialogTitle>
      <DialogDescription>
        You can restore archived work from settings within 30 days.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <button type="button" className="rounded border px-3 py-1 text-sm">
          Cancel
        </button>
      </DialogClose>
      <button type="button" className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground">
        Archive
      </button>
    </DialogFooter>
  </>
);

const defaultArgs = {
  size: "md" as const,
  severity: "warning" as const,
  animationType: "scale" as const,
  children: dialogBody,
};

const meta = {
  title: "${title}",
  component: AnimatedDialog,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    open: { control: "boolean", description: "Controlled open state" },
    onOpenChange: {
      action: "openChange",
      description: "Open state change handler",
    },
    children: { control: false, description: "Dialog body composition" },
    trigger: { control: false, description: "Optional DialogTrigger node" },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
      description: "Dialog width token",
      table: { defaultValue: { summary: "md" } },
    },
    severity: {
      control: "select",
      options: ["default", "success", "warning", "error", "info"],
      description: "Semantic accent color",
      table: { defaultValue: { summary: "default" } },
    },
    animationType: {
      control: "select",
      options: ["scale", "slide", "fade"],
      description: "GSAP entrance animation",
      table: { defaultValue: { summary: "scale" } },
    },
    className: {
      control: "text",
      description: "Dialog content class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof AnimatedDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <AnimatedDialogDemo {...args} />,
};
export const Playground: Story = {
  render: (args) => <AnimatedDialogDemo {...args} />,
};
${playClickButton("Playground")}

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => <AnimatedDialogDemo {...defaultArgs} />,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
  render: (args) => <AnimatedDialogDemo {...args} />,
};
`;
  },

  LocationCard(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { LocationCard } from "./LocationCard";
import contract from "./LocationCard.contract.json";

const defaultArgs = {
  officeName: "Digitaltableteur Helsinki",
  address: ["Mannerheimintie 20 B", "00100 Helsinki", "Finland"],
  email: "mail@digitaltableteur.com",
  variant: "bordered" as const,
};

const meta = {
  title: "${title}",
  component: LocationCard,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    officeName: { control: "text", description: "Location title" },
    address: { control: "object", description: "Address lines inside <address>" },
    email: { control: "text", description: "Contact email" },
    phone: { control: "text", description: "Optional phone number" },
    variant: {
      control: "select",
      options: ["default", "bordered", "elevated"],
      description: "Card surface treatment",
      table: { defaultValue: { summary: "default" } },
    },
    className: {
      control: "text",
      description: "Article wrapper class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof LocationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  name: "Example (contact page)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ maxWidth: 420, width: "100%" }}>
      <LocationCard {...defaultArgs} />
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },

  ValueCard(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sparkle } from "@phosphor-icons/react";
import { ValueCard } from "./ValueCard";
import contract from "./ValueCard.contract.json";

const defaultArgs = {
  icon: <Sparkle weight="duotone" className="size-8 text-primary" aria-hidden />,
  title: "Clarity first",
  description: "Interfaces should explain themselves before they decorate.",
  variant: "bordered" as const,
};

const meta = {
  title: "${title}",
  component: ValueCard,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    icon: { control: false, description: "Decorative leading icon" },
    title: { control: "text", description: "Card heading" },
    description: { control: "text", description: "Supporting copy" },
    variant: {
      control: "select",
      options: ["default", "bordered", "elevated"],
      description: "Card surface treatment",
      table: { defaultValue: { summary: "default" } },
    },
    className: {
      control: "text",
      description: "Article wrapper class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof ValueCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        maxWidth: 720,
      }}
    >
      <ValueCard {...defaultArgs} />
      <ValueCard
        icon={<Sparkle weight="duotone" className="size-8 text-primary" aria-hidden />}
        title="Accessible by default"
        description="Keyboard, contrast, and semantics are part of the definition of done."
        variant="bordered"
      />
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },

  Gallery(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import Gallery from "./Gallery";
import contract from "./Gallery.contract.json";

const sampleImages = [
  {
    src: "https://picsum.photos/800/600?random=1",
    alt: "Dashboard overview",
  },
  {
    src: "https://picsum.photos/800/600?random=2",
    alt: "Component library grid",
  },
  {
    src: "https://picsum.photos/800/600?random=3",
    alt: "Mobile navigation drawer",
  },
];

const defaultArgs = {
  images: sampleImages,
  minColumnWidth: 280,
  gutter: 24,
};

const meta = {
  title: "${title}",
  component: Gallery,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    images: {
      control: false,
      description: "Gallery items with alt text for lightbox names",
    },
    minColumnWidth: {
      control: "number",
      description: "Minimum column width in px",
      table: { defaultValue: { summary: "320" } },
    },
    gutter: {
      control: "number",
      description: "Grid gutter in px",
      table: { defaultValue: { summary: "32" } },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Gallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};
${playTab("Playground")}

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <Gallery
      gutter={24}
      minColumnWidth={280}
      images={sampleImages}
    />
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },

  TextInput(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { TextInput } from "./TextInput";
import contract from "./TextInput.contract.json";

const defaultArgs = {
  placeholder: "Search components…",
  size: "md" as const,
  clearable: true,
  error: false,
};

const meta = {
  title: "${title}",
  component: TextInput,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Input height / typography scale",
      table: { defaultValue: { summary: "md" } },
    },
    startIcon: {
      control: false,
      description: "Leading affordance icon",
    },
    endIcon: {
      control: false,
      description: "Trailing icon slot",
    },
    clearable: {
      control: "boolean",
      description: "Show clear button when value present",
    },
    onClear: {
      action: "clear",
      description: "Clear button handler",
    },
    error: {
      control: "boolean",
      description: "Error border state (message lives in FormField)",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
    disabled: {
      control: "boolean",
      description: "Native disabled state",
    },
    value: {
      control: "text",
      description: "Controlled value",
      table: { disable: true },
    },
    onChange: {
      action: "change",
      description: "Input change handler",
      table: { disable: true },
    },
    className: {
      control: "text",
      description: "Input class names",
      table: { disable: true },
    },
  },
  args: {
    ...defaultArgs,
    startIcon: <MagnifyingGlass className="size-4" aria-hidden />,
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};
${playTab("Playground")}

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ width: 320 }}>
      <TextInput
        placeholder="Search…"
        startIcon={<MagnifyingGlass className="size-4" aria-hidden />}
        clearable
      />
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: {
    ...defaultArgs,
    startIcon: <MagnifyingGlass className="size-4" aria-hidden />,
  },
};
`;
  },

  Layout(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import Layout from "./Layout";
import contract from "./Layout.contract.json";

const sampleMain = (
  <div style={{ padding: "var(--space-layout-24)" }}>
    <h1 className="font-heading text-title-l">Page content</h1>
    <p className="text-sm text-muted-foreground">
      Vite-era shell with skip link, header, main landmark, footer, and chat widget.
    </p>
  </div>
);

const meta = {
  title: "${title}",
  component: Layout,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: {
      control: false,
      description: "Route page content rendered inside <main>",
    },
  },
  args: { children: sampleMain },
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Layout>{args.children}</Layout>,
};
export const Playground: Story = { ...Default };

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <Layout>{sampleMain}</Layout>,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: { children: sampleMain },
  render: (args) => <Layout>{args.children}</Layout>,
};
`;
  },

  NextHeader(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { NextHeader } from "./NextHeader";
import contract from "./NextHeader.contract.json";

const meta = {
  title: "${title}",
  component: NextHeader,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {},
  args: {},
} satisfies Meta<typeof NextHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};
${playTab("Playground")}

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <NextHeader />,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: {},
};
`;
  },

  NextMobileMenu(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { userEvent, within } from "storybook/test";
import { NextMobileMenu } from "./NextMobileMenu";
import contract from "./NextMobileMenu.contract.json";

const navItems = [
  { href: "/", label: "Home", exact: true },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const languages = [
  { code: "en", label: "EN", ariaLabel: "English" },
  { code: "fi", label: "FI", ariaLabel: "Finnish" },
  { code: "sv", label: "SV", ariaLabel: "Swedish" },
];

function MobileMenuDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ minHeight: 480 }}>
      <button type="button" onClick={() => setOpen(true)}>
        Open menu
      </button>
      <NextMobileMenu
        isOpen={open}
        onClose={() => setOpen(false)}
        navItems={navItems}
        languages={languages}
        id="story-mobile-menu"
      />
    </div>
  );
}

const defaultArgs = {
  isOpen: true,
  navItems,
  languages,
  id: "story-mobile-menu",
};

const meta = {
  title: "${title}",
  component: NextMobileMenu,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    isOpen: { control: "boolean", description: "Drawer open state" },
    onClose: { action: "close", description: "Close handler" },
    onNavigate: { action: "navigate", description: "Navigate handler" },
    id: { control: "text", description: "Dialog id for aria-controls" },
    navItems: { control: false, description: "Mobile navigation links" },
    languages: { control: false, description: "Language switcher options" },
  },
  args: defaultArgs,
} satisfies Meta<typeof NextMobileMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <MobileMenuDemo />,
};
export const Playground: Story = {
  render: () => <MobileMenuDemo />,
};
${playTab("Playground")}

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <MobileMenuDemo />,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  render: () => <MobileMenuDemo />,
};
`;
  },

  SkillsGrid(title) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { Code, FigmaLogo, PenNib } from "@phosphor-icons/react";
import { SkillsGrid } from "./SkillsGrid";
import contract from "./SkillsGrid.contract.json";

const sampleSkills = [
  {
    icon: <FigmaLogo weight="duotone" className="size-8" aria-hidden />,
    name: "Figma",
    description: "Design system source of truth",
  },
  {
    icon: <Code weight="duotone" className="size-8" aria-hidden />,
    name: "React",
    description: "Component implementation",
  },
  {
    icon: <PenNib weight="duotone" className="size-8" aria-hidden />,
    name: "Sketch",
    description: "Legacy library migration",
  },
];

const defaultArgs = {
  skills: sampleSkills,
  columns: 6 as const,
  showCategories: false,
};

const meta = {
  title: "${title}",
  component: SkillsGrid,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    skills: { control: false, description: "Skill logos with alt names" },
    showCategories: {
      control: "boolean",
      description: "Group skills under category headings",
    },
    columns: {
      control: "select",
      options: [4, 6, 8],
      description: "Grid column count",
      table: { defaultValue: { summary: "6" } },
    },
    className: {
      control: "text",
      description: "Section wrapper class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof SkillsGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <SkillsGrid skills={sampleSkills} columns={6} showCategories={false} />
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
`;
  },
};

// --- molecules & patterns (continued in part 2 via append) ---

export function getStorySource(name, title) {
  const builder = STORY_BUILDERS[name];
  return builder ? builder(title) : null;
}
