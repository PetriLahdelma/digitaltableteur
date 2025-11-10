// components/SocialShare.tsx
import React, { useState, useEffect } from "react";
import styles from "./SocialShare.module.css";
import {
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaReddit,
  FaWhatsapp,
  FaShare,
} from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";

import Button from "@dt/Button";
import Toast from "../Toast/Toast";
import { useTranslation } from "react-i18next";

interface SocialShareProps {
  url: string;
  title: string;
}

const isClipboardSupported = () =>
  typeof navigator !== "undefined" &&
  !!navigator.clipboard &&
  typeof navigator.clipboard.writeText === "function";

const fallbackCopy = (value: string): boolean => {
  if (typeof document === "undefined") {
    return false;
  }

  try {
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = value;
    tempTextArea.setAttribute("readonly", "");
    tempTextArea.style.position = "fixed";
    tempTextArea.style.top = "-9999px";
    document.body.appendChild(tempTextArea);

    const selection =
      typeof window !== "undefined" && window.getSelection
        ? window.getSelection()
        : null;
    const originalRange =
      selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    tempTextArea.select();
    tempTextArea.setSelectionRange(0, value.length);

    const success =
      typeof document.execCommand === "function"
        ? document.execCommand("copy")
        : false;

    document.body.removeChild(tempTextArea);

    if (originalRange && selection) {
      selection.removeAllRanges();
      selection.addRange(originalRange);
    }

    return success;
  } catch (error) {
    console.warn("Fallback copy failed", error);
    return false;
  }
};

export const SocialShare = ({ url, title }: SocialShareProps) => {
  const { t } = useTranslation();
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const [toastOpen, setToastOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [supportsNativeShare, setSupportsNativeShare] = useState(false);

  useEffect(() => {
    // Check if matchMedia is available (not in JSDOM/test environment)
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(width < 768px)");
      setIsMobile(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setIsMobile(e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  useEffect(() => {
    // Check if native sharing is supported
    if (typeof window !== "undefined" && "share" in navigator) {
      setSupportsNativeShare(true);
    }
  }, []);

  const handleCopy = async (): Promise<boolean> => {
    try {
      if (isClipboardSupported()) {
        await navigator.clipboard.writeText(url);
        setToastOpen(true);
        return true;
      }
    } catch (error) {
      console.warn("Navigator clipboard failed, falling back to execCommand");
    }

    const fallbackSuccess = fallbackCopy(url);
    if (fallbackSuccess) {
      setToastOpen(true);
    }
    return fallbackSuccess;
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title,
        url,
        text: title,
      });
    } catch (error) {
      // If native share fails or is cancelled, fall back to copy
      console.log("Native share failed, falling back to copy");
      await handleCopy();
    }
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
      {supportsNativeShare ? (
        <Button
          size={isMobile ? "s" : "l"}
          variant="secondary"
          icon={<FaShare role="img" aria-label="Share icon" />}
          className={styles.copyButton}
          onClick={handleNativeShare}
          aria-label={t("share")}
        >
          {!isMobile && (
            <span className={styles.copyButtonText} aria-hidden="true">
              {t("share")}
            </span>
          )}
        </Button>
      ) : (
        <Button
          size={isMobile ? "s" : "l"}
          variant="secondary"
          icon={<MdContentCopy role="img" aria-label="Copy link icon" />}
          className={styles.copyButton}
          onClick={handleCopy}
          aria-label={t("copyLinkToClipboard")}
        >
          {!isMobile && (
            <span className={styles.copyButtonText} aria-hidden="true">
              {t("copyLinkToClipboard")}
            </span>
          )}
        </Button>
      )}
      <Toast
        message={t("linkCopied")}
        open={toastOpen}
        onClose={handleToastClose}
      />
    </div>
  );
};
