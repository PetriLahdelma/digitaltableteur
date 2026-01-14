import {
  LayoutGrid,
  Code,
  Compass,
  PenTool,
  Sparkles,
  Layers,
} from "lucide-react";

/**
 * Service icons for the homepage services section.
 * Re-exports lucide-react icons with consistent naming.
 */

/** UX & Interfaces - Layout/grid icon */
export const UxInterfacesIcon = LayoutGrid;

/** Creative & Development - Code icon */
export const CreativeDevelopmentIcon = Code;

/** Branding & Strategy - Compass/direction icon */
export const BrandingStrategyIcon = Compass;

/** Editorial & Illustration - Pen tool icon */
export const EditorialIllustrationIcon = PenTool;

/** AI Solutions & Integration - Sparkles/magic icon */
export const AiSolutionsIcon = Sparkles;

/** Design Systems - Layers/components icon */
export const DesignSystemsIcon = Layers;

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
