import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

const categories = [
  { value: "all", label: "All" },
  { value: "design", label: "Design" },
  { value: "accessibility", label: "Accessibility" },
  { value: "engineering", label: "Engineering" },
];

type Args = {
  activeCategory: string;
  size: "sm" | "md" | "lg";
  variant: "pills" | "underline" | "minimal";
};
function CategoryFilter(args: Args) {
  return (
    <NativeElement
      tagName="dt-category-filter"
      attributes={{
        categories: JSON.stringify(categories),
        "active-category": args.activeCategory,
        size: args.size,
        variant: args.variant,
        "aria-label": "Filter projects by category",
      }}
    />
  );
}

const meta = {
  title: "Web Components/Site/CategoryFilter",
  component: CategoryFilter,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: { component: "Native dt-category-filter custom element." },
    },
  },
  args: { activeCategory: "all", size: "md", variant: "pills" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: {
      control: "inline-radio",
      options: ["pills", "underline", "minimal"],
    },
  },
} satisfies Meta<typeof CategoryFilter>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-category-filter") };
export const Playground: Story = {};
export const Example: Story = {
  ...exampleStory,
  args: { activeCategory: "design" },
};
export const ForcedColors: Story = { ...forcedColorsStory };
