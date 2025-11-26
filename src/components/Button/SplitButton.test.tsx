import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, test, expect, vi, beforeEach } from "vitest";
import SplitButton, { type SplitButtonOption } from "./SplitButton";

expect.extend(toHaveNoViolations);

// Mock translation
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "splitButton.moreOptions": "More options",
      };
      return translations[key] || key;
    },
    i18n: { language: "en" },
  }),
}));

describe("SplitButton", () => {
  const options: SplitButtonOption[] = [
    { id: "save-as", label: "Save as" },
    { id: "save-cloud", label: "Save to cloud" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    test("renders primary button with label", () => {
      render(<SplitButton label="Save" options={options} />);
      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    });

    test("renders toggle button with translated aria-label", () => {
      render(<SplitButton label="Save" options={options} />);
      expect(
        screen.getByRole("button", { name: "More options" }),
      ).toBeInTheDocument();
    });

    test("renders custom toggleLabel when provided", () => {
      render(
        <SplitButton label="Save" options={options} toggleLabel="Show more" />,
      );
      expect(
        screen.getByRole("button", { name: "Show more" }),
      ).toBeInTheDocument();
    });

    test("renders all menu options when open", async () => {
      render(<SplitButton label="Save" options={options} />);
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );
      expect(
        screen.getByRole("menuitem", { name: /save as/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("menuitem", { name: /save to cloud/i }),
      ).toBeInTheDocument();
    });

    test("forwards ref to wrapper div", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<SplitButton label="Save" options={options} ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveAttribute("data-variant", "primary");
    });
  });

  describe("Interactions", () => {
    test("opens menu when clicking toggle button", async () => {
      render(<SplitButton label="Save" options={options} />);
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    test("closes menu when clicking outside", async () => {
      render(
        <div>
          <SplitButton label="Save" options={options} />
          <button>Outside</button>
        </div>,
      );
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );
      expect(screen.getByRole("menu")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Outside" }));
      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });

    test("calls onPrimaryClick when clicking main button", async () => {
      const onPrimaryClick = vi.fn();
      render(
        <SplitButton
          label="Save"
          options={options}
          onPrimaryClick={onPrimaryClick}
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: /save/i }));
      expect(onPrimaryClick).toHaveBeenCalledTimes(1);
    });

    test("calls option.onSelect and closes menu", async () => {
      const onSelect = vi.fn();
      render(
        <SplitButton
          label="Save"
          options={[options[0], { ...options[1], onSelect }]}
        />,
      );
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );
      await userEvent.click(
        screen.getByRole("menuitem", { name: /save to cloud/i }),
      );

      expect(onSelect).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });

    test("does not call disabled option onSelect", async () => {
      const onSelect = vi.fn();
      render(
        <SplitButton
          label="Save"
          options={[{ ...options[0], disabled: true, onSelect }]}
        />,
      );
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );

      const disabledOption = screen.getByRole("menuitem", { name: /save as/i });
      expect(disabledOption).toBeDisabled();

      await userEvent.click(disabledOption);
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    test("catches errors thrown by onSelect", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const onSelectError = vi.fn(() => {
        throw new Error("Test error");
      });

      render(
        <SplitButton
          label="Save"
          options={[{ ...options[0], onSelect: onSelectError }]}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );
      await userEvent.click(screen.getByRole("menuitem", { name: /save as/i }));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "SplitButton option onSelect error:",
        expect.any(Error),
      );

      // Menu should still close despite error
      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });

    test("handles async onSelect errors", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const asyncError = vi.fn(() => Promise.reject(new Error("Async error")));

      render(
        <SplitButton
          label="Save"
          options={[{ ...options[0], onSelect: asyncError }]}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );
      await userEvent.click(screen.getByRole("menuitem", { name: /save as/i }));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Keyboard Navigation", () => {
    test("opens menu with Enter key on toggle", async () => {
      render(<SplitButton label="Save" options={options} />);
      const toggle = screen.getByRole("button", { name: "More options" });

      await userEvent.type(toggle, "{Enter}");
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    test("opens menu with Space key on toggle", async () => {
      render(<SplitButton label="Save" options={options} />);
      const toggle = screen.getByRole("button", { name: "More options" });

      await userEvent.type(toggle, " ");
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    test("opens menu with ArrowDown on toggle", async () => {
      render(<SplitButton label="Save" options={options} />);
      const toggle = screen.getByRole("button", { name: "More options" });

      fireEvent.keyDown(toggle, { key: "ArrowDown" });
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    test("closes menu with Escape key", async () => {
      render(<SplitButton label="Save" options={options} />);
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );

      fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });

    test("navigates menu items with ArrowDown", async () => {
      render(<SplitButton label="Save" options={options} />);
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );

      const menu = screen.getByRole("menu");
      fireEvent.keyDown(menu, { key: "ArrowDown" });

      // First item should have focus
      expect(screen.getByRole("menuitem", { name: /save as/i })).toHaveFocus();
    });

    test("navigates menu items with ArrowUp", async () => {
      render(<SplitButton label="Save" options={options} />);
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );

      const menu = screen.getByRole("menu");
      fireEvent.keyDown(menu, { key: "ArrowUp" });

      // Should navigate to last item
      expect(
        screen.getByRole("menuitem", { name: /save to cloud/i }),
      ).toHaveFocus();
    });

    test("jumps to first item with Home key", async () => {
      render(<SplitButton label="Save" options={options} />);
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );

      const menu = screen.getByRole("menu");
      fireEvent.keyDown(menu, { key: "Home" });

      expect(screen.getByRole("menuitem", { name: /save as/i })).toHaveFocus();
    });

    test("jumps to last item with End key", async () => {
      render(<SplitButton label="Save" options={options} />);
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );

      const menu = screen.getByRole("menu");
      fireEvent.keyDown(menu, { key: "End" });

      expect(
        screen.getByRole("menuitem", { name: /save to cloud/i }),
      ).toHaveFocus();
    });

    test("skips disabled items when navigating", async () => {
      render(
        <SplitButton
          label="Save"
          options={[{ ...options[0], disabled: true }, options[1]]}
        />,
      );
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );

      const menu = screen.getByRole("menu");
      fireEvent.keyDown(menu, { key: "ArrowDown" });

      // Should skip disabled first item and focus second
      expect(
        screen.getByRole("menuitem", { name: /save to cloud/i }),
      ).toHaveFocus();
    });
  });

  describe("Nested Menus", () => {
    const nestedOptions: SplitButtonOption[] = [
      {
        id: "export",
        label: "Export",
        children: [
          { id: "pdf", label: "PDF" },
          { id: "csv", label: "CSV" },
        ],
      },
      { id: "save", label: "Save" },
    ];

    test("renders nested menu when parent has children", async () => {
      render(<SplitButton label="Actions" options={nestedOptions} />);
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );

      const exportItem = screen.getByRole("menuitem", { name: /export/i });
      await userEvent.click(exportItem);

      await waitFor(() => {
        expect(
          screen.getByRole("menuitem", { name: /pdf/i }),
        ).toBeInTheDocument();
      });
    });

    test("opens submenu with ArrowRight key", async () => {
      render(<SplitButton label="Actions" options={nestedOptions} />);
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );

      const exportItem = screen.getByRole("menuitem", { name: /export/i });
      fireEvent.keyDown(exportItem, { key: "ArrowRight" });

      await waitFor(() => {
        expect(
          screen.getByRole("menuitem", { name: /pdf/i }),
        ).toBeInTheDocument();
      });
    });

    test("closes submenu with ArrowLeft key", async () => {
      render(<SplitButton label="Actions" options={nestedOptions} />);
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );

      const exportItem = screen.getByRole("menuitem", { name: /export/i });
      fireEvent.keyDown(exportItem, { key: "ArrowRight" });

      await waitFor(() => {
        expect(
          screen.getByRole("menuitem", { name: /pdf/i }),
        ).toBeInTheDocument();
      });

      fireEvent.keyDown(exportItem, { key: "ArrowLeft" });

      await waitFor(() => {
        expect(
          screen.queryByRole("menuitem", { name: /pdf/i }),
        ).not.toBeInTheDocument();
      });
    });

    test("calls child option onSelect", async () => {
      const onSelect = vi.fn();
      const optionsWithCallback: SplitButtonOption[] = [
        {
          id: "export",
          label: "Export",
          children: [{ id: "pdf", label: "PDF", onSelect }],
        },
      ];

      render(<SplitButton label="Actions" options={optionsWithCallback} />);
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );
      await userEvent.click(screen.getByRole("menuitem", { name: /export/i }));
      await userEvent.click(screen.getByRole("menuitem", { name: /pdf/i }));

      expect(onSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe("ARIA Attributes", () => {
    test("toggle has correct ARIA attributes when closed", () => {
      render(<SplitButton label="Save" options={options} />);
      const toggle = screen.getByRole("button", { name: "More options" });

      expect(toggle).toHaveAttribute("aria-haspopup", "menu");
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    test("toggle has correct ARIA attributes when open", async () => {
      render(<SplitButton label="Save" options={options} />);
      const toggle = screen.getByRole("button", { name: "More options" });

      await userEvent.click(toggle);

      expect(toggle).toHaveAttribute("aria-expanded", "true");
      expect(toggle).toHaveAttribute("aria-controls");
    });

    test("menu items with submenus have aria-haspopup", async () => {
      const nestedOptions: SplitButtonOption[] = [
        {
          id: "export",
          label: "Export",
          children: [{ id: "pdf", label: "PDF" }],
        },
      ];

      render(<SplitButton label="Actions" options={nestedOptions} />);
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );

      const exportItem = screen.getByRole("menuitem", { name: /export/i });
      expect(exportItem).toHaveAttribute("aria-haspopup", "menu");
      expect(exportItem).toHaveAttribute("aria-expanded", "false");
    });

    test("submenu trigger shows aria-expanded=true when open", async () => {
      const nestedOptions: SplitButtonOption[] = [
        {
          id: "export",
          label: "Export",
          children: [{ id: "pdf", label: "PDF" }],
        },
      ];

      render(<SplitButton label="Actions" options={nestedOptions} />);
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );

      const exportItem = screen.getByRole("menuitem", { name: /export/i });
      await userEvent.click(exportItem);

      expect(exportItem).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Disabled States", () => {
    test("disables both buttons when disabled prop is true", () => {
      render(<SplitButton label="Save" options={options} disabled />);

      expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "More options" }),
      ).toBeDisabled();
    });

    test("does not open menu when disabled", async () => {
      render(<SplitButton label="Save" options={options} disabled />);
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("has no accessibility violations (closed)", async () => {
      const { container } = render(
        <SplitButton label="Save" options={options} />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("has no accessibility violations (open)", async () => {
      const { container } = render(
        <SplitButton label="Save" options={options} />,
      );
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("has no accessibility violations (nested menu)", async () => {
      const nestedOptions: SplitButtonOption[] = [
        {
          id: "export",
          label: "Export",
          children: [{ id: "pdf", label: "PDF" }],
        },
      ];

      const { container } = render(
        <SplitButton label="Actions" options={nestedOptions} />,
      );
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );
      await userEvent.click(screen.getByRole("menuitem", { name: /export/i }));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("icons are decorative (aria-hidden or empty aria-label)", async () => {
      render(<SplitButton label="Save" options={options} />);
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );

      // Caret icon should be decorative
      const carets = screen
        .getByRole("button", { name: "More options" })
        .querySelectorAll('[data-slot="icon"]');
      carets.forEach((icon) => {
        expect(icon).toHaveAttribute("aria-label", "");
      });
    });
  });

  describe("Translation Coverage", () => {
    test("uses translation key for default toggleLabel", () => {
      render(<SplitButton label="Save" options={options} />);
      expect(
        screen.getByRole("button", { name: "More options" }),
      ).toBeInTheDocument();
    });

    test("respects custom toggleLabel over translation", () => {
      render(
        <SplitButton
          label="Save"
          options={options}
          toggleLabel="Custom label"
        />,
      );
      expect(
        screen.getByRole("button", { name: "Custom label" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "More options" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Focus Trap", () => {
    test("Tab key cycles forward through menu items", async () => {
      render(<SplitButton label="Save" options={options} />);
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );

      const menu = screen.getByRole("menu");
      const firstItem = screen.getByRole("menuitem", { name: /save as/i });
      const secondItem = screen.getByRole("menuitem", {
        name: /save to cloud/i,
      });

      // First item should have focus after opening
      fireEvent.keyDown(menu, { key: "ArrowDown" });
      expect(firstItem).toHaveFocus();

      // Tab should move to second item (not escape menu)
      fireEvent.keyDown(document, { key: "Tab" });
      await waitFor(() => {
        expect(secondItem).toHaveFocus();
      });

      // Tab again should cycle back to first item
      fireEvent.keyDown(document, { key: "Tab" });
      await waitFor(() => {
        expect(firstItem).toHaveFocus();
      });
    });

    test("Shift+Tab cycles backward through menu items", async () => {
      render(<SplitButton label="Save" options={options} />);
      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );

      const firstItem = screen.getByRole("menuitem", { name: /save as/i });
      const secondItem = screen.getByRole("menuitem", {
        name: /save to cloud/i,
      });

      // Start at first item
      fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
      expect(firstItem).toHaveFocus();

      // Shift+Tab should cycle to last item
      fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
      await waitFor(() => {
        expect(secondItem).toHaveFocus();
      });
    });

    test("focus cannot escape menu with Tab until Escape is pressed", async () => {
      render(
        <div>
          <button>Before</button>
          <SplitButton label="Save" options={options} />
          <button>After</button>
        </div>,
      );

      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );

      // Tab should not escape to "After" button
      fireEvent.keyDown(document, { key: "Tab" });
      expect(screen.getByRole("button", { name: "After" })).not.toHaveFocus();

      // Press Escape to close menu
      fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });

      // Now focus should return to toggle
      expect(
        screen.getByRole("button", { name: "More options" }),
      ).toHaveFocus();
    });
  });

  describe("Portal Support", () => {
    test("renders menu inline by default (usePortal=false)", () => {
      const { container } = render(
        <SplitButton label="Save" options={options} />,
      );
      fireEvent.click(screen.getByRole("button", { name: "More options" }));

      // Menu should be inside the component wrapper
      const wrapper = container.querySelector('[data-variant="primary"]');
      const menu = screen.getByRole("menu");
      expect(wrapper).toContainElement(menu);
    });

    test("renders menu in portal when usePortal=true", () => {
      const { container } = render(
        <SplitButton label="Save" options={options} usePortal />,
      );
      fireEvent.click(screen.getByRole("button", { name: "More options" }));

      // Menu should NOT be inside the component wrapper
      const wrapper = container.querySelector('[data-variant="primary"]');
      const menu = screen.getByRole("menu");
      expect(wrapper).not.toContainElement(menu);

      // Menu should be in document.body
      expect(document.body).toContainElement(menu);
    });

    test("portal menu still functions correctly", async () => {
      const onSelect = vi.fn();
      render(
        <SplitButton
          label="Save"
          options={[{ ...options[0], onSelect }]}
          usePortal
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: "More options" }),
      );
      await userEvent.click(screen.getByRole("menuitem", { name: /save as/i }));

      expect(onSelect).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });
  });
});
