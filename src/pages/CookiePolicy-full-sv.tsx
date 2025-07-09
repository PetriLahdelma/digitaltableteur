import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import styles from "./CookiePolicy.module.css";
import { useTranslation } from "react-i18next";
import Button from "@dt/Button";
import { FaArrowLeft } from "react-icons/fa";
import Title from "@dt/Title";

const CookiePolicyFullSV = () => {
  const { t, i18n } = useTranslation();

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{t("cookiePolicyMetaTitle")} – Fullständig version</title>
          <meta name="description" content={t("cookiePolicyMetaDescription")} />
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
            <FaArrowLeft style={{ marginRight: 8 }} />
            Tillbaka
          </Button>
        </div>
        <Title>Sekretesspolicy</Title>
        <h2>Avtalsregister – Integritetspolicy</h2>
        <p>
          <strong>Datum för skapande:</strong> 7.7.2025
        </p>
        <p>
          <strong>Personuppgiftsansvarig:</strong> Digitaltableteur Tmi
          <br />
          Hämeentie 8 C26
          <br />
          +358 45 657 4469
          <br />
          mail@digitaltableteur.com
        </p>
        <p>
          <br />
          <strong>Kontaktperson för registerärenden:</strong>
          <br />
          Petri Lahdelma
          <br />
          Hämeentie 8 C26
          <br />
          +358 45 657 4469
          <br />
          mail@digitaltableteur.com
        </p>
        <br />
        <p>
          <strong>Registrets namn:</strong> Avtalsregister
        </p>
        <br />
        <p>
          <strong>Syfte med behandling av personuppgifter:</strong> Den
          rättsliga grunden är avtal. Syftet är att underhålla, hantera,
          arkivera och behandla avtal med kunder och andra intressenter samt att
          underhålla kundrelationer. Uppgifter kan användas för att förbättra
          verksamheten, statistik och personanpassat innehåll. Uppgifter
          behandlas enligt personuppgiftslagen. Uppgifter kan användas för
          riktad reklam inom företagets egna system men lämnas inte ut till
          tredje part. Samarbetspartners kan användas av tekniska skäl, men
          uppgifterna behandlas endast i samband med kundrelationer via tekniska
          gränssnitt.
        </p>
        <br />
        <p>
          <strong>Berättigat intresse:</strong> Databehandling baseras inte på
          berättigat intresse.
        </p>
        <br />
        <p>
          <strong>Kategorier av personuppgifter:</strong> Namn på kontaktperson
          hos kundföretaget, överenskomna ämnen.
        </p>
        <br />
        <p>
          <strong>Mottagare och mottagargrupper:</strong>{" "}
          Personuppgiftsansvarigs personal och outsourcingpartners vid behov.
        </p>
        <br />
        <p>
          <strong>Samtycke:</strong> Databehandling baseras inte på samtycke.
        </p>
        <br />
        <p>
          <strong>Registerinnehåll:</strong> Avtalsregistret innehåller: för-
          och efternamn, representerad organisation, FO-nummer, e-postadress,
          postadress, telefonnummer, beställda tjänster, andra överenskomna
          affärsärenden.
        </p>
        <br />
        <p>
          <strong>Regelmässiga datakällor:</strong> Telefon- och elektronisk
          kommunikation. Uppgifter kan också fås från underleverantörer eller
          samarbetspartners webbplatser, datasystem eller andra digitala källor
          med hjälp av elektronisk inloggning, cookies eller kundspecifika
          identifierare.
        </p>
        <br />
        <p>
          <strong>Användning och utlämning av data:</strong> Uppgifter används
          endast inom företaget, utom när en extern tjänsteleverantör används
          för mervärde- eller kredittjänster. Uppgifter lämnas inte ut till
          tredje part, förutom vid kreditansökningar, indrivning, fakturering
          eller om lagen kräver det. Uppgifter tas bort på begäran, om inte
          lagen, obetalda fakturor eller indrivning hindrar det.
        </p>
        <br />
        <p>
          <strong>Lagringstid:</strong> 10 år efter avtalets slut.
        </p>
        <br />
        <h3>Cookies (Kakor)</h3>
        <p>
          Vi använder cookies för att förbättra och anpassa användarupplevelsen
          samt analysera webbplatsens användning. Data som samlas in kan
          användas för riktad kommunikation och marknadsföring, men besökare kan
          inte identifieras enbart baserat på cookies. Du kan blockera cookies i
          webbläsarens inställningar, men det kan påverka webbplatsens
          funktionalitet.
        </p>
        <h3>Utövande av rättigheter</h3>
        <p>
          För att använda dina rättigheter, kontakta den personuppgiftsansvariga
          eller ovanstående kontaktperson. Du kan lämna in klagomål till
          Dataombudsmannen (
          <a href="mailto:tietosuoja@om.fi">tietosuoja@om.fi</a>,
          <a
            href="https://www.tietosuoja.fi/sv"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.tietosuoja.fi/sv
          </a>
          ).
        </p>
      </div>
    </>
  );
};

export default CookiePolicyFullSV;
