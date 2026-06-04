import type { Meta, StoryObj } from "@storybook/react-vite";
import { MapPin, ExternalLink, Share } from "lucide-react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { IconButton as ShadcnIconButton } from "@/nextjs-app/shared/components/IconButton";
import DtButton from "@dt/Button";
import {
  MigrationDecisionBand,
  MigrationDecisionBlock,
  MigrationDecisionPage,
} from "./MigrationDecisionBoard";
import board from "./MigrationDecisionBoard.module.css";

const meta = {
  title: "Design system/Migration boards/Button contexts",
  parameters: { layout: "fullscreen", docs: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Light-surface buttons — use surface=default (not onDark).
 */
export const AllContexts: Story = {
  name: "All contexts",
  render: () => (
    <MigrationDecisionPage
      title="Button contexts decision board"
      lead={
        <>
          Decision: migrate with <code>surface=default</code> on light cards. Map
          shadcn <code>ghost</code> → <code>tertiary</code>, <code>outline</code> →{" "}
          <code>secondary</code>. Icon-only uses <code>isRounded</code> +{" "}
          <code>accessibleName</code>.
        </>
      }
    >
      <MigrationDecisionBand title="StudioMap — chat embed (light card)">
        <div className={board.chatEmbed}>
          <MigrationDecisionBlock
            variant="legacy"
            title="Today — shadcn outline + ghost, sm, asChild"
          >
            <ShadcnButton variant="outline" size="sm" asChild className="text-xs">
              <a href="#maps">
                <MapPin className="w-3 h-3 mr-1.5" />
                Get directions
              </a>
            </ShadcnButton>
            <ShadcnButton variant="ghost" size="sm" asChild className="text-xs">
              <a href="#maps">
                <ExternalLink className="w-3 h-3 mr-1.5" />
                Open in Maps
              </a>
            </ShadcnButton>
          </MigrationDecisionBlock>
          <MigrationDecisionBlock
            variant="proposed"
            title="Proposed — @dt secondary + tertiary, sm, href + icon"
          >
            <DtButton
              href="#maps"
              variant="secondary"
              size="sm"
              icon={<MapPin className="w-3 h-3" aria-hidden />}
            >
              Get directions
            </DtButton>
            <DtButton
              href="#maps"
              variant="tertiary"
              size="sm"
              icon={<ExternalLink className="w-3 h-3" aria-hidden />}
            >
              Open in Maps
            </DtButton>
          </MigrationDecisionBlock>
        </div>
      </MigrationDecisionBand>

      <MigrationDecisionBand title="IconButton — SiteHeader / MobileDrawer" className={board.bandLight}>
        <MigrationDecisionBlock
          variant="legacy"
          title="Today — shadcn IconButton (ghost / outline, rounded-full)"
        >
          <ShadcnIconButton icon={<Share className="h-5 w-5" />} label="Share" variant="ghost" />
          <ShadcnIconButton
            icon={<Share className="h-5 w-5" />}
            label="Share"
            variant="outline"
          />
        </MigrationDecisionBlock>
        <MigrationDecisionBlock
          variant="proposed"
          title="Proposed — @dt icon-only + isRounded"
        >
          <DtButton
            accessibleName="Share"
            variant="tertiary"
            size="sm"
            isRounded
            icon={<Share className="h-5 w-5" aria-hidden />}
          />
          <DtButton
            accessibleName="Share"
            variant="secondary"
            size="sm"
            isRounded
            icon={<Share className="h-5 w-5" aria-hidden />}
          />
        </MigrationDecisionBlock>
      </MigrationDecisionBand>

      <MigrationDecisionBand title="ContactFormSuccess — muted card" className={board.bandMuted}>
        <MigrationDecisionBlock variant="legacy" title="Today — shadcn outline">
          <ShadcnButton variant="outline">Send another message</ShadcnButton>
        </MigrationDecisionBlock>
        <MigrationDecisionBlock variant="proposed" title="Proposed — @dt secondary">
          <DtButton variant="secondary">Send another message</DtButton>
        </MigrationDecisionBlock>
      </MigrationDecisionBand>
    </MigrationDecisionPage>
  ),
};
