"use client";

import { useEffect, useReducer, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import Button from "@dt/Button";
import { FormFieldEditorial } from "../FormFieldEditorial";
import { ExpandableSection } from "../ExpandableSection";
import { useToast } from "../Toaster/Toaster";
import FileUpload from "@dt/FileUpload";
import MultiCombobox from "@dt/MultiCombobox";
import { CheckboxField } from "../CheckboxField";
import styles from "./ContactFormEditorial.module.css";
import {
  CONTACT_ACCEPTED_ATTACHMENT_TYPES,
  CONTACT_ATTACHMENT_MAX_BYTES,
  CONTACT_EMAIL_ATTACHMENT_LIMIT_BYTES,
  CONTACT_HONEYPOT_INPUT_ID,
  CONTACT_HONEYPOT_INPUT_NAME,
  reportContactHoneypot,
  validateContactEmail,
} from "../contactFormUtils";
import {
  DONNY_PREFILL_CONTACT_EVENT,
  type DonnyContactPrefillDetail,
} from "../DonnyActionProvider/donnyContactPrefill";

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
  projectType: [] as string[],
  hearAbout: "",
  inspiration: "",
  requestPortfolioMaterials: false,
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
  | {
      type: "UPDATE_FIELD";
      payload: {
        field: Exclude<keyof FormState, "projectType">;
        value: string;
      };
    }
  | { type: "UPDATE_PROJECT_TYPES"; payload: string[] }
  | { type: "ADD_PROJECT_TYPE"; payload: string }
  | {
      type: "UPDATE_BOOLEAN";
      payload: {
        field: "requestPortfolioMaterials";
        value: boolean;
      };
    }
  | { type: "RESET" };

const mergeProjectType = (current: string[], next: string): string[] => {
  if (!next || current.includes(next)) return current;
  return [...current, next];
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.payload.field]: action.payload.value };
    case "UPDATE_PROJECT_TYPES":
      return { ...state, projectType: action.payload };
    case "ADD_PROJECT_TYPE":
      return {
        ...state,
        projectType: mergeProjectType(state.projectType, action.payload),
      };
    case "UPDATE_BOOLEAN":
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

const formatProjectTypesForSubmit = (
  values: string[],
  t: (key: string) => string,
): string =>
  values
    .map((value) => {
      const option = PROJECT_TYPE_OPTIONS.find((entry) => entry.value === value);
      return option ? t(option.labelKey) : value;
    })
    .join(", ");

/** Maps homepage CTA `?service=` query values to project-type slugs. */
const SERVICE_PROJECT_TYPE_MAP: Record<string, string> = {
  "design-sprint": "component-library",
  "design-sprints": "component-library",
};

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
  const searchParams = useSearchParams();
  // Honour reduced-motion: when set, skip the form's entrance animation entirely
  // so the rendered tree sits at its final visible state from frame 1. Without
  // this, axe samples the form mid-fade (opacity ~0.7) and reports the
  // ExpandableSection trigger/privacy paragraph as a color-contrast violation
  // because their muted-foreground color blends to ~3.5:1 against the page.
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const service = searchParams?.get("service")?.trim().toLowerCase();
    if (!service) return;

    const projectType = SERVICE_PROJECT_TYPE_MAP[service];
    if (!projectType) return;

    dispatchForm({
      type: "ADD_PROJECT_TYPE",
      payload: projectType,
    });
    setTier2Expanded(true);
  }, [searchParams]);

  useEffect(() => {
    const onDonnyPrefill = (event: Event) => {
      const detail = (event as CustomEvent<DonnyContactPrefillDetail>).detail;
      if (!detail) return;

      if (detail.projectType) {
        dispatchForm({
          type: "ADD_PROJECT_TYPE",
          payload: detail.projectType,
        });
        setTier2Expanded(true);
      }

      if (detail.message) {
        dispatchForm({
          type: "UPDATE_FIELD",
          payload: { field: "message", value: detail.message },
        });
      }
    };

    window.addEventListener(DONNY_PREFILL_CONTACT_EVENT, onDonnyPrefill);
    return () =>
      window.removeEventListener(DONNY_PREFILL_CONTACT_EVENT, onDonnyPrefill);
  }, []);

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
    (field: Exclude<keyof FormState, "projectType">) =>
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
          interest: formatProjectTypesForSubmit(formData.projectType, t),
          message: formData.message,
          hearAbout: formData.hearAbout,
          budget: formData.budget,
          timeline: formData.timeline,
          inspiration: formData.inspiration,
          requestPortfolioMaterials: formData.requestPortfolioMaterials,
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
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
      }
    >
      {/* Honeypot */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor={CONTACT_HONEYPOT_INPUT_ID} className="sr-only">
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

        <CheckboxField
          id="contact-request-portfolio-materials"
          className={styles.checkboxField}
          label={t("contactRequestPortfolioMaterials")}
          checked={formData.requestPortfolioMaterials}
          onCheckedChange={(checked) =>
            dispatchForm({
              type: "UPDATE_BOOLEAN",
              payload: { field: "requestPortfolioMaterials", value: checked },
            })
          }
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

          <MultiCombobox
            label={t("contactProjectTypeLabel", "Project type")}
            options={PROJECT_TYPE_OPTIONS.map((opt) => ({
              value: opt.value,
              label: t(opt.labelKey),
            }))}
            value={formData.projectType}
            onValueChange={(values) =>
              dispatchForm({ type: "UPDATE_PROJECT_TYPES", payload: values })
            }
            placeholder={t(
              "contactMultiSelectPlaceholder",
              "Select one or more...",
            )}
          />
        </div>

        {/* === TIER 3: Relationship & Brief === */}
        <ExpandableSection
          collapsedLabel={t("contactTellUsMore", "Tell us more")}
          expandedLabel={t("contactHideTellUsMore", "Hide")}
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
                appearance="editorial"
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
      <Button
        submits
        variant="primary"
        isLoading={isSubmitting}
        disabled={!isFormValid}
        className={styles.submitButton}
      >
        {isSubmitting
          ? t("contactSubmitting", "Sending...")
          : t("contactSubmit")}
      </Button>
    </motion.form>
  );
}

ContactFormEditorial.displayName = "ContactFormEditorial";
