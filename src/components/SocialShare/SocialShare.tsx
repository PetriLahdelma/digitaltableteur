// components/SocialShare.tsx
import React, { useState } from "react";
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
import Toast from "../Toast/Toast";

interface SocialShareProps {
  url: string;
  title: string;
}

export const SocialShare = ({ url, title }: SocialShareProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const [toastOpen, setToastOpen] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setToastOpen(true);
  };

  const handleToastClose = () => {
    setToastOpen(false);
  };

  return (
    <div className={styles.socialShare}>
      <a
        href="https://www.instagram.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Instagram"
      >
        <FaInstagram role="img" aria-label="Instagram icon" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Twitter"
      >
        <FaTwitter role="img" aria-label="Twitter icon" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
      >
        <FaFacebook role="img" aria-label="Facebook icon" />
      </a>
      <a
        href={`https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Reddit"
      >
        <FaReddit role="img" aria-label="Reddit icon" />
      </a>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
      >
        <FaWhatsapp role="img" aria-label="WhatsApp icon" />
      </a>
      <Button
        variant="secondary"
        icon={<FaLink role="img" aria-label="Copy link icon" />}
        className={styles.copyButton}
        onClick={handleCopy}
        aria-label="Copy link to clipboard"
      >
        Copy link to clipboard
      </Button>
      <Toast
        message="Link copied!"
        open={toastOpen}
        onClose={handleToastClose}
      />
    </div>
  );
};
