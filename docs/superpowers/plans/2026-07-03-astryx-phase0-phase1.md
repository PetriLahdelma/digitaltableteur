# Astryx Roadmap Phase 0 + Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute the approved consolidations (Phase 0) and build the doc data layer (Phase 1) from `docs/superpowers/specs/2026-07-03-astryx-level-design-system-roadmap.md`.

**Architecture:** Phase 0 removes/merges 9 duplicate or orphaned components so nothing gets documented twice, using typecheck to enumerate breakage after each move. Phase 1 extends `contract.schema.v2.json` with Astryx-style doc fields (usage, bestPractices, anatomy, keywords, playground, dense), adds ratchet enforcement in `validate:components` (rules apply once a component adopts the fields), a serializable element-descriptor resolver for the future Storybook frame, and authors Button as the content exemplar.

**Tech Stack:** TypeScript 6 strict, React 19, CSS Modules, vitest, ts-morph (existing validator), ajv (existing schema validation), Storybook 10.

## Global Constraints

- Platinum API conventions: `variant` = visual weight, `tone` = semantic color (`neutral|error|warning|success|info`), sizes `sm|md|lg`, `surface: default|onDark|onBrand`, unprefixed booleans (`disabled`, `loading`, not `isDisabled`).
- CSS Modules only; no inline styles; no hardcoded colors; design tokens from `nextjs-app/shared/styles/variables.css`.
- User-facing strings via i18next with en + fi + sv keys in `nextjs-app/shared/locales/{en,fi,sv}/translation.json`.
- No em dashes in any authored prose (user writing rule).
- Conventional Commits. Every task ends with a commit.
- After any component deletion or contract change, regenerate derived artifacts: `npm run build:tokens && npm run build:zod-catalog`, then `npm run check:generated`.
- If `check:contract-drift --strict` flags an intentional contract edit, follow the remediation printed by the script (it documents its own authorization flow).
- Final PR gate (local, before merge): `npm run typecheck && npm run lint && npm test && npm run build`, all exit 0. Merge with `gh pr merge --admin --squash`. Never wait on GitHub Actions checks.
- Branch: create `DT-XXX-astryx-phase0-phase1` fresh off `main`.

**Deliberate deviations from the spec:** (1) The spec's Phase 1 "backfill script stubs" is replaced by ratchet enforcement (Task 10) plus a real exemplar (Task 12); empty-but-valid stubs would add noise without value and fight the validator's no-placeholder philosophy. (2) BusyIndicator-vs-Spinner deduplication and the Toast/Toaster docs merge are deferred to the Phase 3 feedback batch; both are docs-level calls that do not risk double-documentation before then.

**Component deletion checklist** (referenced by Tasks 1, 2, 3, 4, 5): delete the directory; remove the name from `scripts/design-system/component-tiers.mjs` `COMPONENT_TIERS` if present; remove any export line from `nextjs-app/shared/components/index.ts` if present; grep the repo for remaining references (`grep -rn "<Name>" app nextjs-app scripts .storybook --include="*.ts*" --include="*.mjs" --include="*.mdx" | grep -v node_modules`); run `npm run typecheck` and fix every hit; regenerate derived artifacts per Global Constraints.

---

### Task 1: Delete Heading (absorbed by Title)

**Files:**
- Delete: `nextjs-app/shared/components/Heading/` (entire directory)
- Modify: any file typecheck flags (expected: none; Heading has 0 production importers and no barrel export)

**Interfaces:**
- Consumes: nothing.
- Produces: Title is the only heading component. Later tasks and Phase 3 docs reference `Title` exclusively.

- [ ] **Step 1: Confirm zero references outside the directory**

Run: `grep -rn "Heading" app nextjs-app scripts .storybook --include="*.ts*" --include="*.mjs" | grep -v "components/Heading/" | grep -v node_modules | grep -vE "GroupLabel|AnchorHeading|aria-|heading" | grep -E "@dt/Heading|components/Heading|from ['\"].*Heading['\"]"`
Expected: no output. If any hit appears, replace it with the `Title` equivalent (`<Title as="h2" size="...">`) before deleting.

- [ ] **Step 2: Delete and clean up**

```bash
git rm -r nextjs-app/shared/components/Heading
```
Apply the component deletion checklist (tiers file: Heading is NOT listed, so no edit expected; barrel: not exported, so no edit expected).

- [ ] **Step 3: Regenerate and verify**

