import { redirect } from "next/navigation";

import { copyTable } from "@/app/lib/intake/copy";
import { currentClient } from "@/app/lib/intake/service/session";

import { IntakeFrame } from "./_components/IntakeFrame";
import { SignInFlow } from "./_components/SignInFlow";
import { requestLocale } from "./_components/locale";

export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function IntakeSignInPage({ searchParams }: Props) {
  const { session } = await currentClient();
  if (session) redirect("/intake/forms");
  const locale = await requestLocale(searchParams);
  return (
    <IntakeFrame locale={locale}>
      <SignInFlow copy={copyTable(locale)} locale={locale} />
    </IntakeFrame>
  );
}
