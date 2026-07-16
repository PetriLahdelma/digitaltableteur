"use client";

import React from "react";
import type { ImageSource as StaticImageData } from "../../lib/imageComponent";
import Avatar, { type AvatarSize } from "@dt/Avatar";
import styles from "./Author.module.css";

export interface AuthorProps {
  /** Author name shown after the byline prefix. */
  name: string;
  /** Avatar image source. */
  imageUrl: string | { default: string } | StaticImageData;
  /** Avatar size. @default "2.5rem" */
  size?: AvatarSize;
  /** Optional author profile URL; makes the byline text a link. */
  profileUrl?: string;
}

/**
 * Compact author byline for article metadata. Use AuthorBio for the expanded
 * end-of-article biography treatment.
 */
export const Author: React.FC<AuthorProps> = ({
  name,
  imageUrl,
  size = "2.5rem",
  profileUrl,
}) => (
  <div className={styles.authorContainer}>
    <Avatar imageUrl={imageUrl} size={size} />
    <p className={styles.author}>
      {profileUrl ? (
        <a className={styles.authorLink} href={profileUrl}>
          By {name}
        </a>
      ) : (
        <>By {name}</>
      )}
    </p>
  </div>
);

export default Author;
