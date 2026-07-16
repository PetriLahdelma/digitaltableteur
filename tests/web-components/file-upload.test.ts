import { fireEvent } from "@testing-library/dom";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DtFileUploadElement,
  type DtFileUploadChangeDetail,
} from "../../packages/web-components/src/native/file-upload";

type InternalsMock = {
  setFormValue: ReturnType<typeof vi.fn>;
  setValidity: ReturnType<typeof vi.fn>;
};

const internals = new WeakMap<HTMLElement, InternalsMock>();

function internalsFor(element: HTMLElement): InternalsMock {
  const instance = internals.get(element);
  if (!instance) throw new Error("Missing mocked internals");
  return instance;
}

function hiddenInput(element: DtFileUploadElement): HTMLInputElement {
  const input = element.shadowRoot?.querySelector("input[type='file']");
  if (!(input instanceof HTMLInputElement)) {
    throw new Error("Hidden input not found");
  }
  return input;
}

function summaryInput(element: DtFileUploadElement): HTMLInputElement {
  const input = element.shadowRoot?.querySelector("#control");
  if (!(input instanceof HTMLInputElement)) {
    throw new Error("Summary input not found");
  }
  return input;
}

function summaryButton(element: DtFileUploadElement): HTMLButtonElement {
  const button = element.shadowRoot?.querySelector("#control");
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("Summary button not found");
  }
  return button;
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "attachInternals", {
    configurable: true,
    value() {
      const instance = {
        setFormValue: vi.fn(),
        setValidity: vi.fn(),
      };
      internals.set(this as HTMLElement, instance);
      return instance;
    },
  });

  if (!customElements.get("dt-file-upload")) {
    customElements.define("dt-file-upload", DtFileUploadElement);
  }
});

