import contract from "./TeamBlock.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import TeamBlock from "./TeamBlock";
import type { TeamBlockProps } from "./TeamBlock";
import ImagePlaceholder from "@dt/ImagePlaceholder";
import PageLayout from "../PageLayout/PageLayout";
import Title from "@dt/Title";
import Text from "@dt/Text";
import styles from "./TeamBlock.module.css";

/**
 * Storybook-only wrapper that renders team members with ImagePlaceholder instead of Next.js Image
 * for mock data, while keeping production Helsinki DS images unchanged
 */
const TeamBlockForStorybook: React.FC<TeamBlockProps> = ({
  members,
  sectionTitle = "Team",
  description,
  columns = 5,
  backgroundColor = "transparent",
  maxWidth = "lg",
  spacing = "default",
  className = "",
  as = "section",
  ariaLabel,
  roundImages = false,
}) => {
  const Wrapper = as;
  const bgColors = {
    light: "var(--color-light-bg)",
    white: "var(--color-white)",
    transparent: "transparent",
  };
  const gridClass = styles[`grid${columns}Col`];
  const imageClass = roundImages ? styles.roundImage : styles.teamImage;

  return (
    <Wrapper
      className={[styles.teamBlock, className].filter(Boolean).join(" ")}
      style={{
        backgroundColor: bgColors[backgroundColor],
        paddingBlock:
          backgroundColor !== "transparent" ? "var(--space-xl, 3rem)" : "0",
      }}
      aria-label={ariaLabel || sectionTitle}
    >
      <PageLayout maxWidth={maxWidth} spacing={spacing} as="div">
        {sectionTitle && (
          <Title
            level={2}
            terminals="sans"
            size="xl"
            className={styles.sectionTitle}
          >
            {sectionTitle}
          </Title>
        )}

        {description && (
          <div className={styles.description}>
            {typeof description === "string" ? (
              <Text size="m">{description}</Text>
            ) : (
              description
            )}
          </div>
        )}

        <div className={gridClass}>
          {members.map((member, index) => {
            const MemberWrapper = member.link ? "a" : "div";
            const memberProps = member.link
              ? {
                  href: member.link,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: styles.memberLink,
                }
              : {};

            const width = member.imageWidth || 112;
            const height = member.imageHeight || 112;

            return (
              <MemberWrapper
                key={`${member.name}-${index}`}
                className={styles.col}
                {...memberProps}
              >
                {/* Use ImagePlaceholder for all Storybook previews */}
                <div
                  className={imageClass}
                  style={{ overflow: "hidden", borderRadius: "50%" }}
                >
                  <ImagePlaceholder
                    width={width}
                    height={height}
                    alt={member.imageAlt || member.name}
                    variant="gradient"
                    showIcon
                    style={{ borderRadius: "50%" }}
                  />
                </div>
                <Title
                  level={3}
                  terminals="sans"
                  size="xs"
                  className={styles.memberName}
                >
                  {member.name}
                </Title>
                <Text size="s" className={styles.memberTitle}>
                  {member.title}
                </Text>
              </MemberWrapper>
            );
          })}
        </div>
      </PageLayout>
    </Wrapper>
  );
};

