import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DocSection,
  FoundationPage,
  getCatalogGroups,
  MotionDemo,
  TokenTable,
} from "../doc";

const meta = {
  title: "Foundations/Motion",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function MotionFoundations() {
  const duration =
    getCatalogGroups("motion").find((g) =>
      g.tokens[0]?.name.startsWith("--duration"),
    )?.tokens ?? [];
  const easing =
    getCatalogGroups("motion").find((g) =>
      g.tokens[0]?.name.startsWith("--ease"),
    )?.tokens ?? [];
  const other = getCatalogGroups("motion")
    .flatMap((g) => g.tokens)
    .filter(
      (t) =>
        t.name.startsWith("--stagger") ||
        t.name.startsWith("--motion-distance"),
    );

  return (
    <FoundationPage
      title="Motion"
      lead="Duration, easing, stagger, and distance tokens for GSAP and CSS transitions. Respect prefers-reduced-motion in components; these are defaults for enhanced experiences."
    >
      <DocSection
        title="Duration"
        description="From instant micro-feedback to slowest hero reveals."
      >
        <TokenTable tokens={duration} />
        <MotionDemo
          label="Normal"
          duration="var(--duration-normal)"
          easing="var(--ease-out-expo)"
        />
        <MotionDemo
          label="Slow"
          duration="var(--duration-slow)"
          easing="var(--ease-out-quart)"
        />
      </DocSection>

      <DocSection
        title="Easing"
        description="Studio-tuned cubic-bezier curves — prefer --ease-out-expo for entrances."
      >
        <TokenTable tokens={easing} />
      </DocSection>

      <DocSection
        title="Stagger & distance"
        description="Choreography helpers for lists and scroll reveals."
      >
        <TokenTable tokens={other} />
      </DocSection>
    </FoundationPage>
  );
}

export const Overview: Story = { render: () => <MotionFoundations /> };
export const EasingPlayground: Story = { render: () => <MotionFoundations /> };
