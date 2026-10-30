import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { FieldShell, fieldDescribedBy, fieldStatusClass } from "./FieldShell";
import contract from "./FieldShell.contract.json";
import TextInput from "@dt/TextInput";
import TextArea from "@dt/TextArea";
import Select from "@dt/Select";
import { Combobox } from "@dt/Combobox";
import { MultiCombobox } from "@dt/MultiCombobox";
import PhoneInput from "@dt/PhoneInput";
import fieldStyles from "../../styles/field.module.css";
import inputStyles from "../TextInput/TextInput.module.css";
import styles from "./FieldShell.stories.module.css";

const meta = {
  title: "Forms/FieldShell",
  component: FieldShell,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  args: {
    controlId: "shell-company",
    label: "Company",
    helperText: "As it reads on your invoices",
    status: undefined,
    statusMessage: "",
    required: false,
    disabled: false,
    hideLabel: false,
    children: null,
  },
  argTypes: {
    controlId: { table: { disable: true } },
    children: { table: { disable: true } },
    actions: { table: { disable: true } },
    className: { table: { disable: true } },
    label: { control: "text", description: "Visible field label; stays the control's accessible name when hidden", table: { category: "Content" } },
    helperText: { control: "text", description: "Supporting copy under the control, after the status message", table: { category: "Content" } },
    statusMessage: { control: "text", description: "Message under the control, styled and announced for the status", table: { category: "Content" } },
    status: {
      control: "radio",
      options: [undefined, "error", "warning", "success"],
      description: "Colours the control border and styles the status message.",
      table: { category: "Appearance" },
    },
    required: { control: "boolean", description: "Shows the required marker on the label", table: { category: "Behavior", defaultValue: { summary: "false" } } },
    disabled: { control: "boolean", description: "Dims the label and disables every action", table: { category: "Behavior", defaultValue: { summary: "false" } } },
    hideLabel: { control: "boolean", description: "Visually hides the label; with no actions the label row takes no room", table: { category: "Accessibility", defaultValue: { summary: "false" } } },
  },
  render: (args) => (
    <FieldShell
      {...args}
      statusMessage={args.statusMessage || undefined}
      actions={[{ label: "Paste", icon: "clipboard", onClick: () => undefined }]}
    >
      <input
        id={args.controlId}
        disabled={args.disabled}
        className={[inputStyles.input, fieldStatusClass(args.status)].filter(Boolean).join(" ")}
        aria-invalid={args.status === "error" || undefined}
        aria-describedby={fieldDescribedBy(args.controlId, {
          statusMessage: args.statusMessage || undefined,
          helperText: args.helperText,
        })}
      />
    </FieldShell>
  ),
} satisfies Meta<typeof FieldShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

const services = [
  { value: "audit", label: "Design system audit" },
  { value: "build", label: "Component build" },
  { value: "training", label: "Team training" },
  { value: "retainer", label: "Ongoing support" },
];

function ExampleForm() {
  const [timeline, setTimeline] = useState("");
  const [picked, setPicked] = useState<string[]>(["audit"]);
  const [brief, setBrief] = useState("");
  return (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
      <div className={styles.pair}>
        <TextInput
          type="email"
          label="Email"
          defaultValue="anna@example.com"
          status="success"
          statusMessage="Address verified"
          actions={[{ label: "Paste", icon: "clipboard", onClick: () => undefined }]}
        />
        <PhoneInput label="Phone" helperText="Only if you prefer a call" />
      </div>
      <Select
        label="Company size"
        options={[
          { value: "", label: "Choose a size" },
          { value: "small", label: "Up to 50 people" },
          { value: "medium", label: "50 to 500 people" },
          { value: "large", label: "Over 500 people" },
        ]}
        error="Choose a company size"
        actions={[
          {
            label: "Size options",
            items: [
              { label: "Use the size from last time", onSelect: () => undefined },
              { label: "Reset", onSelect: () => undefined },
            ],
          },
        ]}
      />
      <div className={styles.pair}>
        <Combobox
          label="Timeline"
          placeholder="Pick a start"
          options={[
            { value: "now", label: "This month" },
            { value: "quarter", label: "This quarter" },
            { value: "later", label: "Later this year" },
          ]}
          value={timeline}
          onValueChange={setTimeline}
          status="warning"
          statusMessage="The next free slot is in December"
        />
        <MultiCombobox
          label="Services"
          options={services}
          value={picked}
          onValueChange={setPicked}
          helperText="Pick all that apply"
          actions={[
            {
              label: "Service options",
              items: [
                { label: "Select all", onSelect: () => setPicked(services.map((s) => s.value)) },
                { label: "Clear selection", onSelect: () => setPicked([]) },
              ],
            },
          ]}
        />
      </div>
      <TextArea
        label="Brief"
        value={brief}
        onChange={setBrief}
        helperText="What should change, and by when"
        actions={[
          {
            label: "Insert a template",
            icon: "file-text",
            items: [
              { label: "Audit brief", onSelect: () => setBrief("Goal:\nCurrent state:\nDeadline:") },
              { label: "Build brief", onSelect: () => setBrief("Component:\nWhere it is used:\nDeadline:") },
            ],
          },
          {
            label: "Brief options",
            items: [
              { label: "Copy text", onSelect: () => void navigator.clipboard?.writeText(brief) },
              { label: "Clear", onSelect: () => setBrief(""), tone: "destructive" },
            ],
          },
        ]}
      />
    </form>
  );
}

export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Every DS field on one shell: actions in the label row, then the status message and helper line. Fields side by side keep their controls level whether or not they carry actions.",
      },
    },
  },
  render: () => <ExampleForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent("Choose a company size");
    const email = canvas.getByRole("textbox", { name: "Email" });
    const phone = canvas.getByRole("textbox", { name: "Phone" });
    await expect(Math.round(email.getBoundingClientRect().top)).toBe(
      Math.round(phone.closest(`.${fieldStyles.field}`)!.getBoundingClientRect().top),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Insert a template" }));
    await expect(within(document.body).getAllByRole("menuitem")).toHaveLength(2);
    await userEvent.keyboard("{Escape}");
    // Escape hands keyboard focus back to the trigger once the menu has
    // finished closing; wait for that, then release it so the story rests
    // without a focus ring nobody asked for.
    await waitFor(() =>
      expect(within(document.body).queryAllByRole("menuitem")).toHaveLength(0),
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(canvas.getByRole("button", { name: "Insert a template" })),
    );
    (document.activeElement as HTMLElement).blur();
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  args: { status: "error", statusMessage: "Enter the company name" },
  globals: { forcedColors: "active" },
  parameters: {
    docs: { description: { story: "Forced-colors verification story." } },
  },
};
