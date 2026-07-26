# @digitaltableteur/cli

Local-first, typed access to the same generated component contracts that power
Digitaltableteur Storybook and MCP.

```bash
npx @digitaltableteur/cli search "multi select"
npx @digitaltableteur/cli component Button
npx @digitaltableteur/cli example Button --story Playground
npx @digitaltableteur/cli compose "dismissible validation warning"
npx @digitaltableteur/cli doctor
npx @digitaltableteur/cli manifest --json
npx @digitaltableteur/cli --help
```

Every command supports `--json`. The package root exports the same asynchronous
functions for programmatic use.
