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
  imageSrcSet?: string;
  imageSizes?: string;
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
  imageLoading?: "lazy" | "eager";
  imageDecoding?: "auto" | "sync" | "async";
}

const PersonCard: React.FC<PersonCardProps> = ({
  imageSrc,
  imageAlt,
  imageSrcSet,
  imageSizes,
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
  imageLoading = "lazy",
  imageDecoding = "async",
}) => {
  const { t } = useTranslation();
  const resolvedSizes =
    imageSizes ?? "(max-width: 768px) 240px, (max-width: 1024px) 180px, 128px";

  return (
    <div className={`${styles.personGrid} ${className || ""}`}>
      <img
        className={styles.portrait}
        src={imageSrc}
        srcSet={imageSrcSet ?? `${imageSrc} 1x`}
        sizes={resolvedSizes}
        alt={imageAlt}
        loading={imageLoading}
        decoding={imageDecoding}
      />
      <div className={styles.personDetails}>
        <div className={styles.nameTitle}>
          <Text as="h3" className={styles.personName}>
            {name}
          </Text>
          <Text as="p" className={styles.personTitle}>
            {title}
          </Text>
          <Text as="p">
            <Link
              size="S"
              href={`mailto:${email}`}
              className={styles.personEmail}
            >
              {email}
            </Link>
          </Text>
        </div>
        <div className={styles.socialLinks}>
          {linkedinUrl && (
            <Link
              size="S"
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={linkedinLabel || t("contactLinkedInLabel")}
              title={linkedinLabel || t("contactLinkedInLabel")}
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
              title={githubLabel || t("contactGitHubLabel")}
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
              title={facebookLabel || t("contactFacebookLabel")}
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
              title={twitterLabel || t("contactTwitterLabel")}
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
              title={dribbbleLabel || t("contactDribbbleLabel")}
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
              title={mediumLabel || t("contactMediumLabel")}
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
              title={instagramLabel || t("contactInstagramLabel")}
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
