/** Props for Footer. */
export interface FooterProps {
  /** Additional CSS classes on the footer. */
  className?: string;
}

import styles from "./Footer.module.css";
import { Grid, Icon, Link } from "@digitaltableteur/react";
import { useTranslate } from "../../lib/translation";

/**
 * Footer component.
 */
export const Footer = ({ className }: FooterProps = {}) => {
  const t = useTranslate();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={className ? `${styles.footer} ${className}` : styles.footer}
    >
      <Grid columns={3} className={styles.footerGrid}>
        <div className={styles.companyInfo}>
          <h2>
            <a href="/">Digitaltableteur</a>
          </h2>
          <p className={styles.billingDetails}>{t("footerAddressTitle")}</p>
          <p>
            {t("footerAddress1")}
            <br />
            {t("footerAddress2")}
            <br />
            <a
              href="mailto:mail@digitaltableteur.com"
              aria-label={t("footerAriaEmail")}
              title={t("footerAriaEmail")}
            >
              mail@digitaltableteur.com
            </a>
          </p>
          <p className={styles.billingDetails}>{t("footerBillingTitle")}</p>
          <p>
            <strong>{t("footerBillingEInvoiceLabel")}</strong>
            <br />
            {t("footerBillingEInvoice")}
            <br />
            <strong>{t("footerBillingOperatorLabel")}</strong>
            <br />
            {t("footerBillingOperator")}
            <br />
            <strong>{t("footerBillingOperatorIdLabel")}</strong>
            <br />
            {t("footerBillingOperatorId")}
          </p>
          <p className={styles.billingDetails}>{t("footerLegalTitle")}</p>
          <p>
            <a href="/privacy-policy">{t("footerPrivacyPolicy")}</a>
            <br />
            <a href="/imprint">{t("footerImprint")}</a>
            <br />
            <a href="/ai-use">{t("footerAiUse")}</a>
            <br />
            <a href="/accessibility">{t("footerAccessibility")}</a>
          </p>
          <p className={styles.billingDetails}>{t("footerResourcesTitle")}</p>
          <p>
            <a href="/pseo">{t("footerGuides")}</a>
          </p>
        </div>
      </Grid>
      <div className={styles["socialLinks"]}>
        <a
          href="https://www.instagram.com/digitaltableteur/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("footerAriaInstagram")}
          title={t("footerAriaInstagram")}
        >
          <Icon
            name="instagram-logo"
            size={24}
            ariaLabel={t("footerAriaInstagram")}
          />
        </a>
        <a
          href="https://www.facebook.com/digitaltableteur"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("footerAriaFacebook")}
          title={t("footerAriaFacebook")}
        >
          <Icon
            name="facebook-logo"
            size={24}
            ariaLabel={t("footerAriaFacebook")}
          />
        </a>
        <a
          href="https://www.linkedin.com/company/digitaltableteur/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("footerAriaLinkedin")}
          title={t("footerAriaLinkedin")}
        >
          <Icon
            name="linkedin-logo"
            size={24}
            ariaLabel={t("footerAriaLinkedin")}
          />
        </a>
        <a
          href="https://medium.com/digitaltableteur"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("footerAriaMedium")}
          title={t("footerAriaMedium")}
        >
          <Icon
            name="medium-logo"
            size={24}
            ariaLabel={t("footerAriaMedium")}
          />
        </a>
        <a
          href="https://x.com/dtdoesdesign"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("footerAriaX")}
          title={t("footerAriaX")}
        >
          <Icon name="x-twitter" size={24} ariaLabel={t("footerAriaX")} />
        </a>
        <a
          href="https://github.com/PetriLahdelma"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("footerAriaGithub")}
          title={t("footerAriaGithub")}
        >
          <Icon
            name="github-logo"
            size={24}
            ariaLabel={t("footerAriaGithub")}
          />
        </a>
        <a
          href="https://substack.com/@petrilahdelma?"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("footerAriaSubstack")}
          title={t("footerAriaSubstack")}
        >
          <Icon
            name="newspaper"
            size={24}
            ariaLabel={t("footerAriaSubstack")}
          />
        </a>
        <a
          href="https://dribbble.com/digitaltableteur"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("footerAriaDribbble")}
          title={t("footerAriaDribbble")}
        >
          <Icon
            name="dribbble-logo"
            size={24}
            ariaLabel={t("footerAriaDribbble")}
          />
        </a>
      </div>
      <p className={styles["footerText"]}>
        &copy; {currentYear} Digitaltableteur. {t("footerCopyright")}
      </p>
    </footer>
  );
};

export default Footer;
