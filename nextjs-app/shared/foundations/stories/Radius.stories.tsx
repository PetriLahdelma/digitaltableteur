import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DocSection,
  FoundationPage,
  getCatalogGroups,
  TokenTable,
} from "../doc";

const meta = {
  title: "Foundations/Radius",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => {
    const tokens = getCatalogGroups("radius").flatMap((g) => g.tokens);
    return (
      <FoundationPage
        title="Radius"
        lead="A tight corner scale — sm through xl — plus full (pill) and circle for controls, cards, modals, and avatars."
      >
        <DocSection title="Tokens">
          <TokenTable tokens={tokens} />
          <div
            style={{
              display: "flex",
              gap: "var(--space-layout-24)",
              marginBlockStart: "var(--space-layout-24)",
              flexWrap: "wrap",
            }}
          >
            {[
              { token: "--radius-sm", label: "sm" },
              { token: "--radius-md", label: "md" },
              { token: "--radius-lg", label: "lg" },
              { token: "--radius-xl", label: "xl" },
              { token: "--radius-full", label: "full" },
              { token: "--radius-circle", label: "circle" },
            ].map(({ token, label }) => (
              <div key={token} style={{ textAlign: "center" }}>
                <div
                  style={{
                    inlineSize: "6rem",
                    blockSize: "6rem",
                    background: "var(--color-primary)",
                    borderRadius: `var(${token})`,
                  }}
                  aria-hidden
                />
                <code
                  style={{
                    fontSize: "0.75rem",
                    display: "block",
                    marginBlockStart: "var(--space-internal-8)",
                  }}
                >
                  {label}
                </code>
              </div>
            ))}
          </div>
        </DocSection>
      </FoundationPage>
    );
  },
};
