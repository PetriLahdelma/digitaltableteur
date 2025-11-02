import React from "react";
import styles from "./avatar.module.css";

type AvatarProps = {
  name?: string;
  imageUrl?: string | { default: string };
  clickable?: boolean;
  destinationUrl?: string;
  size?: string;
  srcSet?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
  decoding?: "auto" | "sync" | "async";
};

const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  clickable,
  destinationUrl,
  size,
  srcSet,
  sizes,
  loading = "lazy",
  decoding = "async",
}) => {
  const resolvedImageUrl =
    typeof imageUrl === "string" ? imageUrl : imageUrl?.default;
  const resolvedSrcSet =
    srcSet ?? (resolvedImageUrl ? `${resolvedImageUrl} 1x` : undefined);
  const defaultSizes = "(max-width: 600px) 56px, 40px";
  const resolvedSizes = sizes ?? (size ? `${size}` : defaultSizes);

  const handleClick = () => {
    if (clickable && destinationUrl) {
      window.location.href = destinationUrl;
    }
  };

  const avatarStyle = size ? { inlineSize: size, blockSize: size } : undefined;

  if (resolvedImageUrl) {
    return (
      <img
        src={resolvedImageUrl}
        srcSet={resolvedSrcSet}
        sizes={resolvedSizes}
        alt={name || "Avatar"}
        className={styles.avatarImage}
        onClick={clickable ? handleClick : undefined}
        style={avatarStyle}
        loading={loading}
        decoding={decoding}
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
