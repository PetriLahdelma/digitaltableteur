# Code

## Intent
Inline code for a function name, prop, file path or CLI flag inside prose.
Renders a semantic `<code>` on the light surface with a hairline border.

## Interaction contract
- Static, non-interactive; no keyboard or pointer behavior of its own.
- Screen readers: announced as regular text; `<code>` conveys the semantic.

## Do / don't
- Do: match `size` to the surrounding text (sm with xxs/xs, md with s/m, lg with l), or use `inherit` where the text size varies, such as article prose.
- Do: keep it to a few words inside a sentence.
- Don't: add a copy affordance; a copyable command is a Snippet.
- Don't: use it for keyboard keys; that is Kbd.

## Design notes
- Tokens: `--color-light-bg`, `--color-border-light`, `--color-text`, `--radius-md`, `--font-mono`.
- Rules are doubled on the class so article prose styles never outrank them.
- Figma: Code (1976:7364). Replaces CodeSnippet `variant="inline"`.
