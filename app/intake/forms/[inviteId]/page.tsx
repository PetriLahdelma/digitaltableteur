import { notFound, redirect } from "next/navigation";

import { copyTable } from "@/app/lib/intake/copy";
import { inputFields } from "@/app/lib/intake/schema";
import { loadDraft } from "@/app/lib/intake/service/forms";
import { currentClient } from "@/app/lib/intake/service/session";

import { IntakeForm } from "../../_components/IntakeForm";
import { IntakePage } from "../../_components/IntakePage";
import { requestLocale } from "../../_components/locale";

export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ inviteId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function IntakeFormPage({ params, searchParams }: Props) {
  const { inviteId } = await params;
  const { ctx, session } = await currentClient();
  if (!session) redirect("/intake");
  if (!UUID.test(inviteId)) notFound();
  const draft = await loadDraft(ctx, session.clientId, inviteId);
  // Not this client's, or already submitted: the home page shows what is available.
  if (!draft) redirect("/intake/forms");
  // Every questionnaire carries all its copy in every language, so the form follows the header's language switcher.
  const locale = await requestLocale(searchParams, draft.locale);
  // Before the first save, the invite's name and email stand in as answers (Mercury pre-fills what it knows).
  const fieldIds = new Set(
    inputFields(draft.questionnaire).map((field) => field.id),
  );
  const prefill = Object.fromEntries(
    [
      ["contact_name", draft.contact.name],
      ["email", draft.contact.email],
    ].filter(([id]) => fieldIds.has(id)),
  );
  const initialAnswers =
    draft.revision === 0 ? { ...prefill, ...draft.answers } : draft.answers;

  return (
    <IntakePage locale={locale}>
      <IntakeForm
        inviteId={inviteId}
        questionnaire={draft.questionnaire}
        locale={locale}
        copy={copyTable(locale)}
        initialAnswers={initialAnswers}
        initialRevision={draft.revision}
        initialCompleted={draft.completedParts}
      />
    </IntakePage>
  );
}
