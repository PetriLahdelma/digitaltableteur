import React from "react";
import styles from "./avatar.module.css";

type AvatarProps = {
  name?: string;
  imageUrl?: string | { default: string };
  clickable?: boolean;
  destinationUrl?: string;
  size?: string;
};

const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  clickable,
  destinationUrl,
  size,
}) => {
  const resolvedImageUrl =
    typeof imageUrl === "string" ? imageUrl : imageUrl?.default;

  const handleClick = () => {
    if (clickable && destinationUrl) {
      window.location.href = destinationUrl;
    }
  };

  const avatarStyle = size ? { width: size, height: size } : undefined;

  if (resolvedImageUrl) {
    return (
      <img
        src={resolvedImageUrl}
        alt={name || "Avatar"}
        className={styles.avatarImage}
        onClick={clickable ? handleClick : undefined}
        style={avatarStyle}
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
      style={avatarStyle}
    >
      {initials}
    </div>
  );
};

export default Avatar;
