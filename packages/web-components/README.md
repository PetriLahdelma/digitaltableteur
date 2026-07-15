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

The default registry contains 24 native Shadow DOM custom elements:
AlertBanner, Badge, Button, ButtonGroup, Checkbox, Divider, EmptyState,
FilterChip, Icon, IconButton, Link, List, NavLink, Progress, Section, SkipLink,
Spinner, Stack, StatusDot, Switch, Text, TextArea, TextInput, and Title.

```html
<dt-button label="Continue" variant="primary"></dt-button>
<dt-icon-button icon="list" label="Open menu"></dt-icon-button>
<dt-button-group aria-label="View options">
  <dt-button>Grid</dt-button>
  <dt-button>List</dt-button>
</dt-button-group>
<dt-filter-chip pressed count="12">Articles</dt-filter-chip>
<dt-link href="https://example.com">Documentation</dt-link>
<dt-nav-link href="/work" current-path="/work/case-study">Work</dt-nav-link>
<dt-skip-link>Skip to main content</dt-skip-link>
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
<dt-empty-state
  icon="magnifying-glass"
  title-text="No results"
  description="Try another filter."
>
  <dt-button slot="action">Clear filters</dt-button>
</dt-empty-state>
<dt-title level="2" size="l">Native semantic heading</dt-title>
<dt-text size="m">Tokenized body copy.</dt-text>
<dt-list list-style-type="dash">
  <li>Semantic light-DOM list items</li>
  <li>JSON string arrays are also supported through the items attribute</li>
</dt-list>
<dt-section spacing="lg" background="muted">
  <dt-stack gap="sm">
    <dt-title level="2" size="m">Composed layout primitives</dt-title>
    <dt-text>Slots preserve arbitrary native content.</dt-text>
  </dt-stack>
</dt-section>
<form>
  <dt-text-input
    name="email"
    type="email"
    label="Email address"
    required
  ></dt-text-input>
  <dt-text-area name="brief" label="Project brief"></dt-text-area>
  <dt-checkbox name="terms" label="I agree to the terms" required></dt-checkbox>
  <dt-button submits>Send</dt-button>
</form>
<dt-switch label="Email notifications"></dt-switch>
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
slots; EmptyState supports `title`, `description`, `icon`, and `action` slots.
Text, Title, Section, and Stack expose a default slot plus a text attribute
fallback. List accepts either semantic light-DOM `li` children or a JSON string
array through `items` (and a `string[]` property in JavaScript).
`dt-nav-link` deliberately does not inspect a framework router: the host updates
`current-path` when navigation changes. Component metadata and attributes are
published in `custom-elements.json`. TextInput, TextArea, and Checkbox are
form-associated custom elements; Switch remains an immediate-action control
and deliberately does not submit a form value.

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
