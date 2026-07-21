import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  quote: string;
  name: string;
  title: string;
  company: string;
  linkedinUrl: string;
  avatarUrl: string;
};

// No width Stage: the React stories render the bare full-width testimonial
// on the padded canvas, and the rendered-parity gate compares them 1:1.
function Testimonial(args: Args) {
  return (
    <NativeElement
      tagName="dt-testimonial"
      attributes={{
        quote: args.quote,
        name: args.name,
        "person-title": args.title,
        company: args.company,
        "linkedin-url": args.linkedinUrl,
        "avatar-url": args.avatarUrl,
      }}
    />
  );
}

const defaults: Args = {
  quote:
    "Working with Digitaltableteur was an exceptional experience. Petri delivered exactly what we needed with incredible attention to detail and professionalism.",
  name: "Sarah Johnson",
  title: "Product Manager",
  company: "TechCorp",
  linkedinUrl: "https://linkedin.com/in/sarahjohnson",
  avatarUrl: "",
};

const meta = {
  title: "Web Components/Site/Testimonial",
  component: Testimonial,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: { description: { component: "Native dt-testimonial element." } },
  },
  args: defaults,
} satisfies Meta<typeof Testimonial>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-testimonial") };
export const WithAvatar: Story = {
  args: {
    quote:
      "The design system transformed our product line and exceeded expectations.",
    name: "Marcus Chen",
    title: "Design Director",
    company: "InnovateNow",
    avatarUrl: "/pete.png",
  },
};
export const LongTestimonial: Story = {
  args: {
    quote:
      "Digitaltableteur brought expertise and creativity to the project. The combination of technical skill and design vision resulted in a product that met our requirements and significantly improved the user experience.",
    name: "Elena Korhonen",
    title: "Chief Technology Officer",
    company: "Nordic Solutions",
  },
};
export const WithoutLinkedIn: Story = {
  args: {
    quote: "Outstanding work on our rebranding project.",
    name: "David Wilson",
    title: "CEO",
    company: "StartupHub",
    linkedinUrl: "",
  },
};
export const Playground: Story = { tags: ["beta-matrix"] };
export const Example: Story = {
  tags: ["beta-matrix"], ...exampleStory };
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
