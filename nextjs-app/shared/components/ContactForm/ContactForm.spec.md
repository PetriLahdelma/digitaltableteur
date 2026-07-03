# ContactForm

## Intent
Ship the single, fixed-composition contact form for the marketing
site. ContactForm exists at organism tier so consumers stop
rebuilding the same form, the same validation, and the same submit
pipeline per page. The component is intentionally not parameterised
— variant work belongs in `patterns/`.

## Interaction contract
- Keyboard: Tab walks through name, email, phone, interest,
  message, channels (master + each), attachment (Browse → Clear),
  hear-about, submit. Disabled / hidden fields are skipped. Enter
  inside a field submits the form (native behaviour).
- Pointer: each field's own click behaviour applies. The submit
  Button disables itself (swallowing clicks) while loading.
- Screen readers: each field is announced via its own labelled
  child. The submit button announces "busy" during submission. On
  success, the Modal steals focus and announces the success title.
  On error, the Toast announces the error message politely.

## Do / don't
- Do: keep the form mounted exactly once per page. Multiple
  ContactForms on the same page collide on the honeypot field name
  and the i18n key namespace.
- Do: wrap with a heading element above the form. ContactForm does
  not own its `<h1>` so the consumer can choose the right heading
  level for the document outline.
- Don't: pass props. The component intentionally accepts none. If
  you need a variant, compose smaller atoms at the pattern layer.
- Don't: swallow the `/api/contact` endpoint. The submit handler
  expects that endpoint specifically; redirecting it requires
  changing the rate-limiting, telemetry, and email plumbing too.
- Don't: remove the honeypot. It catches a meaningful share of bot
  submissions without any user-facing UX cost.

## Design notes
- Tokens: field spacing uses `--space-internal-16` between rows.
  The form is wrapped in a Stack with the canonical spacing. The
  submit row uses `--space-internal-24` top margin for visual
  separation.
- Figma: https://www.figma.com/design/digitaltableteur/contact-form
  — single composition; field order matches the Figma frame.
- Honeypot semantics: `honeypot` is rendered as a hidden Inputs.
  Real users never see it; bots that auto-fill every field trip
  it. The submit handler reports tripped honeypots via
  `reportContactHoneypot` and silently no-ops.
- Email attachment size threshold: files above
  `CONTACT_EMAIL_ATTACHMENT_LIMIT_BYTES` (~10 MB) are accepted but
  surfaced with a warning that the attachment will be uploaded to
  S3 rather than emailed (Resend caps at ~10 MB).
- Form state lives in a `useReducer` so resetting and partial
  updates are cleanly typed. The reducer is intentionally tiny —
  only `UPDATE_FIELD` and `RESET` — to keep the component scannable.
