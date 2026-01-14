import {
  ChevronRight,
  Code,
  ChevronUp,
  Check,
  Sparkles,
  ChevronDown,
} from "lucide-react";

/**
 * Service icons for the homepage services section.
 * Re-exports lucide-react icons with consistent naming.
 */

/** UX & Interfaces - Layout/grid icon */
export const UxInterfacesIcon = ChevronRight;

/** Creative & Development - Code icon */
export const CreativeDevelopmentIcon = Code;

/** Branding & Strategy - Direction icon */
export const BrandingStrategyIcon = ChevronUp;

/** Editorial & Illustration - Check icon */
export const EditorialIllustrationIcon = Check;

/** AI Solutions & Integration - Sparkles/magic icon */
export const AiSolutionsIcon = Sparkles;

/** Design Systems - Layers/components icon */
export const DesignSystemsIcon = ChevronDown;

/**
 * All service icons as an array for iteration
 */
export const serviceIcons = {
  ux: UxInterfacesIcon,
  creative: CreativeDevelopmentIcon,
  branding: BrandingStrategyIcon,
  editorial: EditorialIllustrationIcon,
  ai: AiSolutionsIcon,
  designSystems: DesignSystemsIcon,
} as const;

export type ServiceIconKey = keyof typeof serviceIcons;
