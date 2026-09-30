import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ColophonPage } from "./ColophonPage";

describe("ColophonPage", () => {
  it("marks its English-only content without adding a main landmark", () => {
    const { container } = render(<ColophonPage />);

    expect(screen.getByRole("article")).toHaveAttribute("lang", "en");
    expect(container.querySelector("main")).toBeNull();
  });
});