Run: `npm run build:tokens && npm run build:zod-catalog && npm run typecheck && npm run validate:components`
Expected: all exit 0; agent-manifest no longer contains Heading.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "refactor(design-system): delete Heading, Title is the canonical heading"
```

---

### Task 2: Absorb TextLink into Link

**Files:**
- Modify: `nextjs-app/shared/patterns/SiteFooter/SiteFooter.tsx` (the single production importer)
- Delete: `nextjs-app/shared/components/TextLink/` (entire directory)

**Interfaces:**
- Consumes: `Link` from `@dt/Link` (stable platinum: `size`, `tone`, underline variants; verify exact props by reading `nextjs-app/shared/components/Link/Link.tsx` before mapping).
- Produces: Link is the only inline link component; NavLink remains the nav-aware variant.

- [ ] **Step 1: Migrate SiteFooter**

In `SiteFooter.tsx`, replace `import { TextLink } from "@/nextjs-app/shared/components/TextLink"` with `import Link from "@dt/Link"` (match the Link barrel's actual export form) and swap each `<TextLink ...>` usage. Map props by reading both components: TextLink's `href/children` map 1:1; for any TextLink-only prop (external detection), Link's existing API covers external rel/target handling; if a visual prop has no Link equivalent, use the closest `tone`/`underline` variant and note it in the commit body.

- [ ] **Step 2: Verify SiteFooter renders**

Run: `npm run typecheck && npx vitest run nextjs-app/shared/patterns/SiteFooter --reporter=basic`
Expected: exit 0. If SiteFooter has a Storybook story, spot-check it later in the final gate's story smoke run.

- [ ] **Step 3: Delete TextLink**

```bash
git rm -r nextjs-app/shared/components/TextLink
```
Apply the component deletion checklist.

- [ ] **Step 4: Regenerate, verify, commit**

Run: `npm run build:tokens && npm run build:zod-catalog && npm run typecheck && npm run validate:components`
Expected: exit 0.

```bash
git add -A && git commit -m "refactor(design-system): absorb TextLink into Link (single importer migrated)"
```

---

### Task 3: Delete EnhancedContactForm + EnhancedPersonCard

Do this BEFORE Tasks 4 and 6: EnhancedContactForm is the only importer of FormGroup and one of the `@dt/Inputs` importers, so deleting it first shrinks those tasks.

**Files:**
- Delete: `nextjs-app/shared/components/EnhancedContactForm/` and `nextjs-app/shared/components/EnhancedPersonCard/`

**Interfaces:**
- Consumes: nothing.
- Produces: FormGroup and CheckboxField reach 0 importers (Task 6); `@dt/Inputs` importer count drops (Task 7).

- [ ] **Step 1: Confirm no production imports**

Run: `grep -rn "EnhancedContactForm\|EnhancedPersonCard" app nextjs-app --include="*.tsx" | grep -v "components/EnhancedContactForm/\|components/EnhancedPersonCard/" | grep -v "\.stories\.\|\.test\."`
Expected: no output (agent audit found stories-only references).

- [ ] **Step 2: Delete both directories, clean up**

```bash
git rm -r nextjs-app/shared/components/EnhancedContactForm nextjs-app/shared/components/EnhancedPersonCard
```
Apply the component deletion checklist (neither is in the barrel nor the tiers file per audit).

- [ ] **Step 3: Regenerate, verify, commit**

Run: `npm run build:tokens && npm run build:zod-catalog && npm run typecheck && npm run validate:components`
Expected: exit 0.

```bash
git add -A && git commit -m "refactor(design-system): delete orphaned EnhancedContactForm and EnhancedPersonCard (0 production importers)"
```

---

### Task 4: Fold AnimatedDialog motion into Modal

**Files:**
- Modify: `nextjs-app/shared/components/Modal/Modal.tsx`, `Modal.contract.json`, `Modal.stories.tsx`
- Test: `nextjs-app/shared/components/Modal/Modal.test.tsx`
- Delete: `nextjs-app/shared/components/AnimatedDialog/` (entire directory)

**Interfaces:**
- Consumes: Modal's existing `panelRef` prop and `isOpen`.
- Produces: `ModalProps` gains `animation?: "none" | "scale" | "slide" | "fade"` (default `"none"`). Phase 3 overlay docs document this prop.

- [ ] **Step 1: Write the failing test**

Add to `Modal.test.tsx`:

```tsx
describe("animation prop", () => {
    it("applies the entrance animation data attribute when animation is set", () => {
        render(
            <Modal isOpen animation="scale" title="Animated" onClose={() => {}}>
                content
            </Modal>,
        );
        expect(screen.getByRole("dialog")).toHaveAttribute("data-animation", "scale");
    });

    it("defaults to no animation attribute", () => {
        render(
            <Modal isOpen title="Plain" onClose={() => {}}>
                content
            </Modal>,
        );
        expect(screen.getByRole("dialog")).not.toHaveAttribute("data-animation");
    });
});
```

(If the dialog role lands on an inner panel element in Modal's DOM, target that element the same way Modal's existing tests locate the panel.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run nextjs-app/shared/components/Modal --reporter=basic -t "animation"`
Expected: FAIL (attribute never set).

- [ ] **Step 3: Implement**

In `Modal.tsx`:
1. Add to `ModalProps`: `animation?: "none" | "scale" | "slide" | "fade";` with default `"none"` in the destructure.
2. Set `data-animation={animation === "none" ? undefined : animation}` on the panel element.
3. Port AnimatedDialog's GSAP effect (its lines 63-97) into Modal, gated on the prop and the existing `prefersReducedMotion` check exactly as AnimatedDialog does (early-return when reduced motion). The effect targets the panel element Modal already exposes via `panelRef`; use an internal ref merged with the public `panelRef` so the effect works without a caller-provided ref.

Keep durations/eases tokenizable later; for now copy AnimatedDialog's values verbatim (`scale 0.95/0.2s`, `y 20/0.25s`, `fade 0.2s`, `power2.out`).

- [ ] **Step 4: Run tests**

Run: `npx vitest run nextjs-app/shared/components/Modal --reporter=basic`
Expected: PASS (new + existing).

- [ ] **Step 5: Add an example story**

In `Modal.stories.tsx`, add a story `AnimatedEntrance` using `animation="scale"` so the behavior stays visible and matrix-tested.

- [ ] **Step 6: Update contract and delete AnimatedDialog**

Add the `animation` prop to `Modal.contract.json` `props` (run `npm run sync:contract-props` if it manages the props block; check its output only touches Modal).

```bash
git rm -r nextjs-app/shared/components/AnimatedDialog
```
Apply the component deletion checklist (not in barrel, not in tiers file).

- [ ] **Step 7: Regenerate, verify, commit**

Run: `npm run build:tokens && npm run build:zod-catalog && npm run typecheck && npm run validate:components && npx vitest run nextjs-app/shared/components/Modal --reporter=basic`
Expected: exit 0.

```bash
git add -A && git commit -m "feat(design-system): fold AnimatedDialog entrance motion into Modal as animation prop"
```

---

### Task 5: Button gains clickAction; delete AdaptiveLoadingButton

**Files:**
- Modify: `nextjs-app/shared/components/Button/Button.tsx`, `Button.contract.json`, `Button.stories.tsx`, `nextjs-app/shared/components/ContactForm/ContactForm.tsx`
- Test: `nextjs-app/shared/components/Button/Button.test.tsx`
- Delete: `nextjs-app/shared/components/AdaptiveLoadingButton/` (entire directory), its line in `nextjs-app/shared/components/index.ts` and `scripts/design-system/component-tiers.mjs` (it IS present in both per audit)

**Interfaces:**
- Consumes: existing `BaseButtonProps.loading` rendering.
- Produces: `clickAction?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>` on `ButtonAsButton` only (not the link form). While the returned promise is pending, the button renders its existing `loading` state and sets `aria-busy`. `onClick` still fires first if both are provided (Astryx semantics).

- [ ] **Step 1: Write the failing tests**

Add to `Button.test.tsx`:

