import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import portrait from "../../../assets/images/pete-vault-boy.jpg";
import {
  NativeElement,
  Stage,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  imageSrc: string;
  imageAlt: string;
  name: string;
  title: string;
  email: string;
  linkedinUrl: string;
  linkedinLabel: string;
  githubUrl: string;
  githubLabel: string;
  facebookUrl: string;
  twitterUrl: string;
  dribbbleUrl: string;
  mediumUrl: string;
  instagramUrl: string;
  substackUrl: string;
  imageLoading: "lazy" | "eager";
  imageDecoding: "auto" | "sync" | "async";
  loading: boolean;
};

function PersonCard(args: Args) {
  return (
    <NativeElement
      tagName="dt-person-card"
      attributes={{
        "image-src": args.imageSrc,
        "image-alt": args.imageAlt,
        name: args.name,
        "person-title": args.title,
        email: args.email,
        "linkedin-url": args.linkedinUrl,
        "linkedin-label": args.linkedinLabel,
        "github-url": args.githubUrl,
        "github-label": args.githubLabel,
        "facebook-url": args.facebookUrl,
        "twitter-url": args.twitterUrl,
        "dribbble-url": args.dribbbleUrl,
        "medium-url": args.mediumUrl,
        "instagram-url": args.instagramUrl,
        "substack-url": args.substackUrl,
        "image-loading": args.imageLoading,
        "image-decoding": args.imageDecoding,
        loading: args.loading,
      }}
    />
  );
}

const defaults: Args = {
  imageSrc: portrait,
  imageAlt: "Portrait of Petri Lahdelma",
  name: "Petri Lahdelma",
  title: "Digital Designer & Developer",
  email: "petri@digitaltableteur.com",
  linkedinUrl: "https://linkedin.com/in/petrilahdelma",
  linkedinLabel: "Connect on LinkedIn",
  githubUrl: "https://github.com/petrilahdelma",
  githubLabel: "View GitHub profile",
  facebookUrl: "",
  twitterUrl: "https://twitter.com/petrilahdelma",
  dribbbleUrl: "",
  mediumUrl: "https://medium.com/digitaltableteur",
  instagramUrl: "",
  substackUrl: "",
  imageLoading: "lazy",
  imageDecoding: "async",
  loading: false,
};

const meta = {
  title: "Web Components/Site/PersonCard",
  component: PersonCard,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: { description: { component: "Native dt-person-card element." } },
  },
  args: defaults,
  argTypes: {
    imageLoading: { control: "inline-radio", options: ["lazy", "eager"] },
    imageDecoding: {
      control: "inline-radio",
      options: ["auto", "sync", "async"],
    },
  },
} satisfies Meta<typeof PersonCard>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-person-card") };
export const WithoutSocialMedia: Story = {
  args: {
    linkedinUrl: "",
    githubUrl: "",
    twitterUrl: "",
    mediumUrl: "",
  },
};
export const Loading: Story = { args: { loading: true } };
export const AllSocialMedia: Story = {
  args: {
    facebookUrl: "https://facebook.com/petrilahdelma",
    dribbbleUrl: "https://dribbble.com/petrilahdelma",
    instagramUrl: "https://instagram.com/petrilahdelma",
    substackUrl: "https://petrilahdelma.substack.com",
  },
};
export const WithCustomClass: Story = {
  render: (args) => (
    <Stage width="40rem">
      <div
        style={
          {
            "--color-light-bg": "var(--color-primary)",
            "--color-primary": "var(--color-white)",
          } as CSSProperties
        }
      >
        <PersonCard {...args} />
      </div>
    </Stage>
  ),
};
export const LongTitle: Story = {
  args: {
    name: "Dr. Alexandra Catherine Thompson-Williams",
    title: "Senior Principal Software Engineering Manager",
    email: "alexandra.thompson-williams@company.com",
  },
};
export const Playground: Story = {
  args: {
    facebookUrl: "https://facebook.com/petrilahdelma",
    dribbbleUrl: "https://dribbble.com/petrilahdelma",
    instagramUrl: "https://instagram.com/petrilahdelma",
    substackUrl: "https://petrilahdelma.substack.com",
  },
};
export const Example: Story = { ...exampleStory };
export const ForcedColors: Story = { ...forcedColorsStory };
