import React from "react";
import styles from "./Footer.module.css";
import { FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import Grid from "../../components/Grid/Grid";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Grid columns={3} gap="1rem">
        <div className={styles["grid-item-blank"]}>
          <h2>
            <a href="/">Digitaltableteur</a>
          </h2>
        </div>
        <div className={styles["grid-item-blank"]}></div>
        <div className={styles["grid-item-blank"]}></div>
      </Grid>
      <p>&copy; {currentYear} Digitaltableteur. All rights reserved.</p>
      <div className={styles["social-links"]}>
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
      </div>
    </footer>
  );
};

export default Footer;