```tsx
describe("clickAction", () => {
    it("shows loading while the promise is pending and clears after resolve", async () => {
        let resolve!: () => void;
        const pending = new Promise<void>((r) => (resolve = r));
        render(<Button clickAction={() => pending}>Save</Button>);
        const button = screen.getByRole("button", { name: "Save" });

        await userEvent.click(button);
        expect(button).toHaveAttribute("aria-busy", "true");
        expect(button).toBeDisabled();

        resolve();
        await waitFor(() => expect(button).not.toHaveAttribute("aria-busy"));
        expect(button).toBeEnabled();
    });

    it("dedupes clicks while pending", async () => {
        let calls = 0;
        let resolve!: () => void;
        render(
            <Button
                clickAction={() => {
                    calls += 1;
                    return new Promise<void>((r) => (resolve = r));
                }}
            >
                Save
            </Button>,
        );
        const button = screen.getByRole("button", { name: "Save" });
        await userEvent.click(button);
        await userEvent.click(button);
        expect(calls).toBe(1);
        resolve();
    });

    it("clears loading when the promise rejects", async () => {
        render(
            <Button clickAction={() => Promise.reject(new Error("nope"))}>Save</Button>,
        );
        const button = screen.getByRole("button", { name: "Save" });
        await userEvent.click(button);
        await waitFor(() => expect(button).toBeEnabled());
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run nextjs-app/shared/components/Button --reporter=basic -t "clickAction"`
Expected: FAIL (prop does not exist; typecheck error is the failure mode).

- [ ] **Step 3: Implement clickAction**

In `Button.tsx`:
1. Add to `ButtonAsButton`: `clickAction?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;` and `href?: never` stays. Add `clickAction?: never;` to `ButtonAsLink`.
2. In the button branch (current lines ~261-272):

```tsx
const { submits = false, type, clickAction, onClick, ...buttonRest } = rest as ButtonAsButton;
const [actionPending, setActionPending] = useState(false);
const isLoading = loading || actionPending;

const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!clickAction || event.defaultPrevented) return;
    const result = clickAction(event);
    if (result && typeof (result as Promise<void>).finally === "function") {
        setActionPending(true);
        void (result as Promise<void>)
            .catch(() => {})
            .finally(() => setActionPending(false));
    }
};
```

3. Use `isLoading` wherever the button branch currently reads `loading` (disabled state, spinner content, `aria-busy`). The `useState` must be declared unconditionally at the top of the component (both branches share the function body), and the deduping comes from `disabled={disabled || isLoading}` (a disabled button cannot re-click).
4. Note: errors are swallowed after clearing the pending state; callers own error UX. Document this in the contract prop description.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run nextjs-app/shared/components/Button --reporter=basic`
Expected: PASS, including existing suites and the a11y test.

- [ ] **Step 5: Migrate ContactForm and delete AdaptiveLoadingButton**

`ContactForm.tsx` currently renders `AdaptiveLoadingButton` with externally-driven `loading`, i18n idle/loading labels, and optional `progress`. Replace with `Button`:

```tsx
<Button submits loading={loading} disabled={disabled}>
    {loading ? t("adaptiveLoadingButton.loading") : t("adaptiveLoadingButton.idle")}
</Button>
```

Preserve the exact translation keys already in use (they exist in all 3 locales). If ContactForm used `progress`, render the progress string inside the loading children the same way AdaptiveLoadingButton did (`t("adaptiveLoadingButton.progress", { percent })`). Then:

```bash
git rm -r nextjs-app/shared/components/AdaptiveLoadingButton
```
Apply the component deletion checklist: remove its export from `nextjs-app/shared/components/index.ts` AND its entry from `scripts/design-system/component-tiers.mjs` (line ~9).

- [ ] **Step 6: Contract, stories, regenerate**

Add `clickAction` to `Button.contract.json` props (via `npm run sync:contract-props` or manually matching the props block shape). Add a Button story `AsyncAction` demonstrating `clickAction` with a 1.5s fake promise.
Run: `npm run build:tokens && npm run build:zod-catalog && npm run typecheck && npm run validate:components && npx vitest run nextjs-app/shared/components/Button nextjs-app/shared/components/ContactForm --reporter=basic`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(design-system): Button clickAction with auto-loading; retire AdaptiveLoadingButton"
```

---

### Task 6: FormField absorbs FormGroup; delete CheckboxField

**Files:**
- Modify: `nextjs-app/shared/components/FormField/FormField.tsx`, `FormField.contract.json`, `FormField.stories.tsx`
- Test: `nextjs-app/shared/components/FormField/FormField.test.tsx`
- Delete: `nextjs-app/shared/components/CheckboxField/`, `nextjs-app/shared/components/FormGroup/`

**Interfaces:**
- Consumes: FormField's existing `useId` + `aria-describedby` cloning behavior (keep intact).
- Produces: `FormFieldProps` gains `legend?: string` and `groupDescription?: string`. When `legend` is set, FormField renders a `<fieldset>` with `<legend>` around its children instead of the single-control wrapper (absorbing FormGroup). Checkbox-with-error compositions use `FormField` + `Checkbox` directly.

- [ ] **Step 1: Write the failing test**

Add to `FormField.test.tsx`:

```tsx
describe("group mode", () => {
    it("renders a fieldset with legend when legend is provided", () => {
        render(
            <FormField legend="Notification channels" groupDescription="Pick at least one">
                <Checkbox label="Email" />
                <Checkbox label="SMS" />
            </FormField>,
        );
        const group = screen.getByRole("group", { name: "Notification channels" });
        expect(group.tagName).toBe("FIELDSET");
        expect(screen.getByText("Pick at least one")).toBeInTheDocument();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run nextjs-app/shared/components/FormField --reporter=basic -t "group mode"`
Expected: FAIL.

- [ ] **Step 3: Implement group mode**

In `FormField.tsx`, before the existing single-control render path:

```tsx
if (legend) {
    return (
        <fieldset className={cnJoin(styles.fieldset, className)} disabled={disabled}>
            <legend className={styles.legend}>
                {legend}
                {required ? <span aria-hidden="true"> *</span> : null}
            </legend>
            {groupDescription ? (
                <p className={styles.groupDescription}>{groupDescription}</p>
            ) : null}
            <div className={styles.groupControls}>{children}</div>
            {error ? (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            ) : null}
        </fieldset>
    );
}
```

Port FormGroup's fieldset/legend/description CSS into `FormField.module.css` as `.fieldset`, `.legend`, `.groupDescription`, `.groupControls` (copy the rules from `FormGroup.module.css` if present, else style with existing spacing tokens). In group mode `label` becomes optional: change `label: string` to `label?: string` and add a dev-time invariant that exactly one of `label`/`legend` is provided. Match the file's existing class-name join utility (FormField currently uses template strings; keep that style, the `cnJoin` above is shorthand for it).

