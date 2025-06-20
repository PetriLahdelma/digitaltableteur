import React from "react";
import styles from "./Footer.module.css";
import { FaInstagram, FaFacebook, FaLinkedin, FaMedium } from "react-icons/fa";
import Grid from "../../components/Grid/Grid";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Grid columns={3}>
        <div className={styles["grid-item-blank"]}>
          <h2>
            <a href="/">Digitaltableteur</a>
          </h2>
          <p>
            Hämeentie 8
            <br />
            00530 Helsinki
            <br />
            <a href="mailto:mail@digitaltableteur.com">
              mail@digitaltableteur.com
            </a>
          </p>
          <br />
          <p>Billing details</p>
          <p>
            Digitaltableteur
            <br />
            Hämeentie 8 C26
            <br />
            00530 Helsinki
            <br />
            VAT FI2264455–2
          </p>
        </div>
        <div className={styles["grid-item-blank"]}></div>
        <div className={styles["grid-item-blank"]}></div>
      </Grid>
      <p className={styles["footerText"]}>
        &copy; {currentYear} Digitaltableteur. All rights reserved.
      </p>
      <div className={styles["socialLinks"]}>
        <a
          href="https://www.instagram.com/digitaltableteur/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          {FaInstagram({ size: 24 })}
        </a>
        <a
          href="https://www.facebook.com/digitaltableteur"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          {FaFacebook({ size: 24 })}
        </a>
        <a
          href="https://www.linkedin.com/company/digitaltableteur/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          {FaLinkedin({ size: 24 })}
        </a>
        <a
          href="https://medium.com/@petrilahdelma/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Medium"
        >
          {FaMedium({ size: 24 })}
        </a>
      </div>
    </footer>
  );
};

export default Footer;
