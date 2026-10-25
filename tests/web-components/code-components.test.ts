import { fireEvent, waitFor } from "@testing-library/dom";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DtCodeElement } from "../../packages/web-components/src/native/code";
import { DtCodeBlockElement } from "../../packages/web-components/src/native/code-block";
import { DtCodeCopyButtonElement } from "../../packages/web-components/src/native/code-copy-button";
import { DtSnippetElement } from "../../packages/web-components/src/native/snippet";

const writeText = vi.fn();

beforeAll(() => {
  const definitions: Array<[string, CustomElementConstructor]> = [
    ["dt-code", DtCodeElement],
    ["dt-code-block", DtCodeBlockElement],
    ["dt-code-copy-button", DtCodeCopyButtonElement],
    ["dt-snippet", DtSnippetElement],
  ];
  for (const [tag, element] of definitions) {
    if (!customElements.get(tag)) customElements.define(tag, element);
  }
});

beforeEach(() => {
  writeText.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
});

afterEach(() => {
  document.documentElement.className = "";
  document.body.replaceChildren();
});

function mount<T extends HTMLElement>(tag: string, attributes: Record<string, string> = {}): T {
  const element = document.createElement(tag) as T;
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  document.body.append(element);
  return element;
}

const shadow = (element: HTMLElement) => element.shadowRoot as ShadowRoot;
const rows = (element: HTMLElement) =>
  Array.from(shadow(element).querySelectorAll<HTMLElement>("[data-line]"));

describe("dt-code", () => {
  it("renders a sized code element around its slot", () => {
    const element = mount<DtCodeElement>("dt-code", { size: "lg" });
    element.textContent = "app/page.tsx";
    const code = shadow(element).querySelector("code");
    expect(code?.className).toBe("code lg");
    expect(shadow(element).querySelector("slot")).not.toBeNull();
  });

  it("defaults to md", () => {
    const element = mount<DtCodeElement>("dt-code");
    expect(shadow(element).querySelector("code")?.classList.contains("md")).toBe(true);
  });
});

describe("dt-code-copy-button", () => {
  it("copies, announces and dispatches copy", async () => {
    const element = mount<DtCodeCopyButtonElement>("dt-code-copy-button", { value: "npm ci" });
    const onCopy = vi.fn();
    element.addEventListener("copy", onCopy);
    const button = shadow(element).querySelector("button") as HTMLButtonElement;
    expect(button.getAttribute("aria-label")).toBe("Copy code");
    fireEvent.click(button);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("npm ci"));
    await waitFor(() =>
      expect(shadow(element).querySelector('[role="status"]')?.textContent).toBe("Copied"),
    );
    expect(button.dataset.status).toBe("copied");
    expect(onCopy.mock.calls[0][0].detail).toEqual({ text: "npm ci" });
  });

  it("reports a refused clipboard as a failure", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    const element = mount<DtCodeCopyButtonElement>("dt-code-copy-button", { value: "x" });
    fireEvent.click(shadow(element).querySelector("button") as HTMLButtonElement);
    await waitFor(() =>
      expect(shadow(element).querySelector('[role="status"]')?.textContent).toBe("Copy failed"),
    );
  });
});

describe("dt-snippet", () => {
  it("hides the prompt from assistive tech and from the copy", async () => {
    const element = mount<DtSnippetElement>("dt-snippet", { command: "npm install" });
    const prompt = shadow(element).querySelector(".prompt");
    expect(prompt?.getAttribute("aria-hidden")).toBe("true");
    fireEvent.click(shadow(element).querySelector("button") as HTMLButtonElement);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("npm install"));
  });

  it("renders several commands and copies them together", async () => {
    const element = mount<DtSnippetElement>("dt-snippet");
    element.commands = ["npm ci", "npm test"];
    expect(shadow(element).querySelectorAll(".command")).toHaveLength(2);
    fireEvent.click(shadow(element).querySelector("button") as HTMLButtonElement);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("npm ci\nnpm test"));
  });

  it("can drop the prompt and the copy button", () => {
    const element = mount<DtSnippetElement>("dt-snippet", {
      command: "ls",
      prompt: "false",
      copyable: "false",
    });
    expect(shadow(element).querySelector(".prompt")).toBeNull();
    expect(shadow(element).querySelector("button")).toBeNull();
  });
});

