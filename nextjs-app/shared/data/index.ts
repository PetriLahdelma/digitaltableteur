// Project data and utilities
export {
  projects,
  categories,
  filterProjects,
  getProjectBySlug,
  getRelatedProjects,
  getFeaturedProjects,
  getProjectNavigation,
  type Project,
  type ProjectCategory,
  type CategoryOption,
} from "./projects";

// Donny site action registry
export {
  DONNY_SITE_TARGETS,
  donnyTargetSelector,
  getDonnyTarget,
  getDonnyTargetOrThrow,
  getDonnyTargetByPackageId,
  getDonnyTargetByProjectSlug,
  getDonnyTargetCatalog,
  getDonnyTargetsByIntent,
  getDonnyTargetsByRoute,
  isDonnyTargetId,
  isSafeDonnyRoute,
  isStaticDonnySelector,
  validateDonnySiteRegistry,
  type DonnyHighlightMode,
  type DonnyTarget,
  type DonnyTargetId,
  type DonnyTargetIntent,
} from "./donny-site-actions";
