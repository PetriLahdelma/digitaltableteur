"use client";

import { useReducer, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "../Toaster/Toaster";
import { FormField } from "../FormField";
import { FormGroup } from "../FormGroup";
import { FadeIn } from "../animations/FadeIn";
import PhoneInput from "@dt/PhoneInput";
import FileUpload from "@dt/FileUpload";
import { Loader } from "lucide-react";

// === PRESERVED CONSTANTS (CRITICAL - DO NOT CHANGE) ===
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024; // 2MB upload cap
const EMAIL_ATTACHMENT_LIMIT_BYTES = 2 * 1024 * 1024; // 2MB email attach cap
const ACCEPTED_ATTACHMENT_TYPES = ".pdf,.png,.jpg,.jpeg";

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
const validateEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Interest options
const INTEREST_OPTIONS = [
  { value: "brand-strategy", labelKey: "contactInterestBrandStrategy" },
  { value: "design-creative", labelKey: "contactInterestDesignCreative" },
  { value: "digital-products", labelKey: "contactInterestDigitalProducts" },
  { value: "help-me-choose", labelKey: "contactInterestHelpMeChoose" },
];

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

  // === PRESERVED HANDLERS (CRITICAL - DO NOT CHANGE LOGIC) ===
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchForm({
      type: "UPDATE_FIELD",
      payload: { field: "fullName", value: e.target.value },
    });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchForm({
      type: "UPDATE_FIELD",
      payload: { field: "email", value: e.target.value },
    });
  };

  const handlePhoneChange = (value: string | undefined) => {
    dispatchForm({
      type: "UPDATE_FIELD",
      payload: { field: "phone", value: value || "" },
    });
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatchForm({
      type: "UPDATE_FIELD",
      payload: { field: "message", value: e.target.value },
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
  const SPAM_LOG_ENDPOINT =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_APP_CONTACT_SPAM_LOG_ENDPOINT
      : undefined;
  const isDev =
    typeof process !== "undefined" ? process.env.NODE_ENV !== "production" : false;

  const logHoneypotHit = () => {
    if (!SPAM_LOG_ENDPOINT) {
      if (isDev) {
        console.info(
          "Honeypot triggered but no SPAM log endpoint configured. Set VITE_CONTACT_SPAM_LOG_ENDPOINT to capture these events."
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
        new Blob([body], { type: "application/json" })
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
        console.error("Failed to log honeypot submission", err);
      }
    });
  };

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
      if (isDev) {
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
            onChange={handleHoneypotChange}
          />
        </div>

        {/* Full Name */}
        <FormField
          label={t("contactFullName")}
          error={formErrors.fullName}
          required
        >
          <Input
            type="text"
            placeholder={t("contactFullNamePlaceholder")}
            value={formData.fullName}
            onChange={handleFullNameChange}
            className={cn(formErrors.fullName && "border-destructive")}
          />
        </FormField>

        {/* Email */}
        <FormField
          label={t("contactEmail")}
          error={formErrors.email}
          required
        >
          <Input
            type="email"
            placeholder={t("contactEmailPlaceholder")}
            value={formData.email}
            onChange={handleEmailChange}
            className={cn(formErrors.email && "border-destructive")}
          />
        </FormField>

        {/* Phone */}
        <PhoneInput
          label={t("contactPhone")}
          placeholder={t("contactPhonePlaceholder")}
          value={formData.phone}
          onChange={handlePhoneChange}
        />

        {/* Interests */}
        <FormGroup legend={t("contactInterest")}>
          <div className="space-y-3">
            {/* Select All */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="interest-all"
                checked={allSelected}
                onCheckedChange={handleSelectAllInterests}
              />
              <Label htmlFor="interest-all" className="text-sm font-normal cursor-pointer">
                {t("contactAll")}
              </Label>
            </div>
            {/* Individual options */}
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3 ml-6">
              {INTEREST_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`interest-${option.value}`}
                    checked={selectedInterests.includes(option.value)}
                    onCheckedChange={(checked) =>
                      handleInterestToggle(option.value, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`interest-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {t(option.labelKey)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </FormGroup>

        {/* Message */}
        <FormField
          label={t("contactMessage")}
          error={formErrors.message}
          required
        >
          <Textarea
            placeholder={t("contactMessagePlaceholder")}
            value={formData.message}
            onChange={handleMessageChange}
            rows={5}
            className={cn(formErrors.message && "border-destructive")}
          />
        </FormField>

        {/* Attachment */}
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

        {/* How did you hear about us */}
        <FormField label={t("contactHearAbout")}>
          <Select value={formData.hearAbout} onValueChange={handleHearAboutChange}>
            <SelectTrigger>
              <SelectValue placeholder={t("contactHearAboutPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="social-media">{t("contactHearSocial")}</SelectItem>
              <SelectItem value="search-engine">{t("contactHearSearch")}</SelectItem>
              <SelectItem value="word-of-mouth">{t("contactHearWord")}</SelectItem>
              <SelectItem value="event">{t("contactHearEvent")}</SelectItem>
              <SelectItem value="existing-client">{t("contactHearExisting")}</SelectItem>
              <SelectItem value="other">{t("contactHearOther")}</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        {/* Privacy Policy */}
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

        {/* Actions */}
        <div className="flex flex-col-reverse tablet:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={resetFormState}
            disabled={isSubmitting}
          >
            {t("contactClear")}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="flex-1"
          >
            {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {t("contactSubmit")}
          </Button>
        </div>
      </form>

      {/* Error Dialog */}
      <Dialog open={isErrorOpen} onOpenChange={setIsErrorOpen}>
        <DialogContent severity="error">
          <DialogHeader>
            <DialogTitle>{t("contactErrorTitle")}</DialogTitle>
            <DialogDescription>{t("contactErrorMessage")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsErrorOpen(false)}>
              {t("back")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}

EnhancedContactForm.displayName = "EnhancedContactForm";
