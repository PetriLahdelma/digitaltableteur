"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Icon, Map as LeafletMap } from "leaflet";

import ContactForm from "@dt/ContactForm";
import FlexBox from "@dt/FlexBox";
import Link from "@dt/Link";
import PersonCard from "@dt/PersonCard";
import SecureCVDownload from "@dt/SecureCVDownload";
import Text from "@dt/Text";
import Title from "@dt/Title";
import PageLayout from "../../../patterns/PageLayout/PageLayout";
import styles from "./ContactPage.module.css";

const HELSINKI_COORDINATES: [number, number] = [
  60.1810882006689, 24.952352100000002,
];

export function ContactPage() {
  const { t } = useTranslation();
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const clearMapContainer = () => {
    mapRef.current?.remove();
    mapRef.current = null;
    const container = mapContainerRef.current as
      | (HTMLDivElement & { _leaflet_id?: string })
      | null;
    if (container?._leaflet_id) {
      delete container._leaflet_id;
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Fresh container each mount (handles Fast Refresh/StrictMode replays).
    clearMapContainer();

    let mounted = true;
    (async () => {
      const leafletCore = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      const L = (leafletCore as any).default ?? leafletCore;
      if (typeof L?.map !== "function") {
        // In non-browser/test environments, bail out gracefully.
        return;
      }
      const iconOptions = (L.Icon as typeof Icon).Default.prototype.options;
      if (!iconOptions.iconRetinaUrl) {
        (L.Icon as typeof Icon).Default.mergeOptions({
          iconRetinaUrl: "/marker-icon-2x.png",
          iconUrl: "/marker-icon.png",
          shadowUrl: "/marker-shadow.png",
        });
      }

      if (!mounted) return;
      const container = mapContainerRef.current;
      if (!container) return;

      // Ensure Leaflet doesn't think this container is already bound.
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }

      const map = L.map(container, {
        scrollWheelZoom: true,
      }).setView(HELSINKI_COORDINATES, 20);

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {},
      ).addTo(map);

      const hqIcon = L.icon({
        iconUrl: "/dt-blue.svg",
        iconRetinaUrl: "/dt-blue.svg",
        iconSize: [44, 44],
        iconAnchor: [22, 40], // bottom center anchors the tip
        popupAnchor: [0, -32],
      });

      L.marker(HELSINKI_COORDINATES, { icon: hqIcon })
        .addTo(map)
        .bindPopup(t("contactHelsinkiOffice"));

      mapRef.current = map;
      setIsMapReady(true);
    })();

    return () => {
      mounted = false;
      clearMapContainer();
      setIsMapReady(false);
    };
  }, [t]);

  return (
    <div className={styles.contact}>
      <PageLayout maxWidth="lg" spacing="spacious" as="section">
        <Title size="L">{t("contactHeroTitle")}</Title>
      </PageLayout>
      <PageLayout maxWidth="lg" spacing="comfortable" as="section">
        <Title level={2} size="M" className={styles.contactSectionHeading}>
          {t("contactSectionHeading")}
        </Title>
        <div className={styles.officeAddress}>
          <FlexBox direction="row" gap="0.5rem">
            <Text className={styles.officeAddressLine}>
              {t("contactAddressLine2")}
              <br />
              {t("contactAddressLine3")}
              <br />
              {t("contactAddressLine4")}
            </Text>
          </FlexBox>
        </div>
        <div className={styles.officeMap}>
          <div
            className={styles.mapWrapper}
            aria-label={t("contactMapDescription")}
          >
            <div
              ref={mapContainerRef}
              className={styles.map}
              role="img"
              aria-label={t("contactHelsinkiOffice")}
            />
            {!isMapReady && (
              <Text className={styles.mapFallback}>
                {t("contactMapFallback")}
              </Text>
            )}
          </div>
        </div>
        <div className={styles.personCardCenter}>
          <Title level={2} size="S" className={styles.contactTitle}>
            {t("contactTitle")}
          </Title>
          <PersonCard
            imageSrc="/pete.png"
            imageAlt={t("contactPersonAlt")}
            name={t("contactPersonName")}
            title={t("contactPersonTitle")}
            email="mail@digitaltableteur.com"
            linkedinUrl="https://www.linkedin.com/in/petrilahdelma/"
            linkedinLabel={t("contactLinkedInLabel")}
            githubUrl="https://github.com/PetriLahdelma"
            githubLabel={t("contactGitHubLabel")}
            mediumUrl="https://medium.com/@petrilahdelma"
            mediumLabel={t("contactMediumLabel")}
            dribbbleUrl="https://dribbble.com/digitaltableteur"
            dribbbleLabel={t("contactDribbbleLabel")}
            substackLabel={t("contactSubstackLabel")}
            substackUrl="https://substack.com/@petrilahdelma"
          />
        </div>
        <PageLayout maxWidth="sm" spacing="comfortable" as="section">
          <Title level={2} size="S" className={styles.contactFormTitle}>
            {t("contactFormTitle")}
          </Title>
          <Text className={styles.contactInfo}>
            {t("contactInfo")}{" "}
            <Link
              size="M"
              href="mailto:mail@digitaltableteur.com"
              className="wavyUnderline"
            >
              mail@digitaltableteur.com
            </Link>
          </Text>
          <ContactForm />
        </PageLayout>
      </PageLayout>
      <PageLayout maxWidth="full" spacing="comfortable" as="section">
        <div className={styles.cvDownloadSection}>
          <Title level={2} size="S" className={styles.resumeTitle}>
            {t("resumeSectionTitle")}
          </Title>
          <Text className={styles.resumeInfo}>
            {t("resumeSectionDescription")}&nbsp;
            <Link
              size="m"
              href="mailto:mail@digitaltableteur.com"
              className="wavyUnderline"
            >
              mail@digitaltableteur.com
            </Link>
          </Text>
          <SecureCVDownload buttonVariant="primary" inverse />
        </div>
      </PageLayout>
    </div>
  );
}
