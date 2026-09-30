# Document and media follow-up

## Directly linked reports

The footer's ReliablePartnerBadge links to three language-specific reports. All nine pages were rendered and inspected; metadata and the structure trees were inspected with pypdf. The originals were not changed.

| Report | Pages | Document language | Structure evidence |
| --- | --- | --- | --- |
| `public/docs/reliable-partner/reliable-partner-report-en.pdf` | 3 | `fi-FI` at the catalog and Document structure element, despite English primary content | Tagged; 126 NonStruct nodes, 10 Figure nodes, 3 Table nodes, 22 TD and no TH nodes. Nine Figure nodes lack Alt/ActualText. |
| `public/docs/reliable-partner/reliable-partner-report-fi.pdf` | 3 | Missing | No StructTreeRoot or MarkInfo; visible tables and headings lack a tagged structure tree. |
| `public/docs/reliable-partner/reliable-partner-report-sv.pdf` | 3 | `fi-FI` at the catalog and Document structure element, despite Swedish primary content | Same structural counts as English. |

These are concrete defects or review flags, not a PDF/UA certificate. EN/SV also contain a Finnish register appendix, so changing only the catalog language would not correctly identify every language boundary. The missing figure alternatives need contextual classification: a symbol with adjacent equivalent text may be decorative, whereas a meaningful standalone image needs an equivalent. The presence of tags alone does not prove their correctness.

The Finnish report has an additional liability-insurance section and a different issuer/footer from EN/SV. Do not silently derive all languages from one report. The files contain personal register details: a new HTML alternative requires an explicit publishing choice, and redaction would no longer be a complete equivalent. Prefer a faithful, clearly labelled alternative or accessible replacements from the issuer; preserve the original verification documents.

Reviewed SHA-256 values:

```text
en f83b34c1fab56054e69836a7821e530094d0df89620a74f6dc113ecc74dc6076
fi 2b96e478009bbdc86039120df1676adaa633d711118c071a85bcc2f3c261735c
sv cc1955f79e362d7d3252bac16cf4b4ae301f77fde3af1d6f26338b49f51c7468
```

## Legacy public assets

There are 25 PDF files under public: the three footer reports and 22 Finnish Transport Agency design assets. No direct references to the legacy PDF filenames were found in the current production page/content sources. They remain URL-accessible. Their metadata was inventoried, but their 22 documents have not received a full content-equivalence review. Missing language/title/structure metadata is a review flag, not proof that every purely graphical asset fails every criterion. Do not remove archival assets to make a scan pass.

## Garage Junction

Both original formats are approximately 34.04 seconds long and show the same static promotional card. Sampling at four-second intervals and at two frames per second found no meaningful changes; `freezedetect=n=-50dB:d=1` reports a freeze beginning at zero for both files. The published claim of motion graphics is not supported by these particular assets.

The page now exposes the visual information in text and associates it with the original player. The original files are unchanged. This improves access to the visual information but is not a substitute for synchronized sound captions or an audio-described version.

An experimental described version was generated locally with an 18.491792-second spoken introduction followed by the full original sound. Whole-suffix waveform correlation was 0.9998348, confirming technical feasibility without overlapping the original audio. **The prototype and its generation script were removed from the publishable tree before commit. They are not shipped.**

[Apple's macOS Tahoe license, section 2.F](https://www.apple.com/legal/sla/docs/macOSTahoe.pdf), restricts publication of System Voice output. The prototype used an installed system voice, and no separate publication license has been established. An owned recording or a commercially licensed voice is required before this route can ship. The recording script is retained in the media-description design note; it describes only verified visual content and does not invent the untranscribed audio.

A future alternate version can follow [W3C technique G8](https://www.w3.org/WAI/WCAG22/Techniques/general/G8), putting the description before the original audio rather than obscuring unreviewed dialogue or effects. Accurate original-sound captions, an approved narration source and auditory review remain open. No full conformance claim is made.

## Safe increment verification

The shipped code is limited to the visible description, its aria-describedby association and readable caption measure. Its regression failed before the change and passes afterward. The full unit run passes 3,145 tests in 389 files. All 132 production-browser regressions pass, including the eight new media-description theme/width cases. The production build, TypeScript, lint, CSS and component contract checks pass. Original report PDFs and original video assets have no Git diff; the experimental voice, generator and related files are outside the repository and are not part of the PR.
