import React, { useEffect, useReducer, useState } from "react";
import { send } from "@emailjs/browser";
import styles from "./ContactForm.module.css";
import Inputs from "@dt/Inputs";
import Button from "@dt/Button";
import CheckboxGroup from "@dt/CheckboxGroup";
import Modal from "@dt/Modal";
import TextArea from "@dt/Inputs/TextArea";
import Select from "@dt/Select";
import FileUpload from "@dt/FileUpload";
import BusyIndicator from "@dt/BusyIndicator";
import { useTranslation } from "react-i18next";

const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
const EMAIL_ATTACHMENT_LIMIT_BYTES = 35 * 1024;
const ACCEPTED_ATTACHMENT_TYPES = ".pdf,.png,.jpg,.jpeg";

const getInitialFormState = () => ({
  fullName: "",
  email: "",
  phone: "",
  interest: "",
  message: "",
  hearAbout: "",
  honeypot: "",
});

const getInitialErrorState = () => ({
  email: "",
  fullName: "",
  message: "",
});

type FormState = ReturnType<typeof getInitialFormState>;

type FormAction =
  | { type: "UPDATE_FIELD"; payload: { field: keyof FormState; value: string } }
  | { type: "RESET" };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.payload.field]: action.payload.value };
    case "RESET":
      return getInitialFormState();
    default:
      return state;
  }
};

