import { send } from "@emailjs/browser";

interface SendContactEmailParams {
  SERVICE_ID?: string;
  TEMPLATE_ID?: string;
  PUBLIC_KEY?: string;
  payload: {
    name: string;
    email: string;
    phone?: string;
    interest?: string | string[];
    message: string;
    hearAbout?: string;
    time?: string;
  };
}

export class EmailServiceError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export const sendContactEmail = async ({
  SERVICE_ID,
  TEMPLATE_ID,
  PUBLIC_KEY,
  payload,
}: SendContactEmailParams): Promise<void> => {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new EmailServiceError(
      "credentials",
      "Missing EmailJS credentials (SERVICE_ID/TEMPLATE_ID/PUBLIC_KEY)",
    );
  }
  try {
    await send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        interest: Array.isArray(payload.interest)
          ? payload.interest.join(", ")
          : payload.interest,
        message: payload.message,
        hearAbout: payload.hearAbout,
        time: payload.time ?? new Date().toLocaleString(),
      },
      PUBLIC_KEY,
    );
  } catch (err: any) {
    throw new EmailServiceError("sendFailed", err?.message || "Send failed");
  }
};
