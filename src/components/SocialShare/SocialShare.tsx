// components/SocialShare.tsx
import React from "react";
import styles from "./SocialShare.module.css";
import {
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaReddit,
  FaWhatsapp,
  FaLink,
} from "react-icons/fa";
import Button from "../Button/Button";

interface SocialShareProps {
  url: string;
  title: string;
}

export const SocialShare = ({ url, title }: SocialShareProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    alert("Link copied!");
  };

  return (
    <div className={styles.socialShare}>
      <a
        href="https://www.instagram.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Instagram"
      >
        {FaInstagram({})}
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Twitter"
      >
        {FaTwitter({})}
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
      >
        {FaFacebook({})}
      </a>
      <a
        href={`https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Reddit"
      >
        {FaReddit({})}
      </a>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
      >
        {FaWhatsapp({})}
      </a>
      <Button
        variant="secondary"
        icon={FaLink({})}
        className={styles["copy-button"]}
        onClick={handleCopy}
        aria-label="Copy link to clipboard"
      >
        Copy link to clipboard
      </Button>
    </div>
  );
};
