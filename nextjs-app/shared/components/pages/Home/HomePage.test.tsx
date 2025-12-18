import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomePage } from "./HomePage";

vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

describe("HomePage", () => {
  it("renders hero title", () => {
    render(<HomePage />);
    expect(screen.getByText(/heroTitle/i)).toBeInTheDocument();
  });

  it("renders hero subtitle", () => {
    render(<HomePage />);
    expect(screen.getByText(/heroSubtitle/i)).toBeInTheDocument();
  });

  it("renders CTA buttons", () => {
    render(<HomePage />);
    expect(screen.getByRole("button", { name: /work/i })).toBeInTheDocument();
  });

  it("renders services section", () => {
    render(<HomePage />);
    expect(screen.getByText(/servicesTitle/i)).toBeInTheDocument();
  });

  it("renders work examples section", () => {
    render(<HomePage />);
    expect(screen.getByText(/workTitle/i)).toBeInTheDocument();
  });

  it("renders testimonials section", () => {
    render(<HomePage />);
    expect(screen.getByText(/testimonialsTitle/i)).toBeInTheDocument();
  });

  it("renders process section", () => {
    render(<HomePage />);
    expect(screen.getByText(/processTitle/i)).toBeInTheDocument();
  });
});
