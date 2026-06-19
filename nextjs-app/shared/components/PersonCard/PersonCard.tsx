import React from "react";
import styles from "./PersonCard.module.css";
import Text from "@dt/Text";
import Link from "@dt/Link";
import { useTranslation } from "react-i18next";
import Icon from "@dt/Icon";
import Skeleton from "@dt/Skeleton";

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
  substackUrl?: string;
  substackLabel?: string;
  className?: string;
  imageLoading?: "lazy" | "eager";
  imageDecoding?: "auto" | "sync" | "async";
  /** Show skeleton placeholders while content is loading */
  loading?: boolean;
}

/**
 * PersonCard component.
 */
export const PersonCard: React.FC<PersonCardProps> = ({
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
  substackUrl,
  substackLabel,
  className,
  imageLoading = "lazy",
  imageDecoding = "async",
  loading = false,
}) => {
  const { t } = useTranslation();
  const resolvedSizes =
    imageSizes ?? "(max-width: 768px) 240px, (max-width: 1024px) 180px, 96px";

  const containerClassName = [styles.personGrid, className]
    .filter(Boolean)
    .join(" ");

  if (loading) {
    return (
      <div className={containerClassName} aria-busy="true" role="status">
        <Skeleton
          variant="avatar"
          className={styles.portraitSkeleton}
          label={t("personCard.loadingAvatar")}
        />
        <div className={styles.personDetails}>
          <Skeleton
            variant="text"
            lines={1}
            width="72%"
            className={styles.nameSkeleton}
            label={t("personCard.loadingName")}
          />
          <Skeleton
            variant="text"
            lines={1}
            width="56%"
            className={styles.titleSkeleton}
            label={t("personCard.loadingTitle")}
          />
          <Skeleton
            variant="text"
            lines={1}
            width="48%"
            className={styles.contactSkeleton}
            label={t("personCard.loadingContact")}
          />
          <div className={styles.socialSkeletonRow}>
            <Skeleton
              variant="circle"
              width={28}
              height={28}
              className={styles.socialSkeleton}
              label={t("personCard.loadingSocial")}
            />
            <Skeleton
              variant="circle"
              width={28}
              height={28}
              className={styles.socialSkeleton}
              label={t("personCard.loadingSocial")}
            />
            <Skeleton
              variant="circle"
              width={28}
              height={28}
              className={styles.socialSkeleton}
              label={t("personCard.loadingSocial")}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
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
              size="md"
              href={`mailto:${email}`}
              className={`${styles.personEmail} wavyUnderline`.trim()}
            >
              {email}
            </Link>
          </Text>
        </div>
        <div className={styles.socialLinks}>
          {linkedinUrl && (
            <Link
              size="sm"
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={linkedinLabel || t("contactLinkedInLabel")}
              title={linkedinLabel || t("contactLinkedInLabel")}
            >
              <Icon
                name="linkedin-logo"
                ariaLabel={linkedinLabel || t("contactLinkedInLabel")}
              />
            </Link>
          )}
          {githubUrl && (
            <Link
              size="sm"
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={githubLabel || t("contactGitHubLabel")}
              title={githubLabel || t("contactGitHubLabel")}
            >
              <Icon
                name="github-logo"
                ariaLabel={githubLabel || t("contactGitHubLabel")}
              />
            </Link>
          )}
          {facebookUrl && (
            <Link
              size="sm"
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={facebookLabel || t("contactFacebookLabel")}
              title={facebookLabel || t("contactFacebookLabel")}
            >
              <Icon
                name="facebook-logo"
                ariaLabel={facebookLabel || t("contactFacebookLabel")}
              />
            </Link>
          )}
          {twitterUrl && (
            <Link
              size="sm"
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={twitterLabel || t("contactTwitterLabel")}
              title={twitterLabel || t("contactTwitterLabel")}
            >
              <Icon
                name="x-twitter"
                ariaLabel={twitterLabel || t("contactTwitterLabel")}
              />
            </Link>
          )}
          {dribbbleUrl && (
            <Link
              size="sm"
              href={dribbbleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={dribbbleLabel || t("contactDribbbleLabel")}
              title={dribbbleLabel || t("contactDribbbleLabel")}
            >
              <Icon
                name="dribbble-logo"
                ariaLabel={dribbbleLabel || t("contactDribbbleLabel")}
              />
            </Link>
          )}
          {mediumUrl && (
            <Link
              size="sm"
              href={mediumUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={mediumLabel || t("contactMediumLabel")}
              title={mediumLabel || t("contactMediumLabel")}
            >
              <Icon
                name="medium-logo"
                ariaLabel={mediumLabel || t("contactMediumLabel")}
              />
            </Link>
          )}
          {instagramUrl && (
            <Link
              size="sm"
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={instagramLabel || t("contactInstagramLabel")}
              title={instagramLabel || t("contactInstagramLabel")}
            >
              <Icon
                name="instagram-logo"
                ariaLabel={instagramLabel || t("contactInstagramLabel")}
              />
            </Link>
          )}
          {substackUrl && (
            <Link
              size="sm"
              href={substackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={substackLabel || t("contactSubstackLabel")}
              title={substackLabel || t("contactSubstackLabel")}
            >
              <Icon
                name="newspaper-clipping"
                ariaLabel={substackLabel || t("contactSubstackLabel")}
              />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonCard;
