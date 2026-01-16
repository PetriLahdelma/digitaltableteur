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
}

interface EmailSignatureGeneratorProps {
  /** Company name for the signature */
  companyName?: string;
  /** Company website URL */
  companyUrl?: string;
  /** Company logo URL for preview (relative path works) */
  logoUrl?: string;
  /** Full URL for the logo in generated HTML signature */
  logoUrlFull?: string;
}

const EmailSignatureGenerator: React.FC<EmailSignatureGeneratorProps> = ({
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
    const { name, title, phone, twitter } = formData;

    const contactParts: string[] = [];
    if (phone) {
      contactParts.push(
        `<a href="tel:${phone.replace(/\s/g, "")}" style="color: #6b7280; text-decoration: none;">${phone}</a>`
      );
    }
    if (twitter) {
      const handle = twitter.startsWith("@") ? twitter : `@${twitter}`;
      const username = twitter.startsWith("@") ? twitter.slice(1) : twitter;
      contactParts.push(
        `<a href="https://x.com/${username}" style="color: #6b7280; text-decoration: none;">${handle}</a>`
      );
    }

    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #374151;">
  <tr>
    <td style="padding-bottom: 12px;">
      <a href="${companyUrl}" style="text-decoration: none;">
        <img src="${logoUrlFull}" alt="${companyName}" width="48" height="48" style="display: block; border: 0; border-radius: 8px;" />
      </a>
    </td>
  </tr>
  <tr>
    <td>
      <strong style="font-size: 16px; color: #111827;">${name || "Your Name"}</strong>
    </td>
  </tr>
  <tr>
    <td style="color: #6b7280; padding-top: 2px;">
      ${title ? `${title}, ` : ""}${companyName}
    </td>
  </tr>
  ${
    contactParts.length > 0
      ? `<tr>
    <td style="padding-top: 8px; color: #6b7280;">
      ${contactParts.join(" · ")}
    </td>
  </tr>`
      : ""
  }
</table>`;
  }, [formData, companyName, companyUrl, logoUrlFull]);

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
    const { name, title, phone, twitter } = formData;

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
    if (twitter) {
      const handle = twitter.startsWith("@") ? twitter : `@${twitter}`;
      const username = twitter.startsWith("@") ? twitter.slice(1) : twitter;
      contactParts.push(
        <a
          key="twitter"
          href={`https://x.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactLink}
        >
          {handle}
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
          <Title level={1} size="M" terminals="sans" className={styles.title}>
            {t("emailSig.title", {
              defaultValue: `Create your ${companyName} email signature`,
            })}
          </Title>
          <Text as="p" size="M" className={styles.subtitle}>
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
                id="twitter"
                type="text"
                value={formData.twitter}
                onChange={handleInputChange("twitter")}
                placeholder={t("emailSig.twitterPlaceholder", {
                  defaultValue: "@ Twitter handle",
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
            <Title level={3} size="S" terminals="sans">
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
            <Title level={3} size="S" terminals="sans">
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
            <Title level={3} size="S" terminals="sans">
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
        </div>
      </Modal>

      {/* Toast Notification */}
      <Toast
        isOpen={toastOpen}
        message={toastMessage}
        severity={toastSeverity}
        position="bottom-center"
        duration={3000}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
};

export default EmailSignatureGenerator;
