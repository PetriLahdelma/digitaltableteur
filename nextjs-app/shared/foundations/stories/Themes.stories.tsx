import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ColorSwatch,
  DocSection,
  FoundationPage,
  FOUNDATION_THEMES,
  SwatchGrid,
  ThemePanel,
} from "../doc";

const meta = {
  title: "Foundations/Themes",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const matrix = [
  { token: "--color-primary", label: "Primary" },
  { token: "--color-text", label: "Text" },
  { token: "--main-body-background-color", label: "Canvas" },
  { token: "--color-border", label: "Border" },
  { token: "--color-error", label: "Error" },
  { token: "--link-color", label: "Link" },
  { token: "--focus-ring-color", label: "Focus" },
];

export const Overview: Story = {
  render: () => (
    <FoundationPage
      title="Themes"
      lead="Four production themes: light (default), dark, high-contrast black (HCB), and high-contrast white (HCW). Toggle via Storybook toolbar or ThemeProvider on site."
    >
      <DocSection
        title="Full semantic matrix"
        description="Compare resolved colors per theme class (.themeDark, .themeHCB, .themeHCW)."
      >
        <div
          style={{
            display: "grid",
            gap: "var(--space-layout-24)",
            gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
          }}
        >
          {FOUNDATION_THEMES.map((theme) => (
            <ThemePanel
              key={theme.id}
              themeClass={theme.className}
              label={theme.label}
            >
              <SwatchGrid>
                {matrix.map(({ token, label }) => (
                  <ColorSwatch
                    key={token}
                    token={token}
                    label={label}
                    themeClass={theme.className}
                  />
                ))}
              </SwatchGrid>
            </ThemePanel>
          ))}
        </div>
      </DocSection>
    </FoundationPage>
  ),
};
