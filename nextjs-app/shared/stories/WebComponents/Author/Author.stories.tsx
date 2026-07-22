import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stack,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  name: string;
  imageUrl: string;
  size: string;
  profileUrl: string;
};

function Author(args: Args) {
  return (
    <NativeElement
      tagName="dt-author"
      attributes={{
        name: args.name,
        "image-url": args.imageUrl,
        size: args.size,
        "profile-url": args.profileUrl,
      }}
    />
  );
}

const defaults: Args = {
  name: "Petri Lahdelma",
  imageUrl: "/pete.png",
  size: "2.5rem",
  profileUrl: "",
};

const meta = {
  title: "Web Components/Content/Author",
  component: Author,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: { description: { component: "Native dt-author byline." } },
  },
  args: defaults,
} satisfies Meta<typeof Author>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-author") };
export const WithProfileLink: Story = {
  args: { profileUrl: "/authors/petri-lahdelma" },
};
export const SmallSize: Story = {
  args: { name: "Anna Virtanen", size: "1.5rem", profileUrl: "/authors/anna" },
};
export const LargeSize: Story = {
  args: { name: "Mika Korhonen", size: "4rem", profileUrl: "/authors/mika" },
};
export const MultipleAuthors: Story = {
  render: () => (
    <Stack>
      {[
        ["Petri Lahdelma", "/authors/petri"],
        ["Anna Virtanen", "/authors/anna"],
        ["Mika Korhonen", "/authors/mika"],
      ].map(([name, profileUrl]) => (
        <Author key={name} {...defaults} name={name} profileUrl={profileUrl} />
      ))}
    </Stack>
  ),
};
export const NoProfileLink: Story = { args: { name: "Guest Author" } };
export const LongName: Story = {
  args: {
    name: "Dr. Alexander Wellington-Worthington III",
    profileUrl: "/authors/alexander-wellington-worthington",
  },
};
export const CustomSize: Story = {
  args: { name: "Sarah Chen", size: "3.5rem" },
};
export const BlogPostByline: Story = {
  args: { profileUrl: "/authors/petri-lahdelma" },
};
export const CardFooter: Story = {
  args: { name: "Emma Lindström", size: "2rem", profileUrl: "/authors/emma" },
};
export const InArticleContext: Story = {
  render: () => (
    <article style={{ maxWidth: "42rem" }}>
      <h1>Building modern web applications</h1>
      <Author {...defaults} profileUrl="/authors/petri-lahdelma" />
      <p>Article metadata stays compact and clearly attributed.</p>
    </article>
  ),
};
export const Playground: Story = {
  tags: ["beta-matrix"], args: { size: "3rem" } };
export const Example: Story = {
  tags: ["beta-matrix"], ...exampleStory };
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
