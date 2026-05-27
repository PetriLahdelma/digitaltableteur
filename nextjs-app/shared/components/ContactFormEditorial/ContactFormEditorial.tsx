"use client";

import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { FormFieldEditorial } from "../FormFieldEditorial";
import { ExpandableSection } from "../ExpandableSection";
import { useToast } from "../Toaster/Toaster";
import FileUpload from "@dt/FileUpload";
import styles from "./ContactFormEditorial.module.css";
import {
  CONTACT_ACCEPTED_ATTACHMENT_TYPES,
  CONTACT_ATTACHMENT_MAX_BYTES,
  CONTACT_EMAIL_ATTACHMENT_LIMIT_BYTES,
  reportContactHoneypot,
  validateContactEmail,
} from "../contactFormUtils";

// === PRESERVED CONSTANTS ===
const MAX_ATTACHMENT_BYTES = CONTACT_ATTACHMENT_MAX_BYTES;
const EMAIL_ATTACHMENT_LIMIT_BYTES = CONTACT_EMAIL_ATTACHMENT_LIMIT_BYTES;
const ACCEPTED_ATTACHMENT_TYPES = CONTACT_ACCEPTED_ATTACHMENT_TYPES;

// === FORM STATE ===
const getInitialFormState = () => ({
  name: "",
  email: "",
  message: "",
  budget: "",
  timeline: "",
  projectType: "",
  hearAbout: "",
  inspiration: "",
  honeypot: "",
});

const getInitialErrorState = () => ({
  name: "",
  email: "",
  message: "",
});

type FormState = ReturnType<typeof getInitialFormState>;
type ErrorState = ReturnType<typeof getInitialErrorState>;

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

// === VALIDATION ===
const validateEmail = validateContactEmail;

// === OPTIONS ===
const BUDGET_OPTIONS = [
  { value: "under-5k", labelKey: "contactBudgetUnder5k" },
  { value: "5k-15k", labelKey: "contactBudget5k15k" },
  { value: "15k-50k", labelKey: "contactBudget15k50k" },
  { value: "50k-plus", labelKey: "contactBudget50kPlus" },
  { value: "not-sure", labelKey: "contactBudgetNotSure" },
];

const TIMELINE_OPTIONS = [
  { value: "asap", labelKey: "contactTimelineAsap" },
  { value: "1-2-months", labelKey: "contactTimeline1to2" },
  { value: "3-6-months", labelKey: "contactTimeline3to6" },
  { value: "flexible", labelKey: "contactTimelineFlexible" },
];

const PROJECT_TYPE_OPTIONS = [
  { value: "brand-identity", labelKey: "contactProjectBrand" },
  { value: "digital-product", labelKey: "contactProjectDigital" },
  { value: "website", labelKey: "contactProjectWebsite" },
  { value: "creative-direction", labelKey: "contactProjectCreative" },
  { value: "ds-audit", labelKey: "contactProjectDsAudit" },
  { value: "component-library", labelKey: "contactProjectComponentLib" },
  { value: "tokens-theming", labelKey: "contactProjectTokens" },
  { value: "ai-designops", labelKey: "contactProjectDesignOps" },
  { value: "other", labelKey: "contactProjectOther" },
];

const HEAR_ABOUT_OPTIONS = [
  { value: "social-media", labelKey: "contactHearSocial" },
  { value: "search-engine", labelKey: "contactHearSearch" },
  { value: "word-of-mouth", labelKey: "contactHearWord" },
  { value: "event", labelKey: "contactHearEvent" },
  { value: "existing-client", labelKey: "contactHearExisting" },
  { value: "other", labelKey: "contactHearOther" },
];

export interface ContactFormEditorialProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * ContactFormEditorial component.
 */
