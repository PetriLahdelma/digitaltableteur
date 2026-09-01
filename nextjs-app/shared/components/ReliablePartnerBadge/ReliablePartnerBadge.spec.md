# ReliablePartnerBadge

## Intent

Shows that Digitaltableteur is a Vastuu Group **Luotettava Kumppani** (Reliable
Partner): a Finnish certification confirming that tax, pension and employer
obligations required by the Contractor's Obligations Act (tilaajavastuulaki)
are verified and in order.

The badge is third-party proof, not decoration. It earns its place where a
buyer is deciding whether to trust the business: the site footer, the About
page's delivery/governance story, and next to the pricing packages. Each badge
opens that language's report PDF so the claim is checkable rather than asserted.

## Interaction contract

- Renders the official green badge matched to the active UI language:
  `fi` → luotettava kumppani, `sv` → pålitlig partner, anything else → reliable
  partner. Language comes from `useLocalization().resolvedLanguage`; with no
  TranslationProvider it falls back to English.
- Links, by default, to the matching report PDF under
  `/docs/reliable-partner/reliable-partner-report-{fi,sv,en}.pdf`, opened in a
  new tab (`target="_blank"` with `rel="noopener noreferrer"`) so the PDF
  hands off to the viewer's own reader.
- `href` overrides the target; `href={null}` renders the badge unlinked, for
  contexts that already provide their own link to the report.
- `size` controls height only: `sm` 32px, `md` 48px, `lg` 64px. Width is always
  derived from the asset's aspect ratio.
- The badge is a static image. It has no hover, active, or loading state, and
  no motion, so `prefers-reduced-motion` needs no special handling.

## Do / don't

- **Do** let the badge link to the report. The certification's value is that it
  is verifiable; a badge that links nowhere reads as a sticker.
- **Do** keep the language of the badge and the language of the page the same.
  A Finnish mark on an English page looks like a stray asset.
- **Do** use `sm` in dense chrome (footer) and `md`/`lg` where the badge is
  making an argument alongside body copy.
- **Don't** recolor, crop, redraw, or add effects to the mark. The asset as
  delivered by Vastuu Group is the brand; only whitespace has been trimmed.
- **Don't** stretch it. Set height via `size`; never set width.
- **Don't** use it as a generic "verified" or "certified" icon. It means one
  specific Finnish certification and misusing it misrepresents the business.
- **Don't** hardcode a report path at the call site. Use the default, or
  `getReliablePartnerReportHref(language)` so a language stays in sync.

## Design notes

- Three assets, one per language. The Finnish PNG and the English/Swedish JPGs
  ship from Vastuu Group with a white plate around the green field; only that
  whitespace is trimmed. `border-radius` on the image clips the residual white
  corner notches so the green plate sits cleanly on dark backgrounds without
  touching the artwork itself.
- The mark's own green is fixed by the brand and is deliberately **not**
  themed. It is the same in light, dark, and high-contrast themes, which is
  why the contract lists no color tokens. Only the focus ring is themed.
- `max-width: none` and `flex-shrink: 0` guard against the global
  `img { max-width: 100% }` reset squeezing the badge inside flex rows — that
  squeeze was the first defect found when the badge shipped into the About
  band.
- Report PDFs expire roughly quarterly (the current set is valid until
  2026-11-13). The filenames are language-stable on purpose: refreshing the
  certification is a drop-in replacement of three files, with no code change.
- Only the Finnish mark carries a ® symbol; that asymmetry is Vastuu Group's,
  reproduced as delivered.
