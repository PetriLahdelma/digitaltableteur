# @digitaltableteur/cli

Local-first, typed access to the same generated component contracts that power
Digitaltableteur Storybook and MCP.

```bash
npx @digitaltableteur/cli search "multi select"
npx @digitaltableteur/cli component Button
npx @digitaltableteur/cli example Button --story Playground
npx @digitaltableteur/cli compose "dismissible validation warning"
npx @digitaltableteur/cli doctor
npx @digitaltableteur/cli diff --from v-prev-ref --to HEAD
npx @digitaltableteur/cli diff DataTable --from HEAD~5
npx @digitaltableteur/cli affected DataTable TreeView
npx @digitaltableteur/cli validate --path src
npx @digitaltableteur/cli manifest --json
npx @digitaltableteur/cli --help
```

Every command supports `--json`. The package root exports the same asynchronous
functions for programmatic use.

## Lifecycle commands

`diff` compares component contracts between two git refs (default: `HEAD` →
the working tree) and reports every change with its own severity — props
added/removed/required/retyped, finite values gained or lost, defaults,
accessibility requirements, composition relationships, slots, and status
transitions — plus a rolled-up semver recommendation and the consumer files
the generated import graph marks as affected. Runs inside the repository
(`ERR_GIT_CONTEXT_UNAVAILABLE` elsewhere).

`affected` maps one or more components to their direct importers, the
design-system components that compose them (reverse `composesWith` edges),
and the production pages reached through the import graph.

`validate` scans a consumer codebase (`--path <dir>`, default the current
directory; optionally narrowed to named components) for `.tsx`/`.jsx`
design-system usage — `@dt/<Name>` imports, `@digitaltableteur/react` named
imports, and relative component/pattern imports — and checks every JSX usage
against the installed contract manifest. Errors: unknown `@dt` component,
enum prop literal outside the contract values, missing required prop
(skipped for elements carrying a JSX spread). Warnings: props the contract
does not declare (native passthrough is legal but invisible to contracts),
deprecated components, unmatched package named imports. Exit code 2 when any
error is found, so it works as a CI gate:

```bash
npx @digitaltableteur/cli validate --path src
npx @digitaltableteur/cli validate DataTable TreeView --path app --json
```
