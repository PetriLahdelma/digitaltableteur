# @digitaltableteur/react

Private React package for the Digitaltableteur design system. It contains the reusable component surface, runtime adapters, hooks, and the package stylesheet consumed by Digitaltableteur frontends.

## Install

```sh
npm install @digitaltableteur/react @digitaltableteur/tokens-css
```

Import the package stylesheet once at the app boundary:

```tsx
import "@digitaltableteur/tokens-css/tokens.css";
import "@digitaltableteur/react/style.css";
```

## Usage

```tsx
import { Button, Card, Stack, Text, Title } from "@digitaltableteur/react";

export function Example() {
  return (
    <Card>
      <Stack gap="md">
        <Title order={2}>Design system card</Title>
        <Text>Reusable UI from the npm package.</Text>
        <Button>Continue</Button>
      </Stack>
    </Card>
  );
}
```

For a smaller package graph, import only the families an application uses and
their matching stylesheets:

```tsx
import "@digitaltableteur/react/actions/style.css";
import "@digitaltableteur/react/typography/style.css";
import { Button } from "@digitaltableteur/react/actions";
import { Text, Title } from "@digitaltableteur/react/typography";
```

Available family entrypoints are `actions`, `consent`, `content`, `feedback`,
`forms`, `hooks`, `identity`, `layout`, `navigation`, `patterns`, `runtime`, and
`typography`. Family stylesheets include the shared component CSS reachable
from that entrypoint. Use either the family stylesheets or the global
`@digitaltableteur/react/style.css`; loading both is redundant. The root module
and global stylesheet remain the compatibility surface for existing consumers.

Host frameworks provide their own routing, image, i18n, toast, and navigation runtime behavior through package adapters:

```tsx
import {
  ImageProvider,
  LinkProvider,
  NavigationProvider,
  ToastRuntimeProvider,
  TranslationProvider,
} from "@digitaltableteur/react";
```

## Public Surface

The package intentionally exposes design-system primitives and host adapters, not Digitaltableteur product/page composition.

Use the family entrypoints above to discover the supported actions, consent,
content, feedback, forms, hooks, identity, layout, navigation, patterns,
runtime, and typography surfaces. Runtime utilities such as
`resolveMotionPlan` are available from `@digitaltableteur/react/runtime` and
the compatibility root.

The authoritative export list is frozen in
`packages/react/public-api.manifest.json` and checked by
`npm run check:react-public-api`; the README intentionally does not duplicate
that generated list.

## Boundaries

Keep app/product/site composition out of this package. Examples that must stay outside `@digitaltableteur/react` include site chrome, portfolio/blog cards, chat surfaces, maps, booking/CV utilities, social/profile sharing, and route-specific page layouts.

## Verification

Before publishing, run:

```sh
npm run check:react-publish-ready
```

After publishing, run:

```sh
npm run check:react-registry-install
```
