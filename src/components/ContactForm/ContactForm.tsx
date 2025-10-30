import React, { useState } from "react";
import { send } from "@emailjs/browser";
import styles from "./ContactForm.module.css";
import Inputs from "@dt/Inputs";
import Button from "@dt/Button";
import CheckboxGroup from "@dt/CheckboxGroup";
import Modal from "@dt/Modal";
import TextArea from "@dt/Inputs/TextArea";
import { useTranslation } from "react-i18next";

const ContactForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    interest: "",
    message: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: "",
    fullName: "",
    message: "",
  });

  const handleFullNameChange = (value: string | number) => {
    setFormData({ ...formData, fullName: String(value) });
  };

  const handleEmailChange = (value: string | number) => {
    setFormData({ ...formData, email: String(value) });
  };

  const handlePhoneChange = (value: string | number) => {
    setFormData({ ...formData, phone: String(value) });
  };

  const handleMessageChange = (value: string | number) => {
    setFormData({ ...formData, message: String(value) });
  };

  const handleInterestChange = (selectedOptions: string[]) => {
    setFormData({ ...formData, interest: selectedOptions.join(", ") });
  };

  const SERVICE_ID =
    import.meta.env.VITE_EMAIL_SERVICE_ID ||
    import.meta.env.VITE_APP_EMAIL_SERVICE_ID ||
    "service_ix55445";
  const TEMPLATE_ID =
    import.meta.env.VITE_EMAIL_TEMPLATE_ID ||
    import.meta.env.VITE_APP_EMAIL_TEMPLATE_ID ||
    "template_bfw826h";
  const PUBLIC_KEY =
    import.meta.env.VITE_EMAIL_PUBLIC_KEY ||
    import.meta.env.VITE_APP_EMAIL_PUBLIC_KEY ||
    "ockSR3pBVF7_k4-Tu";

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = {
      email: "",
      fullName: "",
      message: "",
    };

    // Validate required fields
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      errors.message = "Message is required";
    }

    setFormErrors(errors);
    return !errors.email && !errors.fullName && !errors.message;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    const now = new Date();
    const time = now.toLocaleString(); // You can customize the format if needed

    // Always try to store in MongoDB and handle response
    fetch("https://digitaltableteursecureproxy.vercel.app/api/save-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        interest: formData.interest,
        message: formData.message,
        time,
      }),
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("Failed to save to MongoDB", err);
      // Do not show error modal for MongoDB failure
    });

    // Check if EmailJS credentials are available
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      // eslint-disable-next-line no-console
      console.error(
        "EmailJS credentials not configured. Please set VITE_EMAIL_* environment variables.",
      );
      setIsErrorOpen(true);
      return;
    }

    // Show modal only after successful EmailJS send
    send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        interest: formData.interest,
        message: formData.message,
        time, // Add the current time for EmailJS {{time}}
      },
      PUBLIC_KEY,
    )
      .then(() => {
        setIsModalOpen(true);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          interest: "",
          message: "",
        });
        setFormErrors({
          email: "",
          fullName: "",
          message: "",
        });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Failed to send message via EmailJS", err);
        setIsErrorOpen(true);
      });
  };

  return (
    <div className={styles["contactForm"]}>
      <form onSubmit={handleSubmit}>
        <div className={styles["formGroup"]}>
          <Inputs
            label={t("contactFullName")}
            type="text"
            placeholder={t("contactFullNamePlaceholder")}
            value={formData.fullName}
            onChange={handleFullNameChange}
            error={formErrors.fullName}
            required
          />
        </div>

        <div className={styles["formGroup"]}>
          <Inputs
            label={t("contactEmail")}
            type="email"
            placeholder={t("contactEmailPlaceholder")}
            value={formData.email}
            onChange={handleEmailChange}
            error={formErrors.email}
            required
          />
        </div>

        <div className={styles["formGroup"]}>
          <Inputs
            label={t("contactPhone")}
            type="tel"
            placeholder={t("contactPhonePlaceholder")}
            value={formData.phone}
            onChange={handlePhoneChange}
          />
        </div>

        <div className={styles["formGroup"]}>
          <CheckboxGroup
            className={styles["checkboxGroup"]}
            label={t("contactInterest")}
            showMasterCheckbox={true}
            masterLabel={t("contactAll")}
            options={[
              {
                label: t("contactInterestBrandStrategy"),
                value: "brand-strategy",
              },
              {
                label: t("contactInterestDesignCreative"),
                value: "design-creative",
              },
              {
                label: t("contactInterestDigitalProducts"),
                value: "digital-products",
              },
              {
                label: t("contactInterestHelpMeChoose"),
                value: "help-me-choose",
              },
            ]}
            onChange={handleInterestChange}
          />
        </div>

        <div className={styles["formGroup"]}>
          <TextArea
            label={t("contactMessage")}
            placeholder={t("contactMessagePlaceholder")}
            value={formData.message}
            onChange={handleMessageChange}
            error={formErrors.message}
            required
          />
        </div>

        <div className={styles["formGroup"]}>
          <p className={styles["privacyPolicy"]}>
            *{t("contactPrivacyPolicy1")}{" "}
            <a href="/privacyPolicy">{t("contactPrivacyPolicy2")}</a>.
          </p>
          <Button
            className={styles["submitButton"]}
            type="submit"
            variant="primary"
          >
            {t("contactSubmit")}
          </Button>
        </div>
      </form>
      <Modal
        className={styles["successModal"]}
        isOpen={isModalOpen}
        variant="success"
        title={t("contactSuccessTitle")}
        onClose={() => {
          setIsModalOpen(false);
          window.location.reload();
        }}
      >
        {t("contactSuccessMessage")}
      </Modal>
      <Modal
        className={styles["errorModal"]}
        isOpen={isErrorOpen}
        variant="error"
        title={t("contactErrorTitle")}
        onClose={() => setIsErrorOpen(false)}
      >
        {t("contactErrorMessage")}
      </Modal>
    </div>
  );
};

export default ContactForm;
