"use client";

import { useRef, useState } from "react";
import Button from "@dt/Button";
import Modal from "@dt/Modal";

export interface DeleteProjectDialogProps {
  projectName: string;
  onConfirm: () => void;
}

export default function DeleteProjectDialog({
  projectName,
  onConfirm,
}: DeleteProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  return (
    <>
      <Button variant="primary" tone="error" onClick={() => setIsOpen(true)}>
        Delete project
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={close}
        title={`Delete ${projectName}?`}
        description="This cannot be undone."
        footer={
          <>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="primary" tone="error"
              onClick={() => {
                onConfirm();
                close();
              }}
            >
              Delete
            </Button>
          </>
        }
      />
    </>
  );
}
