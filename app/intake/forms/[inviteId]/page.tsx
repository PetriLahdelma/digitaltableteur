import { notFound, redirect } from "next/navigation";

import { copyTable } from "@/app/lib/intake/copy";
import { loadDraft } from "@/app/lib/intake/service/forms";
import { currentClient } from "@/app/lib/intake/service/session";

import { IntakeForm } from "../../_components/IntakeForm";
import { IntakeFrame } from "../../_components/IntakeFrame";

export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ inviteId: string }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function IntakeFormPage({ params }: Props) {
  const { inviteId } = await params;
  const { ctx, session } = await currentClient();
  if (!session) redirect("/intake");
  if (!UUID.test(inviteId)) notFound();
  const draft = await loadDraft(ctx, session.clientId, inviteId);
  // Not this client's, or already submitted: the home page shows what is available.
  if (!draft) redirect("/intake/forms");

  return (
    <IntakeFrame locale={draft.locale} signedIn languageSwitch={false}>
      <IntakeForm
        inviteId={inviteId}
        questionnaire={draft.questionnaire}
        locale={draft.locale}
        copy={copyTable(draft.locale)}
        initialAnswers={draft.answers}
        initialRevision={draft.revision}
      />
    </IntakeFrame>
  );
}
