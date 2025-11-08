import React from "react";
import styles from "./Footer.module.css";
import {
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaMedium,
  FaGithub,
  FaDribbble,
} from "react-icons/fa";
import Grid from "@dt/Grid";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Grid columns={3} className={styles.footerGrid}>
        <div className={styles.companyInfo}>
          <h2>
            <a href="/">Digitaltableteur</a>
          </h2>
          <p>
            {t("footerAddress1")}
            <br />
            {t("footerAddress2")}
            <br />
            <a href="mailto:mail@digitaltableteur.com">
              mail@digitaltableteur.com
            </a>
          </p>
          <br />
          <p className={styles.billingDetails}>{t("footerBillingTitle")}</p>
          <p>
            {t("footerBillingName")}
            <br />
            {t("footerBillingAddress")}
            <br />
            {t("footerBillingZip")}
            <br />
            {t("footerBillingVat")}
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
          {FaInstagram({ size: 24 })}
        </a>
        <a
          href="https://www.facebook.com/digitaltableteur"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("footerAriaFacebook")}
          title={t("footerAriaFacebook")}
        >
          {FaFacebook({ size: 24 })}
        </a>
        <a
          href="https://www.linkedin.com/company/digitaltableteur/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("footerAriaLinkedin")}
          title={t("footerAriaLinkedin")}
        >
          {FaLinkedin({ size: 24 })}
        </a>
        <a
          href="https://medium.com/@petrilahdelma/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("footerAriaMedium")}
          title={t("footerAriaMedium")}
        >
          {FaMedium({ size: 24 })}
        </a>
        <a
          href="https://github.com/PetriLahdelma"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("footerAriaGithub")}
          title={t("footerAriaGithub")}
        >
          {FaGithub({ size: 24 })}
        </a>
        <a
          href="https://dribbble.com/digitaltableteur"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("footerAriaDribbble")}
          title={t("footerAriaDribbble")}
        >
          {FaDribbble({ size: 24 })}
        </a>
      </div>
      <p className={styles["footerText"]}>
        &copy; {currentYear} Digitaltableteur. {t("footerCopyright")}
      </p>
    </footer>
  );
};

export default Footer;
