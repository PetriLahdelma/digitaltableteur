/**
 * Backtest cases: twelve shipped bugs, each with a grader from graders.mjs.
 * A grader earns its place if it FAILS the buggy state and PASSES the fix.
 *
 * mode "static":    grade file contents at the fix's parent vs the fix.
 * mode "storybook": reverse-apply the fix to the current tree (re-introduce the
 *                   bug), grade against the running Storybook, then restore.
 * mode "prod":      same, but needs a production build: graded in two passes
 *                   (mutated build, then the HEAD build).
 */

export const CASES = [
  {
    id: "F1-proofblock-dark",
    fix: "8cca46ecd",
    failure: "F1 theme-blind colour",
    mode: "storybook",
    files: ["nextjs-app/shared/patterns/ProofBlock/ProofBlock.module.css"],
    grader: "contrastInThemes",
    args: { storyId: "patterns-proofblock--tight-dark", themes: ["dark"] },
  },
  {
    id: "F2-phantom-tokens",
    fix: "f1c1c5dec",
    failure: "F2 phantom token",
    mode: "static",
    grader: "phantomTokensInFiles",
    argsFromCommit: "cssFiles",
  },
  {
    id: "F3-breadcrumb-at",
    fix: "98119b5e7",
    failure: "F3 accessible semantics",
    mode: "storybook",
    files: ["nextjs-app/shared/components/Breadcrumb/Breadcrumb.tsx"],
    grader: "decorativeGlyphsHidden",
    args: { storyId: "navigation-breadcrumb--default" },
  },
  {
    id: "F4-filter-focus-clip",
    fix: "2abb405bc",
    failure: "F4 focus clipped",
    mode: "storybook",
    files: [
      "nextjs-app/shared/components/CategoryFilter/CategoryFilter.tsx",
      "nextjs-app/shared/components/BlogCategoryFilter/BlogCategoryFilter.tsx",
    ],
    grader: "focusNotClipped",
    args: { storyId: "site-categoryfilter--default" },
  },
  {
    id: "F5-attribution",
    fix: "9c028fbe1",
    failure: "F5 mixed attribution",
    mode: "static",
    grader: "attributionMatchesRecord",
    args: {},
  },
  {
    id: "F6-lockfile",
    fix: "a156bd9a0",
    failure: "F6 deploy-blocking dependency change",
    mode: "static",
    grader: "lockfileInstallsOnLinux",
    args: {},
  },
  {
    id: "F11-ios-icon-size",
    fix: "8c5cc6691",
    failure: "F11 iOS only",
    mode: "prod",
    files: ["app/globals.css"],
    grader: "iconsMatchAcrossEngines",
    args: { path: "/" },
  },
  {
    id: "F9-modal-repaints-nested",
    fix: "97dc6d6c6",
    failure: "F9 cascade defeats DS styles",
    mode: "storybook",
    files: ["nextjs-app/shared/components/Modal/Modal.module.css"],
    grader: "containerRulesDoNotRepaint",
    args: { storyId: "feedback-modal--form-in-modal", container: "Modal" },
  },
  {
    id: "F10-raw-keys",
    fix: "a209e486d",
    failure: "F10 i18n raw keys",
    mode: "static",
    grader: "untranslatedKeys",
    args: { locales: ["en"] },
  },
  {
    id: "F10-hydration-fi",
    fix: "184dace3d",
    failure: "F10/F12 hydration mismatch",
    mode: "prod",
    files: ["providers/I18nProvider.tsx"],
    grader: "noHydrationErrors",
    args: { path: "/blog", language: "fi", loads: 14 },
  },
  {
    id: "F1-logos-hcb",
    fix: "3b372e618",
    failure: "F1 theme-blind colour (graphics)",
    mode: "prod",
    files: ["app/globals.css"],
    grader: "graphicVisible",
    args: { path: "/", theme: "hcb", selector: "img.client-logo-marquee-image" },
  },
  {
    id: "F1-switch-hcb",
    fix: "52349bed5",
    failure: "F1 theme-blind colour (non-text)",
    mode: "storybook",
    files: ["nextjs-app/shared/components/Switch/Switch.module.css"],
    // The fix's hunks no longer reverse-apply (the file moved on), so the bug
    // is re-introduced directly: the handle loses its HC ring.
    mutate: {
      find: "0 0 0 1px var(--switch-handle-ring-color, transparent)",
      replace: "0 0 0 0 transparent",
    },
    grader: "partsDistinguishable",
    args: {
      storyId: "forms-switch--default",
      theme: "hcb",
      part: '[class*="Switch-module__handle"]',
      track: '[role="switch"]',
    },
  },
];
