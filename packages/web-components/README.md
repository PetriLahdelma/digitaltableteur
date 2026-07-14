# @digitaltableteur/web-components

Framework-neutral, native custom elements for the Digitaltableteur design
system. The default package surface has no React runtime dependency.

## Install

```sh
npm install @digitaltableteur/web-components @digitaltableteur/tokens-css
```

Load tokens once, then register the native element fleet:

```js
import "@digitaltableteur/tokens-css/tokens.css";
import "@digitaltableteur/web-components/register";
```

The default registry includes Button, Badge, StatusDot, Divider, Icon, Spinner,
Progress, and AlertBanner as native Shadow DOM custom elements.

```html
<dt-button label="Continue" variant="primary"></dt-button>
<dt-badge label="Beta" tone="warning"></dt-badge>
<dt-status-dot label="Online" tone="success"></dt-status-dot>
<dt-divider></dt-divider>
<dt-icon name="check-circle" aria-label="Complete"></dt-icon>
<dt-spinner label="Loading portfolio"></dt-spinner>
<dt-progress value="64" label="Upload progress"></dt-progress>
<dt-alert-banner
  tone="warning"
  title-text="Review required"
  description="Check the deployment settings."
></dt-alert-banner>
```

`/native` and `/register/native` are retained as explicit aliases for hosts
that prefer to state the implementation mode:

```js
import "@digitaltableteur/tokens-css/tokens.css";
import "@digitaltableteur/web-components/register/native";
```

Use the side-effect-free API when registration timing or a scoped custom
element registry is owned by the host:

```js
import { defineElements } from "@digitaltableteur/web-components";

defineElements();
```

Native components accept text attributes for simple markup and slots for rich
content. For example, Button supports default, `icon`, and `end-icon` slots;
AlertBanner supports default, `title`, `description`, `icon`, and `action`
slots. Component metadata and attributes are published in
`custom-elements.json`.

## Legacy React adapters

The initial quick-port adapters remain available temporarily from
`@digitaltableteur/web-components/react` and
`@digitaltableteur/web-components/register/react`. They are not loaded by the
default entrypoint and their dependencies are optional:

```sh
npm install @digitaltableteur/react @r2wc/react-to-web-component react react-dom
```

Load `@digitaltableteur/react/style.css` before registering those adapters.
Do not register native and React implementations for the same tag in one
custom-element registry; the package rejects implementation conflicts.

The Digitaltableteur marketing site continues to consume
`@digitaltableteur/react`. The web-components package is an independent sibling
implementation, not a migration target for the site.
