import React, { useState, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import Button from "@dt/Button";
import AdaptiveLoadingButton from "@dt/AdaptiveLoadingButton";
import Text from "@dt/Text";
import Title from "@dt/Title";
import Modal from "@dt/Modal";
import Inputs from "@dt/Inputs";
import styles from "./NewsletterWaitlist.module.css";

export interface NewsletterWaitlistProps {
  /** Optional class name for styling extension */
  className?: string;
  /** Callback when email is successfully submitted */
  onSuccess?: (email: string) => void;
  /** Callback when submission fails */
  onError?: (error: Error) => void;
  /** Disable the component */
  disabled?: boolean;
}

/** Newsletter waitlist signup with expandable email field. */
const NewsletterWaitlist: React.FC<NewsletterWaitlistProps> = ({
  className,
  onSuccess,
  onError,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"button" | "input">("button");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleTransform = () => {
    setMode("input");
  };

  const handleCancel = () => {
    setMode("button");
    setEmail("");
    setValidationError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setValidationError(t("newsletterWaitlist.validation.required"));
      return;
    }

    if (!validateEmail(email)) {
      setValidationError(t("newsletterWaitlist.validation.invalid"));
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/save-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          type: "newsletter",
          source: "waitlist",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit email");
      }

      setShowSuccessModal(true);
      setEmail("");
      setMode("button");
      onSuccess?.(email);
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      setValidationError(t("newsletterWaitlist.error.submission"));
      onError?.(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  if (mode === "button") {
    return (
      <div className={`${styles.container} ${className || ""}`}>
        <Button
          onClick={handleTransform}
          isDisabled={disabled}
          variant="primary"
          size="l"
          className={styles.triggerButton}
        >
          {t("newsletterWaitlist.trigger")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={`${styles.container} ${className || ""}`}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.content}>
            <Title level={2} size="M" className={styles.title}>
              {t("newsletterWaitlist.title")}
            </Title>
            <Text size="S" className={styles.promise}>
              {t("newsletterWaitlist.promise")}
            </Text>
          </div>

          <Inputs
            label={t("newsletterWaitlist.inputLabel")}
            type="email"
            value={email}
            onChange={(value) => {
              setEmail(String(value));
              setValidationError(null);
            }}
            disabled={disabled || isSubmitting}
            placeholder={t("newsletterWaitlist.placeholder")}
            error={validationError || undefined}
          />

          <div className={styles.actions}>
            <Button
              type="button"
              onClick={handleCancel}
              isDisabled={disabled || isSubmitting}
              variant="secondary"
            >
              {t("newsletterWaitlist.cancel")}
            </Button>
            <AdaptiveLoadingButton
              type="submit"
              isDisabled={disabled || isSubmitting || !email.trim()}
              variant="primary"
              loading={isSubmitting}
              loadingLabelKey="newsletterWaitlist.submitting"
            >
              {t("newsletterWaitlist.submit")}
            </AdaptiveLoadingButton>
          </div>
        </form>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        title={t("newsletterWaitlist.success.title")}
      >
        <div className={styles.successContent}>
          <Text>{t("newsletterWaitlist.success.message")}</Text>
          <Button onClick={handleCloseModal} variant="primary">
            {t("newsletterWaitlist.success.close")}
          </Button>
        </div>
      </Modal>
    </>
  );
};

NewsletterWaitlist.displayName = "NewsletterWaitlist";

export default NewsletterWaitlist;
