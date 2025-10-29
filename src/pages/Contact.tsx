import React, { useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import styles from "./Contact.module.css";
import ContactForm from "@dt/ContactForm";
import SecureCVDownload from "@dt/SecureCVDownload";
import PersonCard from "@dt/PersonCard";
import Title from "@dt/Title";
import Text from "@dt/Text";
import Link from "@dt/Link";
import { useTranslation } from "react-i18next";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const HELSINKI_COORDINATES: [number, number] = [
  60.1810882006689, 24.952352100000002,
];

// Ensure default marker assets load correctly when bundled
if (typeof window !== "undefined") {
  const iconOptions = L.Icon.Default.prototype.options;
  if (!iconOptions.iconRetinaUrl) {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });
  }
}

const Contact = () => {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{t("contactMetaTitle")}</title>
          <meta name="description" content={t("contactMetaDescription")} />
          <meta property="og:title" content={t("contactMetaTitle")} />
          <meta
            property="og:description"
            content={t("contactMetaDescription")}
          />
          <meta property="og:image" content="/logo512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={t("contactMetaTitle")} />
          <meta
            name="twitter:description"
            content={t("contactMetaDescription")}
          />
          <meta name="twitter:image" content="/logo512.png" />
        </Helmet>
      </HelmetProvider>
      <div className={styles.contact}>
        <Title size="L">{t("contactHeroTitle")}</Title>
        <Title level={2} size="M" className={styles.contactSectionHeading}>
          {t("contactSectionHeading")}
        </Title>
        <section className={styles.officeSection}>
          <div className={styles.officeMap}>
            <div
              className={styles.mapWrapper}
              aria-label={t("contactMapDescription")}
            >
              {isClient ? (
                <MapContainer
                  center={HELSINKI_COORDINATES}
                  zoom={20}
                  scrollWheelZoom={false}
                  className={styles.map}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={HELSINKI_COORDINATES}>
                    <Popup>{t("contactHelsinkiOffice")}</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <Text className={styles.mapFallback}>
                  {t("contactMapFallback")}
                </Text>
              )}
            </div>
            <div className={styles.officeAddress}>
              <Title level={4} size="S" className={styles.officeAddressHeading}>
                {t("contactAddressLine1")}
              </Title>
              <br />
              <Text className={styles.officeAddressLine}>
                {t("contactAddressLine2")}
                <br />
                {t("contactAddressLine3")}
                <br />
                {t("contactAddressLine4")}
              </Text>
            </div>
          </div>
          <PersonCard
            imageSrc="/pete.png"
            imageAlt={t("contactPersonAlt")}
            name={t("contactPersonName")}
            title={t("contactPersonTitle")}
            email="petri.lahdelma@digitaltableteur.com"
            linkedinUrl="https://www.linkedin.com/in/petrilahdelma/"
            linkedinLabel={t("contactLinkedInLabel")}
          />
        </section>
        <Title level={2} size="S" className={styles.contactFormTitle}>
          {t("contactFormTitle")}
        </Title>
        <Text className={styles.contactInfo}>
          {t("contactInfo")}{" "}
          <Link size="S" href="mailto:mail@digitaltableteur.com">
            mail@digitaltableteur.com
          </Link>
        </Text>
        <ContactForm />
        <div className={styles.cvDownloadSection}>
          <Title level={2} size="S" className={styles.contactFormTitle}>
            {t("resumeSectionTitle")}
          </Title>
          <Text className={styles.contactInfo}>
            {t("resumeSectionDescription")}&nbsp;
            <Link size="S" href="mailto:mail@digitaltableteur.com">
              mail@digitaltableteur.com
            </Link>
          </Text>
          <SecureCVDownload buttonVariant="primary" />
        </div>
      </div>
    </>
  );
};

export default Contact;