export function ContactFormEditorial({
  onSuccess,
  onError,
  className,
}: ContactFormEditorialProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Form state
  const [formData, dispatchForm] = useReducer(
    formReducer,
    undefined,
    getInitialFormState,
  );
  const [formErrors, setFormErrors] =
    useState<ErrorState>(getInitialErrorState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Attachment state
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentDataUrl, setAttachmentDataUrl] = useState<string | null>(
    null,
  );
  const [attachmentError, setAttachmentError] = useState("");

  // Expansion state
  const [tier2Expanded, setTier2Expanded] = useState(false);
  const [tier3Expanded, setTier3Expanded] = useState(false);

  // Derived values
  const attachmentSizeValue = (MAX_ATTACHMENT_BYTES / (1024 * 1024)).toFixed(0);
  const emailAttachmentLimitValue = (
    EMAIL_ATTACHMENT_LIMIT_BYTES /
    (1024 * 1024)
  ).toFixed(1);
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

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    validateEmail(formData.email) &&
    formData.message.trim() !== "" &&
    !attachmentError;

  // === HANDLERS ===
  const updateField =
    (field: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      dispatchForm({
        type: "UPDATE_FIELD",
        payload: { field, value: e.target.value },
      });
    };

  const handleAttachmentChange = (file: File | null) => {
    setAttachmentError("");
    setAttachmentFile(file);
    setAttachmentDataUrl(null);
    if (!file) return;

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

  const resetFormState = () => {
    dispatchForm({ type: "RESET" });
    setAttachmentFile(null);
    setAttachmentDataUrl(null);
    setAttachmentError("");
    setFormErrors(getInitialErrorState());
    setTier2Expanded(false);
    setTier3Expanded(false);
  };

  // === SPAM PROTECTION ===
  const logHoneypotHit = () => reportContactHoneypot(formData.honeypot);

  // === VALIDATION ===
  const validateForm = (): boolean => {
    const errors = getInitialErrorState();

    if (!formData.name.trim()) {
      errors.name = t("contactValidationFullNameRequired");
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
    return !errors.name && !errors.email && !errors.message && !attachmentError;
  };

  // === SUBMIT ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Honeypot check
    if (formData.honeypot.trim()) {
      logHoneypotHit();
      setIsSubmitting(false);
      return;
    }

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    const now = new Date();
    const time = now.toLocaleString();

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: "", // Not collected in editorial form
          interest: formData.projectType,
          message: formData.message,
          hearAbout: formData.hearAbout,
          budget: formData.budget,
          timeline: formData.timeline,
          inspiration: formData.inspiration,
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
        throw new Error("Failed to submit form");
      }

      toast(t("contactSuccessMessage"), {
        severity: "success",
        duration: 5000,
      });
      resetFormState();
      onSuccess?.();
    } catch (err) {
      console.error("Failed to submit contact form", err);
      onError?.(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={cn(styles.form, className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Honeypot */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website" className="sr-only">
          {t("contactSpamTrapLabel")}
        </label>
        <input
          id="website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={formData.honeypot}
          onChange={updateField("honeypot")}
        />
      </div>

      {/* === TIER 1: Core Fields === */}
      <div className={styles.fields}>
        <FormFieldEditorial
          label={t("contactFullName")}
          type="text"
          required
          value={formData.name}
          onChange={updateField("name")}
          error={formErrors.name}
          autoComplete="name"
          autoFocus
        />

        <FormFieldEditorial
          label={t("contactEmail")}
          type="email"
          required
          value={formData.email}
          onChange={updateField("email")}
          error={formErrors.email}
          autoComplete="email"
        />

        <FormFieldEditorial
          label={t("contactMessage")}
          type="textarea"
          required
          value={formData.message}
          onChange={updateField("message")}
          error={formErrors.message}
          placeholder={t("contactMessagePlaceholder")}
          rows={5}
        />
      </div>

      {/* === TIER 2: Project Details === */}
      <ExpandableSection
        collapsedLabel={t("contactAddProjectDetails", "Add project details")}
        expandedLabel={t("contactHideProjectDetails", "Hide project details")}
        expanded={tier2Expanded}
        onExpandedChange={setTier2Expanded}
        className={styles.expandable}
      >
        <div className={styles.fields}>
          <FormFieldEditorial
            label={t("contactBudgetLabel", "Budget range")}
            type="select"
            value={formData.budget}
            onChange={updateField("budget")}
          >
            <option value="">
              {t("contactSelectPlaceholder", "Select...")}
            </option>
            {BUDGET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </FormFieldEditorial>

          <FormFieldEditorial
            label={t("contactTimelineLabel", "Timeline")}
            type="select"
            value={formData.timeline}
            onChange={updateField("timeline")}
          >
            <option value="">
              {t("contactSelectPlaceholder", "Select...")}
            </option>
            {TIMELINE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </FormFieldEditorial>

          <FormFieldEditorial
            label={t("contactProjectTypeLabel", "Project type")}
            type="select"
            value={formData.projectType}
            onChange={updateField("projectType")}
          >
            <option value="">
              {t("contactSelectPlaceholder", "Select...")}
            </option>
            {PROJECT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </FormFieldEditorial>
        </div>

        {/* === TIER 3: Relationship & Brief === */}
        <ExpandableSection
          collapsedLabel={t("contactTellUsMore", "+ Tell us more")}
          expandedLabel={t("contactHideTellUsMore", "− Hide")}
          expanded={tier3Expanded}
          onExpandedChange={setTier3Expanded}
          className={styles.expandable}
        >
          <div className={styles.fields}>
            <FormFieldEditorial
              label={t("contactHearAbout")}
              type="select"
              value={formData.hearAbout}
              onChange={updateField("hearAbout")}
            >
              <option value="">
                {t("contactSelectPlaceholder", "Select...")}
              </option>
              {HEAR_ABOUT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </FormFieldEditorial>

            <div className={styles.fileUploadWrapper}>
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
                <p className={styles.attachmentNotice}>
                  {attachmentEmailNotice}
                </p>
              )}
            </div>

            <FormFieldEditorial
              label={t("contactInspirationLabel", "Inspiration / References")}
              type="textarea"
              value={formData.inspiration}
              onChange={updateField("inspiration")}
              placeholder={t(
                "contactInspirationPlaceholder",
                "Share any links or references...",
              )}
              rows={2}
            />
          </div>
        </ExpandableSection>
      </ExpandableSection>

      {/* Privacy Policy */}
      <p className={styles.privacy}>
        {t("contactPrivacyPolicy1")}{" "}
        <a href="/privacy-policy" className={styles.privacyLink}>
          {t("contactPrivacyPolicy2")}
        </a>
        .
      </p>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !isFormValid}
        className={styles.submitButton}
      >
        {isSubmitting ? (
          <>
            <Loader className={styles.spinner} aria-hidden="true" />
            <span>{t("contactSubmitting", "Sending...")}</span>
          </>
        ) : (
          <span>{t("contactSubmit")}</span>
        )}
      </button>
    </motion.form>
  );
}

ContactFormEditorial.displayName = "ContactFormEditorial";
