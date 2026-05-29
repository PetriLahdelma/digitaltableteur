import type { Meta, StoryObj } from "@storybook/react-vite";
import catalog from "../token-catalog.json";
import {
  ContrastMatrix,
  DocSection,
  FoundationPage,
  FOUNDATION_CONTRAST,
  FOUNDATION_THEMES,
} from "../doc";

const meta = {
  title: "Foundations/Contrast",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <FoundationPage
      title="Contrast"
      lead="WCAG 2.x contrast ratios for semantic foreground/background pairs, computed from production theme overrides in variables.css. Fix failures in CSS — not in Storybook."
    >
      <DocSection
        title="Semantic pairs"
        description="AA requires 4.5:1 for normal text and 3:1 for large text. High-contrast themes widen focus rings separately (Foundations/Focus)."
      >
        {FOUNDATION_THEMES.map((theme) => (
          <ContrastMatrix
            key={theme.id}
            themeLabel={theme.label}
            themeClass={theme.className}
            rows={
              (FOUNDATION_CONTRAST[
                theme.id as keyof typeof FOUNDATION_CONTRAST
              ] ?? []) as Parameters<typeof ContrastMatrix>[0]["rows"]
            }
          />
        ))}
      </DocSection>
      <DocSection
        title="CLI gate"
        description="npm run check:contrast fails CI when any pair drops below AA."
      >
        <p
          style={{
            fontFamily: "var(--font-text)",
            fontSize: "var(--font-size-text-s)",
          }}
        >
          Last catalog build: {catalog.generatedAt}. Pairs audited:{" "}
          {catalog.contrastPairs?.length ?? 0}.
        </p>
      </DocSection>
    </FoundationPage>
  ),
};
