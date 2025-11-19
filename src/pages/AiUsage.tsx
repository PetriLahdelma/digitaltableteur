import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import styles from "./CookiePolicy.module.css";
import Button from "@dt/Button";
import Icon from "@dt/Icon";

const delimiter = " – ";

const emphasiseLeadingLabel = (text: string) => {
  const delimiterIndex = text.indexOf(delimiter);
  if (delimiterIndex === -1) {
    return <strong>{text}</strong>;
  }
  const label = text.slice(0, delimiterIndex);
  const remainder = text.slice(delimiterIndex + delimiter.length);
  return (
    <>
      <strong>{label}</strong>
      {delimiter}
      {remainder}
    </>
  );
};

const renderEmailLink = (text: string, email: string) => {
  if (!text.includes(email)) {
    return text;
  }
  const [before, after = ""] = text.split(email);
  return (
    <>
      {before}
      <a href={`mailto:${email}`}>{email}</a>
      {after}
    </>
  );
};

const AiUsage = () => {
  const { t } = useTranslation();

  const useCases = [
    "aiPolicyUseCaseDesign",
    "aiPolicyUseCaseContent",
    "aiPolicyUseCaseOperations",
  ];

  const safeguards = [
    "aiPolicySafeguardHumanReview",
    "aiPolicySafeguardDataMinimisation",
    "aiPolicySafeguardVendorReview",
  ];

  const rights = [
    "aiPolicyRightInformation",
    "aiPolicyRightObjection",
    "aiPolicyRightErasure",
  ];

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{t("aiPolicyMetaTitle")}</title>
          <meta name="description" content={t("aiPolicyMetaDescription")} />
        </Helmet>
      </HelmetProvider>
      <div className={styles.policyPage}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <Button
            variant="secondary"
            size="m"
            onClick={() => (window.location.href = "/")}
          >
            <Icon
              name="arrow-left"
              ariaLabel="Back"
              style={{ marginInlineEnd: 8 }}
            />
            Back
          </Button>
        </div>
        <h1>{t("aiPolicyHeading")}</h1>
        <p>{t("aiPolicyIntro")}</p>
        <section>
          <h2>{t("aiPolicyUseCasesTitle")}</h2>
          <ul>
            {useCases.map((key) => {
              const content = t(key);
              return (
                <li key={key}>
                  <p>{emphasiseLeadingLabel(content)}</p>
                </li>
              );
            })}
          </ul>
        </section>
        <section>
          <h2>{t("aiPolicyDataTitle")}</h2>
          <p>{t("aiPolicyDataBody")}</p>
        </section>
        <section>
          <h2>{t("aiPolicySafeguardsTitle")}</h2>
          <ul>
            {safeguards.map((key) => {
              const content = t(key);
              return (
                <li key={key}>
                  <p>{emphasiseLeadingLabel(content)}</p>
                </li>
              );
            })}
          </ul>
        </section>
        <section>
          <h2>{t("aiPolicyRightsTitle")}</h2>
          <ul>
            {rights.map((key) => {
              const content = t(key);
              return (
                <li key={key}>
                  <p>{emphasiseLeadingLabel(content)}</p>
                </li>
              );
            })}
          </ul>
          <p>
            {renderEmailLink(
              t("aiPolicyRightsFooter"),
              "mail@digitaltableteur.com",
            )}
          </p>
        </section>
      </div>
    </>
  );
};

export default AiUsage;
