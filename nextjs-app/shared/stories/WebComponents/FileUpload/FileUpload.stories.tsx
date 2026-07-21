import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import {
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";
import {
  DtFileUploadElement,
  type DtFileUploadAppearance,
} from "../../../../../packages/web-components/src/native/file-upload";
import contract from "../../../../shared/components/FileUpload/FileUpload.contract.json";

if (!customElements.get("dt-file-upload")) {
  customElements.define("dt-file-upload", DtFileUploadElement);
}

type ValuePreset = "none" | "samplePdf" | "largePng";

type Args = {
  label: string;
  placeholder?: string;
  helperText?: string;
  uploadButtonLabel: string;
  clearButtonLabel?: string;
  accept?: string;
  maxSizeInBytes?: number;
  sizeErrorMessage?: string;
  error?: string;
  disabled: boolean;
  required: boolean;
  appearance: DtFileUploadAppearance;
  valuePreset: ValuePreset;
};

function resolvePreset(valuePreset: ValuePreset): File | null {
  switch (valuePreset) {
    case "samplePdf":
      return new File([new Uint8Array(48 * 1024)], "project-brief.pdf", {
        type: "application/pdf",
      });
    case "largePng":
      return new File([new Uint8Array(160 * 1024)], "moodboard.png", {
        type: "image/png",
      });
    default:
      return null;
  }
}

function NativeFileUpload({ valuePreset, ...args }: Args) {
  const ref = useRef<DtFileUploadElement | null>(null);
  const [file, setFile] = useState<File | null>(() => resolvePreset(valuePreset));

  useEffect(() => {
    setFile(resolvePreset(valuePreset));
  }, [valuePreset]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent<{ file: File | null }>).detail;
      setFile(detail.file ?? null);
    };

    element.addEventListener("file-change", handleChange);
    return () => element.removeEventListener("file-change", handleChange);
  }, []);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const attributes: Record<string, string | number | boolean | undefined> = {
      label: args.label,
      placeholder: args.placeholder,
      "helper-text": args.helperText,
      "upload-button-label": args.uploadButtonLabel,
      "clear-button-label": args.clearButtonLabel,
      accept: args.accept,
      "max-size-in-bytes": args.maxSizeInBytes,
      "size-error-message": args.sizeErrorMessage,
      error: args.error,
      appearance: args.appearance,
      disabled: args.disabled,
      required: args.required,
    };

    for (const [name, value] of Object.entries(attributes)) {
      if (value === false || value === undefined || value === "") {
        element.removeAttribute(name);
        continue;
      }
      element.setAttribute(name, value === true ? "" : String(value));
    }

    element.value = file;
  }, [args, file]);

  return (
    <div style={{ maxWidth: "28rem" }}>
      <dt-file-upload ref={ref} />
    </div>
  );
}

const meta = {
  title: "Web Components/Forms/FileUpload",
  component: NativeFileUpload,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: {
      description: {
        component:
          "Form-associated native dt-file-upload custom element with property-backed File values, drag/drop, and composed change events.",
      },
    },
  },
  args: {
    label: "Attachment (optional)",
    placeholder: "No file selected",
    helperText: "Optional. Max 5 MB. Accepted formats: PDF, PNG, JPG.",
    uploadButtonLabel: "Choose file",
    clearButtonLabel: "Remove file",
    accept: ".pdf,.png,.jpg,.jpeg",
    maxSizeInBytes: 5 * 1024 * 1024,
    sizeErrorMessage: "File exceeds the 5 MB limit.",
    disabled: false,
    required: false,
    appearance: "default",
    valuePreset: "none",
  },
  argTypes: {
    appearance: {
      control: "inline-radio",
      options: ["default", "editorial"],
    },
    valuePreset: {
      control: { type: "select" },
      options: ["none", "samplePdf", "largePng"],
      description:
        "Property-backed File preset for Storybook controls. Real user picks still go through the hidden native input.",
    },
  },
} satisfies Meta<typeof NativeFileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

function shadowInput(canvasElement: HTMLElement): HTMLInputElement {
  const input = canvasElement
    .querySelector("dt-file-upload")
    ?.shadowRoot?.querySelector("input[type='file']");
  if (!(input instanceof HTMLInputElement)) {
    throw new Error("Hidden native file input not found");
  }
  return input;
}

function summaryField(canvasElement: HTMLElement): HTMLInputElement | HTMLButtonElement {
  const control = canvasElement
    .querySelector("dt-file-upload")
    ?.shadowRoot?.querySelector("#control");
  if (
    !(control instanceof HTMLInputElement) &&
    !(control instanceof HTMLButtonElement)
  ) {
    throw new Error("Summary control not found");
  }
  return control;
}

export const Default: Story = {
  tags: ["beta-matrix"],
  play: assertNative("dt-file-upload"),
};

export const SelectAndClear: Story = {
  ...exampleStory,
  play: async ({ canvasElement }) => {
    const input = shadowInput(canvasElement);
    const file = new File(["hello"], "brief.pdf", { type: "application/pdf" });
    await userEvent.upload(input, file);

    const summary = summaryField(canvasElement);
    await waitFor(() =>
      expect(
        summary instanceof HTMLInputElement ? summary.value : summary.textContent,
      ).toMatch(/brief\.pdf/),
    );

    const clear = canvasElement
      .querySelector("dt-file-upload")
      ?.shadowRoot?.querySelector("button.clearButton");
    if (!(clear instanceof HTMLButtonElement)) {
      throw new Error("Clear button not found");
    }
    await userEvent.click(clear);

    await waitFor(() => {
      // Re-query: clearing re-renders the shadow summary, so the pre-click
      // node reference goes stale (same trap as WC Pagination, #1239).
      const cleared = summaryField(canvasElement);
      expect(
        cleared instanceof HTMLInputElement ? cleared.value : cleared.textContent,
      ).not.toMatch(/brief\.pdf/);
    });
  },
};

export const SizeRejection: Story = {
  ...exampleStory,
  args: {
    maxSizeInBytes: 10,
    sizeErrorMessage: "File exceeds the 10 byte demo limit.",
  },
  play: async ({ canvasElement }) => {
    const input = shadowInput(canvasElement);
    const file = new File(["x".repeat(64)], "too-big.pdf", {
      type: "application/pdf",
    });
    await userEvent.upload(input, file);

    const error = canvasElement
      .querySelector("dt-file-upload")
      ?.shadowRoot?.querySelector("#error");
    await waitFor(() =>
      expect(error?.textContent).toMatch(/10 byte demo limit/i),
    );
  },
};

export const Editorial: Story = {
  ...exampleStory,
  args: {
    appearance: "editorial",
  },
};

export const Disabled: Story = {
  ...exampleStory,
  args: {
    disabled: true,
  },
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  args: {
    valuePreset: "samplePdf",
  },
};

export const Example: Story = {
  ...exampleStory,
  tags: ["beta-matrix"],
};

export const ForcedColors: Story = {
  ...forcedColorsStory,
  tags: ["beta-matrix"],
};
