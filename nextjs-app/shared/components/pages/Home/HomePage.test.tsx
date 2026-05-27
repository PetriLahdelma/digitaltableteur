import type { ReactNode } from "react";
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils/render";
import { HomePage } from "./HomePage";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt, src, ...props }: { alt: string; src: string }) => (
    <img alt={alt} src={src} {...props} />
  ),
}));

describe("HomePage", () => {
  it("renders hero title from translations", () => {
    renderWithProviders(<HomePage />);
    expect(
      screen.getByRole("region", { name: /Homepage hero section/i }),
    ).toBeInTheDocument();
  });

  it("renders hero CTA links", () => {
    renderWithProviders(<HomePage />);
    expect(
      screen.getByRole("link", { name: /Get in touch/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /About us/i })).toBeInTheDocument();
  });

  it("renders services section", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/What we do/i)).toBeInTheDocument();
  });

  it("renders selected clients label", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/Selected clients/i)).toBeInTheDocument();
  });
});
