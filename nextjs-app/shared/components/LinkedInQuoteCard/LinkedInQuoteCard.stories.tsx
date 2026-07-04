import contract from "./LinkedInQuoteCard.contract.json";
import React, { useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import LinkedInQuoteCard from "./LinkedInQuoteCard";
import Icon from "@dt/Icon";
import Button from "@dt/Button";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import type { Meta, StoryFn } from "@storybook/react-vite";

const linkedInQuoteCardComplianceRules: ComplianceRule[] = [
  {
    id: "file-structure",
    rule: "Complete file structure",
    status: "pass",
    details: "All 5 files present",
  },
  {
    id: "typescript-strict",
    rule: "TypeScript strict",
    status: "pass",
    details: "Proper typing with LinkedInQuoteCardProps",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "Content passed as props",
  },
  {
    id: "css-modules",
    rule: "CSS Modules",
    status: "pass",
    details: "No inline styles",
  },
  {
    id: "design-tokens",
    rule: "Design tokens",
    status: "pass",
    details: "Uses var(--font-text), spacing tokens",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "Uses inline-size, block-size, margin-block",
  },
  {
    id: "theme-support",
    rule: "Theme support",
    status: "pass",
    details: "Dark theme support with [data-theme]",
  },
  {
    id: "composition",
    rule: "Component composition",
    status: "pass",
    details: "Uses Text, Link, Icon from design system",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "Semantic markup, aria-labels, alt text",
  },
  {
    id: "storybook-stories",
    rule: "Storybook stories",
    status: "wip",
    details: "Multiple variants - needs visual test",
  },
  {
    id: "tests",
    rule: "Tests",
    status: "wip",
    details: "Test file created - needs coverage",
  },
];

const SCREENSHOT_WIDTH = 588;
const SCREENSHOT_HEIGHT = 725;

interface ScreenshotWrapperProps {
  children: React.ReactNode;
  variant?: "light" | "dark" | "muted";
}

const ScreenshotWrapper: React.FC<ScreenshotWrapperProps> = ({
  children,
  variant = "muted",
}) => {
  const captureRef = useRef<HTMLDivElement>(null);

  const handleScreenshot = useCallback(async () => {
    if (!captureRef.current) return;

    try {
      const canvas = await html2canvas(captureRef.current, {
        width: SCREENSHOT_WIDTH,
        height: SCREENSHOT_HEIGHT,
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
            alert("Screenshot copied to clipboard!");
          } catch (err) {
            console.error("Failed to copy to clipboard:", err);
            // Fallback: download the image
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "linkedin-quote-card.png";
            a.click();
            URL.revokeObjectURL(url);
          }
        }
      }, "image/png");
    } catch (err) {
      console.error("Failed to capture screenshot:", err);
    }
  }, []);

  const getBackgroundColor = () => {
    switch (variant) {
      case "light":
        return "var(--color-white)";
      case "dark":
        return "var(--color-gray-dark)";
      case "muted":
      default:
        return "#9ca3af";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "2rem",
      }}
    >
      <div
        ref={captureRef}
        style={{
          position: "relative",
          width: `${SCREENSHOT_WIDTH}px`,
          height: `${SCREENSHOT_HEIGHT}px`,
          backgroundColor: getBackgroundColor(),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
      <div style={{ marginTop: "1.5rem" }}>
        <Button
          variant="primary"
          size="m"
          onClick={handleScreenshot}
          icon={<Icon name="camera" size={18} />}
        >
          Take a screenshot
        </Button>
      </div>
      <p
        style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#4b5563" }}
      >
        {SCREENSHOT_WIDTH}px × {SCREENSHOT_HEIGHT}px
      </p>
    </div>
  );
};

export default {
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["muted", "light", "dark"],
      description: "Surface treatment for the quote card",
      table: { defaultValue: { summary: "muted" } },
    },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      avatarUrl: { control: "text", description: "Avatar image URL (optional)", table: { category: "Content" } },
      children: { table: { disable: true } },
      className: { control: "text", description: "Additional CSS classes", table: { category: "Advanced" } },
      company: { control: "text", description: "Company name", table: { category: "Content" } },
      companyLogoUrl: { control: "text", description: "Company logo URL (optional, displayed at bottom)", table: { category: "Content" } },
      connectionDegree: { control: "text", description: "Connection degree (e.g., \"1st\", \"2nd\", \"3rd\")", table: { category: "Content" } },
      id: { table: { disable: true } },
      linkedinUrl: { control: "text", description: "LinkedIn profile URL (optional)", table: { category: "Content" } },
      name: { control: "text", description: "Name of the person", table: { category: "Content" } },
      quote: { control: "text", description: "The quote/post text", table: { category: "Content" } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } },
      title: { control: "text", description: "Title/position of the person", table: { category: "Content" } }
},
  title: "Site/LinkedInQuoteCard",
  component: LinkedInQuoteCard,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-linked-in-quote-card",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "fullscreen",
  },
} as Meta;

export const Z_LinkedInQuoteCardCompliance: StoryFn = () => (
  <ComplianceCard
    title="Compliance: 9/11 (WIP)"
    titleIcon={
      <Icon name="warning" color="var(--color-warning)" weight="fill" />
    }
    rules={linkedInQuoteCardComplianceRules}
  />
);

export const Default = () => (
  <LinkedInQuoteCard
    quote="Systems protect consistency. People protect meaning."
    name="Petri Lahdelma"
    title="Founder"
    company="Digitaltableteur"
    connectionDegree="1st"
    avatarUrl="/images/portfolio/helsinki-design-system/team/petri.png"
    companyLogoUrl="/dt-logo.svg"
    variant="muted"
  />
);

