"use client";

import { useEffect, useReducer, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import Inputs, { TextArea } from "@dt/Inputs";
import Select from "@dt/Select";
import SelectOption from "@dt/Select/SelectOption";
import Checkbox from "@dt/Checkbox";
import Button from "@dt/Button";
import Modal from "@dt/Modal";
import { useToast } from "../Toaster/Toaster";
import { FormGroup } from "../FormGroup";
import { FadeIn } from "../animations/FadeIn";
import PhoneInput from "@dt/PhoneInput";
import FileUpload from "@dt/FileUpload";
import {
  CONTACT_ACCEPTED_ATTACHMENT_TYPES,
  CONTACT_ATTACHMENT_MAX_BYTES,
  CONTACT_EMAIL_ATTACHMENT_LIMIT_BYTES,
  CONTACT_HONEYPOT_INPUT_ID,
  CONTACT_HONEYPOT_INPUT_NAME,
  reportContactHoneypot,
  validateContactEmail,
} from "../contactFormUtils";

// === PRESERVED CONSTANTS (CRITICAL - DO NOT CHANGE) ===
const MAX_ATTACHMENT_BYTES = CONTACT_ATTACHMENT_MAX_BYTES; // 2MB upload cap
const EMAIL_ATTACHMENT_LIMIT_BYTES = CONTACT_EMAIL_ATTACHMENT_LIMIT_BYTES; // 2MB email attach cap
const ACCEPTED_ATTACHMENT_TYPES = CONTACT_ACCEPTED_ATTACHMENT_TYPES;

// === PRESERVED STATE TYPES (CRITICAL - DO NOT CHANGE) ===
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

// === PRESERVED REDUCER (CRITICAL - DO NOT CHANGE) ===
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

// === PRESERVED EMAIL REGEX (CRITICAL - DO NOT CHANGE) ===
const validateEmail = validateContactEmail;

// Interest options
const INTEREST_OPTIONS = [
  { value: "brand-strategy", labelKey: "contactInterestBrandStrategy" },
  { value: "design-creative", labelKey: "contactInterestDesignCreative" },
  { value: "digital-products", labelKey: "contactInterestDigitalProducts" },
  { value: "help-me-choose", labelKey: "contactInterestHelpMeChoose" },
];

const HEAR_ABOUT_OPTIONS = [
  { value: "social-media", labelKey: "contactHearSocial" },
  { value: "search-engine", labelKey: "contactHearSearch" },
  { value: "word-of-mouth", labelKey: "contactHearWord" },
  { value: "event", labelKey: "contactHearEvent" },
  { value: "existing-client", labelKey: "contactHearExisting" },
  { value: "other", labelKey: "contactHearOther" },
] as const;

/** Maps marketing CTA `?service=` values to contact-form interest slugs. */
const SERVICE_INTEREST_MAP: Record<string, string> = {
  "design-sprint": "digital-products",
  "design-sprints": "digital-products",
};

export interface EnhancedContactFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function EnhancedContactForm({
  onSuccess,
  onError,
  className,
}: EnhancedContactFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // === PRESERVED STATE MANAGEMENT (CRITICAL - DO NOT CHANGE) ===
  const [formData, dispatchForm] = useReducer(
    formReducer,
    undefined,
    getInitialFormState
  );
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [formErrors, setFormErrors] = useState(getInitialErrorState);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentDataUrl, setAttachmentDataUrl] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    const service = searchParams.get("service")?.trim().toLowerCase();
    if (!service) return;

    const interest = SERVICE_INTEREST_MAP[service];
    if (!interest) return;

    setSelectedInterests((prev) => {
      if (prev.includes(interest)) return prev;
      const next = [...prev, interest];
      dispatchForm({
        type: "UPDATE_FIELD",
        payload: { field: "interest", value: next.join(", ") },
      });
      return next;
    });
  }, [searchParams]);

  // Check if form is valid for submission
  const isFormValid =
    formData.fullName.trim() !== "" &&
    formData.email.trim() !== "" &&
    validateEmail(formData.email) &&
    formData.message.trim() !== "" &&
    !attachmentError;

  const resetFormState = () => {
    dispatchForm({ type: "RESET" });
    setAttachmentFile(null);
    setAttachmentDataUrl(null);
    setAttachmentError("");
    setFormErrors(getInitialErrorState());
    setSelectedInterests([]);
  };

  const attachmentSizeValue = (MAX_ATTACHMENT_BYTES / (1024 * 1024)).toFixed(0);
  const emailAttachmentLimitValue = (
    EMAIL_ATTACHMENT_LIMIT_BYTES / (1024 * 1024)
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

  const handlePhoneChange = (value: string | undefined) => {
    dispatchForm({
      type: "UPDATE_FIELD",
      payload: { field: "phone", value: value || "" },
    });
  };

  const handleInterestToggle = (value: string, checked: boolean) => {
    const newInterests = checked
      ? [...selectedInterests, value]
      : selectedInterests.filter((i) => i !== value);
    setSelectedInterests(newInterests);
    dispatchForm({
      type: "UPDATE_FIELD",
      payload: { field: "interest", value: newInterests.join(", ") },
    });
  };

  const handleSelectAllInterests = (checked: boolean) => {
    if (checked) {
      const allValues = INTEREST_OPTIONS.map((o) => o.value);
      setSelectedInterests(allValues);
      dispatchForm({
        type: "UPDATE_FIELD",
        payload: { field: "interest", value: allValues.join(", ") },
      });
    } else {
      setSelectedInterests([]);
      dispatchForm({
        type: "UPDATE_FIELD",
        payload: { field: "interest", value: "" },
      });
    }
  };

  const handleHearAboutChange = (value: string) => {
    dispatchForm({
      type: "UPDATE_FIELD",
      payload: { field: "hearAbout", value },
    });
  };

  // === PRESERVED HONEYPOT HANDLER (CRITICAL - DO NOT CHANGE) ===
  const handleHoneypotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchForm({
      type: "UPDATE_FIELD",
      payload: { field: "honeypot", value: event.target.value },
    });
  };

  // === PRESERVED ATTACHMENT HANDLER (CRITICAL - DO NOT CHANGE) ===
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

  // === PRESERVED SPAM LOGGING (CRITICAL - DO NOT CHANGE) ===
  const logHoneypotHit = () => reportContactHoneypot(formData.honeypot);

  // === PRESERVED VALIDATION (CRITICAL - DO NOT CHANGE) ===
  const validateForm = () => {
    const errors = getInitialErrorState();

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

  // === PRESERVED SUBMIT HANDLER (CRITICAL - DO NOT CHANGE API CONTRACT) ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Quietly drop submissions that fill the honeypot field
    if (formData.honeypot.trim()) {
      logHoneypotHit();
      setIsSubmitting(false);
      return;
    }

    // Validate form before submission
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
        onError?.(new Error("Failed to submit form"));
        return;
      }

      toast(t("contactSuccessMessage"), { severity: "success", duration: 5000 });
      resetFormState();
      onSuccess?.();
    } catch (err) {
      console.error("Failed to submit contact form", err);
      setIsErrorOpen(true);
      onError?.(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const allSelected = selectedInterests.length === INTEREST_OPTIONS.length;

  return (
    <FadeIn direction="up">
      <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
        {/* === PRESERVED HONEYPOT FIELD (CRITICAL - DO NOT CHANGE) === */}
        <div className="absolute -left-[10000px] aria-hidden" aria-hidden="true">
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
            onChange={handleHoneypotChange}
          />
        </div>

        <Inputs
          type="text"
          label={t("contactFullName")}
          placeholder={t("contactFullNamePlaceholder")}
          value={formData.fullName}
          error={formErrors.fullName}
          onValueChange={(value) =>
            dispatchForm({
              type: "UPDATE_FIELD",
              payload: { field: "fullName", value: String(value) },
            })
          }
        />

        <Inputs
          type="email"
          label={t("contactEmail")}
          placeholder={t("contactEmailPlaceholder")}
          value={formData.email}
          error={formErrors.email}
          onValueChange={(value) =>
            dispatchForm({
              type: "UPDATE_FIELD",
              payload: { field: "email", value: String(value) },
            })
          }
        />

        <PhoneInput
          label={t("contactPhone")}
          placeholder={t("contactPhonePlaceholder")}
          value={formData.phone}
          onChange={handlePhoneChange}
        />

        <FormGroup legend={t("contactInterest")}>
          <div className="space-y-3">
            <Checkbox
              id="interest-all"
              label={t("contactAll")}
              isChecked={allSelected}
              onCheckedChange={handleSelectAllInterests}
            />
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3 ml-6">
              {INTEREST_OPTIONS.map((option) => (
                <Checkbox
                  key={option.value}
                  id={`interest-${option.value}`}
                  label={t(option.labelKey)}
                  isChecked={selectedInterests.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleInterestToggle(option.value, checked)
                  }
                />
              ))}
            </div>
          </div>
        </FormGroup>

        <TextArea
          label={t("contactMessage")}
          placeholder={t("contactMessagePlaceholder")}
          value={formData.message}
          error={formErrors.message}
          rows={5}
          onChange={(value) =>
            dispatchForm({
              type: "UPDATE_FIELD",
              payload: { field: "message", value },
            })
          }
        />

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
          <p className="text-xs text-muted-foreground -mt-4">
            {attachmentEmailNotice}
          </p>
        )}

        <Select
          label={t("contactHearAbout")}
          value={formData.hearAbout}
          onValueChange={handleHearAboutChange}
        >
          <SelectOption
            value=""
            label={t("contactHearAboutPlaceholder")}
            disabled
          />
          {HEAR_ABOUT_OPTIONS.map((option) => (
            <SelectOption
              key={option.value}
              value={option.value}
              label={t(option.labelKey)}
            />
          ))}
        </Select>

        <p className="text-xs text-muted-foreground">
          *{t("contactPrivacyPolicy1")}{" "}
          <a
            href="/privacy-policy"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            {t("contactPrivacyPolicy2")}
          </a>
          .
        </p>

        <div className="flex flex-col-reverse tablet:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={resetFormState}
            isDisabled={isSubmitting}
          >
            {t("contactClear")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isDisabled={isSubmitting || !isFormValid}
            isLoading={isSubmitting}
            className="flex-1"
          >
            {t("contactSubmit")}
          </Button>
        </div>
      </form>

      <Modal
        isOpen={isErrorOpen}
        severity="error"
        title={t("contactErrorTitle")}
        description={t("contactErrorMessage")}
        onClose={() => setIsErrorOpen(false)}
        footer={
          <Button variant="secondary" onClick={() => setIsErrorOpen(false)}>
            {t("back")}
          </Button>
        }
      />
    </FadeIn>
  );
}

EnhancedContactForm.displayName = "EnhancedContactForm";