const ContactForm = () => {
  const { t } = useTranslation();
  const [formData, dispatchForm] = useReducer(
    formReducer,
    undefined,
    getInitialFormState,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [formErrors, setFormErrors] = useState(getInitialErrorState);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentDataUrl, setAttachmentDataUrl] = useState<string | null>(
    null,
  );
  const [attachmentError, setAttachmentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resetFormState = () => {
    dispatchForm({ type: "RESET" });
    setAttachmentFile(null);
    setAttachmentDataUrl(null);
    setAttachmentError("");
    setFormErrors(getInitialErrorState());
  };
  const handleClearForm = () => {
    resetFormState();
  };
  const attachmentSizeValue = (MAX_ATTACHMENT_BYTES / (1024 * 1024)).toFixed(0);
  const emailAttachmentLimitValue = Math.floor(
    EMAIL_ATTACHMENT_LIMIT_BYTES / 1024,
  );
  const isAttachmentTooLargeForEmail =
    !!attachmentFile && attachmentFile.size > EMAIL_ATTACHMENT_LIMIT_BYTES;
  const emailAttachmentLimitLabel = t("contactAttachmentEmailLimitLabel", {
    size: emailAttachmentLimitValue,
  });
  const attachmentEmailNotice = isAttachmentTooLargeForEmail
    ? t("contactAttachmentEmailLimitReached", {
        size: emailAttachmentLimitLabel,
      })
    : "";

  const handleFullNameChange = (value: string | number) => {
    dispatchForm({
      type: "UPDATE_FIELD",
      payload: { field: "fullName", value: String(value) },
    });
  };

  const handleEmailChange = (value: string | number) => {
    dispatchForm({
      type: "UPDATE_FIELD",
      payload: { field: "email", value: String(value) },
    });
  };

  const handlePhoneChange = (value: string | number) => {
    dispatchForm({
      type: "UPDATE_FIELD",
      payload: { field: "phone", value: String(value) },
    });
  };

  const handleMessageChange = (value: string | number) => {
    dispatchForm({
      type: "UPDATE_FIELD",
      payload: { field: "message", value: String(value) },
    });
  };

  const handleInterestChange = (selectedOptions: string[]) => {
    dispatchForm({
      type: "UPDATE_FIELD",
      payload: { field: "interest", value: selectedOptions.join(", ") },
    });
  };

  const handleHearAboutChange = (value: string) => {
    dispatchForm({
      type: "UPDATE_FIELD",
      payload: { field: "hearAbout", value },
    });
  };

  const handleHoneypotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchForm({
      type: "UPDATE_FIELD",
      payload: { field: "honeypot", value: event.target.value },
    });
  };

  const handleAttachmentChange = (file: File | null) => {
    setAttachmentError("");
    setAttachmentFile(file);
    setAttachmentDataUrl(null);
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAttachmentDataUrl(reader.result);
      } else {
        setAttachmentError(t("contactAttachmentReadError"));
        setAttachmentFile(null);
      }
    };
    reader.onerror = () => {
      setAttachmentError(t("contactAttachmentReadError"));
      setAttachmentFile(null);
    };
    reader.readAsDataURL(file);
  };

  const env =
    typeof import.meta !== "undefined" ? (import.meta as any).env : undefined;

  const SERVICE_ID =
    env?.VITE_EMAIL_SERVICE_ID ||
    env?.VITE_APP_EMAIL_SERVICE_ID ||
    process.env.NEXT_PUBLIC_EMAIL_SERVICE_ID ||
    process.env.NEXT_PUBLIC_APP_EMAIL_SERVICE_ID;
  const TEMPLATE_ID =
    env?.VITE_EMAIL_TEMPLATE_ID ||
    env?.VITE_APP_EMAIL_TEMPLATE_ID ||
    process.env.NEXT_PUBLIC_EMAIL_TEMPLATE_ID ||
    process.env.NEXT_PUBLIC_APP_EMAIL_TEMPLATE_ID;
  const PUBLIC_KEY =
    env?.VITE_EMAIL_PUBLIC_KEY ||
    env?.VITE_APP_EMAIL_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_EMAIL_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_APP_EMAIL_PUBLIC_KEY;
  const spamLogEndpoint = process.env.NEXT_PUBLIC_APP_CONTACT_SPAM_LOG_ENDPOINT;
  const SPAM_LOG_ENDPOINT = spamLogEndpoint;
  const isDev = env?.DEV ?? process.env.NODE_ENV !== "production";

  // Debug logging in development - only once on mount
  useEffect(() => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log("EmailJS Environment Check:", {
        VITE_EMAIL_SERVICE_ID:
          !!env?.VITE_EMAIL_SERVICE_ID ||
          !!process.env.NEXT_PUBLIC_EMAIL_SERVICE_ID,
        VITE_EMAIL_TEMPLATE_ID:
          !!env?.VITE_EMAIL_TEMPLATE_ID ||
          !!process.env.NEXT_PUBLIC_EMAIL_TEMPLATE_ID,
        VITE_EMAIL_PUBLIC_KEY:
          !!env?.VITE_EMAIL_PUBLIC_KEY ||
          !!process.env.NEXT_PUBLIC_EMAIL_PUBLIC_KEY,
        SERVICE_ID: !!SERVICE_ID,
        TEMPLATE_ID: !!TEMPLATE_ID,
        PUBLIC_KEY: !!PUBLIC_KEY,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array = run once on mount

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = getInitialErrorState();

    // Validate required fields
    if (!formData.fullName.trim()) {
      errors.fullName = t("contactValidationFullNameRequired");
    }

    if (!formData.email.trim()) {
      errors.email = t("contactValidationEmailRequired");
    } else if (!validateEmail(formData.email)) {
      errors.email = t("contactValidationEmailInvalid");
    }

    if (!formData.message.trim()) {
      errors.message = t("contactValidationMessageRequired");
    }

    setFormErrors(errors);
    const isFieldValid = !errors.email && !errors.fullName && !errors.message;
    if (!isFieldValid) {
      return false;
    }
    if (attachmentError) {
      return false;
    }
    return true;
  };

  const logHoneypotHit = () => {
    if (!SPAM_LOG_ENDPOINT) {
      if (isDev) {
        // eslint-disable-next-line no-console
        console.info(
          "Honeypot triggered but no SPAM log endpoint configured. Set VITE_CONTACT_SPAM_LOG_ENDPOINT to capture these events.",
        );
      }
      return;
    }

    const payload = {
      event: "contact-form-honeypot",
      submittedAt: new Date().toISOString(),
      honeypotValue: formData.honeypot,
      path:
        typeof window !== "undefined" ? window.location.pathname : "unknown",
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    };

    const body = JSON.stringify(payload);
    const canUseBeacon =
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function";

    if (canUseBeacon) {
      const success = navigator.sendBeacon(
        SPAM_LOG_ENDPOINT,
        new Blob([body], { type: "application/json" }),
      );
      if (success) {
        return;
      }
    }

    fetch(SPAM_LOG_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch((err) => {
      if (isDev) {
        // eslint-disable-next-line no-console
        console.error("Failed to log honeypot submission", err);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Quietly drop submissions that fill the honeypot field
    if (formData.honeypot.trim()) {
      logHoneypotHit();
      if (isDev) {
        // eslint-disable-next-line no-console
        console.warn("Honeypot triggered, dropping submission.");
      }
      setIsSubmitting(false);
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
    const now = new Date();
    const time = now.toLocaleString(); // You can customize the format if needed

    // Always try to store in MongoDB and handle response
    try {
      await fetch(
        "https://digitaltableteursecureproxy.vercel.app/api/save-contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            interest: formData.interest,
            message: formData.message,
            hearAbout: formData.hearAbout,
            attachmentName: attachmentFile?.name ?? null,
            attachmentType: attachmentFile?.type ?? null,
            attachmentSize: attachmentFile?.size ?? null,
            attachmentData: attachmentDataUrl,
            time,
          }),
        },
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to save to MongoDB", err);
      // Do not show error modal for MongoDB failure
    }

    // Check if EmailJS credentials are available
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      const missingCredentials = {
        SERVICE_ID: !SERVICE_ID,
        TEMPLATE_ID: !TEMPLATE_ID,
        PUBLIC_KEY: !PUBLIC_KEY,
      };

      // eslint-disable-next-line no-console
      console.error(
        "EmailJS credentials not configured. Missing:",
        missingCredentials,
      );

      // In development, provide helpful instructions
      if (isDev) {
        // eslint-disable-next-line no-console
        console.error(
          "To fix this error:\n" +
            "1. Create a .env.local file in your project root\n" +
            "2. Add the following variables with your EmailJS credentials:\n" +
            "   VITE_EMAIL_SERVICE_ID=your_service_id\n" +
            "   VITE_EMAIL_TEMPLATE_ID=your_template_id\n" +
            "   VITE_EMAIL_PUBLIC_KEY=your_public_key\n" +
            "   NEXT_PUBLIC_EMAIL_SERVICE_ID=your_service_id (for Next.js)\n" +
            "   NEXT_PUBLIC_EMAIL_TEMPLATE_ID=your_template_id (for Next.js)\n" +
            "   NEXT_PUBLIC_EMAIL_PUBLIC_KEY=your_public_key (for Next.js)\n" +
            "3. Get these values from https://dashboard.emailjs.com/\n" +
            "4. Restart your development server",
        );
      }

      setIsErrorOpen(true);
      setIsSubmitting(false);
      return;
    }

    // Show modal only after successful EmailJS send
    try {
      await send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          interest: formData.interest,
          message: formData.message,
          hearAbout: formData.hearAbout,
          attachmentName: attachmentFile?.name ?? "",
          attachmentType: attachmentFile?.type ?? "",
          attachmentSize: attachmentFile?.size ?? "",
          attachmentData:
            attachmentDataUrl && !isAttachmentTooLargeForEmail
              ? attachmentDataUrl
              : "",
          attachmentNotice: attachmentEmailNotice,
          time, // Add the current time for EmailJS {{time}}
        },
        PUBLIC_KEY,
      );
      setIsModalOpen(true);
      resetFormState();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to send message via EmailJS", err);
      setIsErrorOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles["contactForm"]}>
      <form onSubmit={handleSubmit}>
        <div className={styles["honeypot"]} aria-hidden="true">
          <label htmlFor="website">{t("contactSpamTrapLabel")}</label>
          <input
            id="website"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={formData.honeypot}
            onChange={handleHoneypotChange}
          />
        </div>

        <div className={styles["formGroup"]}>
          <Inputs
            label={t("contactFullName")}
            type="text"
            placeholder={t("contactFullNamePlaceholder")}
            value={formData.fullName}
            onChange={handleFullNameChange}
            error={formErrors.fullName}
            required
          />
        </div>

        <div className={styles["formGroup"]}>
          <Inputs
            label={t("contactEmail")}
            type="email"
            placeholder={t("contactEmailPlaceholder")}
            value={formData.email}
            onChange={handleEmailChange}
            error={formErrors.email}
            required
          />
        </div>

        <div className={styles["formGroup"]}>
          <Inputs
            label={t("contactPhone")}
            type="tel"
            placeholder={t("contactPhonePlaceholder")}
            value={formData.phone}
            onChange={handlePhoneChange}
          />
        </div>

        <div className={styles["formGroup"]}>
          <CheckboxGroup
            className={styles["checkboxGroup"]}
            label={t("contactInterest")}
            showMasterCheckbox={true}
            masterLabel={t("contactAll")}
            options={[
              {
                label: t("contactInterestBrandStrategy"),
                value: "brand-strategy",
              },
              {
                label: t("contactInterestDesignCreative"),
                value: "design-creative",
              },
              {
                label: t("contactInterestDigitalProducts"),
                value: "digital-products",
              },
              {
                label: t("contactInterestHelpMeChoose"),
                value: "help-me-choose",
              },
            ]}
            onChange={handleInterestChange}
          />
        </div>

        <div className={styles["formGroup"]}>
          <TextArea
            label={t("contactMessage")}
            placeholder={t("contactMessagePlaceholder")}
            value={formData.message}
            onChange={handleMessageChange}
            error={formErrors.message}
            required
          />
        </div>

        <div className={styles["formGroup"]}>
          <FileUpload
            label={t("contactAttachmentLabel")}
            placeholder={t("contactAttachmentPlaceholder")}
            helperText={t("contactAttachmentHelper", {
              size: t("contactAttachmentSizeLabel", {
                size: attachmentSizeValue,
              }),
              emailLimit: emailAttachmentLimitLabel,
              types: t("contactAttachmentAcceptedTypes"),
            })}
            uploadButtonLabel={t("contactAttachmentUpload")}
            clearButtonLabel={t("contactAttachmentClear")}
            accept={ACCEPTED_ATTACHMENT_TYPES}
            maxSizeInBytes={MAX_ATTACHMENT_BYTES}
            sizeErrorMessage={t("contactAttachmentTooLarge", {
              size: t("contactAttachmentSizeLabel", {
                size: attachmentSizeValue,
              }),
            })}
            value={attachmentFile}
            onFileChange={handleAttachmentChange}
            error={attachmentError}
          />
          {isAttachmentTooLargeForEmail && (
            <p className={styles["attachmentNotice"]}>
              {attachmentEmailNotice}
            </p>
          )}
        </div>

        <div className={styles["formGroup"]}>
          <Select
            label={t("contactHearAbout")}
            value={formData.hearAbout}
            onValueChange={handleHearAboutChange}
          >
            <option value="">{t("contactHearAboutPlaceholder")}</option>
            <option value="social-media">{t("contactHearSocial")}</option>
            <option value="search-engine">{t("contactHearSearch")}</option>
            <option value="word-of-mouth">{t("contactHearWord")}</option>
            <option value="event">{t("contactHearEvent")}</option>
            <option value="existing-client">{t("contactHearExisting")}</option>
            <option value="other">{t("contactHearOther")}</option>
          </Select>
        </div>

        <div className={styles["formGroup"]}>
          <p className={styles["privacyPolicy"]}>
            *{t("contactPrivacyPolicy1")}{" "}
            <a href="/privacyPolicy">{t("contactPrivacyPolicy2")}</a>.
          </p>
          <div className={styles["formActions"]}>
            <Button
              type="button"
              variant="tertiary"
              onClick={handleClearForm}
              disabled={isSubmitting}
            >
              {t("contactClear")}
            </Button>
            <Button
              className={styles["submitButton"]}
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("busyIndicator.loading") : t("contactSubmit")}
            </Button>
            {isSubmitting ? (
              <BusyIndicator
                variant="inline"
                size="s"
                label={t("busyIndicator.loading")}
                className={styles["busyInline"]}
              />
            ) : null}
          </div>
        </div>
      </form>
      <Modal
        className={styles["successModal"]}
        isOpen={isModalOpen}
        variant="success"
        title={t("contactSuccessTitle")}
        onClose={() => {
          setIsModalOpen(false);
          window.location.reload();
        }}
      >
        {t("contactSuccessMessage")}
      </Modal>
      <Modal
        className={styles["errorModal"]}
        isOpen={isErrorOpen}
        variant="error"
        title={t("contactErrorTitle")}
        onClose={() => setIsErrorOpen(false)}
      >
        {t("contactErrorMessage")}
      </Modal>
    </div>
  );
};

export default ContactForm;