export const WithCompanyLogo = () => (
  <LinkedInQuoteCard
    quote="Great design systems are built on trust, not just tokens. The best documentation is the one your team actually reads."
    name="Petri Lahdelma"
    title="Founder"
    company="Digitaltableteur"
    connectionDegree="1st"
    avatarUrl="/images/portfolio/helsinki-design-system/team/petri.png"
    companyLogoUrl="/dt-logo.svg"
    variant="muted"
  />
);

export const LightBackground = () => (
  <LinkedInQuoteCard
    quote="The gap between design and code isn't a technical problem—it's a communication problem. Design tokens are the vocabulary."
    name="Petri Lahdelma"
    title="Founder"
    company="Digitaltableteur"
    connectionDegree="1st"
    avatarUrl="/images/portfolio/helsinki-design-system/team/petri.png"
    companyLogoUrl="/dt-logo.svg"
    variant="light"
  />
);

export const DarkBackground = () => (
  <LinkedInQuoteCard
    quote="Accessibility isn't a feature—it's a responsibility. Every component we build should work for everyone."
    name="Petri Lahdelma"
    title="Founder"
    company="Digitaltableteur"
    connectionDegree="1st"
    avatarUrl="/images/portfolio/helsinki-design-system/team/petri.png"
    companyLogoUrl="/dt-logo.svg"
    variant="dark"
  />
);

export const WithoutAvatar = () => (
  <LinkedInQuoteCard
    quote="Component libraries are easy. Design systems are hard. The difference is culture."
    name="Petri Lahdelma"
    title="Founder"
    company="Digitaltableteur"
    connectionDegree="1st"
    companyLogoUrl="/dt-logo.svg"
    variant="muted"
  />
);

export const WithoutLogo = () => (
  <LinkedInQuoteCard
    quote="Placeholder text can say anything, but meaningful content tells a story. Design is communication."
    name="Petri Lahdelma"
    title="Founder"
    company="Digitaltableteur"
    connectionDegree="1st"
    avatarUrl="/images/portfolio/helsinki-design-system/team/petri.png"
    variant="muted"
  />
);

export const LongQuote = () => (
  <LinkedInQuoteCard
    quote="After 15 years in design systems, I've learned that the best systems aren't the ones with the most components—they're the ones teams actually use. Documentation that reads like legal text gets ignored. Tokens without context get overridden. Guidelines without examples get misinterpreted. Build for humans first, machines second."
    name="Petri Lahdelma"
    title="Founder"
    company="Digitaltableteur"
    connectionDegree="1st"
    avatarUrl="/images/portfolio/helsinki-design-system/team/petri.png"
    companyLogoUrl="/dt-logo.svg"
    variant="muted"
  />
);

export const SecondDegreeConnection = () => (
  <LinkedInQuoteCard
    quote="Your network is your net worth—but only if you actually engage with it."
    name="Petri Lahdelma"
    title="Founder"
    company="Digitaltableteur"
    connectionDegree="2nd"
    avatarUrl="/images/portfolio/helsinki-design-system/team/petri.png"
    companyLogoUrl="/dt-logo.svg"
    variant="muted"
  />
);

// Screenshot story - renders the card in a fixed-size container with a capture button
const ScreenshotCardContent: React.FC<{
  variant?: "light" | "dark" | "muted";
}> = ({ variant = "muted" }) => (
  <div
    style={{
      position: "relative",
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      boxSizing: "border-box",
    }}
  >
    <article
      style={{
        maxWidth: "480px",
        width: "100%",
        padding: "1.25rem 1.5rem",
        borderRadius: "0.5rem",
        background: "#ffffff",
        boxShadow: "0 4px 6px rgb(0 0 0 / 10%), 0 10px 20px rgb(0 0 0 / 8%)",
        fontFamily:
          "\"Source Sans 3\", -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <img
          src="/images/portfolio/helsinki-design-system/team/petri.png"
          alt="Portrait of Petri Lahdelma"
          style={{
            width: "48px",
            height: "48px",
            flexShrink: 0,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0.25rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: "1.3rem",
                color: "rgba(0, 0, 0, 0.9)",
                lineHeight: 1.33,
              }}
            >
              Petri Lahdelma
            </span>
            <span
              style={{
                color: "rgba(0, 0, 0, 0.6)",
                fontSize: "0.875rem",
                fontWeight: 400,
              }}
            >
              •
            </span>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 400,
                color: "rgba(0, 0, 0, 0.6)",
              }}
            >
              1st
            </span>
          </div>
          <div
            style={{
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.6)",
              lineHeight: 1.33,
              marginTop: 0,
            }}
          >
            Founder, Digitaltableteur
          </div>
        </div>
      </header>
      <blockquote style={{ margin: 0, padding: 0, border: "none" }}>
        <p
          style={{
            margin: 0,
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "1.125rem",
            lineHeight: 1.5,
            color: "rgba(0, 0, 0, 0.9)",
          }}
        >
          Systems protect consistency. People protect meaning.
        </p>
      </blockquote>
    </article>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "3rem",
      }}
    >
      <img
        src="/dt-logo.svg"
        alt="Digitaltableteur logo"
        style={{ maxWidth: "64px", maxHeight: "64px", objectFit: "contain" }}
      />
    </div>
  </div>
);

export const Screenshot = () => (
  <ScreenshotWrapper variant="muted">
    <ScreenshotCardContent variant="muted" />
  </ScreenshotWrapper>
);

export const ScreenshotLight = () => (
  <ScreenshotWrapper variant="light">
    <ScreenshotCardContent variant="light" />
  </ScreenshotWrapper>
);

export const ScreenshotDark = () => (
  <ScreenshotWrapper variant="dark">
    <ScreenshotCardContent variant="dark" />
  </ScreenshotWrapper>
);

export const Playground = Default;
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
