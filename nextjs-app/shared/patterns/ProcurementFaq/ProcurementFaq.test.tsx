import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import en from "../../locales/en/translation.json";
import { ProcurementFaq, readProcurementItems } from "./ProcurementFaq";

expect.extend(toHaveNoViolations);

describe("ProcurementFaq", () => {
  it("is a section named by its heading", () => {
    render(<ProcurementFaq />);
    expect(
      screen.getByRole("region", { name: en.procurementFaq.title }),
    ).toBeInTheDocument();
  });

  it("asks every procurement question, with the first one open", () => {
    render(<ProcurementFaq />);
    const triggers = en.procurementFaq.items.map((item) =>
      screen.getByRole("button", { name: item.question }),
    );
    expect(triggers).toHaveLength(9);
    expect(triggers[0]).toHaveAttribute("aria-expanded", "true");
    expect(triggers[1]).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps every answer in the page for search engines and the FAQ data", () => {
    const { container } = render(<ProcurementFaq />);
    for (const item of en.procurementFaq.items) {
      expect(container).toHaveTextContent(item.answer);
    }
  });

  it("links the AI use policy from the AI answer", () => {
    const { container } = render(<ProcurementFaq />);
    expect(container.querySelector('a[href="/ai-use"]')).toHaveTextContent(
      en.procurementFaq.aiPolicyLink,
    );
  });

  it("drops malformed locale rows", () => {
    expect(
      readProcurementItems([{ id: "a", question: "Q", answer: "A" }, { id: "b" }, "x"]),
    ).toEqual([{ id: "a", question: "Q", answer: "A" }]);
    expect(readProcurementItems(null)).toEqual([]);
  });

  it("supports a level-3 heading", () => {
    render(<ProcurementFaq headingLevel={3} />);
    expect(
      screen.getByRole("heading", { level: 3, name: en.procurementFaq.title }),
    ).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<ProcurementFaq />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
