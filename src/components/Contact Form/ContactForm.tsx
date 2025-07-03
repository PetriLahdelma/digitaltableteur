import React, { useState } from "react";
import { send } from "@emailjs/browser";
import styles from "./ContactForm.module.css";
import Inputs from "../Inputs/Inputs";
import Button from "../Button/Button";
import CheckboxGroup from "../CheckboxGroup/CheckboxGroup";
import Modal from "../Modal/Modal";
import TextArea from "../Inputs/TextArea";
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

  const SERVICE_ID = import.meta.env.VITE_EMAIL_SERVICE_ID || "service_ix55445";
  const TEMPLATE_ID =
    import.meta.env.VITE_EMAIL_TEMPLATE_ID || "template_bfw826h";
  const PUBLIC_KEY =
    import.meta.env.VITE_EMAIL_PUBLIC_KEY || "***REMOVED***";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(SERVICE_ID, TEMPLATE_ID, formData, PUBLIC_KEY)
      .then(() => {
        setIsModalOpen(true);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          interest: "",
          message: "",
        });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Failed to send message", err);
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
          />
        </div>

        <div className={styles["formGroup"]}>
          <Inputs
            label={t("contactEmail")}
            type="email"
            placeholder={t("contactEmailPlaceholder")}
            value={formData.email}
            onChange={handleEmailChange}
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
