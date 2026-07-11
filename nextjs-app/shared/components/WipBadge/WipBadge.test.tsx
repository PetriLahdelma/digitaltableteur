import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import WipBadge from "./WipBadge";

vi.mock("../../lib/translation", () => ({
  useTranslate: () => (key: string) => {
    const translations: Record<string, string> = {
      storybookDeprecatedBadge: "Deprecated",
      storybookWipBadge: "Work in progress",
    };
    return translations[key] ?? key;
  },
}));

describe("WipBadge", () => {
  it("renders non-stable statuses as status text", () => {
    render(<WipBadge status="beta" />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Work in progress (beta)",
    );
  });

  it("renders the deprecated label", () => {
    render(<WipBadge status="deprecated" />);

    expect(screen.getByRole("status")).toHaveTextContent("Deprecated");
  });

  it("keeps the wrapper visible to assistive technology", () => {
    const { container } = render(<WipBadge status="alpha" />);

    expect(container.querySelector("[aria-hidden='false']")).toBeInTheDocument();
  });

  it("renders nothing for stable components", () => {
    const { container } = render(<WipBadge status="stable" />);

    expect(container.firstChild).toBeNull();
  });
});
