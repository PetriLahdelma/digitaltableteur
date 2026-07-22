"use client";

import React from "react";
import type { ImageSource as StaticImageData } from "../../lib/imageComponent";
import { useTranslate } from "../../lib/translation";
import Avatar, { type AvatarSize } from "@dt/Avatar";
import styles from "./Author.module.css";

export interface AuthorProps {
  /** Author name shown after the byline prefix. */
  name: string;
  /** Avatar image source: a URL, an imported asset path, or static image data. */
  imageUrl: string | { default: string } | StaticImageData;
  /** Avatar size. @default "2.5rem" */
  size?: AvatarSize;
  /** Optional author profile URL; makes the byline text a link. */
  profileUrl?: string;
  /** Byline prefix before the name. Defaults to the localized "By"
   * (fi "Kirjoittanut", sv "Av"), matching the native dt-author element. */
  bylinePrefix?: string;
}

/**
 * Compact author byline for article metadata. Fully input-driven: pass any
 * name, avatar image (URL or path), and optional profile link. Use AuthorBio
 * for the expanded end-of-article biography treatment.
 */
export const Author: React.FC<AuthorProps> = ({
  name,
  imageUrl,
  size = "2.5rem",
  profileUrl,
  bylinePrefix,
}) => {
  const t = useTranslate();
  // || not ??: a cleared/seeded Controls text field passes "" and must fall
  // back to the localized default prefix.
  const prefix = bylinePrefix || t("authorBylinePrefix");
  const byline = `${prefix} ${name}`;

  return (
    <div className={styles.authorContainer}>
      <Avatar imageUrl={imageUrl} size={size} />
      <p className={styles.author}>
        {profileUrl ? (
          <a className={styles.authorLink} href={profileUrl}>
            {byline}
          </a>
        ) : (
          byline
        )}
      </p>
    </div>
  );
};

export default Author;
