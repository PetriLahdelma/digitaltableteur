import type { Metadata } from "next";
import { ContactContent } from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact Digitaltableteur",
  description: "Get in touch for design systems, AI design ops, and consulting.",
};

export default function ContactPage() {
  return <ContactContent />;
}
