import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPanel from "./SettingsPanel";

function setup() {
  const user = userEvent.setup();
  const onSave = vi.fn();
  render(<SettingsPanel onSave={onSave} />);
  const tab = (name: string) => screen.getByRole("tab", { name });
  const panel = (name: string) => screen.queryByRole("tabpanel", { name });
  const toSwitch = async (name: string, section: string) => {
    await user.click(tab(section));
    return screen.getByRole("switch", { name });
  };
  return { user, onSave, tab, panel, toSwitch };
}

describe("bench: settings acceptance", () => {
  it("renders a labelled tablist with one visible panel", () => {
    const { tab, panel } = setup();
    expect(screen.getByRole("tablist", { name: "Settings sections" })).toBeInTheDocument();
    expect(tab("Notifications")).toHaveAttribute("aria-selected", "true");
    expect(tab("Appearance")).toHaveAttribute("aria-selected", "false");
    const notifications = panel("Notifications");
    expect(notifications).toBeVisible();
    expect(within(notifications as HTMLElement).getByRole("switch", { name: "Email notifications" })).toBeChecked();
    expect(within(notifications as HTMLElement).getByRole("switch", { name: "Weekly digest" })).not.toBeChecked();
    expect(panel("Appearance")).toBeNull();
  });

  it("moves between tabs with the arrow keys", async () => {
    const { user, tab, panel } = setup();
    await user.click(tab("Notifications"));
    await user.keyboard("{ArrowRight}");
    expect(tab("Appearance")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(tab("Appearance")).toHaveAttribute("aria-selected", "true");
    expect(panel("Appearance")).toBeVisible();
    expect(panel("Notifications")).toBeNull();
  });

  it("keeps switch state when switching tabs", async () => {
    const { user, toSwitch } = setup();
    await user.click(await toSwitch("Dark mode", "Appearance"));
    await user.click(await toSwitch("Weekly digest", "Notifications"));
    expect(await toSwitch("Dark mode", "Appearance")).toBeChecked();
    expect(await toSwitch("Weekly digest", "Notifications")).toBeChecked();
  });

  it("saves the current values and announces it", async () => {
    const { user, onSave, toSwitch } = setup();
    await user.click(await toSwitch("Dark mode", "Appearance"));
    await user.click(await toSwitch("Email notifications", "Notifications"));
    await user.click(screen.getByRole("button", { name: "Save settings" }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({
      emailNotifications: false,
      weeklyDigest: false,
      darkMode: true,
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Settings saved");
  });
});
