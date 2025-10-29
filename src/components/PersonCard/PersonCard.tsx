import React from "react";
import styles from "./PersonCard.module.css";
import Title from "@dt/Title";
import Text from "@dt/Text";
import Link from "@dt/Link";
import {
  FaLinkedin,
  FaGithub,
  FaFacebook,
  FaTwitter,
  FaDribbble,
  FaMedium,
  FaInstagram,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

export interface PersonCardProps {
  imageSrc: string;
  imageAlt: string;
  name: string;
  title: string;
  email: string;
  linkedinUrl?: string;
  linkedinLabel?: string;
  githubUrl?: string;
  githubLabel?: string;
  facebookUrl?: string;
  facebookLabel?: string;
  twitterUrl?: string;
  twitterLabel?: string;
  dribbbleUrl?: string;
  dribbbleLabel?: string;
  mediumUrl?: string;
  mediumLabel?: string;
  instagramUrl?: string;
  instagramLabel?: string;
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
  githubUrl,
  githubLabel,
  facebookUrl,
  facebookLabel,
  twitterUrl,
  twitterLabel,
  dribbbleUrl,
  dribbbleLabel,
  mediumUrl,
  mediumLabel,
  instagramUrl,
  instagramLabel,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div className={`${styles.personGrid} ${className || ""}`}>
      <img className={styles.portrait} src={imageSrc} alt={imageAlt} />
      <div className={styles.personDetails}>
        <Title
          terminals="sans"
          level={3}
          size="S"
          className={styles.personName}
        >
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
        <div className={styles.socialLinks}>
          {linkedinUrl && (
            <Link
              size="S"
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={linkedinLabel || t("contactLinkedInLabel")}
            >
              <FaLinkedin aria-hidden="true" />
            </Link>
          )}
          {githubUrl && (
            <Link
              size="S"
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={githubLabel || t("contactGitHubLabel")}
            >
              <FaGithub aria-hidden="true" />
            </Link>
          )}
          {facebookUrl && (
            <Link
              size="S"
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={facebookLabel || t("contactFacebookLabel")}
            >
              <FaFacebook aria-hidden="true" />
            </Link>
          )}
          {twitterUrl && (
            <Link
              size="S"
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={twitterLabel || t("contactTwitterLabel")}
            >
              <FaTwitter aria-hidden="true" />
            </Link>
          )}
          {dribbbleUrl && (
            <Link
              size="S"
              href={dribbbleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={dribbbleLabel || t("contactDribbbleLabel")}
            >
              <FaDribbble aria-hidden="true" />
            </Link>
          )}
          {mediumUrl && (
            <Link
              size="S"
              href={mediumUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={mediumLabel || t("contactMediumLabel")}
            >
              <FaMedium aria-hidden="true" />
            </Link>
          )}
          {instagramUrl && (
            <Link
              size="S"
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={instagramLabel || t("contactInstagramLabel")}
            >
              <FaInstagram aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonCard;
