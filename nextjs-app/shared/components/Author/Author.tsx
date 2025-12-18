import React from "react";
import type { StaticImageData } from "next/image";
import Avatar, { type AvatarSize } from "@dt/Avatar";
import styles from "./Author.module.css";

type AuthorProps = {
  name: string;
  imageUrl: string | { default: string } | StaticImageData;
  size?: AvatarSize;
  profileUrl?: string;
};

const Author: React.FC<AuthorProps> = ({
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
