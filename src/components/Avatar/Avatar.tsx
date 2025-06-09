import React from "react";
import styles from "./avatar.module.css";

type AvatarProps = {
  name?: string;
  imageUrl?: string | { default: string };
  clickable?: boolean;
  destinationUrl?: string;
};

const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  clickable,
  destinationUrl,
}) => {
  const resolvedImageUrl =
    typeof imageUrl === "string" ? imageUrl : imageUrl?.default;

  const handleClick = () => {
    if (clickable && destinationUrl) {
      window.location.href = destinationUrl;
    }
  };

  if (resolvedImageUrl) {
    return (
      <img
        src={resolvedImageUrl}
        alt={name || "Avatar"}
        className={styles.avatarImage}
        onClick={clickable ? handleClick : undefined}
        style={clickable ? { cursor: "pointer" } : undefined}
      />
    );
  }

  const initials = name
    ? name
        .split(" ")
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "";

  return (
    <div
      className={styles.avatarText}
      onClick={clickable ? handleClick : undefined}
      style={clickable ? { cursor: "pointer" } : undefined}
    >
      {initials}
    </div>
  );
};

export default Avatar;