beforeEach(() => {
  document.documentElement.lang = "en";
});

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("DtFileUploadElement", () => {
  it("keeps File values property-backed while reflecting the string API to attributes", () => {
    const element = document.createElement("dt-file-upload") as DtFileUploadElement;
    const file = new File(["brief"], "brief.pdf", {
      type: "application/pdf",
    });

    element.label = "Attachment";
    element.placeholder = "No file selected";
    element.helperText = "Max 5 MB";
    element.uploadButtonLabel = "Choose file";
    element.clearButtonLabel = "Remove file";
    element.accept = ".pdf,.png";
    element.maxSizeInBytes = 5 * 1024 * 1024;
    element.value = file;

    expect(element).toHaveAttribute("helper-text", "Max 5 MB");
    expect(element).toHaveAttribute("upload-button-label", "Choose file");
    expect(element).toHaveAttribute("clear-button-label", "Remove file");
    expect(element).toHaveAttribute("accept", ".pdf,.png");
    expect(element).toHaveAttribute("max-size-in-bytes", "5242880");
    expect(element).not.toHaveAttribute("value");

    document.body.append(element);

    expect(summaryInput(element).value).toContain("brief.pdf");
    expect(hiddenInput(element)).toHaveAttribute("accept", ".pdf,.png");
  });

  it("accepts picker selections, emits composed events in order, and syncs form state", () => {
    const element = document.createElement("dt-file-upload") as DtFileUploadElement;
    element.label = "Attachment";
    element.uploadButtonLabel = "Choose file";
    element.clearButtonLabel = "Remove file";
    element.required = true;

    const order: string[] = [];
    const onFileChange = vi.fn(() => order.push("file-change"));
    const onChange = vi.fn(() => order.push("change"));
    element.addEventListener("file-change", onFileChange);
    element.addEventListener("change", onChange);
    document.body.append(element);

    expect(internalsFor(element).setValidity).toHaveBeenLastCalledWith(
      { valueMissing: true },
      "Please select a file.",
      expect.any(HTMLInputElement),
    );

    const file = new File(["hello"], "hello.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(hiddenInput(element), { target: { files: [file] } });

    expect(order).toEqual(["file-change", "change"]);
    expect(summaryInput(element).value).toContain("hello.pdf");
    expect(internalsFor(element).setFormValue).toHaveBeenLastCalledWith(file);
    expect(internalsFor(element).setValidity).toHaveBeenLastCalledWith(
      {},
      "",
      expect.any(HTMLInputElement),
    );

    const detail = (
      onFileChange.mock.calls[0]?.[0] as CustomEvent<DtFileUploadChangeDetail>
    ).detail;
    expect(detail).toEqual({
      file,
      source: "picker",
      rejectedFile: undefined,
      error: undefined,
    });
    expect(
      (onFileChange.mock.calls[0]?.[0] as CustomEvent).composed,
    ).toBe(true);
  });

  it("rejects oversized files, clears form participation, and keeps external errors authoritative", () => {
    const element = document.createElement("dt-file-upload") as DtFileUploadElement;
    element.label = "Attachment";
    element.uploadButtonLabel = "Choose file";
    element.maxSizeInBytes = 1024;
    element.sizeErrorMessage = "File too large";
    document.body.append(element);

    const file = new File([new Uint8Array(2048)], "big.pdf", {
      type: "application/pdf",
    });
    const onFileChange = vi.fn();
    element.addEventListener("file-change", onFileChange);

    fireEvent.change(hiddenInput(element), { target: { files: [file] } });

    expect(element.value).toBeNull();
    expect(summaryInput(element).value).toBe("");
    expect(element.shadowRoot?.querySelector("#error")).toHaveTextContent(
      "File too large",
    );
    expect(internalsFor(element).setFormValue).toHaveBeenLastCalledWith(null);
    expect(internalsFor(element).setValidity).toHaveBeenLastCalledWith(
      { customError: true },
      "File too large",
      expect.any(HTMLInputElement),
    );
    expect(
      (onFileChange.mock.calls[0]?.[0] as CustomEvent<DtFileUploadChangeDetail>)
        .detail,
    ).toEqual({
      file: null,
      source: "picker",
      rejectedFile: file,
      error: "File too large",
    });

    element.error = "Server rejected upload";
    expect(element.shadowRoot?.querySelector("#error")).toHaveTextContent(
      "Server rejected upload",
    );
    expect(internalsFor(element).setValidity).toHaveBeenLastCalledWith(
      { customError: true },
      "Server rejected upload",
      expect.any(HTMLInputElement),
    );
  });

  it("enforces extension, exact MIME, and wildcard MIME accept tokens", () => {
    const element = document.createElement("dt-file-upload") as DtFileUploadElement;
    element.label = "Attachment";
    element.uploadButtonLabel = "Choose file";
    element.accept = ".pdf,image/*,text/csv";
    document.body.append(element);

    const rejected = new File(["notes"], "notes.txt", { type: "text/plain" });
    const onFileChange = vi.fn();
    element.addEventListener("file-change", onFileChange);
    fireEvent.change(hiddenInput(element), { target: { files: [rejected] } });

    expect(element.value).toBeNull();
    expect(element.shadowRoot?.querySelector("#error")).toHaveTextContent(
      "File type is not accepted",
    );
    expect(
      (onFileChange.mock.calls[0]?.[0] as CustomEvent<DtFileUploadChangeDetail>)
        .detail,
    ).toMatchObject({
      file: null,
      source: "picker",
      rejectedFile: rejected,
    });

    const extensionMatch = new File(["pdf"], "REPORT.PDF", { type: "" });
    fireEvent.change(hiddenInput(element), {
      target: { files: [extensionMatch] },
    });
    expect(element.value).toBe(extensionMatch);

    const wildcardMatch = new File(["image"], "preview.bin", {
      type: "image/png",
    });
    fireEvent.change(hiddenInput(element), {
      target: { files: [wildcardMatch] },
    });
    expect(element.value).toBe(wildcardMatch);

    const exactMimeMatch = new File(["csv"], "data.bin", {
      type: "text/csv",
    });
    fireEvent.change(hiddenInput(element), {
      target: { files: [exactMimeMatch] },
    });
    expect(element.value).toBe(exactMimeMatch);
  });

  it("supports drag and drop plus clear actions without a framework runtime", async () => {
    const element = document.createElement("dt-file-upload") as DtFileUploadElement;
    element.label = "Attachment";
    element.placeholder = "Drop a file";
    element.uploadButtonLabel = "Choose file";
    element.clearButtonLabel = "Remove file";
    document.body.append(element);

    const dropzone = element.shadowRoot?.querySelector(".dropzone");
    if (!(dropzone instanceof HTMLElement)) {
      throw new Error("Dropzone not found");
    }

    const droppedFile = new File(["drop"], "dropped.pdf", {
      type: "application/pdf",
    });
    const onFileChange = vi.fn();
    element.addEventListener("file-change", onFileChange);

    const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { files: [droppedFile], types: ["Files"] },
    });
    fireEvent(dropzone, dropEvent);

    expect(element.value).toBe(droppedFile);
    expect(summaryInput(element).value).toContain("dropped.pdf");
    expect(
      (onFileChange.mock.calls[0]?.[0] as CustomEvent<DtFileUploadChangeDetail>)
        .detail.source,
    ).toBe("drop");

    const clear = element.shadowRoot?.querySelector(
      "button.clearButton",
    ) as HTMLButtonElement;
    clear.click();
    await Promise.resolve();

    expect(element.value).toBeNull();
    expect(summaryInput(element).value).toBe("");
    expect(
      (onFileChange.mock.calls.at(-1)?.[0] as CustomEvent<DtFileUploadChangeDetail>)
        .detail.source,
    ).toBe("clear");
    expect(element.shadowRoot?.activeElement).toBe(summaryInput(element));
  });

  it("renders editorial appearance with required and error ARIA wiring", () => {
    const element = document.createElement("dt-file-upload") as DtFileUploadElement;
    element.label = "Attachment";
    element.placeholder = "No file selected";
    element.uploadButtonLabel = "Choose file";
    element.clearButtonLabel = "Remove file";
    element.helperText = "Max 5 MB";
    element.error = "Upload is required";
    element.required = true;
    element.appearance = "editorial";
    element.value = new File(["hello"], "hello.pdf", {
      type: "application/pdf",
    });
    document.body.append(element);

    const trigger = summaryButton(element);
    expect(trigger).toHaveAttribute("aria-labelledby", "control-label");
    expect(trigger).toHaveAttribute("aria-describedby", "error helper");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("aria-required", "true");
    expect(trigger.textContent).toContain("hello.pdf");
    expect(internalsFor(element).setValidity).toHaveBeenLastCalledWith(
      { customError: true },
      "Upload is required",
      expect.any(HTMLButtonElement),
    );
  });
});
