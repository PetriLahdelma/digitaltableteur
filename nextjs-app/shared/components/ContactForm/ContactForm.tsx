import React, { useReducer, useState } from "react";
import styles from "./ContactForm.module.css";
import Inputs from "@dt/Inputs";
import Button from "@dt/Button";
import CheckboxGroup from "@dt/CheckboxGroup";
import Modal from "@dt/Modal";
import Toast from "@dt/Toast";
import TextArea from "@dt/Inputs/TextArea";
import Select from "@dt/Select";
import FileUpload from "@dt/FileUpload";
import AdaptiveLoadingButton from "@dt/AdaptiveLoadingButton";
import Text from "@dt/Text";
import PhoneInput from "@dt/PhoneInput";
import { useTranslation } from "react-i18next";
import {
  CONTACT_ACCEPTED_ATTACHMENT_TYPES,
  CONTACT_ATTACHMENT_MAX_BYTES,
  CONTACT_EMAIL_ATTACHMENT_LIMIT_BYTES,
  CONTACT_HONEYPOT_INPUT_ID,
  CONTACT_HONEYPOT_INPUT_NAME,
  reportContactHoneypot,
  validateContactEmail,
} from "../contactFormUtils";

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

export type ContactFormProps = Record<string, never>;

/** Contact form organism with validation and file attachment support. */
const ContactForm: React.FC<ContactFormProps> = () => {
  const { t } = useTranslation();
  const [formData, dispatchForm] = useReducer(
    formReducer,
    undefined,
    getInitialFormState,
  );
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [formErrors, setFormErrors] = useState(getInitialErrorState);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentDataUrl, setAttachmentDataUrl] = useState<string | null>(
    null,
  );
  const [attachmentError, setAttachmentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid for submission
  const isFormValid =
    formData.fullName.trim() !== "" &&
    formData.email.trim() !== "" &&
    validateContactEmail(formData.email) &&
    formData.message.trim() !== "" &&
    !attachmentError;

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
  const attachmentSizeValue = (CONTACT_ATTACHMENT_MAX_BYTES / (1024 * 1024)).toFixed(0);
  const emailAttachmentLimitValue = (
    CONTACT_EMAIL_ATTACHMENT_LIMIT_BYTES /
    (1024 * 1024)
  ).toFixed(1);
  const isAttachmentTooLargeForEmail =
    !!attachmentFile && attachmentFile.size > CONTACT_EMAIL_ATTACHMENT_LIMIT_BYTES;
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

  const handlePhoneChange = (value: string | undefined) => {
    dispatchForm({
      type: "UPDATE_FIELD",
      payload: { field: "phone", value: value || "" },
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

  const validateForm = () => {
    const errors = getInitialErrorState();

    // Validate required fields
    if (!formData.fullName.trim()) {
      errors.fullName = t("contactValidationFullNameRequired");
    }

    if (!formData.email.trim()) {
      errors.email = t("contactValidationEmailRequired");
    } else if (!validateContactEmail(formData.email)) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Quietly drop submissions that fill the honeypot field
    if (formData.honeypot.trim()) {
      reportContactHoneypot(formData.honeypot);
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

    try {
      const response = await fetch("/api/contact", {
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
          attachmentData:
            attachmentDataUrl && !isAttachmentTooLargeForEmail
              ? attachmentDataUrl
              : null,
          attachmentNotice: attachmentEmailNotice,
          time,
        }),
      });
      if (!response.ok) {
        setIsErrorOpen(true);
        return;
      }

      setIsToastOpen(true);
      resetFormState();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to submit contact form", err);
      setIsErrorOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles["contactForm"]}>
      <form onSubmit={handleSubmit}>
        <div className={styles["honeypot"]} aria-hidden="true">
          <label htmlFor={CONTACT_HONEYPOT_INPUT_ID} className={styles["honeypotLabel"]}>
            {t("contactSpamTrapLabel")}
          </label>
          <input
            id={CONTACT_HONEYPOT_INPUT_ID}
            type="text"
            name={CONTACT_HONEYPOT_INPUT_NAME}
            tabIndex={-1}
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
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
          <PhoneInput
            label={t("contactPhone")}
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
            accept={CONTACT_ACCEPTED_ATTACHMENT_TYPES}
            maxSizeInBytes={CONTACT_ATTACHMENT_MAX_BYTES}
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
            <Text
              as="p"
              terminals="sans"
              size="XS"
              className={styles["attachmentNotice"]}
            >
              {attachmentEmailNotice}
            </Text>
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
          <Text
            as="p"
            terminals="sans"
            size="XS"
            className={styles["privacyPolicy"]}
          >
            *{t("contactPrivacyPolicy1")}{" "}
            <a href="/privacy-policy">{t("contactPrivacyPolicy2")}</a>.
          </Text>
          <div className={styles["formActions"]}>
            <Button
              className={styles["resetButton"]}
              type="button"
              variant="tertiary"
              onClick={handleClearForm}
              disabled={isSubmitting}
            >
              {t("contactClear")}
            </Button>
            <AdaptiveLoadingButton
              className={styles["submitButton"]}
              type="submit"
              variant="primary"
              loading={isSubmitting}
              loadingLabelKey="busyIndicator.loading"
              disabled={isSubmitting || !isFormValid}
            >
              {t("contactSubmit")}
            </AdaptiveLoadingButton>
          </div>
        </div>
      </form>
      <Toast
        message={t("contactSuccessMessage")}
        isOpen={isToastOpen}
        duration={5000}
        onClose={() => setIsToastOpen(false)}
      />
      <Modal
        className={styles["errorModal"]}
        isOpen={isErrorOpen}
        severity="error"
        title={t("contactErrorTitle")}
        onClose={() => setIsErrorOpen(false)}
      >
        {t("contactErrorMessage")}
      </Modal>
    </div>
  );
};

ContactForm.displayName = "ContactForm";

export default ContactForm;
