"use client";

import React, { useState, useEffect, useMemo } from "react";
import styles from "./SocialShare.module.css";
import Button from "@dt/Button";
import Toast from "@dt/Toast/Toast";
import { useTranslation } from "react-i18next";
import Icon from "@dt/Icon";
import Text from "@dt/Text";

export type SocialShareChannel =
  | "linkedin"
  | "twitter"
  | "facebook"
  | "reddit"
  | "whatsapp"
  | "instagram";

export type SocialShareVariant = "inline" | "article";

export interface SocialShareProps {
  url: string;
  title: string;
  /** Ordered list of network share targets. Defaults to all supported channels. */
  channels?: SocialShareChannel[];
  /** `article` adds a labelled section suited to blog post footers. */
  variant?: SocialShareVariant;
  showHeading?: boolean;
  heading?: string;
}

const DEFAULT_CHANNELS: SocialShareChannel[] = [
  "linkedin",
  "twitter",
  "facebook",
  "reddit",
  "whatsapp",
  "instagram",
];

const CHANNEL_META: Record<
  SocialShareChannel,
  {
    icon: string;
    labelKey: string;
    buildHref: (encodedUrl: string, encodedTitle: string) => string;
    /** Profile links open without share params */
    isProfile?: boolean;
  }
> = {
  linkedin: {
    icon: "linkedin-logo",
    labelKey: "shareLinkedIn",
    buildHref: (encodedUrl) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  },
  twitter: {
    icon: "twitter-logo",
    labelKey: "shareOnTwitter",
    buildHref: (encodedUrl, encodedTitle) =>
      `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
  },
  facebook: {
    icon: "facebook-logo",
    labelKey: "shareOnFacebook",
    buildHref: (encodedUrl) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  },
  reddit: {
    icon: "reddit-logo",
    labelKey: "shareOnReddit",
    buildHref: (encodedUrl, encodedTitle) =>
      `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
  },
  whatsapp: {
    icon: "whatsapp-logo",
    labelKey: "shareOnWhatsapp",
    buildHref: (encodedUrl, encodedTitle) =>
      `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  },
  instagram: {
    icon: "instagram-logo",
    labelKey: "shareOnInstagram",
    buildHref: () => "https://www.instagram.com/digitaltableteur/",
    isProfile: true,
  },
};

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

/** Multi-channel share row with native share / copy fallback. */
export const SocialShare = ({
  url,
  title,
  channels = DEFAULT_CHANNELS,
  variant = "inline",
  showHeading = false,
  heading,
}: SocialShareProps) => {
  const { t } = useTranslation();
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const [toastOpen, setToastOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [supportsNativeShare, setSupportsNativeShare] = useState(false);

  const resolvedChannels = useMemo(
    () => channels.filter((channel) => CHANNEL_META[channel]),
    [channels],
  );

  useEffect(() => {
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
    } catch {
      await handleCopy();
    }
  };

  const rootClassName = [
    styles.socialShare,
    variant === "article" ? styles.article : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={rootClassName}
      aria-label={heading ?? t("shareHeading")}
    >
      {(showHeading || variant === "article") && (
        <Text as="p" className={styles.heading}>
          {heading ?? t("shareHeading")}
        </Text>
      )}

      <div className={styles.actions} role="group" aria-label={t("share")}>
        {resolvedChannels.map((channel) => {
          const meta = CHANNEL_META[channel];
          const href = meta.buildHref(encodedUrl, encodedTitle);
          return (
            <a
              key={channel}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.channelLink}
              aria-label={t(meta.labelKey)}
              {...(meta.isProfile ? { "aria-describedby": undefined } : {})}
            >
              <Icon name={meta.icon} ariaLabel={t(meta.labelKey)} />
            </a>
          );
        })}

        {supportsNativeShare ? (
          <Button
            size={isMobile ? "sm" : "lg"}
            variant="secondary"
            icon={<Icon name="share-network" ariaLabel={t("share")} />}
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
            size={isMobile ? "sm" : "lg"}
            variant="secondary"
            icon={
              <Icon name="copy-simple" ariaLabel={t("copyLinkToClipboard")} />
            }
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
      </div>

      <Toast
        message={t("linkCopied")}
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
      />
    </section>
  );
};
