import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DocSection,
  FoundationPage,
  getCatalogGroups,
  SpaceScale,
  TokenTable,
} from "../doc";

const meta = {
  title: "Foundations/Space",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const LAYOUT_KEYS = [
  "0",
  "4",
  "6",
  "8",
  "16",
  "24",
  "32",
  "40",
  "48",
  "64",
  "80",
  "96",
  "120",
  "160",
] as const;
const INTERNAL_KEYS = [
  "0",
  "2",
  "4",
  "6",
  "8",
  "12",
  "16",
  "24",
  "32",
] as const;

function SpaceFoundations() {
  const layoutTokens =
    getCatalogGroups("space", "Layout (margin & gap)")[0]?.tokens ?? [];
  const internalTokens =
    getCatalogGroups("space", "Internal (padding)")[0]?.tokens ?? [];
  const layoutGrid = getCatalogGroups("layout")
    .flatMap((g) => g.tokens)
    .filter(
      (t) => t.name.includes("grid-gap") || t.name.includes("page-margin"),
    );

  return (
    <FoundationPage
      title="Space"
      lead="Two-axis spacing: layout tokens for margins, gaps, and section rhythm; internal tokens for padding inside components. All values are rem-based and align to an 8px rhythm."
    >
      <DocSection
        title="Layout scale"
        description="Use for margin-block, gap, and grid gutters."
      >
        <SpaceScale prefix="space-layout" keys={LAYOUT_KEYS} />
        <TokenTable tokens={layoutTokens} />
      </DocSection>

      <DocSection
        title="Internal scale"
        description="Use for padding-inline, padding-block, and tight control gaps."
      >
        <SpaceScale prefix="space-internal" keys={INTERNAL_KEYS} />
        <TokenTable tokens={internalTokens} />
      </DocSection>

      <DocSection
        title="Grid & page margins"
        description="Responsive spacing aliases wired to layout tokens."
      >
        <TokenTable tokens={layoutGrid} />
      </DocSection>
    </FoundationPage>
  );
}

export const Overview: Story = { render: () => <SpaceFoundations /> };
export const LayoutScale: Story = {
  render: () => (
    <FoundationPage title="Layout spacing" lead="Margins and gaps.">
      <DocSection title="Layout">
        <SpaceScale prefix="space-layout" keys={LAYOUT_KEYS} />
      </DocSection>
    </FoundationPage>
  ),
};
