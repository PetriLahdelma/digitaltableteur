// Re-export Tailwind-first UI primitives
// Tag was deleted 2026-07-03 (Astryx Phase 3 batch 1): Badge covers the whole
// surface (variant x tone, removable chip mode, auto status icons) — use @dt/Badge.
export { Divider, type DividerProps } from "../Divider";
export { IconButton, type IconButtonProps } from "../IconButton";
export { VisuallyHidden, type VisuallyHiddenProps } from "../VisuallyHidden";
export { Prose, type ProseProps } from "../Prose";

// Work/Portfolio components
export { CategoryFilter, type CategoryFilterProps } from "../CategoryFilter";
export { EnhancedProjectCard, type EnhancedProjectCardProps } from "../EnhancedProjectCard";
export { ProjectGallery, type ProjectGalleryProps, type GalleryImage } from "../ProjectGallery";
export { ProjectNav, type ProjectNavProps } from "../ProjectNav";

// Form components
// TextInput/TextArea are the canonical CSS-Modules @dt components, not
// Tailwind-first primitives — import them directly from @dt/TextInput and
// @dt/TextArea instead of this Tailwind-primitives barrel.
export { FormField, type FormFieldProps } from "../FormField";

// Contact page components
export { LocationCard, type LocationCardProps } from "../LocationCard";
export { ContactFormSuccess, type ContactFormSuccessProps } from "../ContactFormSuccess";

// Re-export shadcn/ui components for convenience
export { Button, buttonVariants } from "@/components/ui/button";
export { Input } from "@/components/ui/input";
export { Textarea } from "@/components/ui/textarea";
export { Label } from "@/components/ui/label";
export { Checkbox } from "@/components/ui/checkbox";
export { Switch } from "@/components/ui/switch";
