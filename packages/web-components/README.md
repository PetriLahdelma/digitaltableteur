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

The default registry contains 70 native Shadow DOM custom elements:
Accordion, AlertBanner, AspectRatio, Avatar, AvatarGroup, Badge, Breadcrumb,
Button, ButtonGroup, Card, Center, Checkbox, CheckboxGroup, CodeBlockWindow,
CodeSnippet, Combobox, CommandPalette, Container, CookieConsent, Display,
Divider, EmptyState, ExpandableSection, FileUpload, FilterChip, FlexBox,
FormField, Grid, GroupLabel, HelperText, Icon, IconButton, Kbd, Label,
LanguageSwitcher, Link, List, MacWindowFrame, Menu, Modal, MultiCombobox,
NavLink, NavMenuList, Pagination, PhoneInput, Progress, Radio, RadioGroup,
Section, SegmentedControl, Select, SelectOption, Skeleton, SkipLink, Spacer,
Spinner, SplitButton, Stack, StatusDot, Switch, Tabs, Text, TextArea,
TextInput, Timestamp, Title, Toast, ToastStack, Tooltip, and VisuallyHidden.

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
<dt-display as="h1">Native hero statement</dt-display>
<dt-text size="m">Tokenized body copy.</dt-text>
<dt-kbd>Enter</dt-kbd>
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
<dt-container size="lg">
  <dt-card title-text="Native surface" description="Structured without React.">
    <dt-text>Default-slot body content.</dt-text>
    <dt-button slot="footer-end">Continue</dt-button>
  </dt-card>
</dt-container>
<dt-center style="min-height: 8rem">Centered content</dt-center>
<dt-aspect-ratio ratio="16:9">
  <img src="hero.jpg" alt="Case study hero" />
</dt-aspect-ratio>
<dt-spacer size="md"></dt-spacer>
<dt-avatar name="Aino Virtanen" variant="initials"></dt-avatar>
<dt-avatar-group aria-label="Project members" max="3">
  <dt-avatar name="Aino Virtanen" variant="initials"></dt-avatar>
  <dt-avatar name="Bo Lindqvist" variant="initials"></dt-avatar>
  <dt-avatar name="Carla Mendes" variant="initials"></dt-avatar>
  <dt-avatar name="Deniz Aydin" variant="initials"></dt-avatar>
</dt-avatar-group>
<dt-grid columns="1" tablet-columns="2" desktop-columns="3">
  <div>First cell</div>
  <div span="2">Spanning cell</div>
</dt-grid>
<dt-skeleton variant="text" lines="3"></dt-skeleton>
<form>
  <dt-text-input
    name="email"
    type="email"
    label="Email address"
    required
  ></dt-text-input>
  <dt-text-area name="brief" label="Project brief"></dt-text-area>
  <dt-checkbox name="terms" label="I agree to the terms" required></dt-checkbox>
  <dt-radio-group
    name="discipline"
    legend="Primary discipline"
    options='[{"value":"design","label":"Design"},{"value":"engineering","label":"Engineering"}]'
  ></dt-radio-group>
  <dt-select
    name="office"
    label="Office"
    options='[{"value":"helsinki","label":"Helsinki"},{"value":"remote","label":"Remote"}]'
  ></dt-select>
  <dt-button submits>Send</dt-button>
</form>
<dt-switch label="Email notifications"></dt-switch>
<dt-tooltip content="Opens in a new tab" placement="top">
  <button type="button">More information</button>
</dt-tooltip>
<dt-expandable-section
  collapsed-label="Show implementation notes"
  expanded-label="Hide implementation notes"
>
  Native disclosure content remains in the light DOM.
</dt-expandable-section>
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
Text, Title, Section, Stack, Label, and HelperText expose a default slot plus a
text attribute fallback. List accepts either semantic light-DOM `li` children
or a JSON string array through `items` (and a `string[]` property in
JavaScript).
Card exposes default, `header-start`, `header-end`, `extra`, `footer-start`, and
`footer-end` slots. Center, Container, and AspectRatio expose default slots;
Spacer is intentionally empty and hidden from the accessibility tree.
AvatarGroup, Display, FlexBox, Grid, Kbd, and VisuallyHidden preserve rich
light-DOM content through default slots. Direct Grid children accept `span` and
`row-span` placement attributes. Avatar menu data is set through the
`menuItems` JavaScript property and emits a composed `menu-select` event.
Skeleton's `animate` option is attribute-only because the platform already
reserves the `HTMLElement.animate()` JavaScript property; use
`animate="false"` to disable shimmer declaratively.
`dt-nav-link` deliberately does not inspect a framework router: the host updates
`current-path` when navigation changes. Component metadata and attributes are
published in `custom-elements.json`. TextInput, TextArea, Checkbox, Radio,
RadioGroup, CheckboxGroup, and Select are form-associated custom elements.
Select accepts JSON option data or declarative `dt-select-option` children;
RadioGroup and CheckboxGroup accept JSON option data or matching declarative
control children. Switch remains an immediate-action control and deliberately
does not submit a form value.
Modal and Tooltip preserve slotted interactive content while owning overlay
semantics, positioning, and dismissal requests. Menu, SplitButton, Tabs,
SegmentedControl, Accordion, and ExpandableSection expose composed events so
framework and plain-JavaScript hosts can own controlled state without adapters.
CommandPalette, NavMenuList, and LanguageSwitcher keep routing host-owned;
ToastStack reports dismissals without owning application state. PhoneInput,
Combobox, and MultiCombobox participate in forms and expose typed value-change
events. CookieConsent exposes consent decisions while leaving storage,
analytics, and policy enforcement to the host.

## Lifecycle status

Canonical API maturity and native implementation maturity are separate. A
component can have a stable React-backed contract while its framework-neutral
implementation remains beta. Storybook displays both values, and
`custom-elements.json` publishes them as `dtContractStatus` and
`dtImplementationStatus`.

All current native implementations are beta. Promoting one to stable requires:

- a stable canonical contract;
- native accessibility-tree and real-browser forced-colors evidence; and
- at least one documented production consumer of the published custom element.

Package build tests, Storybook usage, and clean-install smoke tests do not count
as production consumption. Evidence is recorded in the element definition and
published as `dtImplementationConsumers`.

> **Combobox behavioral extension (native-only):** the React `Combobox` renders a
> non-editable `role="combobox"` button (select-from-list). The native
> `dt-combobox` deliberately extends this to an editable, filtering combobox
> (`aria-autocomplete="list"`) that emits a `filter-change` event, matching the
> APG editable-combobox pattern for framework-free hosts that lack a React
> selection surface. This is an intentional superset, not a port mismatch; the
> non-editable React behavior is still reproducible by ignoring `filter-change`.

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
