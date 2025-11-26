import React from "react";
import { useTranslation } from "react-i18next";
import Avatar, { type AvatarSize } from "@dt/Avatar";
import styles from "./Author.module.css";

/**
 * Author component displays author attribution with avatar and optional profile link.
 *
 * @example
 * ```tsx
 * <Author name="John Doe" imageUrl="/avatar.jpg" />
 * <Author name="Jane Smith" imageUrl={importedImage} profileUrl="/authors/jane" />
 * <Author name="Bob" imageUrl="/bob.jpg" size="4rem" />
 * ```
 */
export interface AuthorProps {
  /** Author's full name */
  name: string;
  /** Avatar image URL or imported image object (Vite/Next.js StaticImageData) */
  imageUrl?: string | { default: string } | { src: string };
  /** Avatar size (default: 2.5rem) */
  size?: AvatarSize;
  /** Optional profile URL to make author name clickable */
  profileUrl?: string;
}

const Author: React.FC<AuthorProps> = ({
  name,
  imageUrl,
  size = "2.5rem",
  profileUrl,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.authorContainer}>
      <Avatar imageUrl={imageUrl} size={size} />
      <p className={styles.author}>
        {profileUrl ? (
          <a className={styles.authorLink} href={profileUrl}>
            {t("author.byline", { name })}
          </a>
        ) : (
          <>{t("author.byline", { name })}</>
        )}
      </p>
    </div>
  );
};

Author.displayName = "Author";

export default Author;
