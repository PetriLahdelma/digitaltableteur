import React from "react";
import styles from "./avatar.module.css";

import type { StaticImageData } from "next/image";

type AvatarProps = {
  name?: string;
  imageUrl?: string | { default: string } | StaticImageData;
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
  let resolvedImageUrl: string | undefined;
  if (typeof imageUrl === "string") {
    resolvedImageUrl = imageUrl;
  } else if (imageUrl && typeof imageUrl === "object" && "src" in imageUrl) {
    resolvedImageUrl = imageUrl.src;
  } else if (
    imageUrl &&
    typeof imageUrl === "object" &&
    "default" in imageUrl
  ) {
    resolvedImageUrl = imageUrl.default;
  }

  const handleClick = () => {
    if (clickable && destinationUrl && typeof window !== "undefined") {
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
