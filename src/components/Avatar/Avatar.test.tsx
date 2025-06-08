import React from "react";
import { render } from "@testing-library/react";
import Avatar from "./Avatar";

describe("Avatar Component", () => {
  it("renders initials when name is provided", () => {
    const { getByText } = render(<Avatar name="Petri Lahdelma" />);
    expect(getByText("PL")).toBeInTheDocument();
  });

  it("renders image when imageUrl is provided", () => {
    const { getByAltText } = render(
      <Avatar
        imageUrl="https://via.placeholder.com/50"
        name="Petri Lahdelma"
      />,
    );
    expect(getByAltText("Petri Lahdelma")).toBeInTheDocument();
  });

  it("renders empty div when no props are provided", () => {
    const { container } = render(<Avatar />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