- [ ] **Step 4: Run tests**

Run: `npx vitest run nextjs-app/shared/components/FormField --reporter=basic`
Expected: PASS. Also add the Vitest CSS-class static guard if FormField lacks one (assert every `styles.x` reference has a matching class in the module CSS, per the repo's established pattern; copy the shape from an existing component's static CSS test).

- [ ] **Step 5: Delete CheckboxField and FormGroup**

Both have 0 production importers after Task 3.

```bash
git rm -r nextjs-app/shared/components/CheckboxField nextjs-app/shared/components/FormGroup
```
Apply the component deletion checklist (neither is in barrel nor tiers file).

- [ ] **Step 6: Contract, story, regenerate, commit**

Add `legend`/`groupDescription` to `FormField.contract.json`; add a `CheckboxGroupComposition` story showing `FormField legend` wrapping Checkboxes.
Run: `npm run build:tokens && npm run build:zod-catalog && npm run typecheck && npm run validate:components`
Expected: exit 0.

```bash
git add -A && git commit -m "feat(design-system): FormField is the single field wrapper (absorbs FormGroup, retires CheckboxField)"
```

---

### Task 7: Canonicalize TextInput and TextArea (dissolve Inputs)

The audit facts: `Inputs/Inputs.tsx` is the real production text input (importers: ContactForm, FileUpload, SecureCVDownload, NewsletterWaitlist, ChatWidget/FieldPrompt). `TextInput/TextInput.tsx` is an unused Tailwind implementation (0 importers, violates CSS-Modules rule). `Inputs/TextArea.tsx` is the real textarea (+ `ChatTextArea` used only by ChatWidget); `TextArea/TextArea.tsx` is an unused parallel implementation (0 production importers).

