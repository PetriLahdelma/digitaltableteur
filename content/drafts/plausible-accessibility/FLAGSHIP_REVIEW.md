# Plausible accessibility: flagship review (draft 1)

Written answers to the [flagship review](../../../docs/WRITING_STYLE.md#flagship-review-editorial-not-a-score) questions. Editorial judgments for the author to challenge, not a score.

**1. Spine in one sentence, and does the close return to it?**
Plausible accessibility is output that has the shape of accessible work and passes as accessible to anyone who cannot check it. Named in paragraph four, landed as a one-line paragraph, used in the title. The close returns to "Looks good to me" from the opening and to the likely-versus-right distinction.

**2. A mechanism a practitioner can use this week?**
The routing table (case, why automation misses it, who to bring in, what to give them), plus two operating rules: give testers tasks, not pages, and do not generalise from one or two users. Secondary: Fairchild's generate-then-review loop as the sensible way to use a model.

**3. A checkable detail in every section?**
Opening: 949 records, exit 0. Median: 95.9% and 56.1 errors, 12% and 86%, 39% vs 22%, $1M. Purpose: 1.1.1, the home icon. Words heard: about 85%, 216 viewers. Keyboard: 10 failures in 29 lines, 14 vs 47, 85 Tab presses. Names: the real language-button string. Meaning: 52.93% of 308, about 90% CAPTCHA. Machines: 1.82:1. Limits: the marker colour rule.

**4. A section that admits what did not work?**
"Where my own checks still fall short": the pipeline fix did not catch the language button or the invisible markers, and accessibility-tree snapshots cannot judge spoken sense or timing.

**5. Is anyone cast as the villain?**
No. The florist that bought an overlay is described as acting rationally; model makers are reported through evidence, not scorn; the author's own pipeline takes the hardest criticism.

**6. All claims sourced, primary first?**
Yes, see `SOURCES.md`. The APA AI document is labelled as draft research. Unverifiable statistics from weaker articles were excluded.

**7. Any sentence that could appear in any other article?**
Candidates to sharpen in draft 2: "None of this means keeping AI out of accessibility work." and "Two rules make the table work." Both are serviceable but generic.

**8. One illustration family; real artifacts with real alt text?**
Planned, not produced. See `VISUAL_BRIEF.md`: the hollow stencil motif across five illustrations, decorative ones `alt=""`. Two real artifacts come from the repo history (the evidence record before and after the silent strip, and the accessibility-tree snapshot diff of the language button in b73740e0f), and the routing table ships as an HTML table.

## Open items for the author

- **AUTHOR CHECK** in "Where my own checks still fall short": confirm what testing with disabled people has actually happened on Digitaltableteur work, or replace with a dated commitment. Nothing untrue should ship.
- Density versus the benchmark: paragraphs average about 4 sentences against the benchmark's 2.4. Draft 2 can split for rhythm once the substance is agreed.
- Title length: 12 words. A shorter option is "Plausible Accessibility" with the rest in the excerpt.
- Language button: fixed (3bc2c6e83) and the article now tells it in the past tense, with the exact-name test as a takeable mechanism. Invisible list markers: still open (task chip); fix before publishing or reword the limits section.
