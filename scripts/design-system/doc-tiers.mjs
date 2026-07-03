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
 */
export const DOC_TIER_1 = [
    // Actions
    'Button', 'IconButton', 'SplitButton', 'Tag',
    // Typography & content
    'Text', 'Title', 'Display', 'List', 'Badge', 'Icon', 'Avatar',
    'CodeSnippet', 'CodeBlockWindow',
    // Forms
    'TextInput', 'TextArea', 'Select', 'Checkbox', 'CheckboxGroup', 'Radio',
    'RadioGroup', 'Switch', 'Combobox', 'MultiCombobox', 'PhoneInput',
    'FileUpload', 'FormField', 'Label', 'HelperText', 'GroupLabel',
    // Feedback & status
    'AlertBanner', 'Toast', 'Progress', 'Spinner', 'BusyIndicator',
    'Skeleton', 'Tooltip', 'Modal',
    // Navigation
    'Link', 'NavLink', 'Breadcrumb', 'Tabs', 'Pagination', 'SkipLink',
    'LanguageSwitcher',
    // Layout & structure
    'Card', 'Container', 'Grid', 'FlexBox', 'Stack', 'Center', 'Spacer',
    'Section', 'Divider', 'AspectRatio', 'Accordion', 'ExpandableSection',
    'MacWindowFrame',
];

export function docTierFor(name) {
    return DOC_TIER_1.includes(name) ? 1 : 2;
}
