/**
 * Doc tiers for the Astryx-level documentation push (spec:
 * docs/superpowers/specs/2026-07-03-astryx-level-design-system-roadmap.md).
 * Tier 1 gets the full doc treatment (usage, bestPractices, anatomy,
 * keywords, playground, dense). Everything else in the catalog is Tier 2
 * (usage.description, keywords, dense only).
 *
 * `Prose` and `Lightbox` are deliberately excluded here: both are
 * `bucket: "exempt"` app-infrastructure folders per
 * nextjs-app/shared/foundations/dist/non-agent-surfaces.json and
 * docs/CATALOG-POLICY.md ("do not add to manifest without an ADR"). Neither
 * has (or is expected to get) a `.contract.json`, so including them here
 * would make report-doc-coverage.mjs's WARNING cross-check fire permanently.
 *
 * The category names double as the Storybook sidebar groups (Astryx Phase 2
 * regroup): `<Category>/<Name>` story titles, Tier 2 under `Site/`.
 */
export const DOC_TIER_1_CATEGORIES = {
    // Tag was deleted in Phase 3 batch 1: Badge (Content) covers the whole
    // surface (variant x tone, removable chip mode, auto status icons).
    Actions: ['Button', 'IconButton', 'SplitButton'],
    Content: [
        'Text', 'Title', 'Display', 'List', 'Badge', 'Icon', 'Avatar',
        'CodeSnippet', 'CodeBlockWindow',
    ],
    Forms: [
        'TextInput', 'TextArea', 'Select', 'Checkbox', 'CheckboxGroup', 'Radio',
        'RadioGroup', 'Switch', 'Combobox', 'MultiCombobox', 'PhoneInput',
        'FileUpload', 'FormField', 'Label', 'HelperText', 'GroupLabel',
    ],
    Feedback: [
        'AlertBanner', 'Toast', 'Progress', 'Spinner',
        'Skeleton', 'Tooltip', 'Modal',
    ],
    Navigation: [
        'Link', 'NavLink', 'Breadcrumb', 'Tabs', 'Pagination', 'SkipLink',
        'LanguageSwitcher',
    ],
    Layout: [
        'Card', 'Container', 'Grid', 'FlexBox', 'Stack', 'Center', 'Spacer',
        'Section', 'Divider', 'AspectRatio', 'Accordion', 'ExpandableSection',
        'MacWindowFrame',
    ],
};

export const DOC_TIER_1 = Object.values(DOC_TIER_1_CATEGORIES).flat();

export function docTierFor(name) {
    return DOC_TIER_1.includes(name) ? 1 : 2;
}

/** Sidebar category for a Tier 1 component, or null for Tier 2. */
export function categoryFor(name) {
    for (const [category, names] of Object.entries(DOC_TIER_1_CATEGORIES)) {
        if (names.includes(name)) return category;
    }
    return null;
}
