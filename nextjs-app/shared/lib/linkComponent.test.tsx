import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Link, LinkProvider, type LinkComponentProps } from "./linkComponent";

describe("linkComponent", () => {
  it("renders a plain anchor by default (no provider)", () => {
    render(<Link href="/about">About</Link>);
    const a = screen.getByText("About");
    expect(a.tagName).toBe("A");
    expect(a).toHaveAttribute("href", "/about");
  });

  it("renders through the injected component when a provider is present", () => {
    const Injected = ({ href, children, ...rest }: LinkComponentProps) => (
      <a data-injected="true" href={href} {...rest}>
        {children}
      </a>
    );
    render(
      <LinkProvider component={Injected}>
        <Link href="/work" className="c">
          Work
        </Link>
      </LinkProvider>,
    );
    const a = screen.getByText("Work");
    expect(a).toHaveAttribute("data-injected", "true");
    expect(a).toHaveAttribute("href", "/work");
    expect(a).toHaveClass("c");
  });
});
