import React from "react";
import styles from "./avatar.module.css";

type AvatarProps = {
  name?: string;
  imageUrl?: string | { default: string };
};

const Avatar: React.FC<AvatarProps> = ({ name, imageUrl }) => {
  const resolvedImageUrl =
    typeof imageUrl === "string" ? imageUrl : imageUrl?.default;

  if (resolvedImageUrl) {
    return (
      <img
        src={resolvedImageUrl}
        alt={name || "Avatar"}
        className={styles.avatarImage}
      />
    );
  }

  const initials = name
    ? name
        .split(" ")
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "";

  return <div className={styles.avatarText}>{initials}</div>;
};

export default Avatar;
