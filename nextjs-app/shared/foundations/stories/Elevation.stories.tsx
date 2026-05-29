import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DocSection,
  FoundationPage,
  getCatalogGroups,
  TokenTable,
} from "../doc";

const meta = {
  title: "Foundations/Elevation",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => {
    const tokens = getCatalogGroups("elevation").flatMap((g) => g.tokens);
    return (
      <FoundationPage
        title="Elevation"
        lead="Overlays and shadows for modals and media captions."
      >
        <DocSection title="Overlay & shadow tokens">
          <TokenTable tokens={tokens} />
          <div
            style={{
              marginBlockStart: "var(--space-layout-24)",
              padding: "var(--space-layout-32)",
              background: "var(--main-body-background-color)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--modal-shadow)",
              border: "1px solid var(--color-border)",
              maxInlineSize: "20rem",
            }}
          >
            Modal surface using <code>--modal-shadow</code>
          </div>
          <div
            style={{
              marginBlockStart: "var(--space-layout-16)",
              position: "relative",
              inlineSize: "12rem",
              blockSize: "8rem",
              background: "var(--color-gray)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div
              style={{
                position: "absolute",
                insetInline: 0,
                insetBlockEnd: 0,
                padding: "var(--space-internal-8)",
                background: "var(--gallery-caption-bg)",
                color: "var(--color-white)",
                fontSize: "var(--font-size-text-s)",
                borderEndEndRadius: "var(--radius-md)",
                borderEndStartRadius: "var(--radius-md)",
              }}
            >
              Caption overlay
            </div>
          </div>
        </DocSection>
      </FoundationPage>
    );
  },
};