describe("dt-code-block", () => {
  it("shows filename, language and copy in the header", () => {
    const element = mount<DtCodeBlockElement>("dt-code-block", {
      code: "const a = 1;",
      language: "ts",
      filename: "a.ts",
    });
    const header = shadow(element).querySelector(".header");
    expect(header?.querySelector(".filename")?.textContent).toBe("a.ts");
    expect(header?.querySelector(".language")?.textContent).toBe("ts");
    expect(header?.querySelector("button")?.getAttribute("aria-label")).toBe("Copy code");
  });

  it("floats the copy button without a header", () => {
    const element = mount<DtCodeBlockElement>("dt-code-block", { code: "ls", language: "bash" });
    expect(shadow(element).querySelector(".header")).toBeNull();
    expect(shadow(element).querySelector(".floatingCopy button")).not.toBeNull();
  });

  it("highlights requested lines and colours syntax", () => {
    const element = mount<DtCodeBlockElement>("dt-code-block", {
      code: 'const a = "x";\nconst b = 2;',
      language: "ts",
      "highlight-lines": "2",
    });
    expect(rows(element).map((row) => row.hasAttribute("data-highlighted-line"))).toEqual([
      false,
      true,
    ]);
    expect(shadow(element).querySelector('[data-syntax="keyword"]')?.textContent).toBe("const");
    expect(shadow(element).querySelector('[data-syntax="string"]')?.textContent).toBe('"x"');
  });

  it("turns a diff into rows and copies the result", async () => {
    const element = mount<DtCodeBlockElement>("dt-code-block", {
      code: "keep\n-old\n+new",
      language: "diff",
    });
    expect(rows(element).map((row) => row.getAttribute("data-highlighted-line-id"))).toEqual([
      null,
      "removed",
      "added",
    ]);
    expect(rows(element)[1].textContent).toBe("old");
    expect(rows(element)[1].getAttribute("data-sign-label")).toBe("Removed line");
    fireEvent.click(shadow(element).querySelector("button") as HTMLButtonElement);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("keep\nnew"));
  });

  it("reads a light-DOM Shiki tree, including diff markers", async () => {
    const element = document.createElement("dt-code-block") as DtCodeBlockElement;
    element.innerHTML =
      '<pre data-language="diff" tabindex="0"><code data-line-numbers><span data-line=""><span style="--shiki-light:#000"> keep</span></span><span data-line=""><span style="--shiki-light:#a0111f">-old</span></span><span data-line=""><span style="--shiki-light:#024c1a">+new</span></span></code></pre>';
    document.body.append(element);
    const pre = shadow(element).querySelector("pre");
    expect(pre?.hasAttribute("tabindex")).toBe(false);
    expect(shadow(element).querySelector("[data-line-numbers]")).not.toBeNull();
    expect(rows(element).map((row) => row.textContent)).toEqual(["keep", "old", "new"]);
    fireEvent.click(shadow(element).querySelector("button") as HTMLButtonElement);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("keep\nnew"));
  });

  it("renders a figure with a caption", () => {
    const element = mount<DtCodeBlockElement>("dt-code-block", {
      code: "x",
      caption: "What it does",
    });
    expect(shadow(element).querySelector("figure figcaption")?.textContent).toBe("What it does");
  });

  it("caps the height and opts out of Lenis wheel handling", () => {
    const element = mount<DtCodeBlockElement>("dt-code-block", { code: "x", "max-height": "240" });
    const body = shadow(element).querySelector<HTMLElement>(".body");
    expect(body?.classList.contains("capped")).toBe(true);
    expect(body?.style.getPropertyValue("--code-block-max-height")).toBe("240px");
    expect(body?.hasAttribute("data-lenis-prevent-wheel")).toBe(true);
  });

  it("follows a high-contrast page instead of going dark for terminal", () => {
    document.documentElement.className = "themeHCW";
    const element = mount<DtCodeBlockElement>("dt-code-block", { code: "ls", theme: "terminal" });
    expect(shadow(element).querySelector(".card")?.hasAttribute("data-dark")).toBe(false);
  });

  it("picks the header glyph from the language", () => {
    const tsx = mount<DtCodeBlockElement>("dt-code-block", { code: "x", language: "tsx", filename: "a.tsx" });
    const bash = mount<DtCodeBlockElement>("dt-code-block", { code: "x", language: "bash", filename: "run.sh" });
    expect(shadow(tsx).querySelector(".fileIcon")?.innerHTML).not.toBe(
      shadow(bash).querySelector(".fileIcon")?.innerHTML,
    );
  });
});
