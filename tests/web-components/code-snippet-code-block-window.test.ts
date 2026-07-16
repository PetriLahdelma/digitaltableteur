import { fireEvent, waitFor } from "@testing-library/dom";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DtCodeBlockWindowElement } from "../../packages/web-components/src/native/code-block-window";
import { DtCodeSnippetElement } from "../../packages/web-components/src/native/code-snippet";

const SNIPPET_TAG = "dt-code-snippet";
const WINDOW_TAG = "dt-code-block-window";

beforeAll(() => {
  if (!customElements.get(SNIPPET_TAG)) {
    customElements.define(SNIPPET_TAG, DtCodeSnippetElement);
  }
  if (!customElements.get(WINDOW_TAG)) {
    customElements.define(WINDOW_TAG, DtCodeBlockWindowElement);
  }
});

beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

function snippetElement(): DtCodeSnippetElement {
  const element = document.createElement(SNIPPET_TAG) as DtCodeSnippetElement;
  element.code = `const answer = 42;
// keep comment
console.log(answer);`;
  element.language = "javascript";
  element.variant = "multi";
  element.showLineNumbers = true;
  element.allowCopy = true;
  document.body.append(element);
  return element;
}

function buildCodeBlock(code: string, language: string): HTMLElement {
  const pre = document.createElement("pre");
  const codeElement = document.createElement("code");
  codeElement.setAttribute("data-language", language);
  codeElement.setAttribute("data-line-numbers", "");

  code.replace(/\n$/, "").split("\n").forEach((line, index, lines) => {
    const lineElement = document.createElement("span");
    lineElement.setAttribute("data-line", "");
    lineElement.textContent = line.length > 0 ? line : " ";
    codeElement.append(lineElement);
    if (index < lines.length - 1) {
      codeElement.append(document.createTextNode("\n"));
    }
  });

  pre.append(codeElement);
  return pre;
}

