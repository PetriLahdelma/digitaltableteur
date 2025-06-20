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
