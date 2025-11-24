import { describe, it, expect } from "vitest";

import {
  createValidators,
  emailRegex,
  generateErrors,
} from "./contactValidation";

describe("contactValidation helpers", () => {
  it("validates email/full name/message", () => {
    const { validateEmail, validateFullName, validateMessage } =
      createValidators();
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("bad-email")).toBe(false);
    expect(validateFullName(" ")).toBe(false);
    expect(validateMessage(" ")).toBe(false);
    expect(emailRegex.test("person@test.com")).toBe(true);
  });

  it("generates translated errors", () => {
    const errors = generateErrors((key) => key, {
      fullName: "",
      email: "bad",
      message: "",
    });
    expect(errors.fullName).toBe("contactValidationFullNameRequired");
    expect(errors.email).toBe("contactValidationEmailInvalid");
    expect(errors.message).toBe("contactValidationMessageRequired");
  });
});
