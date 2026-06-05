import { describe, expect, it } from "vitest";
import {
  buildContactNotificationHtml,
  buildContactNotificationSubject,
  buildContactNotificationText,
  formatAttachmentDisplayName,
} from "./contact-notification-email";

const samplePayload = {
  name: "Petri Lahdelma",
  email: "petri@example.com",
  interest: "Brand & Identity, Creative Direction",
  budget: "50k-plus",
  timeline: "asap",
  hearAbout: "search-engine",
  inspiration: "Inspiration and references man",
  time: "01/06/2026, 01:02:09",
  attachmentName: "ig_037ea11908ff3f8c016a19dd2b60188191b791ba9b102e806d.png",
  attachmentType: "image/png",
  attachmentSize: 1839715,
  message: "Testing testing I want to work with you!",
};

describe("contact-notification-email", () => {
  it("builds a descriptive subject with lead interest", () => {
    expect(buildContactNotificationSubject(samplePayload)).toBe(
      "Contact inquiry · Petri Lahdelma · Brand & Identity",
    );
  });

  it("prefixes subject when portfolio materials are requested", () => {
    expect(
      buildContactNotificationSubject({
        ...samplePayload,
        requestPortfolioMaterials: true,
      }),
    ).toBe(
      "Portfolio follow-up · Contact inquiry · Petri Lahdelma · Brand & Identity",
    );
  });

  it("includes portfolio follow-up in plain text output", () => {
    const text = buildContactNotificationText({
      ...samplePayload,
      requestPortfolioMaterials: true,
    });
    expect(text).toContain(
      "Follow-up: Resume, references, or portfolio requested",
    );
  });

  it("formats select slugs in plain text output", () => {
    const text = buildContactNotificationText(samplePayload);
    expect(text).toContain("Budget: 50k€+");
    expect(text).toContain("Timeline: ASAP");
    expect(text).toContain("Source: Search engine");
    expect(text).toContain("Attachment: Uploaded image · PNG · 1.8 MB");
  });

  it("shortens hashed social upload filenames", () => {
    expect(
      formatAttachmentDisplayName(
        "ig_037ea11908ff3f8c016a19dd2b60188191b791ba9b102e806d.png",
      ),
    ).toBe("Uploaded image · PNG");
  });

  it("renders polished HTML with chips, metrics, and reply CTA", () => {
    const html = buildContactNotificationHtml({
      ...samplePayload,
      message: 'Hello <script>alert("x")</script>',
    });

    expect(html).toContain("Petri Lahdelma");
    expect(html).toContain("Brand &amp; Identity");
    expect(html).toContain("Creative Direction");
    expect(html).toContain("50k€+");
    expect(html).toContain("Search engine");
    expect(html).toContain("Reply to Petri");
    expect(html).toContain("Attachment included");
    expect(html).toContain("Uploaded image · PNG");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("INSPIRATION / REFERENCES");
  });
});
