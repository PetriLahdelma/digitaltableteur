import React from "react";
import { render } from "@testing-library/react";
import SecureCVDownload from "./SecureCVDownload";

describe("SecureCVDownload", () => {
  it("passes inverse prop to trigger Button", () => {
    const { getByRole } = render(
      <SecureCVDownload
        buttonText="Download"
        buttonVariant="secondary"
        inverse
      />,
    );
    const btn = getByRole("button", { name: /download/i });
    expect(btn.className).toMatch(/inverse/);
  });
});