const meta: Meta<typeof TeamBlockForStorybook> = {
  title: "Patterns/TeamBlock",
  component: TeamBlockForStorybook,
  // Exclude from Vitest tests
  tags: ["beta", "autodocs", "!test"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-team-block",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "fullscreen",
    vitest: {
      // Skip Vitest tests for this complex pattern component
      skip: true,
    },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // composite-slot mapping presets live on the Playground story below.
};

export default meta;
type Story = StoryObj<typeof TeamBlock>;

// Mock team members for Helsinki Design System project
const helsinkiTeam = [
  {
    name: "Laura Karhu",
    title: "Project Lead (PM/PO)",
    image: "/images/portfolio/helsinki-design-system/team/laura.png",
  },
  {
    name: "Petri Lahdelma",
    title: "Senior UX Designer",
    image: "/images/portfolio/helsinki-design-system/team/petri.png",
  },
  {
    name: "Roni Helppi",
    title: "UX Designer",
    image: "/images/portfolio/helsinki-design-system/team/roni.png",
  },
  {
    name: "Mika Nevalainen",
    title: "Senior Software Developer",
    image: "/images/portfolio/helsinki-design-system/team/mika.png",
  },
  {
    name: "Ville Miekk'oja",
    title: "Freelance Consultant",
    image: "/images/portfolio/helsinki-design-system/team/ville.png",
  },
];

// Smaller team example
const smallTeam = [
  {
    name: "Sarah Johnson",
    title: "Product Designer",
    image: "placeholder",
    imageAlt: "Sarah Johnson, Product Designer",
  },
  {
    name: "Michael Chen",
    title: "Frontend Developer",
    image: "placeholder",
    imageAlt: "Michael Chen, Frontend Developer",
  },
  {
    name: "Emma Davis",
    title: "UX Researcher",
    image: "placeholder",
    imageAlt: "Emma Davis, UX Researcher",
  },
];

// Large team example
const largeTeam = [
  { name: "Alex Rivera", title: "Creative Director", image: "placeholder" },
  { name: "Jordan Lee", title: "Lead Designer", image: "placeholder" },
  { name: "Taylor Swift", title: "Senior Developer", image: "placeholder" },
  { name: "Casey Morgan", title: "UX Designer", image: "placeholder" },
  { name: "Jamie Park", title: "Frontend Engineer", image: "placeholder" },
  { name: "Riley Chen", title: "Product Manager", image: "placeholder" },
  { name: "Avery Johnson", title: "UI Designer", image: "placeholder" },
  { name: "Morgan Davis", title: "Backend Developer", image: "placeholder" },
];

/**
 * Default story showing a 5-person team (Helsinki Design System)
 */
export const Default: Story = {
  tags: ["beta-matrix"],
  args: {
    members: smallTeam,
    sectionTitle: "Team",
    columns: 5,
    backgroundColor: "transparent",
  },
};

/**
 * Small team with 3 members in 3-column layout
 */
export const SmallTeam: Story = {
  args: {
    members: smallTeam,
    sectionTitle: "Project Team",
    columns: 3,
    backgroundColor: "white",
  },
};

/**
 * Large team with 8 members in 4-column layout
 */
export const LargeTeam: Story = {
  args: {
    members: largeTeam,
    sectionTitle: "Our Team",
    columns: 4,
    backgroundColor: "light",
  },
};

/**
 * Team displayed in 2-column layout
 */
export const TwoColumnLayout: Story = {
  args: {
    members: smallTeam,
    sectionTitle: "Leadership Team",
    columns: 2,
    backgroundColor: "white",
  },
};

/**
 * Team displayed in 6-column layout
 */
export const SixColumnLayout: Story = {
  args: {
    members: largeTeam.slice(0, 6),
    sectionTitle: "Core Team",
    columns: 6,
    backgroundColor: "transparent",
  },
};

/**
 * Team with round profile images
 */
export const RoundImages: Story = {
  args: {
    members: helsinkiTeam,
    sectionTitle: "Team",
    columns: 5,
    roundImages: true,
    backgroundColor: "light",
  },
};

/**
 * Team with description text
 */
export const WithDescription: Story = {
  args: {
    members: smallTeam,
    sectionTitle: "Meet Our Team",
    description:
      "A multidisciplinary team of designers, developers, and strategists working together to create exceptional digital experiences.",
    columns: 5,
    backgroundColor: "white",
  },
};

/**
 * Team without section title
 */
export const NoTitle: Story = {
  args: {
    members: smallTeam,
    sectionTitle: "",
    columns: 3,
    backgroundColor: "transparent",
  },
};

/**
 * Compact spacing variant
 */
export const CompactSpacing: Story = {
  args: {
    members: smallTeam,
    sectionTitle: "Team",
    columns: 5,
    spacing: "compact",
    backgroundColor: "light",
  },
};

/**
 * Wide layout with full width
 */
export const WideLayout: Story = {
  args: {
    members: largeTeam,
    sectionTitle: "Extended Team",
    columns: 4,
    maxWidth: "xl",
    backgroundColor: "white",
  },
};

/**
 * Team members with clickable links
 */
export const WithLinks: Story = {
  args: {
    members: [
      {
        name: "Sarah Johnson",
        title: "Product Designer",
        image: "placeholder",
        link: "https://linkedin.com",
      },
      {
        name: "Michael Chen",
        title: "Frontend Developer",
        image: "placeholder",
        link: "https://linkedin.com",
      },
      {
        name: "Emma Davis",
        title: "UX Researcher",
        image: "placeholder",
        link: "https://linkedin.com",
      },
    ],
    sectionTitle: "Connect With Our Team",
    columns: 3,
    backgroundColor: "light",
  },
};

/**
 * Article semantic variant
 */
export const ArticleVariant: Story = {
  args: {
    members: smallTeam,
    sectionTitle: "Project Contributors",
    as: "article",
    ariaLabel: "List of project contributors and their roles",
    columns: 5,
    backgroundColor: "white",
  },
};

/**
 * Design team example
 */
export const DesignTeam: Story = {
  args: {
    members: [
      { name: "Alex Rivera", title: "Design Director", image: "placeholder" },
      {
        name: "Jordan Lee",
        title: "Lead Product Designer",
        image: "placeholder",
      },
      { name: "Taylor Morgan", title: "UI/UX Designer", image: "placeholder" },
      { name: "Casey Park", title: "Visual Designer", image: "placeholder" },
    ],
    sectionTitle: "Design Team",
    description: "Our creative minds shaping exceptional user experiences.",
    columns: 4,
    backgroundColor: "light",
    roundImages: true,
  },
};

/**
 * Development team example
 */
export const DevelopmentTeam: Story = {
  args: {
    members: [
      { name: "Jamie Chen", title: "Tech Lead", image: "placeholder" },
      {
        name: "Riley Johnson",
        title: "Senior Frontend Engineer",
        image: "placeholder",
      },
      { name: "Avery Davis", title: "Backend Developer", image: "placeholder" },
      { name: "Morgan Lee", title: "DevOps Engineer", image: "placeholder" },
      { name: "Dakota Smith", title: "QA Engineer", image: "placeholder" },
    ],
    sectionTitle: "Development Team",
    columns: 5,
    backgroundColor: "white",
  },
};

/**
 * Minimal duo team
 */
export const MinimalTeam: Story = {
  args: {
    members: [
      {
        name: "Sarah Williams",
        title: "Founder & Designer",
        image: "placeholder",
      },
      {
        name: "John Smith",
        title: "Co-founder & Developer",
        image: "placeholder",
      },
    ],
    sectionTitle: "Founders",
    columns: 2,
    backgroundColor: "transparent",
  },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  argTypes: {
    members: {
      control: { type: "select" },
      options: ["small", "large"],
      mapping: { small: smallTeam, large: largeTeam },
      description:
        "Team members (name, role, image). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "TeamMember[]" } },
    },
    description: {
      control: { type: "select" },
      options: ["none", "intro"],
      mapping: {
        none: undefined,
        intro: <Text size="s">The people behind the system.</Text>,
      },
      description:
        "Optional lead copy under the section title. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
  },
  args: {
    ...Default.args,
    members: "small" as never,
    description: "intro" as never,
  },
};
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
