"use client";

import React, { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./EmailSignatureGenerator.module.css";
import Title from "@dt/Title";
import Text from "@dt/Text";
import Button from "@dt/Button";
import Modal from "@dt/Modal";
import Toast from "@dt/Toast";
import Icon from "@dt/Icon";

interface SignatureData {
  name: string;
  title: string;
  phone: string;
  twitter: string;
  linkedin: string;
  github: string;
  bluesky: string;
  instagram: string;
  tiktok: string;
}

export interface EmailSignatureGeneratorProps {
  /** Company name for the signature */
  companyName?: string;
  /** Company website URL */
  companyUrl?: string;
  /** Company logo URL for preview (relative path works) */
  logoUrl?: string;
  /** Full URL for the logo in generated HTML signature */
  logoUrlFull?: string;
}

/**
 * EmailSignatureGenerator component.
 */
export const EmailSignatureGenerator: React.FC<EmailSignatureGeneratorProps> = ({
  companyName = "Digitaltableteur",
  companyUrl = "https://digitaltableteur.com",
  logoUrl = "/round.png",
  logoUrlFull = "https://digitaltableteur.com/round.png",
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<SignatureData>({
    name: "",
    title: "",
    phone: "",
    twitter: "",
    linkedin: "",
    github: "",
    bluesky: "",
    instagram: "",
    tiktok: "",
  });

  const [previewDarkMode, setPreviewDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">(
    "success"
  );

  const signatureRef = useRef<HTMLDivElement>(null);

  const handleInputChange = useCallback(
    (field: keyof SignatureData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      },
    []
  );

  const handleClearField = useCallback((field: keyof SignatureData) => {
    setFormData((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const generateSignatureHTML = useCallback((): string => {
    const { name, title, phone, twitter, linkedin, github, bluesky, instagram, tiktok } = formData;

    const linkedinLabel = t("emailSig.linkedinLabel", { defaultValue: "LinkedIn" });
    const githubLabel = t("emailSig.githubLabel", { defaultValue: "GitHub" });
    const twitterLabel = t("emailSig.twitterLabel", { defaultValue: "X" });
    const blueskyLabel = t("emailSig.blueskyLabel", { defaultValue: "Bluesky" });
    const instagramLabel = t("emailSig.instagramLabel", { defaultValue: "Instagram" });
    const tiktokLabel = t("emailSig.tiktokLabel", { defaultValue: "TikTok" });

    const contactParts: string[] = [];
    if (phone) {
      contactParts.push(
        `<a href="tel:${phone.replace(/\s/g, "")}" style="color: var(--color-text); text-decoration: none;">${phone}</a>`
      );
    }
    if (linkedin) {
      const username = linkedin.startsWith("@") ? linkedin.slice(1) : linkedin;
      contactParts.push(
        `<a href="https://linkedin.com/in/${username}" style="color: var(--color-text); text-decoration: none;">${linkedinLabel}</a>`
      );
    }
    if (github) {
      const username = github.startsWith("@") ? github.slice(1) : github;
      contactParts.push(
        `<a href="https://github.com/${username}" style="color: var(--color-text); text-decoration: none;">${githubLabel}</a>`
      );
    }
    if (twitter) {
      const username = twitter.startsWith("@") ? twitter.slice(1) : twitter;
      contactParts.push(
        `<a href="https://x.com/${username}" style="color: var(--color-text); text-decoration: none;">${twitterLabel}</a>`
      );
    }
    if (bluesky) {
      const username = bluesky.startsWith("@") ? bluesky.slice(1) : bluesky;
      contactParts.push(
        `<a href="https://bsky.app/profile/${username}" style="color: var(--color-text); text-decoration: none;">${blueskyLabel}</a>`
      );
    }
    if (instagram) {
      const username = instagram.startsWith("@") ? instagram.slice(1) : instagram;
      contactParts.push(
        `<a href="https://instagram.com/${username}" style="color: var(--color-text); text-decoration: none;">${instagramLabel}</a>`
      );
    }
    if (tiktok) {
      const username = tiktok.startsWith("@") ? tiktok.slice(1) : tiktok;
      contactParts.push(
        `<a href="https://tiktok.com/@${username}" style="color: var(--color-text); text-decoration: none;">${tiktokLabel}</a>`
      );
    }

    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.5; color: var(--color-text);">
  <tr>
    <td style="padding-bottom: 12px;">
      <a href="${companyUrl}" style="text-decoration: none;">
        <img src="${logoUrlFull}" alt="${companyName}" width="48" height="48" style="display: block; border: 0; border-radius: 8px;" />
      </a>
    </td>
  </tr>
  <tr>
    <td>
      <strong style="font-size: 16px; color: var(--color-text);">${name || t("emailSig.yourName", { defaultValue: "Your Name" })}</strong>
    </td>
  </tr>
  <tr>
    <td style="color: var(--color-text); padding-top: 2px;">
      ${title ? `${title}, ` : ""}${companyName}
    </td>
  </tr>
  ${
    contactParts.length > 0
      ? `<tr>
    <td style="padding-top: 8px; color: var(--color-text);">
      ${contactParts.join(" · ")}
    </td>
  </tr>`
      : ""
  }
</table>`;
  }, [formData, companyName, companyUrl, logoUrlFull, t]);

  const handleCopySignature = useCallback(async () => {
    const html = generateSignatureHTML();

    try {
      // Try to copy as rich HTML for email clients
      if (navigator.clipboard && window.ClipboardItem) {
        const blob = new Blob([html], { type: "text/html" });
        const item = new ClipboardItem({ "text/html": blob });
        await navigator.clipboard.write([item]);
      } else {
        // Fallback: copy as plain HTML text
        await navigator.clipboard.writeText(html);
      }
      setToastMessage(t("emailSig.copiedSuccess"));
      setToastSeverity("success");
    } catch {
      setToastMessage(t("emailSig.copiedError"));
      setToastSeverity("error");
    }
    setToastOpen(true);
  }, [generateSignatureHTML, t]);

  const renderPreview = () => {
    const { name, title, phone, twitter, linkedin, github, bluesky, instagram, tiktok } = formData;

    const contactParts: React.ReactNode[] = [];
    if (phone) {
      contactParts.push(
        <a
          key="phone"
          href={`tel:${phone.replace(/\s/g, "")}`}
          className={styles.contactLink}
        >
          {phone}
        </a>
      );
    }
    if (linkedin) {
      const username = linkedin.startsWith("@") ? linkedin.slice(1) : linkedin;
      contactParts.push(
        <a
          key="linkedin"
          href={`https://linkedin.com/in/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactLink}
        >
          {t("emailSig.linkedinLabel", { defaultValue: "LinkedIn" })}
        </a>
      );
    }
    if (github) {
      const username = github.startsWith("@") ? github.slice(1) : github;
      contactParts.push(
        <a
          key="github"
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactLink}
        >
          {t("emailSig.githubLabel", { defaultValue: "GitHub" })}
        </a>
      );
    }
    if (twitter) {
      const username = twitter.startsWith("@") ? twitter.slice(1) : twitter;
      contactParts.push(
        <a
          key="twitter"
          href={`https://x.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactLink}
        >
          {t("emailSig.twitterLabel", { defaultValue: "X" })}
        </a>
      );
    }
    if (bluesky) {
      const username = bluesky.startsWith("@") ? bluesky.slice(1) : bluesky;
      contactParts.push(
        <a
          key="bluesky"
          href={`https://bsky.app/profile/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactLink}
        >
          {t("emailSig.blueskyLabel", { defaultValue: "Bluesky" })}
        </a>
      );
    }
    if (instagram) {
      const username = instagram.startsWith("@") ? instagram.slice(1) : instagram;
      contactParts.push(
        <a
          key="instagram"
          href={`https://instagram.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactLink}
        >
          {t("emailSig.instagramLabel", { defaultValue: "Instagram" })}
        </a>
      );
    }
    if (tiktok) {
      const username = tiktok.startsWith("@") ? tiktok.slice(1) : tiktok;
      contactParts.push(
        <a
          key="tiktok"
          href={`https://tiktok.com/@${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactLink}
        >
          {t("emailSig.tiktokLabel", { defaultValue: "TikTok" })}
        </a>
      );
    }

    return (
      <div
        ref={signatureRef}
        className={`${styles.signaturePreview} ${previewDarkMode ? styles.dark : ""}`}
      >
        <a href={companyUrl} className={styles.logoLink}>
          <img
            src={logoUrl}
            alt={companyName}
            width={48}
            height={48}
            className={styles.logo}
          />
        </a>
        <div className={styles.signatureName}>
          {name || t("emailSig.yourName", { defaultValue: "John Doe" })}
        </div>
        <div className={styles.signatureTitle}>
          {title && `${title}, `}
          {companyName}
        </div>
        {contactParts.length > 0 && (
          <div className={styles.signatureContact}>
            {contactParts.map((part, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className={styles.bullet}>·</span>}
                {part}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <Title level={1} size="m" terminals="sans" className={styles.title}>
            {t("emailSig.title", {
              defaultValue: `Create your ${companyName} email signature`,
            })}
          </Title>
          <Text as="p" size="m" className={styles.subtitle}>
            {t("emailSig.subtitle", {
              defaultValue: "Fill in your details and copy it to your email client",
            })}
          </Text>
        </header>

        {/* Form Grid - 2 columns */}
        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange("name")}
                placeholder={t("emailSig.namePlaceholder", {
                  defaultValue: "Name",
                })}
                className={styles.input}
              />
              {formData.name && (
                <button
                  type="button"
                  onClick={() => handleClearField("name")}
                  className={styles.clearButton}
                  aria-label={t("emailSig.clearField", {
                    defaultValue: "Clear field",
                  })}
                >
                  <Icon name="x" size={16} decorative />
                </button>
              )}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange("title")}
                placeholder={t("emailSig.titlePlaceholder", {
                  defaultValue: "Position",
                })}
                className={styles.input}
              />
              {formData.title && (
                <button
                  type="button"
                  onClick={() => handleClearField("title")}
                  className={styles.clearButton}
                  aria-label={t("emailSig.clearField", {
                    defaultValue: "Clear field",
                  })}
                >
                  <Icon name="x" size={16} decorative />
                </button>
              )}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange("phone")}
                placeholder={t("emailSig.phonePlaceholder", {
                  defaultValue: "Phone nr (optional)",
                })}
                className={styles.input}
              />
              {formData.phone && (
                <button
                  type="button"
                  onClick={() => handleClearField("phone")}
                  className={styles.clearButton}
                  aria-label={t("emailSig.clearField", {
                    defaultValue: "Clear field",
                  })}
                >
                  <Icon name="x" size={16} decorative />
                </button>
              )}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <input
                id="linkedin"
                type="text"
                value={formData.linkedin}
                onChange={handleInputChange("linkedin")}
                placeholder={t("emailSig.linkedinPlaceholder", {
                  defaultValue: "LinkedIn username",
                })}
                className={styles.input}
              />
              {formData.linkedin && (
                <button
                  type="button"
                  onClick={() => handleClearField("linkedin")}
                  className={styles.clearButton}
                  aria-label={t("emailSig.clearField", {
                    defaultValue: "Clear field",
                  })}
                >
                  <Icon name="x" size={16} decorative />
                </button>
              )}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <input
                id="github"
                type="text"
                value={formData.github}
                onChange={handleInputChange("github")}
                placeholder={t("emailSig.githubPlaceholder", {
                  defaultValue: "GitHub username",
                })}
                className={styles.input}
              />
              {formData.github && (
                <button
                  type="button"
                  onClick={() => handleClearField("github")}
                  className={styles.clearButton}
                  aria-label={t("emailSig.clearField", {
                    defaultValue: "Clear field",
                  })}
                >
                  <Icon name="x" size={16} decorative />
                </button>
              )}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <input
                id="twitter"
                type="text"
                value={formData.twitter}
                onChange={handleInputChange("twitter")}
                placeholder={t("emailSig.twitterPlaceholder", {
                  defaultValue: "@ Twitter/X handle",
                })}
                className={styles.input}
              />
              {formData.twitter && (
                <button
                  type="button"
                  onClick={() => handleClearField("twitter")}
                  className={styles.clearButton}
                  aria-label={t("emailSig.clearField", {
                    defaultValue: "Clear field",
                  })}
                >
                  <Icon name="x" size={16} decorative />
                </button>
              )}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <input
                id="bluesky"
                type="text"
                value={formData.bluesky}
                onChange={handleInputChange("bluesky")}
                placeholder={t("emailSig.blueskyPlaceholder", {
                  defaultValue: "@ Bluesky handle",
                })}
                className={styles.input}
              />
              {formData.bluesky && (
                <button
                  type="button"
                  onClick={() => handleClearField("bluesky")}
                  className={styles.clearButton}
                  aria-label={t("emailSig.clearField", {
                    defaultValue: "Clear field",
                  })}
                >
                  <Icon name="x" size={16} decorative />
                </button>
              )}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <input
                id="instagram"
                type="text"
                value={formData.instagram}
                onChange={handleInputChange("instagram")}
                placeholder={t("emailSig.instagramPlaceholder", {
                  defaultValue: "@ Instagram handle",
                })}
                className={styles.input}
              />
              {formData.instagram && (
                <button
                  type="button"
                  onClick={() => handleClearField("instagram")}
                  className={styles.clearButton}
                  aria-label={t("emailSig.clearField", {
                    defaultValue: "Clear field",
                  })}
                >
                  <Icon name="x" size={16} decorative />
                </button>
              )}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <input
                id="tiktok"
                type="text"
                value={formData.tiktok}
                onChange={handleInputChange("tiktok")}
                placeholder={t("emailSig.tiktokPlaceholder", {
                  defaultValue: "@ TikTok handle",
                })}
                className={styles.input}
              />
              {formData.tiktok && (
                <button
                  type="button"
                  onClick={() => handleClearField("tiktok")}
                  className={styles.clearButton}
                  aria-label={t("emailSig.clearField", {
                    defaultValue: "Clear field",
                  })}
                >
                  <Icon name="x" size={16} decorative />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className={styles.previewSection}>
          <div className={styles.previewCard}>
            {renderPreview()}
            <div className={styles.themeToggleGroup}>
              <button
                type="button"
                onClick={() => setPreviewDarkMode(false)}
                className={`${styles.themeToggleButton} ${!previewDarkMode ? styles.active : ""}`}
                aria-label={t("emailSig.switchToLight", {
                  defaultValue: "Light mode",
                })}
                aria-pressed={!previewDarkMode}
              >
                <Icon name="sun" size={16} decorative />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDarkMode(true)}
                className={`${styles.themeToggleButton} ${previewDarkMode ? styles.active : ""}`}
                aria-label={t("emailSig.switchToDark", {
                  defaultValue: "Dark mode",
                })}
                aria-pressed={previewDarkMode}
              >
                <Icon name="moon" size={16} decorative />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button
            variant="primary"
            onClick={handleCopySignature}
            className={styles.copyButton}
          >
            {t("emailSig.copyButton", { defaultValue: "Copy Signature" })}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsModalOpen(true)}
            className={styles.importButton}
          >
            {t("emailSig.howToImport", { defaultValue: "How to import?" })}
          </Button>
        </div>

        {/* Back to site link */}
        <div className={styles.backLink}>
          <a href={companyUrl} className={styles.backLinkAnchor}>
            {t("emailSig.backToSite", { defaultValue: "Back to site" })}
          </a>
        </div>
      </div>

      {/* How to Import Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t("emailSig.modalTitle", {
          defaultValue: "How to Import Your Signature",
        })}
        titleTerminals="sans"
        footer={
          <Button variant="primary" onClick={() => setIsModalOpen(false)}>
            {t("emailSig.modalClose", { defaultValue: "Got it" })}
          </Button>
        }
      >
        <div className={styles.modalContent}>
          <div className={styles.instructionBlock}>
            <Title level={3} size="s" terminals="sans">
              {t("emailSig.gmailTitle", { defaultValue: "Gmail" })}
            </Title>
            <ol className={styles.instructionList}>
              <li>
                {t("emailSig.gmailStep1", {
                  defaultValue: "Open Gmail and click the gear icon (Settings)",
                })}
              </li>
              <li>
                {t("emailSig.gmailStep2", {
                  defaultValue: 'Click "See all settings"',
                })}
              </li>
              <li>
                {t("emailSig.gmailStep3", {
                  defaultValue: 'Scroll down to "Signature" section',
                })}
              </li>
              <li>
                {t("emailSig.gmailStep4", {
                  defaultValue: "Create a new signature or edit existing one",
                })}
              </li>
              <li>
                {t("emailSig.gmailStep5", {
                  defaultValue: "Paste your copied signature and save",
                })}
              </li>
            </ol>
          </div>

          <div className={styles.instructionBlock}>
            <Title level={3} size="s" terminals="sans">
              {t("emailSig.macMailTitle", { defaultValue: "macOS Mail" })}
            </Title>
            <ol className={styles.instructionList}>
              <li>
                {t("emailSig.macMailStep1", {
                  defaultValue:
                    "Open Mail and go to Mail > Settings (or Preferences)",
                })}
              </li>
              <li>
                {t("emailSig.macMailStep2", {
                  defaultValue: 'Click the "Signatures" tab',
                })}
              </li>
              <li>
                {t("emailSig.macMailStep3", {
                  defaultValue: "Create a new signature with the + button",
                })}
              </li>
              <li>
                {t("emailSig.macMailStep4", {
                  defaultValue: "Paste your copied signature into the editor",
                })}
              </li>
            </ol>
          </div>

          <div className={styles.instructionBlock}>
            <Title level={3} size="s" terminals="sans">
              {t("emailSig.iosMailTitle", { defaultValue: "iOS Mail" })}
            </Title>
            <ol className={styles.instructionList}>
              <li>
                {t("emailSig.iosMailStep1", {
                  defaultValue: "Open Settings > Mail > Signature",
                })}
              </li>
              <li>
                {t("emailSig.iosMailStep2", {
                  defaultValue: 'Tap "All Accounts" or select specific account',
                })}
              </li>
              <li>
                {t("emailSig.iosMailStep3", {
                  defaultValue:
                    "Delete existing text and paste your signature",
                })}
              </li>
              <li>
                {t("emailSig.iosMailStep4", {
                  defaultValue: "Note: iOS may simplify formatting",
                })}
              </li>
            </ol>
          </div>

          <div className={styles.instructionBlock}>
            <Title level={3} size="s" terminals="sans">
              {t("emailSig.imageTipsTitle", { defaultValue: "Image Tips" })}
            </Title>
            <ul className={styles.tipsList}>
              <li>
                {t("emailSig.imageTip1", {
                  defaultValue:
                    "Images are hosted externally for best compatibility across email clients",
                })}
              </li>
              <li>
                {t("emailSig.imageTip2", {
                  defaultValue:
                    "Some recipients may need to click \"Show images\" to see the logo",
                })}
              </li>
              <li>
                {t("emailSig.imageTip3", {
                  defaultValue:
                    "Gmail may re-host images automatically — this is normal",
                })}
              </li>
              <li>
                {t("emailSig.imageTip4", {
                  defaultValue:
                    "Outlook users: If layout breaks, try pasting as \"Keep Source Formatting\"",
                })}
              </li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      <Toast
        open={toastOpen}
        message={toastMessage}
        tone={toastSeverity}
        position="bottom-center"
        duration={3000}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
};

export default EmailSignatureGenerator;
