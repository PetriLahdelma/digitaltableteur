# ServicesLedger

## Intent
Say what the studio does as a ruled ledger: one row per offer with its index, title, description and capabilities, each linking to where the offer is shown in practice. A Human / Machine view switch (SegmentedControl, centred on phones) re-renders the same offers as plain text with the site's machine endpoints, so the agent-ready positioning is shown rather than claimed.

## Interaction contract
- Keyboard: Tab reaches the Human / Machine view switch as one stop (arrow keys, Home and End change the view), then each row link
- Screen readers: section labelled by its heading; the view switch is a SegmentedControl radiogroup whose options report aria-checked; index numbers are decorative

## Do / don't
- Do: keep capability labels short nouns; keep the machine view to the same facts as the human view
- Don't: put portfolio images or case-study art in the ledger (owner decision 2026-10-20); the homepage has a work section for that

## Design notes
- Benchmarked against Koto, Evil Martians and basement.studio (HUMAN / MACHINE); chosen as option A on 2026-10-20
- Replaces ServicesSection on the homepage; ServicesSection stays for other uses
