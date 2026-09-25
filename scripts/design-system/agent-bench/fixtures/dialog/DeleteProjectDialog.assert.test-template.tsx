import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteProjectDialog from "./DeleteProjectDialog";

// role="dialog" and role="alertdialog" are both valid for a destructive
// confirmation; accept either.
function queryDialog(name?: string) {
  const options = name ? { name } : undefined;
  return (
    screen.queryByRole("dialog", options) ??
    screen.queryByRole("alertdialog", options)
  );
}

async function openDialog() {
  const user = userEvent.setup();
  const onConfirm = vi.fn();
  render(
    <div>
      <a href="#outside">Outside link</a>
      <DeleteProjectDialog projectName="Atlas" onConfirm={onConfirm} />
    </div>,
  );
  const trigger = screen.getByRole("button", { name: "Delete project" });
  await user.click(trigger);
  const dialog = await waitFor(() => {
    const found = queryDialog("Delete Atlas?");
    if (!found) throw new Error('no dialog named "Delete Atlas?"');
    return found;
  });
  return { user, onConfirm, trigger, dialog };
}

describe("bench: dialog acceptance", () => {
  it("names and describes the dialog", async () => {
    const { dialog } = await openDialog();
    expect(dialog).toHaveAccessibleDescription(
      expect.stringContaining("This cannot be undone."),
    );
  });

  it("moves focus into the dialog and keeps Tab out of the background", async () => {
    const { user, dialog } = await openDialog();
    await waitFor(() =>
      expect(dialog).toContainElement(document.activeElement as HTMLElement),
    );
    // A modal may cycle focus inside itself, or make the background inert
    // and let focus leave the page (document.body, i.e. browser chrome).
    // Either is acceptable; reaching live background content is not. jsdom
    // does not implement `inert` for Tab order, so focus landing inside an
    // [inert] subtree is a jsdom artifact that a real browser never produces.
    for (let index = 0; index < 8; index += 1) {
      await user.tab();
      const active = document.activeElement as HTMLElement;
      if (active === document.body || dialog.contains(active)) continue;
      expect(
        active.closest("[inert]"),
        `focus reached live background content: ${active.outerHTML.slice(0, 80)}`,
      ).not.toBeNull();
    }
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const { user, trigger } = await openDialog();
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(queryDialog()).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("Cancel closes without confirming and returns focus", async () => {
    const { user, onConfirm, trigger } = await openDialog();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(queryDialog()).not.toBeInTheDocument(),
    );
    expect(onConfirm).not.toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("Delete confirms exactly once and closes", async () => {
    const { user, onConfirm } = await openDialog();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(queryDialog()).not.toBeInTheDocument(),
    );
  });
});
