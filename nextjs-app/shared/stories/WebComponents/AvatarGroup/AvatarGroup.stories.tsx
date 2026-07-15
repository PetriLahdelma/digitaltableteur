import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stack,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

const PEOPLE = [
  "Aino Virtanen",
  "Bo Lindqvist",
  "Carla Mendes",
  "Deniz Aydin",
  "Eero Salmi",
  "Freja Holm",
];

function Avatars({ count = 6, size = "2.5rem" }) {
  return PEOPLE.slice(0, count).map((name) => (
    <NativeElement
      key={name}
      tagName="dt-avatar"
      attributes={{ name, variant: "initials", size }}
    />
  ));
}

type Args = { ariaLabel: string; max: number; size: "sm" | "md" | "lg" };
function NativeAvatarGroup({ ariaLabel, ...args }: Args) {
  return (
    <NativeElement
      tagName="dt-avatar-group"
      attributes={{ ...args, "aria-label": ariaLabel }}
    >
      <Avatars />
    </NativeElement>
  );
}

const meta = {
  title: "Web Components/Content/AvatarGroup",
  component: NativeAvatarGroup,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    contractStatus: "beta",
    docs: {
      description: { component: "Native overlapping dt-avatar cluster." },
    },
  },
  args: { ariaLabel: "Project members", max: 4, size: "md" },
  argTypes: { size: { control: "radio", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof NativeAvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: assertNative("dt-avatar-group") };
export const Playground: Story = {};
export const NoOverflow: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement
      tagName="dt-avatar-group"
      attributes={{ "aria-label": "Reviewers", max: 4 }}
    >
      <Avatars count={3} />
    </NativeElement>
  ),
};
export const Sizes: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      {(
        [
          ["sm", "2rem"],
          ["md", "2.5rem"],
          ["lg", "3rem"],
        ] as const
      ).map(([size, avatarSize]) => (
        <NativeElement
          key={size}
          tagName="dt-avatar-group"
          attributes={{ "aria-label": `${size} team`, size, max: 3 }}
        >
          <Avatars count={5} size={avatarSize} />
        </NativeElement>
      ))}
    </Stack>
  ),
};
export const WithLabel: Story = {
  ...exampleStory,
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <NativeAvatarGroup ariaLabel="Contributors" max={3} size="md" />
      <span>6 contributors</span>
    </div>
  ),
};
export const Example: Story = { ...exampleStory };
export const ForcedColors: Story = { ...forcedColorsStory };
