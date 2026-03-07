import type { ReactNode } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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
  default: ({
    alt,
    src,
    ...props
  }: {
    alt: string;
    src: string;
  }) => <img alt={alt} src={src} {...props} />,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: unknown }) =>
      options?.defaultValue ?? key,
  }),
}));

vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>(
    "framer-motion",
  );
  return {
    ...actual,
    useReducedMotion: () => false,
  };
});

describe("HomePage", () => {
  it("renders hero title", () => {
    render(<HomePage />);
    expect(screen.getByText(/heroTitle/i)).toBeInTheDocument();
  });

  it("renders hero subtitle", () => {
    render(<HomePage />);
    expect(screen.getByText(/homeHeroSubtext/i)).toBeInTheDocument();
  });

  it("renders hero CTA links", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("link", { name: /homeHeroContactCta/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /homeHeroAboutCta/i }),
    ).toBeInTheDocument();
  });

  it("renders services section", () => {
    render(<HomePage />);
    expect(screen.getByText(/homeExpertiseTitle/i)).toBeInTheDocument();
  });

  it("renders work examples section", () => {
    render(<HomePage />);
    expect(screen.getByText(/homeSelectedWork/i)).toBeInTheDocument();
  });

  it("renders selected clients marquee", () => {
    render(<HomePage />);
    expect(screen.getByText(/homeSelectedClients/i)).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /homeSelectedClientsAria/i }),
    ).toBeInTheDocument();
  });

  it("renders closing CTA section", () => {
    render(<HomePage />);
    expect(screen.getByText(/homeCtaTitle/i)).toBeInTheDocument();
  });
});
