import { redirect } from "next/navigation";

import { adminCopy } from "@/app/lib/intake/admin-copy";
import { isFreshAdminSession, listPasskeys } from "@/app/lib/intake/service/admin-auth";
import { currentAdmin } from "@/app/lib/intake/service/admin-http";

import { IntakeColumns, IntakePage } from "../../_components/IntakePage";
import { requestLocale } from "../../_components/locale";
import { PasskeyList } from "../_components/PasskeyList";

export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function IntakeAdminPasskeysPage({ searchParams }: Props) {
  const { ctx, admin } = await currentAdmin();
  if (!admin) redirect("/intake/admin");
  const locale = await requestLocale(searchParams, "en");
  const t = adminCopy(locale);
  const passkeys = (await listPasskeys(ctx)).map((passkey) => ({
    id: passkey.id,
    label: passkey.label,
    created: passkey.createdAt.toISOString(),
    used: passkey.lastUsedAt?.toISOString() ?? null,
  }));
  return (
    <IntakePage locale={locale}>
      <IntakeColumns title={t("passkeys")} intro={t("passkeysIntro")}>
        <PasskeyList locale={locale} passkeys={passkeys} fresh={isFreshAdminSession(ctx, admin)} />
      </IntakeColumns>
    </IntakePage>
  );
}
