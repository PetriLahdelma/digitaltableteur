import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label as ShadcnLabel } from "@/components/ui/label";
import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox";
import { Input as ShadcnInput } from "@/components/ui/input";
import DtCheckbox from "@dt/Checkbox";
import DtInputs from "@dt/Inputs";
import DtLabel from "@dt/Label";
import {
  MigrationDecisionBand,
  MigrationDecisionBlock,
  MigrationDecisionPage,
} from "./MigrationDecisionBoard";
import board from "./MigrationDecisionBoard.module.css";

const meta = {
  title: "Design system/Migration boards/Form primitives",
  parameters: { layout: "fullscreen", docs: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const FieldAndCheckbox: Story = {
  name: "Field and checkbox",
  render: () => (
    <MigrationDecisionPage
      title="Form primitives decision board"
      lead={
        <>
          Decision: FormField uses <code>@dt/Label</code> + child control; CheckboxField
          collapses to <code>@dt/Checkbox</code> with <code>label</code> prop. Prefer{" "}
          <code>@dt/Inputs</code> when label is built-in.
        </>
      }
    >
      <MigrationDecisionBand title="FormField — email row" className={board.bandLight}>
        <div className={board.bandInset} style={{ maxWidth: "22rem" }}>
          <MigrationDecisionBlock variant="legacy" title="Today — shadcn Label + Input">
            <div className="space-y-2">
              <ShadcnLabel htmlFor="legacy-email" className="font-body text-text-s font-medium">
                Email<span className="text-destructive ml-1">*</span>
              </ShadcnLabel>
              <ShadcnInput id="legacy-email" type="email" placeholder="you@studio.com" />
            </div>
          </MigrationDecisionBlock>
          <MigrationDecisionBlock variant="proposed" title="Proposed — @dt Inputs (label built-in)">
            <DtInputs
              id="dt-email"
              type="email"
              label="Email"
              placeholder="you@studio.com"
              onValueChange={() => {}}
            />
          </MigrationDecisionBlock>
          <MigrationDecisionBlock
            variant="proposed"
            title="Alt — @dt Label + native input (FormField shell)"
          >
            <div className="space-y-2">
              <DtLabel htmlFor="dt-email-alt" required>
                Email
              </DtLabel>
              <ShadcnInput id="dt-email-alt" type="email" placeholder="you@studio.com" />
            </div>
          </MigrationDecisionBlock>
        </div>
      </MigrationDecisionBand>

      <MigrationDecisionBand title="CheckboxField" className={board.bandLight}>
        <div className={board.bandInset} style={{ maxWidth: "26rem" }}>
          <MigrationDecisionBlock variant="legacy" title="Today — shadcn Checkbox + Label">
            <div className="flex gap-3">
              <ShadcnCheckbox id="legacy-cb" defaultChecked className="mt-0.5" />
              <div>
                <ShadcnLabel htmlFor="legacy-cb" className="font-body text-text-m cursor-pointer">
                  Design systems
                </ShadcnLabel>
                <p className="font-body text-text-s text-muted-foreground">
                  Optional description
                </p>
              </div>
            </div>
          </MigrationDecisionBlock>
          <MigrationDecisionBlock variant="proposed" title="Proposed — @dt Checkbox">
            <DtCheckbox
              id="dt-cb"
              label="Design systems"
              defaultChecked
              onCheckedChange={() => {}}
            />
            <p
              className="font-body text-text-s text-muted-foreground"
              style={{ marginTop: "0.5rem" }}
            >
              Optional description — pair with @dt/Text or HelperText
            </p>
          </MigrationDecisionBlock>
        </div>
      </MigrationDecisionBand>
    </MigrationDecisionPage>
  ),
};
