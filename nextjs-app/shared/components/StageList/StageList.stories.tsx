import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import StageList, {
  type StageListItem,
  type StageListPhase,
  type StageListStage,
} from "@dt/StageList";
import contract from "./StageList.contract.json";
import storyStyles from "./StageList.stories.module.css";

/* The production use: "Who to call and when" in Plausible Accessibility. */
const accessibilityStages: StageListStage[] = [
  { id: "scoping", label: "Scoping", phrase: "scoping" },
  { id: "drafting", label: "Drafting", phrase: "drafting" },
  { id: "design-review", label: "Design review", phrase: "design review" },
  { id: "prototype", label: "Prototype", phrase: "prototype" },
  { id: "release-candidate", label: "Release candidate", phrase: "release candidate" },
  { id: "before-publishing", label: "Before publishing", phrase: "before publishing" },
  { id: "every-release", label: "Every release", phrase: "every release" },
  { id: "before-the-claim", label: "Before the claim", phrase: "before the claim" },
];

const accessibilityPhases: StageListPhase[] = [
  {
    label: "Before you build",
    stages: ["scoping", "drafting", "design-review", "prototype"],
  },
  { label: "Before you ship", stages: ["release-candidate", "before-publishing"] },
  {
    label: "Every release and every claim",
    stages: ["every-release", "before-the-claim"],
  },
];

const accessibilityItems: StageListItem[] = [
  {
    id: "custom-widgets",
    title: "Custom widgets: date pickers, comboboxes, drag and drop, modals",
    lead: "A specialist and daily keyboard, switch, voice control and screen reader users",
    description: "Focus order and announcements only show up in operation. Give them the interaction pattern, a single-pointer alternative to dragging and the devices you support.",
    stages: [
      "release-candidate"
    ],
    tag: "design system team"
  },
  {
    id: "forms-with-error-handling",
    title: "Forms with error handling",
    lead: "Screen reader, voice control and magnifier users",
    description: "Errors shown only in colour pass a structure check. Give them a task that triggers every error state.",
    stages: [
      "release-candidate"
    ],
    tag: "design system team"
  },
  {
    id: "zoom-reflow-and-contrast-themes",
    title: "Zoom, reflow and contrast themes",
    lead: "A specialist and low-vision users who magnify or use high-contrast modes",
    description: "Tools render at one viewport and one colour scheme. Give them 400% zoom and 320px targets, forced-colours and high-contrast modes.",
    stages: [
      "every-release"
    ],
    tag: "design system team"
  },
  {
    id: "motion-and-animation",
    title: "Motion and animation",
    lead: "A specialist and people with vestibular disorders",
    description: "Tools can't judge vestibular impact. Give them an inventory of animations and the reduced-motion behaviour.",
    stages: [
      "design-review"
    ],
    tag: "design system team"
  },
  {
    id: "charts-maps-and-diagrams",
    title: "Charts, maps and diagrams",
    lead: "A specialist and screen reader users from the first prototype",
    description: "Tools confirm alt text exists, not that it carries the point. Give them the chart's purpose in one sentence, the data and the palette.",
    stages: [
      "design-review"
    ],
    tag: "product team"
  },
  {
    id: "ai-chat-and-other-streaming-interfaces",
    title: "AI chat and other streaming interfaces",
    lead: "A specialist to design the announcements, daily users of at least two screen readers and magnifier users",
    description: "Live regions behave differently with text that changes as it arrives. Give them tasks to complete, not screens to inspect.",
    stages: [
      "prototype",
      "release-candidate"
    ],
    tag: "product team"
  },
  {
    id: "login-signup-and-verification",
    title: "Login, signup and verification",
    lead: "A specialist and people with memory and attention disabilities",
    description: "Unauthenticated scans stop at the login; cognitive tests need people. Give them test accounts, the two-factor path and the time limits.",
    stages: [
      "design-review",
      "release-candidate"
    ],
    tag: "product team"
  },
  {
    id: "native-mobile-apps",
    title: "Native mobile apps",
    lead: "A mobile accessibility specialist and daily TalkBack and VoiceOver users",
    description: "Web scanners don't run there; platform settings vary. Give them builds, supported OS versions and text-size targets.",
    stages: [
      "release-candidate"
    ],
    tag: "product team"
  },
  {
    id: "captions-for-technical-legal-or-medical-media",
    title: "Captions for technical, legal or medical media",
    lead: "A professional captioner and deaf and hard-of-hearing reviewers",
    description: "Accuracy scores ignore speaker changes, sounds and the terms that matter. Give them a glossary and speaker names.",
    stages: [
      "before-publishing"
    ],
    tag: "content team"
  },
  {
    id: "audio-description-for-video",
    title: "Audio description for video",
    lead: "A describer and blind reviewers",
    description: "Only a person knows which visuals carry the meaning. Give them the script and the visuals that matter.",
    stages: [
      "before-publishing"
    ],
    tag: "content team"
  },
  {
    id: "content-in-sign-language",
    title: "Content in sign language",
    lead: "Deaf signers and qualified interpreters (in Finland, through Kuurojen Liitto)",
    description: "Signed languages have their own grammar; avatars don't carry it. Give them which sign language, the source script and the budget.",
    stages: [
      "scoping"
    ],
    tag: "content team"
  },
  {
    id: "onboarding-and-plain-language-content",
    title: "Onboarding and plain-language content",
    lead: "People with cognitive and learning disabilities and a plain-language editor (in Finland, Selkokeskus)",
    description: "Readability formulas reward short sentences, not clear ones. Give them the decisions the reader has to make.",
    stages: [
      "drafting"
    ],
    tag: "content team"
  },
  {
    id: "documents-and-pdfs",
    title: "Documents and PDFs",
    lead: "A document remediation specialist and screen reader users",
    description: "Tags can exist and still be in the wrong reading order. Give them the source files, not only the exports.",
    stages: [
      "before-publishing"
    ],
    tag: "content team"
  },
  {
    id: "before-any-conformance-claim",
    title: "Before any conformance claim",
    lead: "An independent specialist running a WCAG-EM style evaluation",
    description: "A green report isn't a conformance evaluation. Give them the scope, the sample, the evidence you have and your accessibility statement.",
    stages: [
      "before-the-claim"
    ],
    tag: "leadership"
  }
];

