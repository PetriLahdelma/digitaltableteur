import { notFound, redirect } from "next/navigation";
import {
  AlertBanner,
  Code,
  Text,
  Timestamp,
  Title,
} from "@digitaltableteur/react";

import { intakeCopy } from "@/app/lib/intake/copy";
import { getSubmission } from "@/app/lib/intake/service/forms";
import { currentClient } from "@/app/lib/intake/service/session";

import { AnswerSummary } from "../../_components/AnswerSummary";
import { DownloadPdfButton } from "../../_components/DownloadPdfButton";
import { IntakeColumns, IntakePage } from "../../_components/IntakePage";
import { requestLocale } from "../../_components/locale";
import { INTAKE_TIME_ZONE } from "@/app/lib/intake/data-policy";

export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ submissionId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A past submission, read-only, with the fingerprint the PDF will print. */
export default async function IntakeSubmissionPage({
  params,
  searchParams,
}: Props) {
  const { submissionId } = await params;
  const { ctx, session } = await currentClient();
  if (!session) redirect("/intake");
  if (!UUID.test(submissionId)) notFound();
  const view = await getSubmission(ctx, session.clientId, submissionId);
  if (!view) notFound();
  const locale = await requestLocale(searchParams, view.snapshot.locale);
  const t = intakeCopy(locale);

  return (
    <IntakePage locale={locale}>
      <IntakeColumns
        wide
        title={view.questionnaire.title[locale]}
        intro={
          <>
            <AlertBanner
              tone="success"
              title={t("submittedTitle")}
              description={t("submittedIntro")}
            />
            <Text size="s">
              {t("submittedOn")}{" "}
              <Timestamp
                timeZone={INTAKE_TIME_ZONE}
                value={view.submittedAt}
                format="date_time"
                locale={locale}
              />
            </Text>
            <DownloadPdfButton
              href={`/api/intake/submissions/${view.submissionId}/pdf`}
              label={t("downloadPdf")}
              errorText={t("genericError")}
            />
          </>
        }
      >
        <AnswerSummary
          questionnaire={view.questionnaire}
          answers={view.snapshot.answers}
          locale={locale}
        />
        {/* The fingerprint closes the record, after the answers it seals. */}
        <Text size="s">
          {t("fingerprint")}: <Code>{view.digest}</Code>
        </Text>
      </IntakeColumns>
    </IntakePage>
  );
}
