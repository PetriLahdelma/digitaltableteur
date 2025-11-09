import React from "react";
import Card from "./Card";
import {
  FaPalette,
  FaChartLine,
  FaPen,
  FaGithub,
  FaExternalLinkAlt,
  FaStar,
  FaUser,
  FaCalendar,
  FaHeart,
  FaEye,
  FaBug,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

export default {
  title: "DesignSystem/Card",
  component: Card,
  parameters: { wip: { disabled: false } },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["S", "M", "L", "full"],
      description:
        "Card size with max-width constraints: S(320px), M(480px), L(600px), full(100%)",
    },
    variant: {
      control: { type: "select" },
      options: ["outlined", "filled", "elevated"],
      description: "Card visual variant",
    },
    badge: {
      control: { type: "text" },
      description: "Badge content (text/number) or custom React element",
    },
    "badgeProps.state": {
      control: { type: "select" },
      options: ["success", "info", "error", "warning", "neutral"],
      description: "Badge semantic state",
    },
    "badgeProps.position": {
      control: { type: "select" },
      options: ["start", "end"],
      description: "Badge position in header",
    },
    statusMessage: {
      control: { type: "text" },
      description: "Status/error message below header",
    },
    "statusMessageProps.state": {
      control: { type: "select" },
      options: ["success", "info", "error", "warning"],
      description: "Status message state",
    },
    "iconProps.position": {
      control: { type: "select" },
      options: ["start", "end", "top"],
      description: "Icon position relative to title",
    },
    "iconProps.size": {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Icon size variant",
    },
    hoverable: {
      control: { type: "boolean" },
      description: "Enable hover elevation effect",
    },
    loading: {
      control: { type: "boolean" },
      description: "Show loading skeleton state",
    },
  },
};

// Basic Examples
export const Playground = {
  args: {
    title: "Card Playground",
    subTitle: "Interactive testing",
    body: "Use the controls panel to explore different Card configurations and features.",
    icon: <FaPalette />,
    iconProps: { position: "start", size: "md" },
    badge: "Demo",
    badgeProps: { state: "info", position: "end" },
    variant: "outlined",
    size: "M",
    hoverable: true,
  },
};

export const Default = {
  args: {
    title: "Default Card",
    body: "Simple card with basic content and default styling.",
  },
};

export const Hoverable = {
  args: {
    title: "Hoverable Card",
    body: "This card responds to hover with subtle elevation and background changes.",
    hoverable: true,
  },
};

export const Loading = {
  args: {
    title: "Loading Card",
    loading: true,
    body: "Content hidden during loading state",
  },
};

// Icon Integration Examples
export const WithIconStart = {
  args: {
    title: "Creative Development",
    icon: <FaPalette />,
    iconProps: { position: "start", size: "md" },
    body: "Building digital experiences that combine aesthetic excellence with functional innovation.",
    variant: "elevated",
    hoverable: true,
  },
};

export const WithIconEnd = {
  args: {
    title: "External Link",
    icon: <FaExternalLinkAlt />,
    iconProps: { position: "end", size: "sm" },
    body: "Card with trailing icon to indicate external navigation.",
    variant: "outlined",
  },
};

export const WithIconTop = {
  args: {
    title: "Strategy & Analytics",
    icon: <FaChartLine />,
    iconProps: { position: "top", size: "lg" },
    body: "Strategic thinking meets data visualization to create meaningful insights.",
    variant: "filled",
  },
};

// Nested Props Configuration Examples
export const CustomizedTypography = {
  args: {
    title: "Custom Typography",
    titleProps: { size: "L" },
    subTitle: "Subtitle with custom styling",
    subTitleProps: { size: "M" },
    body: "Body text with customized appearance through nested props.",
    bodyProps: { size: "L" },
    variant: "outlined",
  },
};

export const DescriptionVariant = {
  args: {
    title: "With Description",
    titleProps: { size: "M" },
    description:
      "This card uses the description prop instead of body for semantic clarity.",
    descriptionProps: { size: "M" },
    variant: "elevated",
  },
};

// Layout and Content Examples
export const WithCover = {
  args: {
    title: "Media Card",
    titleProps: { size: "L" },
    cover: (
      <img
        alt="Placeholder content"
        src="/placeholder.png"
        style={{ height: "200px", objectFit: "cover" }}
      />
    ),
    body: "Cards can display media content at the top with supporting text below.",
    variant: "outlined",
    hoverable: true,
  },
};

