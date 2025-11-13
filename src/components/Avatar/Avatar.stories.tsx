import React from "react";
import { StoryFn, Meta } from "@storybook/react-vite";
import Avatar from "./Avatar";
import peteVaultBoy from "../../assets/images/pete-vault-boy.jpg";
import { within, userEvent } from "@storybook/testing-library";
import Icon from "@dt/Icon";
import PropTypes from "prop-types";

export default {
  title: "Components/Avatar",
  component: Avatar,
  argTypes: {
    variant: {
      control: { type: "inline-radio" },
      options: ["image", "initials"],
      description: "Select whether the avatar prefers an image or initials.",
    },
    name: {
      control: { type: "text" },
      description:
        "Full name used for fallback initials (e.g., 'First Last' -> 'FL').",
    },
  },
} as Meta<typeof Avatar>;

type AvatarStoryArgs = React.ComponentProps<typeof Avatar>;
type EdgeDetectionArgs = AvatarStoryArgs & {
  previewPlacement?: "left" | "right" | "top" | "bottom";
};

const Template: StoryFn<AvatarStoryArgs> = (args) => <Avatar {...args} />;

const EdgeTemplate: StoryFn<EdgeDetectionArgs> = ({
  previewPlacement = "right",
  ...avatarArgs
}) => {
  const PREVIEW_MARGIN = 24;
  const MIN_BLOCK_SIZE = 220;
  const MIN_INLINE_SIZE = 220;
  const areaRef = React.useRef<HTMLDivElement | null>(null);
  const [placementRefreshKey, setPlacementRefreshKey] = React.useState(0);
  const [previewSize, setPreviewSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    setPlacementRefreshKey((prev) => prev + 1);
  }, [previewPlacement]);

  React.useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const parent = areaRef.current?.parentElement;
    if (!parent) return;

    const updateSize = () => {
      const rect = parent.getBoundingClientRect();
      setPreviewSize({ width: rect.width, height: rect.height });
    };

    updateSize();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => updateSize());
      observer.observe(parent);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const justifyContent =
    previewPlacement === "left"
      ? "flex-start"
      : previewPlacement === "right"
        ? "flex-end"
        : "center";
  const alignItems =
    previewPlacement === "top"
      ? "flex-start"
      : previewPlacement === "bottom"
        ? "flex-end"
        : "center";

  const computedWidth =
    previewSize.width > 0
      ? Math.max(previewSize.width - PREVIEW_MARGIN * 2, MIN_INLINE_SIZE)
      : undefined;

  const computedHeight =
    previewSize.height > 0
      ? Math.max(previewSize.height - PREVIEW_MARGIN * 2, MIN_BLOCK_SIZE)
      : undefined;

  return (
    <div
      ref={areaRef}
      style={{
        display: "flex",
        width: previewSize.width > 0 ? `${previewSize.width}px` : "100%",
        blockSize: previewSize.height > 0 ? `${previewSize.height}px` : "100%",
        minBlockSize: "95vh",
        padding: `${PREVIEW_MARGIN}px`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent,
          alignItems,
          minHeight: `${MIN_BLOCK_SIZE}px`,
          padding: "1.5rem",
          inlineSize: computedWidth ? `${computedWidth}px` : "100%",
          blockSize: computedHeight ? `${computedHeight}px` : undefined,
          border: "1px dashed var(--color-border, #c0c0c0)",
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <Avatar {...avatarArgs} placementRefreshKey={placementRefreshKey} />
      </div>
    </div>
  );
};

EdgeTemplate.propTypes = {
  // Storybook still lints stories as React components; declare propTypes for lint compatibility.
  previewPlacement: PropTypes.oneOf(["left", "right", "top", "bottom"]),
};

export const DefaultVariant = Template.bind({});
DefaultVariant.args = {
  imageUrl: peteVaultBoy,
  name: "Petri Lahdelma",
  variant: "image",
};
DefaultVariant.parameters = {
  docs: {
    description: {
      story:
        "Default avatar that can switch between image/initials via controls.",
    },
  },
};

export const WithImage = Template.bind({});
WithImage.args = {
  imageUrl: peteVaultBoy,
  name: undefined,
  variant: "image",
};

export const WithInitials = Template.bind({});
WithInitials.args = {
  name: "Petri Lahdelma",
  variant: "initials",
};

export const WithMenu = Template.bind({});
WithMenu.args = {
  imageUrl: peteVaultBoy,
  name: "Petri Lahdelma",
  menuLabel: "Open avatar menu",
  variant: "image",
  menuItems: [
    {
      label: "Profile",
      icon: <Icon name="user" aria-hidden="true" />,
    },
    {
      label: "Settings",
      icon: <Icon name="gear" aria-hidden="true" />,
    },
    {
      label: "Help",
      icon: <Icon name="question-mark" aria-hidden="true" />,
    },
    {
      label: "Sign out",
      icon: <Icon name="sign-out" aria-hidden="true" />,
    },
  ],
};

export const EdgeDetection = EdgeTemplate.bind({});
EdgeDetection.args = {
  ...WithMenu.args,
  previewPlacement: "right",
};
EdgeDetection.argTypes = {
  previewPlacement: {
    options: ["left", "right", "top", "bottom"],
    control: { type: "inline-radio" },
    description:
      "Moves the avatar closer to an edge to verify automatic menu alignment.",
  },
};
EdgeDetection.parameters = {
  docs: {
    description: {
      story:
        "Place the avatar near each edge to confirm the dropdown flips when space is limited.",
    },
  },
};

WithImage.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByRole("img");
};

WithInitials.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  // Check for initials "PL" instead of full name
  await canvas.findByText("PL");
};

WithMenu.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const user = userEvent.setup();
  const trigger = canvas.getByRole("button", { name: /avatar menu/i });
  await user.click(trigger);
  await canvas.findByRole("menuitem", { name: "Profile" });
};

EdgeDetection.play = WithMenu.play;
DefaultVariant.play = WithImage.play;
