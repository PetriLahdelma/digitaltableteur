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
