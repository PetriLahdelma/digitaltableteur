// Note: lucide-react types work at runtime but have resolution issues with
// moduleResolution: "bundler". Icons are correctly exported at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import * as LucideIcons from "lucide-react";

type LucideIcon = typeof LucideIcons.Code;

/**
 * Service icons for the homepage services section.
 * Re-exports lucide-react icons with consistent naming.
 */

/** UX & Interfaces - Layers icon representing interface layers */
export const UxInterfacesIcon = (LucideIcons as Record<string, LucideIcon>).Layers;

/** Creative & Development - Code icon */
export const CreativeDevelopmentIcon = LucideIcons.Code;

/** Branding & Strategy - Crosshair icon representing strategic precision/focus */
export const BrandingStrategyIcon = (LucideIcons as Record<string, LucideIcon>).Crosshair;

/** Editorial & Illustration - PenTool icon representing creative illustration */
export const EditorialIllustrationIcon = (LucideIcons as Record<string, LucideIcon>).PenTool;

/** AI Solutions & Integration - Sparkles/magic icon (keeping this one) */
export const AiSolutionsIcon = LucideIcons.Sparkles;

/** Design Systems - LayoutGrid icon representing modular component systems */
export const DesignSystemsIcon = (LucideIcons as Record<string, LucideIcon>).LayoutGrid;

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
