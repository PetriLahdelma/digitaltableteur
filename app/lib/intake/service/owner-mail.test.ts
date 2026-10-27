import { afterEach, describe, expect, it, vi } from "vitest";

import { resendMailer } from "./mail";
import { ownerSubmittedMail } from "./owner-mail";

const base = {
  name: "Aino",
  email: "aino@example.test",
  questionnaire: "Client intake",
  version: 1,
  submittedAt: new Date("2026-11-02T09:00:00Z"),
  adminLink: "https://www.example.test/intake/admin/intakes/1",
};

describe("owner's copy of a submission", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("escapes answers in the HTML and keeps them verbatim in the text", () => {
    const mail = ownerSubmittedMail({
      ...base,
      answers: [{ title: "Client intake", sections: [{ title: "Contact details", rows: [{ label: "Company", value: '<img src=x onerror="alert(1)">\nLine two' }] }] }],
      pdf: null,
    });
    expect(mail.html).not.toContain("<img src=x");
    expect(mail.html).toContain("&lt;img src=x");
    expect(mail.html).toContain("Line two");
    expect(mail.text).toContain('Company\n<img src=x onerror="alert(1)">\nLine two');
    expect(mail.text).toContain("Reply to aino@example.test.");
  });

  it("sends the PDF to Resend next to the inline logo", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const mail = ownerSubmittedMail({ ...base, answers: [], pdf: { filename: "intake-2026-11-02-v1.pdf", bytes: Buffer.from("%PDF") } });
    await resendMailer("key", "Intake <intake@example.test>").send(mail);
    const body = JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(body.attachments).toHaveLength(2);
    expect(body.attachments[1]).toEqual({ content: Buffer.from("%PDF").toString("base64"), filename: "intake-2026-11-02-v1.pdf", content_type: "application/pdf" });
  });
});