export const WithActions = {
  render: () => {
    const actions = [
      { key: "save", label: "Save Draft" },
      { key: "publish", label: "Publish" },
      { key: "cancel", label: "Cancel" },
    ];
    return (
      <Card
        title="Document Editor"
        icon={<FaPen />}
        iconProps={{ position: "start" }}
        body="Card with multiple footer actions for user interactions."
        actions={actions}
        variant="elevated"
      />
    );
  },
};

export const Interactive = {
  args: {
    title: "Interactive Card",
    icon: <FaGithub />,
    iconProps: { position: "start" },
    subTitle: "Clickable surface",
    description:
      "Set `interactive` or `onClick` to make the card behave like a button without wrapping it in a link.",
    interactive: true,
    hoverable: true,
    variant: "outlined",
    onClick: () => alert("Card clicked!"),
  },
};

// Link Variant
export const AsLink = {
  args: {
    title: "Portfolio Project",
    icon: <FaExternalLinkAlt />,
    iconProps: { position: "end", size: "sm" },
    body: "This entire card functions as a clickable link while maintaining semantic structure.",
    link: "https://example.com",
    linkLabel: "View portfolio project details",
    variant: "elevated",
    hoverable: true,
  },
};

// Size Variants
export const SmallSize = {
  args: {
    title: "Compact Card",
    icon: <FaStar />,
    iconProps: { position: "start", size: "sm" },
    body: "Reduced padding for dense layouts.",
    size: "S",
    variant: "filled",
  },
};

export const LargeSize = {
  args: {
    title: "Spacious Card",
    titleProps: { size: "XL" },
    icon: <FaHeart />,
    iconProps: { position: "top", size: "lg" },
    body: "Generous spacing for prominent content areas.",
    bodyProps: { size: "L" },
    size: "L",
    variant: "elevated",
    hoverable: true,
  },
};

// Complex Layout Examples
export const ProfileCard = {
  args: {
    title: "Sarah Johnson",
    titleProps: { size: "L" },
    subTitle: "Senior Designer",
    icon: <FaUser />,
    iconProps: { position: "start" },
    cover: (
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          height: "120px",
        }}
      />
    ),
    body: "Passionate about creating meaningful digital experiences with a focus on accessibility and user research.",
    variant: "elevated",
    hoverable: true,
  },
};

export const MetricCard = {
  args: {
    title: "Page Views",
    titleProps: { size: "M" },
    body: "12,847",
    bodyProps: { size: "L" },
    description: "↗ 23% from last week",
    descriptionProps: { size: "S" },
    icon: <FaEye />,
    iconProps: { position: "end", size: "sm" },
    variant: "outlined",
    size: "S",
  },
};

export const EventCard = {
  args: {
    title: "Design System Workshop",
    titleProps: { size: "L" },
    subTitle: "Online Event",
    icon: <FaCalendar />,
    iconProps: { position: "start" },
    body: "Join us for an interactive session on building scalable design systems with modern tools and methodologies.",
    variant: "filled",
    hoverable: true,
  },
};

// Tabbed Example
const TabbedStoryComponent = () => {
  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "details", label: "Details" },
    { key: "specs", label: "Specifications" },
    { key: "disabled", label: "Disabled", disabled: true },
  ];
  const [active, setActive] = React.useState("overview");

  const content = {
    overview: "This is the overview tab with general information.",
    details: "Detailed specifications and technical information.",
    specs: "Complete technical specifications and requirements.",
  };

  return (
    <Card
      title="Tabbed Interface"
      icon={<FaGithub />}
      iconProps={{ position: "start" }}
      tabs={tabs}
      activeTabKey={active}
      onTabChange={setActive}
      body={
        content[active as keyof typeof content] ||
        "Select a tab to view content"
      }
      variant="outlined"
    />
  );
};

export const Tabbed = {
  render: () => <TabbedStoryComponent />,
};

