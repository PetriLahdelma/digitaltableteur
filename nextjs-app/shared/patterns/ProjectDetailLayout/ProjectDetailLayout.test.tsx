import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectDetailLayout } from "./ProjectDetailLayout";

describe("ProjectDetailLayout", () => {
  it("uses the shell main landmark and marks case-study content as English", () => {
    const { container } = render(
      <main>
        <ProjectDetailLayout
          nav={<button type="button">Takaisin</button>}
          hero={<h1>Case study</h1>}
          cta={null}
          showScrollProgress={false}
        >
          <p>Project details</p>
        </ProjectDetailLayout>
      </main>,
    );

    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(screen.getByRole("article")).not.toHaveAttribute("lang");
    expect(
      screen.getByRole("heading", { name: "Case study" }).closest("header"),
    ).toHaveAttribute("lang", "en");
    expect(
      screen.getByText("Project details").closest("[lang]"),
    ).toHaveAttribute("lang", "en");
    expect(
      screen.getByRole("button", { name: "Takaisin" }).closest("[lang]"),
    ).toBeNull();
  });
});
