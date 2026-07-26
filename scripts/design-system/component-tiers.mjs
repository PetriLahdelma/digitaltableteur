/**
 * Atomic design tiers for Storybook sidebar + contracts.
 */
import { TIER_PREFIX } from "./in-scope-components.mjs";

/** @type {Record<string, { tier: string, storyPath?: string }>} */
export const COMPONENT_TIERS = {
  Accordion: { tier: "molecule" },
  AlertBanner: { tier: "molecule" },
  ArticleCard: { tier: "molecule" },
  Author: { tier: "molecule" },
  AuthorBio: { tier: "molecule" },
  Avatar: { tier: "atom" },
  Badge: { tier: "atom" },
  Breadcrumb: { tier: "molecule" },
  Button: { tier: "atom" },
  Card: { tier: "molecule" },
  Checkbox: { tier: "atom" },
  CheckboxGroup: { tier: "molecule" },
  ClientLogoMarquee: { tier: "organism" },
  CodeBlockWindow: { tier: "organism" },
  CodeSnippet: { tier: "molecule" },
  ComplianceCard: { tier: "molecule" },
  ContactForm: { tier: "organism" },
  ContactFormEditorial: { tier: "organism" },
  Container: { tier: "atom" },
  CookieConsent: { tier: "organism" },
  DataTable: { tier: "organism", storyPath: "Data display/DataTable" },
  DonnyAvatar: { tier: "molecule" },
  EmailSignatureGenerator: { tier: "organism" },
  EnhancedProjectCard: { tier: "molecule" },
  FadeIn: { tier: "atom", storyPath: "Site/Animations/FadeIn" },
  FileUpload: { tier: "molecule" },
  FlexBox: { tier: "atom" },
  FormFieldEditorial: { tier: "molecule" },
  Grid: { tier: "atom" },
  HelperText: { tier: "atom" },
  Icon: { tier: "atom" },
  ImagePlaceholder: { tier: "atom" },
  Label: { tier: "atom" },
  Link: { tier: "atom" },
  LinkedInQuoteCard: { tier: "molecule" },
  List: { tier: "molecule" },
  MacWindowFrame: { tier: "molecule" },
  MarkdownMessage: { tier: "molecule", storyPath: "Site/Chat/MarkdownMessage" },
  MCPActionButton: { tier: "molecule" },
  Modal: { tier: "molecule" },
  NavMenuList: { tier: "molecule" },
  NewsletterWaitlist: { tier: "organism" },
  OpenHours: { tier: "molecule" },
  PersonCard: { tier: "molecule" },
  PhoneInput: { tier: "molecule" },
  Section: { tier: "atom" },
  SecureCVDownload: { tier: "molecule" },
  Select: { tier: "molecule" },
  SelectOption: { tier: "atom" },
  ServiceCard: { tier: "molecule" },
  ServicesGrid: { tier: "organism" },
  SentrySummaryCard: { tier: "molecule" },
  Skeleton: { tier: "atom" },
  SkipLink: { tier: "atom" },
  SocialShare: { tier: "molecule" },
  SplitButton: { tier: "molecule" },
  Stack: { tier: "atom" },
  Switch: { tier: "atom" },
  Tabs: { tier: "molecule" },
  Testimonial: { tier: "molecule" },
  Text: { tier: "atom" },
  TextInput: { tier: "atom" },
  ThemeProvider: { tier: "atom", storyPath: "Foundations/ThemeProvider" },
  Title: { tier: "atom" },
  Toast: { tier: "molecule" },
  TransformingActionInput: { tier: "molecule" },
  TreeView: { tier: "organism", storyPath: "Navigation/TreeView" },
  VirtualList: { tier: "organism", storyPath: "Data display/VirtualList" },
  WipBadge: { tier: "atom" },
  Divider: { tier: "atom" },
  VisuallyHidden: { tier: "atom" },
  Progress: { tier: "atom" },
  Spinner: { tier: "atom" },
  TextArea: { tier: "atom" },
  Radio: { tier: "atom" },
  RadioGroup: { tier: "molecule" },
  ResizablePanelGroup: {
    tier: "organism",
    storyPath: "Layout/ResizablePanelGroup",
  },
  ReadingProgress: { tier: "molecule", storyPath: "Site/ReadingProgress" },
  Designerman: { tier: "molecule" },
  AIProcessingState: {
    tier: "molecule",
    storyPath: "Site/Chat/AIProcessingState",
  },
  ChatComposer: { tier: "molecule", storyPath: "Site/Chat/ChatComposer" },
  ChatHeader: { tier: "molecule", storyPath: "Site/Chat/ChatHeader" },
  ChatMessageBubble: {
    tier: "molecule",
    storyPath: "Site/Chat/ChatMessageBubble",
  },
  ChatMessages: { tier: "molecule", storyPath: "Site/Chat/ChatMessages" },
  ChatToggle: { tier: "molecule", storyPath: "Site/Chat/ChatToggle" },
  ChatWidget: { tier: "organism", storyPath: "Site/ChatWidget" },
  EmailWorkflow: { tier: "molecule", storyPath: "Site/Chat/EmailWorkflow" },
  NextLayout: { tier: "template", storyPath: "Templates/NextLayout" },
  NextLayoutShell: { tier: "template", storyPath: "Templates/NextLayoutShell" },
};

export function storyTitleFor(componentName) {
  const entry = COMPONENT_TIERS[componentName];
  if (entry?.storyPath) return entry.storyPath;
  const tier = entry?.tier ?? "molecule";
  const prefix = TIER_PREFIX[tier] ?? "Molecules";
  return `${prefix}/${componentName}`;
}

export function tierFor(componentName) {
  return COMPONENT_TIERS[componentName]?.tier ?? "molecule";
}
