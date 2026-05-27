# NewsletterWaitlist

## Intent
Capture an email address with the lightest possible visual weight.
The button-to-input transformation defers commitment until the user
has explicitly opted in to entering data, which avoids the visual
noise of a permanent form occupying valuable hero space.

## Interaction contract
- Keyboard: Tab focuses the Button. Enter / Space activates it,
  transforming to the input mode. Inside input mode, Tab walks
  through Inputs → Cancel → Submit; Enter submits.
- Pointer: click on the Button transforms; click on Cancel resets;
  click on Submit posts the email.
- Screen readers: the Button announces "newsletter signup, button".
  After activation, the Inputs label announces the email field
  context. Loading state announces "busy" on the submit button.
  Success Modal announces its title; the Modal's focus trap kicks
  in.

## Do / don't
- Do: pass `onSuccess` if analytics or a parent component needs to
  react to signups. The callback fires after the success Modal
  appears, with the submitted email.
- Do: pass `disabled` during maintenance windows or when the
  backing endpoint is known to be down. The component degrades
  gracefully (greyed Button, no transformation).
- Don't: mount more than one instance per page. The success Modal
  isn't scoped to the originating component — opening two collides
  on focus management.
- Don't: try to control the transformation state from outside. The
  component owns it; exposing it would invite consumers to break
  the contract.
- Don't: bypass the validation. The regex catches obvious typos but
  the server is the source of truth — never assume client-side
  validation alone gates a real submission.

## Design notes
- Tokens: Button uses `Button variant="primary" size="l"` in trigger
  mode. The input form uses standard `--space-internal-12` gaps
  between Inputs, Cancel, and Submit. The success Modal uses
  `severity="success"`.
- Figma: https://www.figma.com/design/digitaltableteur/newsletter-waitlist
  — button mode and input mode are separate frames; the transition
  is a CSS opacity + width interpolation.
- The endpoint is `/api/save-contact` with body `{ email, type:
  'newsletter', source: 'waitlist' }`. Changing the endpoint
  requires coordinated change in the API route, the contact-store
  shape, and the email template that fires on signup.
- The Modal closes the form and resets to Button mode on dismiss.
  This is intentional — the user has succeeded; the form is done.