// Real-world Use Cases (Matching current codebase patterns)
export const ProjectCard = {
  args: {
    title: "Digital Portfolio",
    titleProps: { size: "L" },
    icon: <FaPalette />,
    iconProps: { position: "start" },
    cover: (
      <img
        alt="Project screenshot"
        src="/placeholder.png"
        style={{ height: "180px", objectFit: "cover" }}
      />
    ),
    body: "A comprehensive portfolio showcasing creative development and strategic design thinking.",
    link: "/portfolio",
    linkLabel: "View full portfolio",
    variant: "elevated",
    hoverable: true,
  },
};

export const ServiceHighlight = {
  args: {
    title: "Creative Development",
    titleProps: { size: "L" },
    icon: <FaPalette />,
    iconProps: { position: "top", size: "lg" },
    description:
      "Building digital experiences that combine aesthetic excellence with functional innovation.",
    descriptionProps: { size: "M" },
    variant: "elevated",
    hoverable: true,
    size: "L",
  },
};

// Badge Examples
export const WithBadgeEnd = {
  args: {
    title: "New Feature",
    badge: "Beta",
    badgeProps: { state: "info", position: "end" },
    body: "This card demonstrates badge positioning at the end of the header.",
    variant: "outlined",
  },
};

export const WithBadgeStart = {
  args: {
    title: "Critical Issue",
    badge: "3",
    badgeProps: { state: "error", position: "start", size: "s" },
    icon: <FaBug />,
    iconProps: { position: "end", size: "sm" },
    body: "Badge positioned at the start of the header with an icon at the end.",
    variant: "elevated",
  },
};

export const WithCustomBadge = {
  args: {
    title: "Premium Service",
    badge: <FaStar style={{ color: "var(--color-warning, #fbbf24)" }} />,
    body: "Custom React element as badge content.",
    variant: "filled",
  },
};

// Status Message Examples
export const WithSuccessMessage = {
  args: {
    title: "Form Submitted",
    icon: <FaCheck />,
    iconProps: { position: "start", size: "md" },
    statusMessage: "Your information has been successfully saved.",
    statusMessageProps: { state: "success" },
    body: "Thank you for your submission. You will receive a confirmation email shortly.",
    variant: "elevated",
  },
};

export const WithErrorMessage = {
  args: {
    title: "Validation Error",
    icon: <FaExclamationTriangle />,
    iconProps: { position: "start", size: "md" },
    statusMessage: "Please check the required fields and try again.",
    statusMessageProps: { state: "error" },
    body: "Some fields contain invalid data that needs to be corrected.",
    variant: "outlined",
  },
};

export const WithWarningMessage = {
  args: {
    title: "Storage Almost Full",
    statusMessage: "You have used 90% of your storage quota.",
    statusMessageProps: { state: "warning" },
    body: "Consider upgrading your plan or removing unused files.",
    variant: "filled",
    hoverable: true,
  },
};

// Size Comparison Examples
export const SizeSmall = {
  args: {
    title: "Compact Card",
    size: "S",
    badge: "New",
    badgeProps: { state: "success", size: "s" },
    body: "Small card with 320px max-width for dense layouts.",
    variant: "outlined",
  },
};

export const SizeMedium = {
  args: {
    title: "Medium Card",
    size: "M",
    icon: <FaUser />,
    iconProps: { position: "start" },
    body: "Medium card with 480px max-width for balanced content.",
    variant: "elevated",
  },
};

export const SizeLarge = {
  args: {
    title: "Large Card",
    size: "L",
    icon: <FaChartLine />,
    iconProps: { position: "top", size: "lg" },
    body: "Large card with 600px max-width for detailed content and generous spacing.",
    variant: "filled",
    hoverable: true,
  },
};

export const SizeFullWidth = {
  args: {
    title: "Full-Width Card",
    size: "full",
    statusMessage: "This card spans the full width of its container.",
    statusMessageProps: { state: "info" },
    body: "Full-width cards adapt to their container and are useful for dashboard layouts.",
    variant: "elevated",
  },
};

// Complex Combination Examples
export const ComplexExample = {
  args: {
    title: "Feature Request",
    titleProps: { size: "L" },
    icon: <FaPalette />,
    iconProps: { position: "start", size: "md" },
    badge: "High Priority",
    badgeProps: { state: "warning", position: "end" },
    statusMessage: "Waiting for product team review",
    statusMessageProps: { state: "info" },
    body: "A comprehensive example showcasing multiple Card features working together.",
    variant: "elevated",
    hoverable: true,
    size: "L",
  },
};
