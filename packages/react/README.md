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

Component exports include:

- Display and feedback: `AlertBanner`, `Avatar`, `AvatarGroup`, `Badge`, `EmptyState`, `Progress`, `Skeleton`, `Spinner`, `StatusDot`, `Toast`, `ValueCard`.
- Layout and typography: `Card`, `Container`, `Divider`, `FlexBox`, `Grid`, `Kbd`, `List`, `Section`, `Stack`, `Text`, `Title`, `VisuallyHidden`.
- Forms: `Button`, `ButtonGroup`, `Checkbox`, `CheckboxGroup`, `Combobox`, `FileUpload`, `FormField`, `GroupLabel`, `HelperText`, `IconButton`, `Label`, `MultiCombobox`, `PhoneInput`, `Radio`, `RadioGroup`, `Select`, `SelectOption`, `Switch`, `TextArea`, `TextInput`.
- Navigation and content: `Breadcrumb`, `CategoryFilter`, `Gallery`, `Icon`, `LanguageSwitcher`, `Link`, `MacWindowFrame`, `Menu`, `Modal`, `NavLink`, `NavMenuList`, `Pagination`, `ReadingProgress`, `SkipLink`, `Tabs`.
- Runtime providers and hooks: `AnimationRuntimeProvider`, `CookieConsentProvider`, `ImageProvider`, `LayerProvider`, `LinkProvider`, `NavigationProvider`, `ThemeProvider`, `ToastRuntimeProvider`, `TranslationProvider`, `useCookieConsent`, `useFocusTrap`, `useLayer`, `useMediaQuery`, `useOverflow`, `useScrollLock`, `useScrollOverflow`, `useTheme`, `useToast`.

The public API is frozen by `packages/react/public-api.manifest.json` and checked by `npm run check:react-public-api`.

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
