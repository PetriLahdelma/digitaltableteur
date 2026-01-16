import {
  Layers,
  Code,
  Crosshair,
  PenTool,
  Sparkles,
  LayoutGrid,
} from "lucide-react";

/**
 * Service icons for the homepage services section.
 * Re-exports lucide-react icons with consistent naming.
 */

/** UX & Interfaces - Layers icon representing interface layers */
export const UxInterfacesIcon = Layers;

/** Creative & Development - Code icon */
export const CreativeDevelopmentIcon = Code;

/** Branding & Strategy - Crosshair icon representing strategic precision/focus */
export const BrandingStrategyIcon = Crosshair;

/** Editorial & Illustration - PenTool icon representing creative illustration */
export const EditorialIllustrationIcon = PenTool;

/** AI Solutions & Integration - Sparkles/magic icon (keeping this one) */
export const AiSolutionsIcon = Sparkles;

/** Design Systems - LayoutGrid icon representing modular component systems */
export const DesignSystemsIcon = LayoutGrid;

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
