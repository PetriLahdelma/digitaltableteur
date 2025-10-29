import React from "react";
import styles from "./PersonCard.module.css";
import Title from "@dt/Title";
import Text from "@dt/Text";
import Link from "@dt/Link";
import { FaLinkedin } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export interface PersonCardProps {
  imageSrc: string;
  imageAlt: string;
  name: string;
  title: string;
  email: string;
  linkedinUrl?: string;
  linkedinLabel?: string;
  className?: string;
}

const PersonCard: React.FC<PersonCardProps> = ({
  imageSrc,
  imageAlt,
  name,
  title,
  email,
  linkedinUrl,
  linkedinLabel,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div className={`${styles.personGrid} ${className || ""}`}>
      <img className={styles.portrait} src={imageSrc} alt={imageAlt} />
      <div className={styles.personDetails}>
        <Title level={2} size="S" className={styles.personName}>
          {name}
        </Title>
        <Text className={styles.personTitle}>
          {title}
          <br />
          <Link
            size="S"
            href={`mailto:${email}`}
            className={styles.personEmail}
          >
            {email}
          </Link>
        </Text>
        {linkedinUrl && (
          <Link
            size="S"
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkedinLink}
            aria-label={linkedinLabel || t("contactLinkedInLabel")}
          >
            <FaLinkedin aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default PersonCard;
