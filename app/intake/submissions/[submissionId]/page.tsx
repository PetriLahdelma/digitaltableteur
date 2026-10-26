import { notFound, redirect } from "next/navigation";
import { AlertBanner, Link, Text, Timestamp, Title } from "@digitaltableteur/react";

import { intakeCopy } from "@/app/lib/intake/copy";
import { getSubmission } from "@/app/lib/intake/service/forms";
import { currentClient } from "@/app/lib/intake/service/session";

import { AnswerSheet } from "../../_components/AnswerSheet";
import { IntakeFrame } from "../../_components/IntakeFrame";
import styles from "../../_components/intake.module.css";

export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ submissionId: string }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A past submission, read-only, with the fingerprint the PDF will print. */
export default async function IntakeSubmissionPage({ params }: Props) {
  const { submissionId } = await params;
  const { ctx, session } = await currentClient();
  if (!session) redirect("/intake");
  if (!UUID.test(submissionId)) notFound();
  const view = await getSubmission(ctx, session.clientId, submissionId);
  if (!view) notFound();
  const locale = view.snapshot.locale;
  const t = intakeCopy(locale);

  return (
    <IntakeFrame locale={locale} signedIn languageSwitch={false}>
      <div className={styles.stack}>
        <Link href="/intake/forms" size="sm">
          {t("backToIntakes")}
        </Link>
        <Title level={1} size="l">
          {view.questionnaire.title[locale]}
        </Title>
        <AlertBanner tone="success" title={t("submittedTitle")} description={t("submittedIntro")} />
        <Text size="s">
          {t("submittedOn")} <Timestamp value={view.submittedAt} format="date_time" locale={locale} />
        </Text>
        <Text size="s">
          {t("fingerprint")}: <span className={styles.digest}>{view.digest}</span>
        </Text>
        <AnswerSheet questionnaire={view.questionnaire} answers={view.snapshot.answers} locale={locale} />
      </div>
    </IntakeFrame>
  );
}
