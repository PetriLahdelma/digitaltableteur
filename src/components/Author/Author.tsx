import React from "react";
import Avatar from "@dt/Avatar";
import styles from "./Author.module.css";

type AuthorProps = {
  name: string;
  imageUrl: string | { default: string };
  size?: "16px" | "24px" | "32px" | "40px"; // Restrict size to templated values
  profileUrl?: string;
};

const Author: React.FC<AuthorProps> = ({
  name,
  imageUrl,
  size = "24px",
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
