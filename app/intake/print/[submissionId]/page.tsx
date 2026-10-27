import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Code, Container, FlexBox, Logo, Text, Title } from "@digitaltableteur/react";
import SummaryList from "@dt/SummaryList";

import { intakeCopy } from "@/app/lib/intake/copy";
import { PRINT_TOKEN_HEADER, verifyPrintToken } from "@/app/lib/intake/pdf/print-token";
import { getSubmissionForPrint } from "@/app/lib/intake/service/forms";
import { formatIntakeDate } from "@/app/lib/intake/service/mail";
import { intakeContext } from "@/app/lib/intake/service/runtime";

import { AnswerSummary } from "../../_components/AnswerSummary";
import { IntakeLanguage } from "../../_components/LanguageControls";

export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ submissionId: string }> };

/**
 * What the PDF prints: one submission as a document. Only the headless
 * renderer can open it, with a one-minute token in a request header; the
 * site's print styles drop the header, footer and banners.
 */
export default async function IntakePrintPage({ params }: Props) {
  const { submissionId } = await params;
  const ctx = await intakeContext();
  const token = (await headers()).get(PRINT_TOKEN_HEADER);
  if (!verifyPrintToken(token, submissionId, ctx.hmacKey, ctx.now())) notFound();
  const view = await getSubmissionForPrint(ctx, submissionId);
  if (!view) notFound();
  const locale = view.snapshot.locale;
  const t = intakeCopy(locale);
  const answers = view.snapshot.answers;
  const client = [answers.contact_name, answers.business_name].filter(Boolean).join(", ");

  return (
    <Container size="lg">
      <IntakeLanguage locale={locale} />
      <FlexBox direction="column" gap="var(--space-layout-48)">
        <FlexBox direction="column" gap="var(--space-internal-24)">
          <FlexBox direction="row" align="center" gap="var(--space-internal-12)">
            <Logo size={40} background decorative />
            <Text as="span">{t("mailBrand")}</Text>
          </FlexBox>
          <Title level={1} size="l">
            {view.questionnaire.title[locale]}
          </Title>
          <SummaryList
            rows={[
              ...(client ? [{ id: "client", label: t("pdfClient"), value: client }] : []),
              { id: "submitted", label: t("pdfSubmitted"), value: formatIntakeDate(view.submittedAt, locale) },
              { id: "fingerprint", label: t("fingerprint"), value: <Code>{view.digest}</Code> },
            ]}
          />
        </FlexBox>
        <AnswerSummary questionnaire={view.questionnaire} answers={answers} locale={locale} />
      </FlexBox>
    </Container>
  );
}
