import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ColorSwatch,
  DocSection,
  FoundationPage,
  getCatalogGroups,
  SwatchGrid,
  TokenTable,
  ThemePanel,
  FOUNDATION_THEMES,
} from "../doc";

const meta = {
  title: "Foundations/Color",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const semanticTokens = [
  { token: "--color-primary", label: "Primary" },
  { token: "--color-text", label: "Text" },
  { token: "--color-title", label: "Title" },
  { token: "--main-body-background-color", label: "Canvas" },
  { token: "--color-border", label: "Border" },
  { token: "--link-color", label: "Link" },
];

const statusTokens = [
  { token: "--color-success", label: "Success" },
  { token: "--color-info", label: "Info" },
  { token: "--color-warning", label: "Warning" },
  { token: "--color-error", label: "Error" },
];

const accentTokens = [
  { token: "--accent-pink", label: "Pink" },
  { token: "--accent-purple", label: "Purple" },
  { token: "--accent-teal", label: "Teal" },
  { token: "--accent-violet", label: "Violet" },
  { token: "--accent-cyan", label: "Cyan" },
  { token: "--accent-yellow", label: "Yellow" },
  { token: "--logo-background", label: "Logo background" },
];

function ColorFoundations() {
  const greyscale =
    getCatalogGroups("color", "Greyscale & borders")[0]?.tokens ?? [];

  return (
    <FoundationPage
      title="Color"
      lead="Semantic palette, status colors, brand accents, and greyscale — all resolved from production CSS custom properties. Use these tokens in components; never hardcode hex in modules."
    >
      <DocSection
        title="Semantic"
        description="Core UI colors for text, surfaces, borders, and primary actions."
      >
        <SwatchGrid>
          {semanticTokens.map(({ token, label }) => (
            <ColorSwatch key={token} token={token} label={label} />
          ))}
        </SwatchGrid>
      </DocSection>

      <DocSection
        title="Status & feedback"
        description="Alert, toast, and form validation semantics."
      >
        <SwatchGrid>
          {statusTokens.map(({ token, label }) => (
            <ColorSwatch key={token} token={token} label={label} />
          ))}
        </SwatchGrid>
      </DocSection>

      <DocSection
        title="Brand accents"
        description="Marketing and illustration accents — not primary UI chrome."
      >
        <SwatchGrid>
          {accentTokens.map(({ token, label }) => (
            <ColorSwatch key={token} token={token} label={label} />
          ))}
        </SwatchGrid>
      </DocSection>

      <DocSection
        title="Greyscale & borders"
        description="Full greyscale token set from the catalog."
      >
        <TokenTable tokens={greyscale} />
      </DocSection>

      <DocSection
        title="Theme matrix"
        description="Same semantic tokens under each production theme class. Values are computed at runtime."
      >
        <div
          style={{
            display: "grid",
            gap: "var(--space-layout-16)",
            gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
          }}
        >
          {FOUNDATION_THEMES.map((theme) => (
            <ThemePanel
              key={theme.id}
              themeClass={theme.className}
              label={theme.label}
            >
              <SwatchGrid>
                <ColorSwatch
                  token="--color-primary"
                  label="Primary"
                  themeClass={theme.className}
                />
                <ColorSwatch
                  token="--color-text"
                  label="Text"
                  themeClass={theme.className}
                />
                <ColorSwatch
                  token="--main-body-background-color"
                  label="Canvas"
                  themeClass={theme.className}
                />
              </SwatchGrid>
            </ThemePanel>
          ))}
        </div>
      </DocSection>
    </FoundationPage>
  );
}

export const Overview: Story = { render: () => <ColorFoundations /> };
export const Semantic: Story = {
  render: () => (
    <FoundationPage title="Semantic colors" lead="Primary UI palette.">
      <DocSection title="Semantic">
        <SwatchGrid>
          {semanticTokens.map(({ token, label }) => (
            <ColorSwatch key={token} token={token} label={label} />
          ))}
        </SwatchGrid>
      </DocSection>
    </FoundationPage>
  ),
};
export const ThemeMatrix: Story = {
  render: () => (
    <FoundationPage title="Theme matrix" lead="Cross-theme semantic colors.">
      <DocSection title="Themes">
        <div
          style={{
            display: "grid",
            gap: "var(--space-layout-16)",
            gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
          }}
        >
          {FOUNDATION_THEMES.map((theme) => (
            <ThemePanel
              key={theme.id}
              themeClass={theme.className}
              label={theme.label}
            >
              <SwatchGrid>
                <ColorSwatch
                  token="--color-primary"
                  label="Primary"
                  themeClass={theme.className}
                />
                <ColorSwatch
                  token="--color-text"
                  label="Text"
                  themeClass={theme.className}
                />
                <ColorSwatch
                  token="--main-body-background-color"
                  label="Canvas"
                  themeClass={theme.className}
                />
                <ColorSwatch
                  token="--color-error"
                  label="Error"
                  themeClass={theme.className}
                />
              </SwatchGrid>
            </ThemePanel>
          ))}
        </div>
      </DocSection>
    </FoundationPage>
  ),
};
