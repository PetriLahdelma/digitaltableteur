import { adminCopy } from "@/app/lib/intake/admin-copy";

import { IntakeColumns, IntakePage } from "../../_components/IntakePage";
import { requestLocale } from "../../_components/locale";
import { AdminEnrol } from "../_components/PasskeyFlows";

export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** The one-time link from `npm run intake:admin-enrol` (token in the fragment). */
export default async function IntakeAdminEnrolPage({ searchParams }: Props) {
  const locale = await requestLocale(searchParams, "en");
  const t = adminCopy(locale);
  return (
    <IntakePage locale={locale}>
      <IntakeColumns title={t("enrolTitle")} intro={t("enrolIntro")}>
        <AdminEnrol locale={locale} via="link" />
      </IntakeColumns>
    </IntakePage>
  );
}
