import { adminCopy } from "@/app/lib/intake/admin-copy";
import { listIntakes } from "@/app/lib/intake/service/admin";
import { hasPasskeys } from "@/app/lib/intake/service/admin-auth";
import { currentAdmin } from "@/app/lib/intake/service/admin-http";

import { IntakeColumns, IntakePage } from "../_components/IntakePage";
import { requestLocale } from "../_components/locale";
import { IntakesTable } from "./_components/IntakesTable";
import { AdminSignIn } from "./_components/PasskeyFlows";

export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** The owner's home: passkey sign-in, then every intake in one table. */
export default async function IntakeAdminPage({ searchParams }: Props) {
  const locale = await requestLocale(searchParams, "en");
  const { ctx, admin } = await currentAdmin();
  const t = adminCopy(locale);
  if (!admin) {
    return (
      <IntakePage locale={locale}>
        <IntakeColumns title={t("title")} intro={t("signInIntro")}>
          <AdminSignIn locale={locale} hasPasskeys={await hasPasskeys(ctx)} />
        </IntakeColumns>
      </IntakePage>
    );
  }
  const rows = (await listIntakes(ctx)).map((row) => ({ ...row, lastActivity: row.lastActivity.toISOString() }));
  return (
    <IntakePage locale={locale}>
      <IntakesTable rows={rows} locale={locale} />
    </IntakePage>
  );
}
