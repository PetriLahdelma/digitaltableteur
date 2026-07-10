import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ChatToggle from "./ChatToggle";

// Mock dependencies
vi.mock("../../lib/translation", () => {
  const t = (key: string, fallback?: string) => {
    const translations: Record<string, string> = {
      chatToggleLabel: "Chat",
      chatToggleClose: "Hide chat",
      chatToggleOpen: "Chat with Donny",
    };
    return translations[key] || fallback || key;
  };
  return {
    useTranslate: () => t,
    useLocalization: () => ({
      translate: t,
      language: "en",
      resolvedLanguage: "en",
      changeLanguage: vi.fn(),
      getResourceBundle: vi.fn(),
    }),
  };
});

describe("ChatToggle", () => {
  it("renders toggle button", () => {
    render(<ChatToggle isOpen={false} onToggle={vi.fn()} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows open prompt in aria-label when closed", () => {
    render(<ChatToggle isOpen={false} onToggle={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Chat — Chat with Donny",
    );
  });

  it("shows close prompt in aria-label when open", () => {
    render(<ChatToggle isOpen={true} onToggle={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Chat — Hide chat",
    );
  });

  it("sets aria-expanded to false when closed", () => {
    render(<ChatToggle isOpen={false} onToggle={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("sets aria-expanded to true when open", () => {
    render(<ChatToggle isOpen={true} onToggle={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });

  it("calls onToggle when clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<ChatToggle isOpen={false} onToggle={onToggle} />);

    await user.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("sets aria-controls when controlsId provided", () => {
    render(
      <ChatToggle isOpen={false} onToggle={vi.fn()} controlsId="chat-panel" />,
    );
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-controls",
      "chat-panel",
    );
  });

  it("renders 'Chat' text label", () => {
    render(<ChatToggle isOpen={false} onToggle={vi.fn()} />);
    expect(screen.getByText("Chat")).toBeInTheDocument();
  });

  it("applies data-open attribute when open", () => {
    render(<ChatToggle isOpen={true} onToggle={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute("data-open", "true");
  });

  it("applies data-open attribute when closed", () => {
    render(<ChatToggle isOpen={false} onToggle={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute("data-open", "false");
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<ChatToggle isOpen={false} onToggle={vi.fn()} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
