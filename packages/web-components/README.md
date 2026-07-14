# @digitaltableteur/web-components

Framework-neutral custom elements for the Digitaltableteur design system. The
package is being migrated in place: React adapters provide fast coverage, then
native implementations replace them without changing tag names or attributes.

## Install

```sh
npm install @digitaltableteur/web-components @digitaltableteur/tokens-css
```

Load tokens once, then choose exactly one registry mode per document:

```js
import "@digitaltableteur/tokens-css/tokens.css";
import "@digitaltableteur/react/style.css";
import "@digitaltableteur/web-components/register";
```

The default hybrid registry currently serves `dt-spinner` and `dt-progress`
natively, with `dt-button` and `dt-badge` backed by the canonical React
components. React-backed tags need the React package stylesheet shown above.

```html
<dt-button label="Continue" variant="primary"></dt-button>
<dt-badge label="Beta" tone="warning"></dt-badge>
<dt-spinner label="Loading portfolio"></dt-spinner>
<dt-progress value="64" label="Upload progress"></dt-progress>
```

For a React-free bundle containing only graduated native tags:

```js
import "@digitaltableteur/tokens-css/tokens.css";
import "@digitaltableteur/web-components/register/native";
```

Use the side-effect-free API when registration timing or a scoped custom
element registry is owned by the host:

```js
import { defineElements } from "@digitaltableteur/web-components";

await defineElements();
```

`@digitaltableteur/web-components/react` exposes the complete quick-port fleet
for parity comparisons. Do not load it together with the hybrid or native
registry; registration rejects mixed implementations instead of silently
keeping the first one.

The machine-readable API is published as `custom-elements.json`. Generated
adapter and manifest drift is checked against the React public API and source
component contracts before every package build.

The first publish must follow `@digitaltableteur/react@0.1.15`; the quick-port
adapters deliberately depend on that canonical package version or newer.
