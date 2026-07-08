import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CodeBlockWindow from "@dt/CodeBlockWindow";

expect.extend(toHaveNoViolations);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options?.language
        ? `${key}:${options.language}`
        : (key as string),
    i18n: { language: "en" },
  }),
}));

const buildCodeBlock = (code: string, language: string) => {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <pre data-language={language}>
      <code data-language={language} data-line-numbers="">
        {lines.map((line, index) => (
          <span data-line key={`${language}-${index}`}>
            {line.length > 0 ? line : " "}
          </span>
        ))}
      </code>
    </pre>
  );
};

const sampleCode = "const value = 42;";

beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
    configurable: true,
  });
});

describe("CodeBlockWindow", () => {
  it("renders title and language label", () => {
    render(
      <CodeBlockWindow
        title="demo.tsx"
        language="tsx"
        showLineNumbers
      >
        {buildCodeBlock(sampleCode, "tsx")}
      </CodeBlockWindow>,
    );

    expect(screen.getByText("demo.tsx")).toBeInTheDocument();
    expect(screen.getByText("TSX")).toBeInTheDocument();
  });

  it("copies code and shows copied state", async () => {
    const user = userEvent.setup();

    render(
      <CodeBlockWindow title="demo.tsx" language="tsx">
        {buildCodeBlock(sampleCode, "tsx")}
      </CodeBlockWindow>,
    );

    const button = screen.getByRole("button", {
      name: "Copy code to clipboard",
    });

    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("Copied")).toBeInTheDocument();
    });
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <CodeBlockWindow title="demo.tsx" language="tsx">
        {buildCodeBlock(sampleCode, "tsx")}
      </CodeBlockWindow>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
