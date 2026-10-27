import { describe, expect, it } from "vitest";

import { answerDisplay } from "./answer-text";
import type { IntakeField } from "./types";

const phone = { id: "phone", kind: "tel", label: { en: "Phone number", fi: "Puhelinnumero", sv: "Telefonnummer" } } as unknown as IntakeField;

describe("answer text", () => {
  it("reads a stored E.164 phone number in international format", () => {
    expect(answerDisplay(phone, "+358456574469", "en")).toBe("+358 45 6574469");
    expect(answerDisplay(phone, "+14155552671", "en")).toBe("+1 415 555 2671");
  });

  it("keeps a phone value it cannot parse as it was typed", () => {
    expect(answerDisplay(phone, "ask for Pekka", "en")).toBe("ask for Pekka");
  });
});