describe("native code snippet and code block window", () => {
  it("renders multi-line snippets with line numbers, expandable content, and copy-without-comments support", async () => {
    const element = snippetElement();
    element.code = Array.from({ length: 14 }, (_, index) => `line ${index + 1}`)
      .join("\n")
      .concat("\n// keep comment");
    element.maxLines = 10;

    const lineNumbers =
      element.shadowRoot?.querySelectorAll<HTMLElement>(".lineNumber");
    const expandButton =
      element.shadowRoot?.querySelector<HTMLButtonElement>(".expandButton");
    const menuButton =
      element.shadowRoot?.querySelector<HTMLButtonElement>(".menuButton");

    expect(lineNumbers?.[0]?.textContent).toBe("1");
    expect(expandButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(expandButton as HTMLButtonElement);
    expect(
      element.shadowRoot?.querySelector<HTMLButtonElement>(".expandButton")
        ?.textContent,
    ).toMatch(/show less/i);

    fireEvent.click(menuButton as HTMLButtonElement);
    const menuItem =
      element.shadowRoot?.querySelector<HTMLButtonElement>(".menuItem");
    fireEvent.click(menuItem as HTMLButtonElement);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        Array.from({ length: 14 }, (_, index) => `line ${index + 1}`).join("\n"),
      );
      expect(
        element.shadowRoot?.querySelector(".status")?.textContent,
      ).toMatch(/copied without comments/i);
    });
  });

  it("announces inline copy on keyboard activation and reports clipboard failures", async () => {
    const successElement = document.createElement(
      SNIPPET_TAG,
    ) as DtCodeSnippetElement;
    successElement.code = "npm install @digitaltableteur/components";
    successElement.language = "bash";
    successElement.variant = "inline";
    document.body.append(successElement);

    const inlineCode =
      successElement.shadowRoot?.querySelector<HTMLElement>("code.inline");
    fireEvent.keyDown(inlineCode as HTMLElement, { key: "Enter" });

    await waitFor(() => {
      expect(successElement.shadowRoot?.textContent).toContain(
        "Copied to clipboard",
      );
    });

    const failureElement = document.createElement(
      SNIPPET_TAG,
    ) as DtCodeSnippetElement;
    failureElement.code = "pnpm dlx storybook@latest";
    failureElement.language = "bash";
    failureElement.variant = "single";
    document.body.append(failureElement);

    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(
      new Error("denied"),
    );

    const copyButton =
      failureElement.shadowRoot?.querySelector<HTMLButtonElement>(".button");
    fireEvent.click(copyButton as HTMLButtonElement);

    await waitFor(() => {
      expect(failureElement.shadowRoot?.textContent).toContain("Failed to copy");
    });
  });

  it("frames highlighted light-dom code, infers line numbers, and copies the extracted code text", async () => {
    const element = document.createElement(
      WINDOW_TAG,
    ) as DtCodeBlockWindowElement;
    element.title = "demo.tsx";
    element.language = "tsx";
    element.append(buildCodeBlock("const value = 42;", "tsx"));
    document.body.append(element);

    const copyEvent = vi.fn();
    element.addEventListener("copy", copyEvent);

    const copyButton =
      element.shadowRoot?.querySelector<HTMLButtonElement>(".copyButton");
    fireEvent.click(copyButton as HTMLButtonElement);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "const value = 42;",
      );
      expect(copyEvent).toHaveBeenCalledTimes(1);
      expect(
        element.shadowRoot?.querySelector(".container")?.getAttribute(
          "data-line-numbers",
        ),
      ).toBe("true");
      expect(element.shadowRoot?.textContent).toContain("Copied");
    });
  });

  it("supports article-context wheel forwarding for tall code blocks", () => {
    const element = document.createElement(
      WINDOW_TAG,
    ) as DtCodeBlockWindowElement;
    element.title = "long-line.ts";
    element.language = "ts";
    element.context = "article";
    element.append(
      buildCodeBlock(
        Array.from({ length: 30 }, (_, index) => `console.log(${index});`).join(
          "\n",
        ),
        "ts",
      ),
    );
    document.body.append(element);

    const body = element.shadowRoot?.querySelector<HTMLElement>(".body");
    const header = element.shadowRoot?.querySelector<HTMLElement>(".header");
    if (!body || !header) throw new Error("Missing article window parts");

    Object.defineProperty(body, "scrollHeight", { configurable: true, value: 640 });
    Object.defineProperty(body, "clientHeight", { configurable: true, value: 220 });
    Object.defineProperty(body, "scrollTop", {
      configurable: true,
      get: () => body.dataset.scrollTop ? Number(body.dataset.scrollTop) : 0,
      set: (value: number) => {
        body.dataset.scrollTop = String(value);
      },
    });

    header.dispatchEvent(
      new WheelEvent("wheel", {
        bubbles: true,
        cancelable: true,
        deltaY: 48,
      }),
    );

    expect(Number(body.dataset.scrollTop ?? "0")).toBe(48);
  });

  it("composes a child snippet source into the window body without duplicating snippet chrome", async () => {
    const windowElement = document.createElement(
      WINDOW_TAG,
    ) as DtCodeBlockWindowElement;
    windowElement.title = "install.sh";
    windowElement.language = "bash";

    const nestedSnippet = document.createElement(
      SNIPPET_TAG,
    ) as DtCodeSnippetElement;
    nestedSnippet.code = "npm install @digitaltableteur/components --save-dev";
    nestedSnippet.language = "bash";
    nestedSnippet.variant = "single";
    nestedSnippet.showLineNumbers = false;

    windowElement.append(nestedSnippet);
    document.body.append(windowElement);

    const copyButton =
      windowElement.shadowRoot?.querySelector<HTMLButtonElement>(".copyButton");
    fireEvent.click(copyButton as HTMLButtonElement);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "npm install @digitaltableteur/components --save-dev",
      );
      expect(windowElement.shadowRoot?.querySelector("pre")).toBeTruthy();
      expect(windowElement.shadowRoot?.querySelector("dt-code-snippet")).toBeNull();
    });
  });
});
