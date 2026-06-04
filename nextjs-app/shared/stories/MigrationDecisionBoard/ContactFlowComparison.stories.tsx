import type { Meta, StoryObj } from "@storybook/react-vite";
import { Loader } from "lucide-react";
import DtButton from "@dt/Button";
import editorialStyles from "../../components/ContactFormEditorial/ContactFormEditorial.module.css";
import successStyles from "../../components/ContactFormSuccessEditorial/ContactFormSuccessEditorial.module.css";
import {
  MigrationDecisionBand,
  MigrationDecisionBlock,
  MigrationDecisionPage,
} from "./MigrationDecisionBoard";
import board from "./MigrationDecisionBoard.module.css";

const meta = {
  title: "Design system/Migration boards/Contact flow",
  parameters: { layout: "fullscreen", docs: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Editorial: Story = {
  render: () => (
    <MigrationDecisionPage
      title="Contact flow decision board"
      lead={
        <>
          Production path: ContactFormEditorial + ContactFormSuccessEditorial. Keep
          editorial module classes on @dt Button; use <code>submits</code> and{" "}
          <code>isLoading</code> for submit.
        </>
      }
    >
      <MigrationDecisionBand title="Submit — ContactFormEditorial" className={board.bandLight}>
        <MigrationDecisionBlock variant="legacy" title="Today — native button + Loader">
          <button type="submit" className={editorialStyles.submitButton}>
            <Loader className={editorialStyles.spinner} aria-hidden />
            <span>Sending…</span>
          </button>
        </MigrationDecisionBlock>
        <MigrationDecisionBlock
          variant="wrong"
          title="Wrong — @dt primary without editorial class (loses layout)"
        >
          <DtButton variant="primary" isLoading>
            Sending…
          </DtButton>
        </MigrationDecisionBlock>
        <MigrationDecisionBlock
          variant="proposed"
          title="Proposed — @dt submits + isLoading + submitButton class"
        >
          <DtButton
            submits
            variant="primary"
            isLoading
            className={editorialStyles.submitButton}
          >
            Sending…
          </DtButton>
          <DtButton submits variant="primary" className={editorialStyles.submitButton}>
            Send message
          </DtButton>
        </MigrationDecisionBlock>
      </MigrationDecisionBand>

      <MigrationDecisionBand title="Success — send another" className={board.bandLight}>
        <div className={successStyles.container} style={{ maxWidth: "24rem" }}>
          <MigrationDecisionBlock variant="legacy" title="Today — native button + module class">
            <button type="button" className={successStyles.sendAnother}>
              Send another message
            </button>
          </MigrationDecisionBlock>
          <MigrationDecisionBlock
            variant="proposed"
            title="Proposed — @dt tertiary + sendAnother class"
          >
            <DtButton variant="tertiary" className={successStyles.sendAnother}>
              Send another message
            </DtButton>
          </MigrationDecisionBlock>
        </div>
      </MigrationDecisionBand>
    </MigrationDecisionPage>
  ),
};
