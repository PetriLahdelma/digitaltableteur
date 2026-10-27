import { notFound, redirect } from "next/navigation";
import { AlertBanner, Code, FlexBox, Link, Section, Text, Timestamp, Title } from "@digitaltableteur/react";
import SummaryList from "@dt/SummaryList";

import { ADMIN_COPY, adminCopy, type AdminCopyKey } from "@/app/lib/intake/admin-copy";
import { getIntake } from "@/app/lib/intake/service/admin";
import { currentAdmin } from "@/app/lib/intake/service/admin-http";

import { AnswerSummary } from "../../../_components/AnswerSummary";
import { DownloadPdfButton } from "../../../_components/DownloadPdfButton";
import { IntakePage } from "../../../_components/IntakePage";
import { requestLocale } from "../../../_components/locale";
import { IntakeActions } from "../../_components/IntakeActions";
import { StatusBadge } from "../../_components/IntakesTable";
import { INTAKE_TIME_ZONE } from "@/app/lib/intake/data-policy";

export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ inviteId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DONE: Record<string, AdminCopyKey> = { resend: "resent", revoke: "revoked", reopen: "reopened" };

/** One intake: who, where it stands, every version with its PDF, the answers and what happened. */
export default async function IntakeAdminDetailPage({ params, searchParams }: Props) {
  const { inviteId } = await params;
  const { ctx, admin } = await currentAdmin();
  if (!admin) redirect("/intake/admin");
  if (!UUID.test(inviteId)) notFound();
  const intake = await getIntake(ctx, inviteId);
  if (!intake) notFound();
  const query = await searchParams;
  const locale = await requestLocale(searchParams, "en");
  const t = adminCopy(locale);
  const done = typeof query.done === "string" ? DONE[query.done] : undefined;
  const sent = query.sent === "1";
  // The action went through but its email did not (invite, resend or reopen).
  const mailFailed = query.mail === "failed" ? (query.done === "reopen" ? "mailFailedReopen" : "mailFailedInvite") : null;
  const actor = (value: string) => t(value === "owner" ? "actorOwner" : value === "client" ? "actorClient" : "actorSystem");
  const auditLabel = (action: string) => {
    const key = `audit_${action.replace(/\./g, "_")}` as AdminCopyKey;
    return key in ADMIN_COPY ? t(key) : t("audit_other");
  };

  return (
    <IntakePage locale={locale}>
      <FlexBox direction="column" gap="var(--space-layout-48)">
        <FlexBox direction="column" gap="var(--space-internal-16)">
          <Text size="s">
            <Link href="/intake/admin">{t("allIntakes")}</Link>
          </Text>
          <FlexBox direction="row" align="center" gap="var(--space-internal-16)" wrap="wrap">
            <Title level={1} size="l">
              {intake.name}
            </Title>
            <StatusBadge status={intake.status} locale={locale} />
          </FlexBox>
          {sent && !mailFailed ? <AlertBanner tone="success" description={t("sent", { email: intake.email })} /> : null}
          {mailFailed ? (
            <AlertBanner tone="warning" description={t(mailFailed, { email: intake.email })} />
          ) : done ? (
            <AlertBanner tone="success" description={t(done, { email: intake.email })} />
          ) : null}
        </FlexBox>

        <Section spacing="none" aria-labelledby="admin-contact">
          <FlexBox direction="column" gap="var(--space-internal-16)">
            <Title level={2} size="s" id="admin-contact">
              {t("detailContact")}
            </Title>
            <SummaryList
              rows={[
                { id: "email", label: t("detailEmail"), value: intake.email },
                ...(intake.company ? [{ id: "company", label: t("colCompany"), value: intake.company }] : []),
                { id: "form", label: t("colForm"), value: intake.questionnaire },
                { id: "invited", label: t("detailInvited"), value: <Timestamp timeZone={INTAKE_TIME_ZONE} value={intake.invitedAt} format="date_time" locale={locale} /> },
                ...(intake.status === "invited" || intake.status === "expired"
                  ? [{ id: "expires", label: t("detailLinkExpires"), value: <Timestamp timeZone={INTAKE_TIME_ZONE} value={intake.linkExpiresAt} format="date_time" locale={locale} /> }]
                  : []),
                {
                  id: "first",
                  label: t("detailFirstSignIn"),
                  value: intake.firstSignedInAt ? <Timestamp timeZone={INTAKE_TIME_ZONE} value={intake.firstSignedInAt} format="date_time" locale={locale} /> : t("detailNotYet"),
                },
              ]}
            />
          </FlexBox>
        </Section>

        <Section spacing="none" aria-labelledby="admin-actions">
          <FlexBox direction="column" gap="var(--space-internal-16)">
            <Title level={2} size="s" id="admin-actions">
              {t("actionsTitle")}
            </Title>
            <IntakeActions inviteId={intake.inviteId} status={intake.status} locale={locale} />
          </FlexBox>
        </Section>

        <Section spacing="none" aria-labelledby="admin-versions">
          <FlexBox direction="column" gap="var(--space-internal-16)">
            <Title level={2} size="s" id="admin-versions">
              {t("versionsTitle")}
            </Title>
            {intake.versionList.length === 0 ? (
              <Text>{t("noVersions")}</Text>
            ) : (
              <SummaryList
                rows={intake.versionList.map((version) => ({
                  id: version.submissionId,
                  label: t("version", { n: version.version }),
                  value: (
                    <FlexBox direction="column" gap="var(--space-internal-4)">
                      <Timestamp timeZone={INTAKE_TIME_ZONE} value={version.submittedAt} format="date_time" locale={locale} />
                      <Text as="span" size="s">
                        {t("fingerprint")}: <Code>{version.digest}</Code>
                      </Text>
                    </FlexBox>
                  ),
                  action: (
                    <DownloadPdfButton
                      href={`/api/intake/admin/submissions/${version.submissionId}/pdf`}
                      label={t("downloadPdf")}
                      errorText={t("genericError")}
                    />
                  ),
                }))}
              />
            )}
          </FlexBox>
        </Section>

        <Section spacing="none" aria-labelledby="admin-answers">
          <FlexBox direction="column" gap="var(--space-internal-16)">
            <Title level={2} size="s" id="admin-answers">
              {t("answersTitle")}
            </Title>
            {intake.answersSource === "none" ? (
              <Text>{t("noAnswers")}</Text>
            ) : (
              <>
                <Text size="s">{intake.answersSource === "draft" ? t("answersDraft") : t("answersLatest")}</Text>
                <AnswerSummary questionnaire={intake.questionnaireDefinition} answers={intake.answers} locale={locale} />
              </>
            )}
          </FlexBox>
        </Section>

        <Section spacing="none" aria-labelledby="admin-activity">
          <FlexBox direction="column" gap="var(--space-internal-16)">
            <Title level={2} size="s" id="admin-activity">
              {t("activityTitle")}
            </Title>
            <SummaryList
              rows={intake.audit.map((entry, index) => ({
                id: `${entry.at.toISOString()}-${index}`,
                label: <Timestamp timeZone={INTAKE_TIME_ZONE} value={entry.at} format="date_time" locale={locale} />,
                value: `${auditLabel(entry.action)} (${actor(entry.actor)})`,
              }))}
            />
          </FlexBox>
        </Section>
      </FlexBox>
    </IntakePage>
  );
}
