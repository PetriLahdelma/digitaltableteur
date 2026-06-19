import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@dt/Modal";
import Button from "@dt/Button";
import Text from "@dt/Text";
import styles from "./SecureCVDownload.module.css";
import { Inputs } from "..";
import Input from "@dt/Inputs";
import BusyIndicator from "@dt/BusyIndicator";

export interface SecureCVDownloadProps {
  /** Button text to trigger the modal */
  buttonText?: string;
  /** Button variant */
  buttonVariant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "error"
    | "warning"
    | "success"
    | "info";
  /** Make the trigger button use inverse styling (white text/border) */
  inverse?: boolean;
}

/**
 * SecureCVDownload component.
 */
export const SecureCVDownload: React.FC<SecureCVDownloadProps> = ({
  buttonText,
  buttonVariant = "primary",
  inverse = false,
}) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const validatePassword = async (passwordValue: string) => {
    if (!passwordValue.trim()) {
      setIsValidPassword(false);
      setError("");
      return;
    }

    setIsValidating(true);
    setError("");

    try {
      const res = await fetch(
        "https://digitaltableteursecureproxy.vercel.app/api/download-cv",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: passwordValue }),
        },
      );

      if (res.ok) {
        setIsValidPassword(true);
        setError("");
      } else {
        setIsValidPassword(false);
        const errorData = await res.json();
        setError(errorData.error || t("downloadResumeErrorIncorrect"));
      }
    } catch (err) {
      setIsValidPassword(false);
      setError(t("downloadResumeErrorValidation"));
    } finally {
      setIsValidating(false);
    }
  };

  const handlePasswordChange = (value: string | number) => {
    const passwordValue = String(value);
    setPassword(passwordValue);

    // Clear previous timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Debounce validation to avoid too many API calls
    validationTimeoutRef.current = setTimeout(() => {
      validatePassword(passwordValue);
    }, 500);
  };

  const handleDownload = async () => {
    if (!password.trim() || !isValidPassword) {
      setError(t("downloadResumeErrorInvalidPassword"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://digitaltableteursecureproxy.vercel.app/api/download-cv",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || t("downloadResumeErrorIncorrect"));
        setLoading(false);
        return;
      }

      // Download file
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "CV.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      // Reset and close modal
      setPassword("");
      setError("");
      setIsValidPassword(false);
      setShowModal(false);
    } catch (err) {
      setError(t("downloadResumeErrorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setPassword("");
    setError("");
    setLoading(false);
    setIsValidPassword(false);
    setIsValidating(false);

    // Clear any pending validation
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && isValidPassword) {
      handleDownload();
    }
  };

  return (
    <>
      <Button
        variant={
          buttonVariant === "secondary" || buttonVariant === "tertiary"
            ? buttonVariant
            : "primary"
        }
        tone={
          buttonVariant === "error" ||
          buttonVariant === "warning" ||
          buttonVariant === "success" ||
          buttonVariant === "info"
            ? buttonVariant
            : undefined
        }
        surface={inverse ? "onDark" : "default"}
        onClick={() => setShowModal(true)}
      >
        {buttonText || t("downloadResumeButton")}
      </Button>

      <Modal
        severity="info"
        isOpen={showModal}
        title={t("downloadResumeModalTitle")}
        onClose={handleClose}
        showCloseIcon={true}
        footer={
          <div className={styles.modalFooter}>
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              {t("downloadResumeCancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleDownload}
              disabled={loading || !isValidPassword}
            >
              {loading
                ? t("downloadResumeDownloading")
                : t("downloadResumeDownload")}
            </Button>
          </div>
        }
      >
        <div className={styles.modalContent}>
          <Text className={styles.description}>
            {t("downloadResumeModalDescription")}
          </Text>
          <div className={styles.inputWrapper}>
            <Input
              type="password"
              label={t("downloadResumePasswordLabel")}
              value={password}
              onChange={handlePasswordChange}
              onKeyPress={handleKeyPress}
              placeholder={t("downloadResumePasswordPlaceholder")}
              disabled={loading}
              autoFocus
              error={error}
            />
            {isValidating && (
              <div className={styles.validationIndicator}>
                <BusyIndicator
                  size="s"
                  label={t("busyIndicator.loading")}
                  className={styles.inlineBusy}
                />
              </div>
            )}
            {isValidPassword && !isValidating && (
              <div className={styles.validationIndicator}>
                <BusyIndicator
                  size="s"
                  label={t("downloadResumeValid", "Valid")}
                  className={styles.inlineSuccess}
                  progress={1}
                />
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SecureCVDownload;
