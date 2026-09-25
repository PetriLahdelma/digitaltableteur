"use client";

import { useState } from "react";

// Plausible first attempt: correct roles and naming, but no focus
// management, no Escape handling, and a live background.
export default function DeleteProjectDialog({
  projectName,
  onConfirm,
}: {
  projectName: string;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Delete project
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          aria-describedby="delete-desc"
        >
          <h2 id="delete-title">Delete {projectName}?</h2>
          <p id="delete-desc">This cannot be undone.</p>
          <button type="button" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </>
  );
}
