import { redirect } from "next/navigation";

import { QUESTIONNAIRE_IDS, getQuestionnaire } from "@/app/lib/intake";
import { adminCopy } from "@/app/lib/intake/admin-copy";
import { ENABLED_INTAKE_LOCALES } from "@/app/lib/intake/data-policy";
import { currentAdmin } from "@/app/lib/intake/service/admin-http";

import { IntakeColumns, IntakePage } from "../../_components/IntakePage";
import { requestLocale } from "../../_components/locale";
import { InviteForm } from "../_components/InviteForm";

export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function IntakeAdminInvitePage({ searchParams }: Props) {
  const { admin } = await currentAdmin();
  if (!admin) redirect("/intake/admin");
  const locale = await requestLocale(searchParams, "en");
  const t = adminCopy(locale);
  const questionnaires = QUESTIONNAIRE_IDS.map((id) => ({ id, title: getQuestionnaire(id)?.title[locale] ?? id }));
  return (
    <IntakePage locale={locale}>
      <IntakeColumns title={t("inviteTitle")} intro={t("inviteIntro")}>
        <InviteForm locale={locale} questionnaires={questionnaires} languages={ENABLED_INTAKE_LOCALES} />
      </IntakeColumns>
    </IntakePage>
  );
}
