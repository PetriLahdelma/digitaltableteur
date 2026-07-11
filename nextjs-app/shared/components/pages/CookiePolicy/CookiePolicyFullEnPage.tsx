"use client";

import React from "react";
import Link from "next/link";

import { Button, Icon, Title } from "@digitaltableteur/react";
import styles from "./CookiePolicy.module.css";

export function CookiePolicyFullEnPage({
  onBack,
  backLabel = "Back",
}: {
  onBack?: () => void;
  backLabel?: string;
}) {
  return (
    <div className={styles.policyPage}>
      {onBack ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <Button variant="secondary" size="md" onClick={onBack}>
            <Icon
              name="arrow-left"
              ariaLabel={backLabel}
              style={{ marginInlineEnd: 8 }}
            />
            {backLabel}
          </Button>
        </div>
      ) : null}

      <Title>Privacy Policy</Title>
      <Title level={2}>Contract Register – Privacy Policy</Title>
      <p>
        <strong>Creation date:</strong> 7.7.2025
      </p>
      <p>
        <strong>Data controller:</strong> Digitaltableteur Tmi
        <br />
        Hämeentie 8 C
        <br />
        +358 45 657 4469
        <br />
        mail@digitaltableteur.com
      </p>
      <p>
        <br />
        <strong>Contact person in matters related to the filing system:</strong>
        <br />
        Petri Lahdelma
        <br />
        Hämeentie 8 C
        <br />
        +358 45 657 4469
        <br />
        mail@digitaltableteur.com
      </p>
      <br />
      <p>
        <strong>Name of filing system:</strong> Contract register
      </p>
      <br />
      <p>
        <strong>Purpose of personal data processing:</strong> The legal basis is
        agreement. The purpose is to maintain, manage, archive, and process
        contracts signed with customers and other interest groups, and to
        maintain customer relationships. Information may be used to improve
        operations, for statistics, and for more personalised content. Data are
        processed in accordance with the Personal Data Act. Data may be used for
        targeted advertising within the company’s own systems, but not disclosed
        to external parties. Partners may be used for technical reasons, but
        data are processed solely for customer relations using technical
        interfaces.
      </p>
      <br />
      <p>
        <strong>Legitimate interest basis:</strong> Data processing is not based
        on legitimate interest.
      </p>
      <br />
      <p>
        <strong>Categories of personal data:</strong> Name of contact person for
        customer company, themes agreed on.
      </p>
      <br />
      <p>
        <strong>Recipients and recipient groups:</strong> The data controller’s
        personnel and outsourcing partners when applicable.
      </p>
      <br />
      <p>
        <strong>Consent:</strong> Data processing is not based on consent.
      </p>
      <br />
      <p>
        <strong>Data content of filing system:</strong> Contract register
        contains: first and last name, community represented, business ID, email
        address, postal address, phone number, ordered services, other agreed
        business matters.
      </p>
      <br />
      <p>
        <strong>Regular data sources:</strong> Phone and electronic
        communication. Data may also be obtained from subcontractors or partner
        websites, data systems, or other digital sources using electronic
        sign-in, cookies, or customer-specific identifiers.
      </p>
      <br />
      <p>
        <strong>Use and disclosure:</strong> Data are used solely by the
        company, except when an external service provider is used for added
        value or credit-related services. Data will not be disclosed to external
        parties except for credit applications, debt collection, invoicing, or
        as required by law. Data are removed upon request unless prohibited by
        law, outstanding invoices, or debt collection.
      </p>
      <br />
      <p>
        <strong>Storage time:</strong> 10 years after the end of the contract.
      </p>
      <br />
      <p>
        <strong>Transferring data outside the EU/EEA:</strong> Personal data
        will not be transferred outside the EU unless necessary for technical
        implementation.
      </p>
      <br />
      <p>
        <strong>Protection principles:</strong>
      </p>
      <ul>
        <li>
          <strong>Manual material:</strong> Manually processed documents are
          stored in a locked, fireproof space. Only specific employees with
          confidentiality agreements may process them.
        </li>
        <li>
          <strong>Electronically processed functions:</strong> Only specific
          employees may use the contract register. Each user has a personal
          username and password and has signed a confidentiality agreement. The
          system is protected by a firewall.
        </li>
      </ul>
      <Title level={3}>Rights of the data subject</Title>
      <ul>
        <li>Right to information on processing</li>
        <li>Right of access</li>
        <li>Right to rectification</li>
        <li>Right to erasure and to be forgotten</li>
        <li>Right to restrict processing</li>
        <li>Right to data portability</li>
        <li>Right to object</li>
        <li>Right not to be subject to automated decisions</li>
      </ul>
      <Title level={3}>Cookies</Title>
      <p>
        We use cookies to improve and personalise your experience, and to
        analyse and improve our site. Data collected with cookies may be used
        for targeted communication and marketing, but visitors cannot be
        identified based solely on cookies. You can prohibit cookies in your
        browser settings, but this may affect site functionality.
      </p>
      <p>
        Cookies are grouped into four categories: <strong>essential</strong>{" "}
        (security, consent storage), <strong>functional</strong> (language,
        layout, map embeds), <strong>analytics</strong> (aggregate usage
        metrics) and <strong>marketing/community</strong> (Substack, Instagram,
        GitHub previews). Non-essential categories are only activated after you
        select “Accept all” in the consent modal. Consent logs are retained for
        13 months as required by EU law.
      </p>
      <Title level={3}>Google Analytics</Title>
      <p>
        We use Google Analytics to monitor site activity, improve functionality,
        and develop marketing. Data collected cannot be linked to individual
        users. You can change your Google ad settings or disable Analytics
        monitoring with a browser add-on.
      </p>
      <Title level={3}>Managing consent</Title>
      <p>
        You can revisit your choice at any time. Clear the “cookieConsent” entry
        in your browser storage (or all cookies) to re-open the banner, or email
        mail@digitaltableteur.com and we will reset it on your behalf.
      </p>
      <Title level={3}>AI-assisted services</Title>
      <p>
        Parts of the site (for example, translated articles, Storybook previews,
        or prototype copy) are reviewed with AI-assisted tooling. Humans remain
        accountable for every deliverable and personal data is minimised before
        any prompt is sent. See our{" "}
        <Link href="/ai-use">AI use & transparency statement</Link> for details.
      </p>
      <Title level={3}>How to exercise your rights</Title>
      <p>
        To access, rectify, or erase your data, or to object to processing,
        contact the data controller or the contact person above. You have the
        right to lodge a complaint with the Data Protection Ombudsman (
        <a href="mailto:tietosuoja@om.fi">tietosuoja@om.fi</a>,{" "}
        <a
          href="https://www.tietosuoja.fi/en/"
          target="_blank"
          rel="noopener noreferrer"
        >
          www.tietosuoja.fi/en/
        </a>
        ).
      </p>
    </div>
  );
}
