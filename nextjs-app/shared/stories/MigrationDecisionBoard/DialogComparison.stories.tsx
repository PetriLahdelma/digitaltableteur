import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button as ShadcnButton } from "@/components/ui/button";
import DtButton from "@dt/Button";
import Modal from "@dt/Modal";
import {
  MigrationDecisionBand,
  MigrationDecisionBlock,
  MigrationDecisionPage,
} from "./MigrationDecisionBoard";
import board from "./MigrationDecisionBoard.module.css";

const meta = {
  title: "Design system/Migration boards/Dialogs",
  parameters: { layout: "fullscreen", docs: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function ShadcnErrorDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ShadcnButton variant="outline" onClick={() => setOpen(true)}>
        Open shadcn error dialog
      </ShadcnButton>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Something went wrong</DialogTitle>
            <DialogDescription>Please try again in a moment.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <ShadcnButton onClick={() => setOpen(false)}>Back</ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DtErrorModal() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <DtButton variant="secondary" onClick={() => setOpen(true)}>
        Open @dt Modal (error)
      </DtButton>
      <Modal
        isOpen={open}
        severity="error"
        title="Something went wrong"
        description="Please try again in a moment."
        onClose={() => setOpen(false)}
        footer={
          <DtButton variant="secondary" onClick={() => setOpen(false)}>
            Back
          </DtButton>
        }
      />
    </>
  );
}

export const AlertAndDeferrals: Story = {
  name: "Alert and deferrals",
  render: () => (
    <MigrationDecisionPage
      title="Dialogs decision board"
      lead={
        <>
          <strong>Error alert approved</strong> — use @dt/Modal with{" "}
          <code>severity=&quot;error&quot;</code>, <code>description</code>, and{" "}
          <code>isOpen</code>/<code>onClose</code>. EnhancedContactForm error path migrated.
          Defer Lightbox, AnimatedDialog, and composable DialogTrigger until matching
          primitives exist.
        </>
      }
    >
      <MigrationDecisionBand title="Error dialog — EnhancedContactForm pattern" className={board.bandLight}>
        <MigrationDecisionBlock variant="legacy" title="Today — shadcn Dialog">
          <ShadcnErrorDialog />
        </MigrationDecisionBlock>
        <MigrationDecisionBlock variant="proposed" title="Proposed — @dt Modal severity=error">
          <DtErrorModal />
        </MigrationDecisionBlock>
      </MigrationDecisionBand>

      <MigrationDecisionBand title="API note — composable trigger" className={board.bandLight}>
        <MigrationDecisionBlock
          variant="legacy"
          title="Today — DialogTrigger + asChild (Radix composition)"
        >
          <Dialog>
            <DialogTrigger asChild>
              <ShadcnButton variant="outline">DialogTrigger</ShadcnButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Composable shadcn</DialogTitle>
                <DialogDescription>
                  @dt Modal uses isOpen / onClose — wrap in local state.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </MigrationDecisionBlock>
      </MigrationDecisionBand>

      <MigrationDecisionBand title="Deferred — do not migrate yet" className={board.bandMuted}>
        <MigrationDecisionBlock variant="defer" title="AnimatedDialog — GSAP + shadcn shell">
          <span className="font-body text-sm">Keep until Modal supports entry animation contract.</span>
        </MigrationDecisionBlock>
        <MigrationDecisionBlock variant="defer" title="Lightbox — ProjectGallery full-bleed">
          <span className="font-body text-sm">Needs gallery overlay primitive or spec extension.</span>
        </MigrationDecisionBlock>
        <MigrationDecisionBlock variant="defer" title="SkillsGrid — shadcn Tooltip">
          <span className="font-body text-sm">No @dt Tooltip; defer or use title attribute.</span>
        </MigrationDecisionBlock>
        <MigrationDecisionBlock variant="defer" title="EnhancedContactForm — shadcn form shell">
          <span className="font-body text-sm">
            Error alert uses @dt/Modal; inputs/selects still shadcn until form boards pass.
          </span>
        </MigrationDecisionBlock>
      </MigrationDecisionBand>
    </MigrationDecisionPage>
  ),
};