**Files:**
- Delete: contents of `nextjs-app/shared/components/TextInput/` (Tailwind impl) and `nextjs-app/shared/components/TextArea/` (unused impl), keeping the directories
- Move: `Inputs/Inputs.tsx` -> `TextInput/TextInput.tsx`; `Inputs/Inputs.module.css` -> `TextInput/TextInput.module.css`; `Inputs/TextArea.tsx` -> `TextArea/TextArea.tsx`; `Inputs/TextArea.test.tsx` -> `TextArea/TextArea.test.tsx`; `Inputs/Inputs.test.tsx` -> `TextInput/TextInput.test.tsx`; contract/spec/mdx/stories files renamed accordingly
- Create: `nextjs-app/shared/components/ChatWidget/ChatTextArea.tsx` (extracted `ChatTextArea`)
- Modify: the 5 importer files listed above; `nextjs-app/shared/components/index.ts` if Inputs is exported there; `scripts/design-system/component-tiers.mjs` (TextArea entry exists at line ~81; add TextInput if the moved component should keep Inputs' tier)
- Delete: `nextjs-app/shared/components/Inputs/` once empty

**Interfaces:**
- Consumes: nothing new.
- Produces: `@dt/TextInput` (default export, the renamed Inputs component, same props), `@dt/TextArea` (default export, the moved implementation; named export `TextAreaProps`). `ChatTextArea` becomes internal to ChatWidget. `@dt/Inputs` ceases to exist.

- [ ] **Step 1: Replace the dead implementations**

```bash
git rm nextjs-app/shared/components/TextInput/TextInput.tsx
git rm -r nextjs-app/shared/components/TextArea
mkdir -p nextjs-app/shared/components/TextArea
git mv nextjs-app/shared/components/Inputs/Inputs.tsx nextjs-app/shared/components/TextInput/TextInput.tsx
git mv nextjs-app/shared/components/Inputs/Inputs.module.css nextjs-app/shared/components/TextInput/TextInput.module.css
git mv nextjs-app/shared/components/Inputs/Inputs.test.tsx nextjs-app/shared/components/TextInput/TextInput.test.tsx
git mv nextjs-app/shared/components/Inputs/TextArea.tsx nextjs-app/shared/components/TextArea/TextArea.tsx
git mv nextjs-app/shared/components/Inputs/TextArea.test.tsx nextjs-app/shared/components/TextArea/TextArea.test.tsx
```

Rename the remaining Inputs artifacts: `Inputs.contract.json` -> `TextInput/TextInput.contract.json` (update its `"name"` to `TextInput`), `Inputs.spec.md`/`Inputs.mdx`/`Inputs.stories.tsx` -> TextInput equivalents (update titles and imports inside), `__a11y-snapshots__` moves with TextInput. The pre-existing `TextInput/` alpha artifacts (contract, stories if any) are replaced by the moved set; keep whichever `index.ts` exports `{ default }` correctly.

Inside the moved files: rename component/identifier `Inputs` -> `TextInput`, fix the `styles` import path, and update `TextArea.tsx`'s relative imports. TextArea needs new `index.ts`, `TextArea.contract.json` (author fresh with `"name": "TextArea"`, status `beta`, copying the accurate fields from the old Inputs contract where they describe the textarea), plus `TextArea.stories.tsx` and `TextArea.mdx` ported from the old standalone dir ONLY where they match the moved implementation's API (label required, minRows/maxRows/animateResize; drop stories for the deleted impl's `showCount`/`resize` props).

- [ ] **Step 2: Extract ChatTextArea into ChatWidget**

Create `nextjs-app/shared/components/ChatWidget/ChatTextArea.tsx` containing the `ChatTextArea` component cut from the moved `TextArea.tsx` (it stays a thin wrapper importing `TextArea` from `../TextArea`). Update `ChatWidget/ChatComposer.tsx` and `ChatWidget/emailWorkflow/FieldPrompt.tsx` to `import { ChatTextArea } from "../ChatTextArea"` (adjust relative depth for the emailWorkflow file).

- [ ] **Step 3: Codemod the importers**

```bash
grep -rln "@dt/Inputs" app nextjs-app --include="*.tsx" --include="*.ts"
```
For each hit: `import Inputs from "@dt/Inputs"` -> `import TextInput from "@dt/TextInput"` (rename JSX usages), `import TextArea from "@dt/Inputs/TextArea"` -> `import TextArea from "@dt/TextArea"`, `import Input from "@dt/Inputs"` (SecureCVDownload) -> `import TextInput from "@dt/TextInput"` keeping the local alias if less churn (`import TextInput as Input` is invalid; use `import Input from "@dt/TextInput"`, default imports alias freely).

```bash
git rm -r nextjs-app/shared/components/Inputs
```
Update `component-tiers.mjs`: keep the existing `TextArea` entry; if `Inputs` has an entry, rename it to `TextInput`. Update the barrel `index.ts` if it exported Inputs.

- [ ] **Step 4: Verify the whole surface**

Run: `npm run typecheck && npx vitest run nextjs-app/shared/components/TextInput nextjs-app/shared/components/TextArea nextjs-app/shared/components/ChatWidget nextjs-app/shared/components/ContactForm nextjs-app/shared/components/FileUpload nextjs-app/shared/components/SecureCVDownload nextjs-app/shared/components/NewsletterWaitlist --reporter=basic && npm run validate:components && npm run build:tokens && npm run build:zod-catalog`
Expected: exit 0. Typecheck is the enumeration tool here; fix every residual reference it finds.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "refactor(design-system): Inputs becomes TextInput, canonical TextArea moves in, ChatTextArea goes ChatWidget-internal"
```

---

### Task 8: Promote SplitButton to its own directory

**Files:**
- Move: `Button/SplitButton.tsx` -> `SplitButton/SplitButton.tsx`, `Button/SplitButton.module.css` -> `SplitButton/SplitButton.module.css`, `Button/SplitButton.stories.tsx` -> `SplitButton/SplitButton.stories.tsx`, `Button/SplitButton.test.tsx` -> `SplitButton/SplitButton.test.tsx`, `Button/SplitButton.schema.json` -> `SplitButton/schema.json` (match sibling naming)
- Modify: `nextjs-app/shared/components/SplitButton/index.ts` (point at local file), `nextjs-app/shared/components/Button/index.ts` (drop SplitButton re-export)
- Create: `SplitButton/SplitButton.contract.json`, `SplitButton/SplitButton.spec.md`, `SplitButton/SplitButton.mdx` (alpha-level stubs)

**Interfaces:**
- Consumes: `ButtonProps` pick (`variant`, `size`, `surface`, `rounded`, `tooltip`, `accessibleName`) via `import type { ButtonProps } from "../Button"`.
- Produces: `@dt/SplitButton` resolves to the new directory; `@dt/Button` no longer exports SplitButton.

- [ ] **Step 1: Move files**

```bash
git mv nextjs-app/shared/components/Button/SplitButton.tsx nextjs-app/shared/components/SplitButton/SplitButton.tsx
git mv nextjs-app/shared/components/Button/SplitButton.module.css nextjs-app/shared/components/SplitButton/SplitButton.module.css
git mv nextjs-app/shared/components/Button/SplitButton.stories.tsx nextjs-app/shared/components/SplitButton/SplitButton.stories.tsx
git mv nextjs-app/shared/components/Button/SplitButton.test.tsx nextjs-app/shared/components/SplitButton/SplitButton.test.tsx
git mv nextjs-app/shared/components/Button/SplitButton.schema.json nextjs-app/shared/components/SplitButton/schema.json
```

Fix relative imports inside the moved files (`./Button` -> `../Button`, styles path unchanged). Update `SplitButton/index.ts` to `export { default } from "./SplitButton"; export type { SplitButtonOption, SplitButtonProps } from "./SplitButton";`. Remove the SplitButton lines from `Button/index.ts`.

- [ ] **Step 2: Author the alpha contract**

Create `SplitButton/SplitButton.contract.json` modeled on `Button/Button.contract.json`'s field shape with: `"schemaVersion": 2`, `"name": "SplitButton"`, `"tier": "molecule"`, `"group": "interaction"`, `"status": "alpha"`, an honest one-sentence `description`, `"figma": null`, `"element": "div"`, variants copied from the CVA config in `SplitButton.tsx` (read the file; if it has no CVA, use an empty variants object), `slots`/`subParts` reflecting `label`/`options`/`menu`, `requiredStories: ["Default"]`, a11y flags all false (alpha), `lightDarkVerified: false`, `tokens` empty. Alpha status avoids the beta MDX/spec gates until the Phase 3 actions batch. Create one-paragraph `SplitButton.spec.md` and `SplitButton.mdx` stubs noting alpha status and pointing at the roadmap.

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npx vitest run nextjs-app/shared/components/SplitButton --reporter=basic && npm run validate:components && npm run build:tokens && npm run build:zod-catalog`
Expected: exit 0; validate:components accepts the alpha contract.

```bash
git add -A && git commit -m "refactor(design-system): promote SplitButton to its own component directory"
```

---

### Task 9: Contract schema v2.1 doc fields

**Files:**
- Modify: `scripts/design-system/contract.schema.v2.json`

**Interfaces:**
- Consumes: nothing.
- Produces: optional top-level contract fields `displayName`, `keywords`, `usage`, `playground`, `theming`, `dense` validated by ajv. Tasks 10 and 12 depend on these exact names and shapes.

- [ ] **Step 1: Add the field definitions**

In `contract.schema.v2.json` `properties` (schema has `additionalProperties: false`, so contracts cannot carry these until the schema knows them; do NOT add anything to the top-level `required` array):

```json
"displayName": { "type": "string", "minLength": 1 },
"keywords": {
    "type": "array",
    "items": { "type": "string", "minLength": 2 },
    "uniqueItems": true
},
"usage": {
    "type": "object",
    "additionalProperties": false,
    "required": ["description"],
    "properties": {
        "description": { "type": "string", "minLength": 20 },
        "bestPractices": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": false,
                "required": ["guidance", "description"],
                "properties": {
                    "guidance": { "type": "boolean" },
                    "description": { "type": "string", "minLength": 10 }
                }
            }
        },
        "anatomy": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": false,
                "required": ["name", "required", "description"],
                "properties": {
                    "name": { "type": "string", "minLength": 1 },
                    "required": { "type": "boolean" },
                    "description": { "type": "string", "minLength": 10 }
                }
            }
        }
    }
},
"playground": {
    "type": "object",
    "additionalProperties": false,
    "required": ["defaults"],
    "properties": {
        "defaults": { "type": "object" }
    }
},
"theming": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "vars": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": false,
                "required": ["name", "description", "default"],
                "properties": {
                    "name": { "type": "string", "pattern": "^--" },
                    "description": { "type": "string", "minLength": 5 },
                    "default": { "type": "string", "minLength": 1 }
                }
            }
        }
    }
},
"dense": { "type": "string", "minLength": 10, "maxLength": 200 }
```

Slot values inside `playground.defaults` may be element descriptors: plain objects `{"__element": "Icon", "props": {...}, "children": ...}`. The schema deliberately leaves `defaults` open (`"type": "object"`); the resolver (Task 11) owns descriptor validation.

- [ ] **Step 2: Verify existing contracts still validate**

Run: `npm run validate:components`
Expected: exit 0 (fields are optional; no contract carries them yet).

- [ ] **Step 3: Commit**

```bash
git add scripts/design-system/contract.schema.v2.json
git commit -m "feat(design-system): contract schema v2.1 doc fields (usage, keywords, playground, theming, dense)"
```

---

### Task 10: Doc tiers, ratchet enforcement, coverage report

**Files:**
- Create: `scripts/design-system/doc-tiers.mjs`
- Modify: `scripts/design-system/validate-components.ts` (extend the contract-check block that already pushes status-gated errors, around lines 490-680)
- Create: `scripts/design-system/report-doc-coverage.mjs`
- Modify: `package.json` (add `"report:doc-coverage": "node scripts/design-system/report-doc-coverage.mjs"`)

**Interfaces:**
- Consumes: contract JSON objects as already loaded by the validator; schema fields from Task 9.
- Produces: `DOC_TIER_1: string[]` and `docTierFor(name: string): 1 | 2` from `doc-tiers.mjs`. Validator rule set "doc-fields ratchet". `npm run report:doc-coverage` prints per-tier fill percentages. Task 12 and every Phase 3 batch rely on these rules.

- [ ] **Step 1: Create doc-tiers.mjs**

```js
/**
 * Doc tiers for the Astryx-level documentation push (spec:
 * docs/superpowers/specs/2026-07-03-astryx-level-design-system-roadmap.md).
 * Tier 1 gets the full doc treatment (usage, bestPractices, anatomy,
 * keywords, playground, dense). Everything else in the catalog is Tier 2
 * (usage.description, keywords, dense only).
 */
export const DOC_TIER_1 = [
    // Actions
    'Button', 'IconButton', 'SplitButton', 'Tag',
    // Typography & content
    'Text', 'Title', 'Display', 'Prose', 'List', 'Badge', 'Icon', 'Avatar',
    'CodeSnippet', 'CodeBlockWindow',
    // Forms
    'TextInput', 'TextArea', 'Select', 'Checkbox', 'CheckboxGroup', 'Radio',
    'RadioGroup', 'Switch', 'Combobox', 'MultiCombobox', 'PhoneInput',
    'FileUpload', 'FormField', 'Label', 'HelperText', 'GroupLabel',
    // Feedback & status
    'AlertBanner', 'Toast', 'Progress', 'Spinner', 'BusyIndicator',
    'Skeleton', 'Tooltip', 'Modal', 'Lightbox',
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
```

- [ ] **Step 2: Write failing validator tests**

The validator is a script, so test at the rule level: create `scripts/design-system/doc-fields-rules.mjs` holding the pure rule function, plus `scripts/design-system/doc-fields-rules.test.mjs` (the repo already unit-tests script libs, see `composition-lint-lib.test.mjs`):

```js
// doc-fields-rules.test.mjs
import { describe, it, expect } from 'vitest';
import { docFieldErrors } from './doc-fields-rules.mjs';

const base = { name: 'Button', status: 'stable' };

describe('docFieldErrors (ratchet: only applies when usage is present)', () => {
    it('is silent when the contract has no usage field', () => {
        expect(docFieldErrors(base, 1)).toEqual([]);
    });

    it('requires the full tier-1 set once usage exists', () => {
        const errors = docFieldErrors({ ...base, usage: { description: 'A button that triggers an action when pressed.' } }, 1);
        expect(errors.join('\n')).toMatch(/bestPractices/);
        expect(errors.join('\n')).toMatch(/keywords/);
        expect(errors.join('\n')).toMatch(/playground/);
        expect(errors.join('\n')).toMatch(/dense/);
    });

    it('requires at least 6 bestPractices with at least 2 do-nots for tier 1', () => {
        const bp = Array.from({ length: 6 }, () => ({ guidance: true, description: 'Do the right thing here.' }));
        const errors = docFieldErrors(
            { ...base, usage: { description: 'A button that triggers an action when pressed.', bestPractices: bp }, keywords: ['a', 'b', 'c', 'd'], playground: { defaults: {} }, dense: 'action trigger w/ variants and loading state' },
            1,
        );
        expect(errors.join('\n')).toMatch(/guidance: false/);
    });

    it('tier 2 needs only description, keywords, dense', () => {
        const errors = docFieldErrors(
            { ...base, usage: { description: 'A marketing card used on the services page grid.' }, keywords: ['card', 'service', 'grid', 'marketing'], dense: 'marketing card for the services grid' },
            2,
        );
        expect(errors).toEqual([]);
    });
});
```

Run: `npx vitest run scripts/design-system/doc-fields-rules.test.mjs`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement the rule module**

```js
// doc-fields-rules.mjs
/**
 * Ratchet enforcement for contract doc fields: rules apply only once a
 * contract has adopted the `usage` field, so unmigrated components stay
 * green while migrated ones can never regress.
 */
export function docFieldErrors(contract, docTier) {
    if (!contract.usage) return [];
    const errors = [];
    const name = contract.name;
    const push = (msg) => errors.push(`${name}.contract.json: ${msg}`);

    if (!contract.keywords || contract.keywords.length < 4) {
        push('doc fields require keywords[] with at least 4 entries');
    }
    if (!contract.dense) {
        push('doc fields require dense (a <=200 char agent-facing one-liner)');
    }
    if (docTier === 1) {
        const bp = contract.usage.bestPractices ?? [];
        if (bp.length < 6) {
            push('tier-1 docs require at least 6 usage.bestPractices entries');
        }
        if (bp.filter((entry) => entry.guidance === false).length < 2) {
            push('tier-1 docs require at least 2 bestPractices with guidance: false (do-nots)');
        }
        if (!contract.playground?.defaults) {
            push('tier-1 docs require playground.defaults');
        }
        const hasParts = (contract.slots?.length ?? 0) > 0 || (contract.subParts?.length ?? 0) > 0;
        if (hasParts && !(contract.usage.anatomy?.length >= 2)) {
            push('tier-1 docs require usage.anatomy (>=2 parts) when the component declares slots or subParts');
        }
    }
    return errors;
}
```

Wire into `validate-components.ts` next to the existing status-gated checks:

```ts
import { docFieldErrors } from './doc-fields-rules.mjs'
import { docTierFor } from './doc-tiers.mjs'
// inside the per-component contract validation block:
errors.push(...docFieldErrors(manifest, docTierFor(name)))
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run scripts/design-system/doc-fields-rules.test.mjs && npm run validate:components`
Expected: both pass (no contract has `usage` yet, ratchet stays silent).

- [ ] **Step 5: Coverage report script**

```js
// report-doc-coverage.mjs
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { DOC_TIER_1, docTierFor } from './doc-tiers.mjs';

const ROOT = new URL('../../nextjs-app/shared/components', import.meta.url).pathname;
const rows = [];
for (const dir of readdirSync(ROOT, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const contractPath = join(ROOT, dir.name, `${dir.name}.contract.json`);
    if (!existsSync(contractPath)) continue;
    const c = JSON.parse(readFileSync(contractPath, 'utf-8'));
    rows.push({
        name: dir.name,
        tier: docTierFor(dir.name),
        usage: Boolean(c.usage?.description),
        bestPractices: (c.usage?.bestPractices?.length ?? 0) >= 6,
        anatomy: (c.usage?.anatomy?.length ?? 0) >= 2,
        keywords: (c.keywords?.length ?? 0) >= 4,
        playground: Boolean(c.playground?.defaults),
        dense: Boolean(c.dense),
    });
}
for (const tier of [1, 2]) {
    const set = rows.filter((r) => r.tier === tier);
    const fields = tier === 1
        ? ['usage', 'bestPractices', 'anatomy', 'keywords', 'playground', 'dense']
        : ['usage', 'keywords', 'dense'];
    console.log(`\nDoc tier ${tier} (${set.length} components):`);
    for (const field of fields) {
        const done = set.filter((r) => r[field]).length;
        console.log(`  ${field.padEnd(14)} ${done}/${set.length}`);
    }
    const incomplete = set.filter((r) => !fields.every((f) => r[f])).map((r) => r.name);
    if (incomplete.length) console.log(`  incomplete: ${incomplete.join(', ')}`);
}
const missingTier1 = DOC_TIER_1.filter((n) => !rows.some((r) => r.name === n));
if (missingTier1.length) console.log(`\nWARNING: DOC_TIER_1 names with no contract on disk: ${missingTier1.join(', ')}`);
```

Run: `npm run report:doc-coverage`
Expected: tier tables print, everything 0/N except nothing; the WARNING line must be empty (it cross-checks DOC_TIER_1 spelling against real directories; fix any typo it reports).

- [ ] **Step 6: Commit**

```bash
git add scripts/design-system/doc-tiers.mjs scripts/design-system/doc-fields-rules.mjs scripts/design-system/doc-fields-rules.test.mjs scripts/design-system/report-doc-coverage.mjs scripts/design-system/validate-components.ts package.json
git commit -m "feat(design-system): doc tiers, ratchet validation, and doc-coverage report"
```

---

### Task 11: Element descriptor resolver for the Storybook frame

**Files:**
- Create: `.storybook/lib/resolveElements.tsx`
- Test: `.storybook/lib/resolveElements.test.tsx`

**Interfaces:**
- Consumes: component modules via explicit registry map (NOT the barrel, to keep the resolver tree-shakeable and Storybook-only).
- Produces: `resolveValue(value: unknown): unknown` and `type ElementDescriptor = { __element: string; props?: Record<string, unknown>; children?: unknown }`. Phase 2 doc blocks and playground-default seeding call `resolveValue` on every contract `playground.defaults` entry.

- [ ] **Step 1: Write the failing test**

```tsx
// .storybook/lib/resolveElements.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { isValidElement } from "react";
import { resolveValue } from "./resolveElements";

describe("resolveValue", () => {
    it("passes primitives and plain objects through untouched", () => {
        expect(resolveValue("hello")).toBe("hello");
        expect(resolveValue(3)).toBe(3);
        expect(resolveValue({ a: 1 })).toEqual({ a: 1 });
    });

    it("resolves a known element descriptor to a React element", () => {
        const resolved = resolveValue({ __element: "Badge", props: { children: "3" } });
        expect(isValidElement(resolved)).toBe(true);
        render(<>{resolved}</>);
        expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("resolves descriptors nested in arrays and objects, adding array keys", () => {
        const resolved = resolveValue([
            { __element: "Badge", props: { children: "a" } },
            { __element: "Badge", props: { children: "b" } },
        ]) as React.ReactElement[];
        expect(resolved.map((el) => el.key)).toEqual(["0", "1"]);
    });

    it("falls back to the tag string for unknown component names", () => {
        const resolved = resolveValue({ __element: "span", props: { children: "raw" } });
        render(<>{resolved}</>);
        expect(screen.getByText("raw").tagName).toBe("SPAN");
    });
});
```

Run: `npx vitest run .storybook/lib/resolveElements.test.tsx`
Expected: FAIL (module missing). If `.storybook/lib` is outside vitest's include globs, add the path to the vitest config's include list as part of this step.

- [ ] **Step 2: Implement**

```tsx
// .storybook/lib/resolveElements.tsx
/**
 * Resolves JSON-safe element descriptors ({ __element, props, children })
 * from contract playground.defaults into real React elements, so contracts
 * can express "this slot defaults to <Icon name='check' />" without code.
 * Astryx pattern (apps/docsite resolveElements.ts), adapted to DT.
 */
import { createElement, type ReactNode } from "react";
import Badge from "@dt/Badge";
import Icon from "@dt/Icon";
import Text from "@dt/Text";
import Title from "@dt/Title";

export type ElementDescriptor = {
    __element: string;
    props?: Record<string, unknown>;
    children?: unknown;
};

/** Extend as doc content adopts more slot elements (Phase 3 batches). */
const REGISTRY: Record<string, React.ComponentType<any>> = {
    Badge,
    Icon,
    Text,
    Title,
};

function isDescriptor(value: unknown): value is ElementDescriptor {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as ElementDescriptor).__element === "string"
    );
}

export function resolveValue(value: unknown, key?: string): unknown {
    if (Array.isArray(value)) {
        return value.map((item, index) => resolveValue(item, String(index)));
    }
    if (isDescriptor(value)) {
        const { __element, props = {}, children } = value;
        const component = REGISTRY[__element] ?? __element;
        const resolvedProps: Record<string, unknown> = { ...props };
        for (const [propName, propValue] of Object.entries(props)) {
            resolvedProps[propName] = resolveValue(propValue);
        }
        if (key != null) resolvedProps.key = key;
        return createElement(
            component as React.ComponentType<any> | string,
            resolvedProps,
            children !== undefined ? (resolveValue(children) as ReactNode) : undefined,
        );
    }
    if (typeof value === "object" && value !== null) {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, resolveValue(v)]),
        );
    }
    return value;
}
```

- [ ] **Step 3: Run tests**

Run: `npx vitest run .storybook/lib/resolveElements.test.tsx`
Expected: PASS (4 tests). Note: descriptor-shaped plain data is shadowed by design; a contract that needs a literal `__element` key in data cannot have one, which is acceptable and matches Astryx.

- [ ] **Step 4: Commit**

```bash
git add .storybook/lib/resolveElements.tsx .storybook/lib/resolveElements.test.tsx
git commit -m "feat(storybook): element descriptor resolver for contract playground defaults"
```

---

### Task 12: Button exemplar doc content

**Files:**
- Modify: `nextjs-app/shared/components/Button/Button.contract.json`

**Interfaces:**
- Consumes: schema fields (Task 9), ratchet rules (Task 10), Button's real API (variant/tone/size/surface/loading/clickAction from Task 5).
- Produces: the canonical example of filled doc fields; Phase 3 batches copy this shape. `report:doc-coverage` shows Button complete.

- [ ] **Step 1: Author the fields**

Add to `Button.contract.json` (adjust wording only if the API differs after Task 5 lands; the executor must verify each claim against `Button.tsx`):

```json
"displayName": "Button",
"keywords": ["button", "cta", "submit", "action", "loading", "async", "primary", "click"],
"dense": "action trigger; variant (weight) x tone (semantic) matrix, sm/md/lg, surface-aware, loading + async clickAction, polymorphic button/link",
"usage": {
    "description": "Button triggers an action: submitting a form, confirming a choice, or starting a flow. It renders a real button, or an anchor when href is given, and carries the full variant (visual weight) by tone (semantic color) matrix.",
    "bestPractices": [
        { "guidance": true, "description": "Reserve variant=primary for the single most important action in the view; use secondary or tertiary for everything else." },
        { "guidance": true, "description": "Write labels that name the action, like Save changes or Send message, never OK or Click here." },
        { "guidance": true, "description": "Use clickAction for async work so the button shows its loading state and dedupes clicks automatically." },
        { "guidance": true, "description": "Pair tone=error with a confirmation step for irreversible actions." },
        { "guidance": true, "description": "Use surface=onDark or onBrand when the button sits on a dark or brand background instead of overriding colors." },
        { "guidance": false, "description": "Do not place more than one primary button in the same view; it dilutes the hierarchy." },
        { "guidance": false, "description": "Do not use Button for pure navigation; if it only takes the user to another page, use Link (Button with href is for action-shaped navigation like Get started)." },
        { "guidance": false, "description": "Do not encode meaning with tone alone; the label must carry the meaning for color-blind users." }
    ],
    "anatomy": [
        { "name": "Icon", "required": false, "description": "Leading icon reinforcing the label, for example a trash icon on Delete." },
        { "name": "Label", "required": true, "description": "Visible text describing the action; doubles as the accessible name." },
        { "name": "End icon", "required": false, "description": "Trailing icon after the label, for example a chevron on a menu trigger." },
        { "name": "Spinner", "required": false, "description": "Replaces content during loading to show the action is in progress." }
    ]
},
"playground": {
    "defaults": {
        "children": "Save changes",
        "variant": "primary",
        "tone": "neutral",
        "size": "md"
    }
}
```

- [ ] **Step 2: Verify against the ratchet and coverage**

Run: `npm run validate:components && npm run report:doc-coverage && npm run check:contract-drift -- --strict`
Expected: validate passes (Button satisfies every tier-1 rule); coverage shows Button as the only complete tier-1 entry; if contract-drift flags the edit, follow its printed remediation.

- [ ] **Step 3: Regenerate derived artifacts and commit**

Run: `npm run build:tokens && npm run build:zod-catalog && npm run check:generated`
Expected: exit 0; agent-manifest picks up the new fields.

```bash
git add -A && git commit -m "docs(design-system): Button exemplar doc fields (usage, best practices, anatomy, playground, dense)"
```

---

### Task 13: Final gate, spec/plan docs, PR

**Files:**
- Add: `docs/superpowers/specs/2026-07-03-astryx-level-design-system-roadmap.md`, `docs/superpowers/plans/2026-07-03-astryx-phase0-phase1.md` (already written; commit them with this branch)

- [ ] **Step 1: Full local gate**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: all four exit 0. Also run `npm run validate:agent-docs` (doc changes) and `npm run test:stories:smoke` (component deletions touched stories).

- [ ] **Step 2: Commit docs, push, PR, merge**

```bash
git add docs/superpowers/specs/2026-07-03-astryx-level-design-system-roadmap.md docs/superpowers/plans/2026-07-03-astryx-phase0-phase1.md
git commit -m "docs: Astryx-level design system roadmap spec and phase 0-1 plan"
git push -u origin DT-XXX-astryx-phase0-phase1
gh pr create --title "refactor(design-system): Astryx roadmap phase 0 consolidation + phase 1 doc data layer" --body "Executes Phase 0 (Heading/TextLink/AnimatedDialog/Enhanced* removals, Button clickAction, FormField wrapper convention, Inputs->TextInput/TextArea canonicalization, SplitButton promotion) and Phase 1 (contract schema v2.1 doc fields, doc tiers + ratchet validation, element resolver, Button exemplar) of the Astryx-level DS roadmap. Spec: docs/superpowers/specs/2026-07-03-astryx-level-design-system-roadmap.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
gh pr merge --admin --squash
```

Before merging, check `gh pr list` for open PRs touching `nextjs-app/shared/components/` and resolve ordering with the user if any exist.
