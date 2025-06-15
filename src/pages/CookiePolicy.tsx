import React from "react";
import { Helmet } from "react-helmet";
import styles from "./CookiePolicy.module.css";

const CookiePolicy = () => {
  return (
    <>
      <Helmet>
        <title>Cookie Policy | Digitaltableteur</title>
        <meta
          name="description"
          content="How Digitaltableteur uses cookies and your choices about them"
        />
      </Helmet>
      <div className={styles.policyPage}>
        <h1>Cookie Policy</h1>
        <p>
          We use cookies to remember your preferences and to analyze how our
          site is used. Essential cookies are saved automatically because the
          site cannot operate without them.
        </p>
        <p>
          Analytics cookies are enabled only if you click{" "}
          <strong>Accept all</strong> on the banner. Choosing{" "}
          <strong>Accept only essential</strong> keeps these disabled. You can
          change your preference at any time through your browser settings.
        </p>
        <p>
          For details about how we handle personal data and your rights under
          GDPR, please contact us.
        </p>
      </div>
    </>
  );
};

export default CookiePolicy;
