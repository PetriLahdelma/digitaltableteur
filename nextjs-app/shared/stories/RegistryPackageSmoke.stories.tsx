import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Card,
  CookieConsentProvider,
  LayerProvider,
  Stack,
  Text,
  Title,
  ToastRuntimeProvider,
  TranslationProvider,
  useCookieConsent,
  useLayer,
  useToast,
} from "@digitaltableteur/react";
import "@digitaltableteur/tokens-css/tokens.css";
import "@digitaltableteur/react/style.css";

function RegistryContextProbe() {
  const layer = useLayer({ role: "toast", level: 2 });
  const consent = useCookieConsent();
  const toast = useToast();

  return (
    <Card
      title="Registry package context probe"
      description="Rendered through @digitaltableteur/react from node_modules."
    >
      <Stack gap="sm">
        <Text size="s">
          Layer role {layer.role}; z-index {layer.zIndex}; consent ready{" "}
          {consent.isReady ? "yes" : "no"}.
        </Text>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            consent.acceptEssentialOnly();
            toast.showToast("Registry package contexts are aligned", {
              tone: "success",
            });
          }}
        >
          Exercise package contexts
        </Button>
      </Stack>
    </Card>
  );
}

function RegistryPackageSmoke() {
  return (
    <TranslationProvider>
      <ToastRuntimeProvider value={{ showToast: () => undefined }}>
        <LayerProvider baseZIndex={7000}>
          <CookieConsentProvider autoShow={false}>
            <Stack gap="md">
              <Title level={2} size="xs">
                Registry package smoke
              </Title>
              <Text size="s">
                This story intentionally imports components, providers, hooks,
                and package CSS from the private npm package path.
              </Text>
              <RegistryContextProbe />
            </Stack>
          </CookieConsentProvider>
        </LayerProvider>
      </ToastRuntimeProvider>
    </TranslationProvider>
  );
}

const meta = {
  title: "Registry/Package smoke",
  component: RegistryPackageSmoke,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Verifies Storybook can compile and render @digitaltableteur/react, @digitaltableteur/react/style.css, and @digitaltableteur/tokens-css from the registry install.",
      },
    },
    wip: { disabled: true },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RegistryPackageSmoke>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
