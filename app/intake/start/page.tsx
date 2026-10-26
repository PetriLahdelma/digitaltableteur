import { copyTable } from "@/app/lib/intake/copy";

import { IntakeFrame } from "../_components/IntakeFrame";
import { InviteFlow } from "../_components/InviteFlow";
import { requestLocale } from "../_components/locale";

export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Invite landing. Opening it consumes nothing; Continue does (STRIDE S2). */
export default async function IntakeInvitePage({ searchParams }: Props) {
  const locale = await requestLocale(searchParams);
  return (
    <IntakeFrame locale={locale}>
      <InviteFlow copy={copyTable(locale)} locale={locale} />
    </IntakeFrame>
  );
}
