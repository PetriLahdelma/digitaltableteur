import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DocSection,
  FoundationPage,
  getCatalogGroups,
  GridColumnDemo,
  TokenTable,
} from "../doc";

const meta = {
  title: "Foundations/Layout",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function LayoutFoundations() {
  const layoutTokens = getCatalogGroups("layout").flatMap((g) => g.tokens);

  return (
    <FoundationPage
      title="Layout"
      lead="Breakpoints, container widths, column counts, and page margins — reference tokens for media queries and @dt Grid, FlexBox, Container."
    >
      <DocSection
        title="Breakpoints"
        description="Use in @media (min-width: …) — values are documented references; match production breakpoints exactly."
      >
        <TokenTable
          tokens={layoutTokens.filter((t) => t.name.startsWith("--breakpoint"))}
        />
      </DocSection>

      <DocSection
        title="Containers"
        description="Max inline sizes for content columns."
      >
        <TokenTable
          tokens={layoutTokens.filter((t) => t.name.startsWith("--container"))}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-layout-8)",
            marginBlockStart: "var(--space-layout-16)",
          }}
        >
          {["sm", "md", "lg", "xl"].map((size) => (
            <div
              key={size}
              style={{
                background: "var(--color-light-bg)",
                border: "1px dashed var(--color-border)",
                inlineSize: `var(--container-${size})`,
                maxInlineSize: "100%",
                padding: "var(--space-internal-8)",
                fontSize: "var(--font-size-text-s)",
              }}
            >
              --container-{size}
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection
        title="12-column grid"
        description="Desktop column count from --grid-columns-desktop."
      >
        <GridColumnDemo />
      </DocSection>

      <DocSection
        title="Grid system"
        description="Column counts and responsive gaps."
      >
        <TokenTable
          tokens={layoutTokens.filter(
            (t) =>
              t.name.startsWith("--grid") ||
              t.name.startsWith("--page-margin") ||
              t.name.startsWith("--rhythm"),
          )}
        />
      </DocSection>
    </FoundationPage>
  );
}

export const Overview: Story = { render: () => <LayoutFoundations /> };
export const GridAndBreakpoints: Story = {
  render: () => <LayoutFoundations />,
};
