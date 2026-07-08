import { useTranslate } from "../../lib/translation";

// Hook-based wrapper to access translations inside validation; pure functions accept t.
export interface ContactValidators {
  validateEmail: (email: string) => boolean;
  validateFullName: (name: string) => boolean;
  validateMessage: (msg: string) => boolean;
}

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const createValidators = (): ContactValidators => ({
  validateEmail: (email) => emailRegex.test(email.trim()),
  validateFullName: (name) => name.trim().length > 0,
  validateMessage: (msg) => msg.trim().length > 0,
});

// Extract errors generator so chat workflow can reuse
export interface ValidationErrors {
  email?: string;
  fullName?: string;
  message?: string;
}

export const generateErrors = (
  t: (key: string) => string,
  data: { fullName: string; email: string; message: string },
): ValidationErrors => {
  const validators = createValidators();
  const errors: ValidationErrors = {};
  if (!validators.validateFullName(data.fullName)) {
    errors.fullName = t("contactValidationFullNameRequired");
  }
  if (!data.email.trim()) {
    errors.email = t("contactValidationEmailRequired");
  } else if (!validators.validateEmail(data.email)) {
    errors.email = t("contactValidationEmailInvalid");
  }
  if (!validators.validateMessage(data.message)) {
    errors.message = t("contactValidationMessageRequired");
  }
  return errors;
};

// Provide a convenience React hook for existing ContactForm if refactoring later
export const useContactValidation = () => {
  const t = useTranslate();
  return {
    t,
    generateErrors: (data: {
      fullName: string;
      email: string;
      message: string;
    }) => generateErrors(t, data),
    validators: createValidators(),
  };
};
