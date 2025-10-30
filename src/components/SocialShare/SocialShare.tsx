// components/SocialShare.tsx
import React, { useState } from "react";
import styles from "./SocialShare.module.css";
import {
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaReddit,
  FaWhatsapp,
} from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";

import Button from "@dt/Button";
import Toast from "../Toast/Toast";
import { useTranslation } from "react-i18next";

interface SocialShareProps {
  url: string;
  title: string;
}

export const SocialShare = ({ url, title }: SocialShareProps) => {
  const { t } = useTranslation();
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
        aria-label={t("shareOnInstagram")}
      >
        <FaInstagram role="img" aria-label="Instagram icon" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("shareOnTwitter")}
      >
        <FaTwitter role="img" aria-label="Twitter icon" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("shareOnFacebook")}
      >
        <FaFacebook role="img" aria-label="Facebook icon" />
      </a>
      <a
        href={`https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("shareOnReddit")}
      >
        <FaReddit role="img" aria-label="Reddit icon" />
      </a>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("shareOnWhatsapp")}
      >
        <FaWhatsapp role="img" aria-label="WhatsApp icon" />
      </a>
      <Button
        size="l"
        variant="secondary"
        icon={<MdContentCopy role="img" aria-label="Copy link icon" />}
        className={styles.copyButton}
        onClick={handleCopy}
        aria-label={t("copyLinkToClipboard")}
      >
        <span className={styles.copyButtonText} aria-hidden="true">
          {t("copyLinkToClipboard")}
        </span>
      </Button>
      <Toast
        message={t("linkCopied")}
        open={toastOpen}
        onClose={handleToastClose}
      />
    </div>
  );
};