/* A short launch plan for the playground and the variant stories. */
const launchStages: StageListStage[] = [
  { id: "plan", label: "Plan", phrase: "planning" },
  { id: "build", label: "Build", phrase: "build" },
  { id: "launch", label: "Launch", phrase: "launch" },
];

const launchPhases: StageListPhase[] = [
  { label: "Before launch", stages: ["plan", "build"] },
  { label: "At launch", stages: ["launch"] },
];

const launchItems: StageListItem[] = [
  {
    id: "research",
    title: "User research",
    lead: "Recruit five people who match the main audience",
    description: "Book them two weeks ahead and share the tasks, not the screens.",
    stages: ["plan"],
    tag: "Research",
  },
  {
    id: "content",
    title: "Content review",
    lead: "A content designer reads every screen aloud",
    description: "Plain words catch the gaps a style guide misses.",
    stages: ["build", "launch"],
    tag: "Content",
  },
  {
    id: "support",
    title: "Support briefing",
    lead: "Walk the support team through what changed",
    description: "Give them the release notes and the three likeliest questions.",
    stages: ["launch"],
    tag: "Support",
  },
];

const defaultArgs = {
  items: launchItems,
  stages: launchStages,
  phases: launchPhases,
  variant: "sheet" as const,
  headingLevel: 3 as const,
  storageKey: "",
  indexLabel: "",
};

const meta = {
  title: "Content/StageList",
  component: StageList,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1897-302",
    },
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: defaultArgs,
  decorators: [
    (Story) => (
      <div className={storyStyles.column}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StageList>;

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

export const Rail: Story = {
  tags: ["example"],
  args: { variant: "rail" },
  parameters: {
    docs: {
      description: {
        story:
          "A vertical timeline: each stage is a marker on the rail with its entries beside it. Reads best when stages are few and the order is the point.",
      },
    },
  },
};

export const Index: Story = {
  tags: ["example"],
  args: { variant: "index" },
  parameters: {
    docs: {
      description: {
        story:
          "Two passes: a linked overview lists each stage's entries (an entry appears under every stage it belongs to), then every entry in full. The overview links jump to the entry.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getAllByRole("link")[0]!;
    first.focus();
    await userEvent.keyboard("{Enter}");
    const target = canvasElement.querySelector(first.getAttribute("href")!);
    await expect(target).not.toBeNull();
  },
};

export const Checklist: Story = {
  tags: ["example"],
  args: { variant: "checklist" },
  parameters: {
    docs: {
      description: {
        story:
          "A tick box per entry with a running count per group. Pass storageKey to keep ticks between visits in the reader's own browser.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole("checkbox", { name: launchItems[0]!.lead });
    box.focus();
    await userEvent.keyboard(" ");
    await expect(box).toBeChecked();
    await expect(canvas.getByText("1 of 2 done")).toBeInTheDocument();
    await userEvent.keyboard(" ");
    await expect(box).not.toBeChecked();
  },
};

export const Cards: Story = {
  tags: ["example"],
  args: { variant: "cards" },
  parameters: {
    docs: {
      description: {
        story:
          "A card per entry, grouped by phase, with the stages as a badge. Two columns where there is room, one on narrow screens.",
      },
    },
  },
};

export const WithoutPhases: Story = {
  tags: ["example"],
  args: { phases: undefined },
  parameters: {
    docs: {
      description: {
        story:
          "Without phases the stages are the top headings. Use phases when there are more than about five stages.",
      },
    },
  },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  args: {
    items: accessibilityItems,
    stages: accessibilityStages,
    phases: accessibilityPhases,
  },
  parameters: {
    docs: {
      description: {
        story:
          "In production: \"Who to call and when\" in the Plausible Accessibility article. Each entry leads with who to call; the stage stays pinned beside its entries while the reader scrolls.",
      },
    },
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: (args) => (
    <div className={storyStyles.stack}>
      {(["sheet", "rail", "index", "checklist", "cards"] as const).map(
        (variant) => (
          <StageList key={variant} {...args} variant={variant} />
        ),
      )}
    </div>
  ),
};
