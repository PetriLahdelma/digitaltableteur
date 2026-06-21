import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DocSection,
  FoundationPage,
  getCatalogGroups,
  TokenTable,
  TypeSpecimen,
} from "../doc";

const meta = {
  title: "Foundations/Typography",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const scale = [
  {
    token: "--font-size-display-xl",
    sample: "Display XL",
    style: {
      fontSize: "var(--font-size-display-xl)",
      lineHeight: "var(--line-height-tight)",
      letterSpacing: "var(--tracking-tighter)",
    },
  },
  {
    token: "--font-size-display",
    sample: "Display",
    style: {
      fontSize: "var(--font-size-display)",
      lineHeight: "var(--line-height-tight)",
    },
  },
  {
    token: "--font-size-title-xxl",
    sample: "Title XXL",
    style: {
      fontSize: "var(--font-size-title-xxl)",
      fontFamily: "var(--font-title)",
      lineHeight: "var(--line-height-tight)",
    },
  },
  {
    token: "--font-size-title-xl",
    sample: "Title XL",
    style: {
      fontSize: "var(--font-size-title-xl)",
      fontFamily: "var(--font-title)",
      lineHeight: "var(--line-height-tight)",
    },
  },
  {
    token: "--font-size-title-l",
    sample: "Title L",
    style: {
      fontSize: "var(--font-size-title-l)",
      fontFamily: "var(--font-title)",
      lineHeight: "var(--line-height-snug)",
    },
  },
  {
    token: "--font-size-title-m",
    sample: "Title M",
    style: {
      fontSize: "var(--font-size-title-m)",
      fontFamily: "var(--font-title)",
    },
  },
  {
    token: "--font-size-title-s",
    sample: "Title S",
    style: {
      fontSize: "var(--font-size-title-s)",
      fontFamily: "var(--font-title)",
    },
  },
  {
    token: "--font-size-title-xs",
    sample: "Title XS",
    style: {
      fontSize: "var(--font-size-title-xs)",
      fontFamily: "var(--font-title)",
    },
  },
  {
    token: "--font-size-title-xxs",
    sample: "Title XXS",
    style: {
      fontSize: "var(--font-size-title-xxs)",
      fontFamily: "var(--font-title)",
    },
  },
  {
    token: "--font-size-text-xxl",
    sample: "Body XXL",
    style: {
      fontSize: "var(--font-size-text-xxl)",
      fontFamily: "var(--font-text)",
    },
  },
  {
    token: "--font-size-text-xl",
    sample: "Body XL",
    style: {
      fontSize: "var(--font-size-text-xl)",
      fontFamily: "var(--font-text)",
    },
  },
  {
    token: "--font-size-text-l",
    sample: "Body L",
    style: {
      fontSize: "var(--font-size-text-l)",
      fontFamily: "var(--font-text)",
    },
  },
  {
    token: "--font-size-text-m",
    sample: "Body M",
    style: {
      fontSize: "var(--font-size-text-m)",
      fontFamily: "var(--font-text)",
    },
  },
  {
    token: "--font-size-text-s",
    sample: "Body S",
    style: {
      fontSize: "var(--font-size-text-s)",
      fontFamily: "var(--font-text)",
    },
  },
  {
    token: "--font-size-text-xs",
    sample: "Body XS",
    style: {
      fontSize: "var(--font-size-text-xs)",
      fontFamily: "var(--font-text)",
    },
  },
  {
    token: "--font-size-text-xxs",
    sample: "Body XXS",
    style: {
      fontSize: "var(--font-size-text-xxs)",
      fontFamily: "var(--font-text)",
    },
  },
  {
    token: "--font-size-button-m",
    sample: "Button M",
    style: {
      fontSize: "var(--font-size-button-m)",
      fontFamily: "var(--font-text)",
      fontWeight: 600,
    },
  },
];

function TypographyFoundations() {
  const families =
    getCatalogGroups("typography", "Families & aliases")[0]?.tokens ?? [];
  const rhythm = getCatalogGroups("typography", "Rhythm")[0]?.tokens ?? [];

  return (
    <FoundationPage
      title="Typography"
      lead="Fluid type scale via clamp(), Syne for headings and Satoshi for body (injected by next/font). Pair Title and Text components with these tokens — do not invent pixel sizes."
    >
      <DocSection
        title="Families"
        description="--font-title and --font-text map to production heading/body stacks."
      >
        <TypeSpecimen
          sample="Heading — Syne"
          token="--font-title"
          meta="Headings, display"
          style={{
            fontFamily: "var(--font-title)",
            fontSize: "var(--font-size-title-m)",
          }}
        />
        <TypeSpecimen
          sample="Body — Satoshi"
          token="--font-text"
          meta="UI and paragraphs"
          style={{
            fontFamily: "var(--font-text)",
            fontSize: "var(--font-size-text-m)",
          }}
        />
        <TokenTable tokens={families} />
      </DocSection>

      <DocSection
        title="Type scale"
        description="Responsive clamp() tokens — scales between mobile and desktop viewports."
      >
        {scale.map((row) => (
          <TypeSpecimen
            key={row.token}
            sample={row.sample}
            token={row.token}
            meta="Live specimen"
            style={row.style}
          />
        ))}
      </DocSection>

      <DocSection
        title="Line height & tracking"
        description="Rhythm tokens for readability and display tightening."
      >
        <TokenTable tokens={rhythm} />
      </DocSection>
    </FoundationPage>
  );
}

export const Overview: Story = { render: () => <TypographyFoundations /> };
export const TypeScale: Story = {
  render: () => (
    <FoundationPage title="Type scale" lead="Fluid clamp scale.">
      <DocSection title="Scale">
        {scale.map((row) => (
          <TypeSpecimen
            key={row.token}
            sample={row.sample}
            token={row.token}
            meta="clamp()"
            style={row.style}
          />
        ))}
      </DocSection>
    </FoundationPage>
  ),
};
