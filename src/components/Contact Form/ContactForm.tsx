import React, { useState } from "react";
import { send } from "@emailjs/browser";
import styles from "./ContactForm.module.css";
import Inputs from "../Inputs/Inputs";
import Button from "../Button/Button";
import CheckboxGroup from "../CheckboxGroup/CheckboxGroup";
import Modal from "../Modal/Modal";
import PhoneInput from "../PhoneInput/PhoneInput";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    interest: "",
    message: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const SERVICE_ID = "service_ix55445";
  const TEMPLATE_ID = "template_bfw826h";
  const PUBLIC_KEY = "ockSR3pBVF7_k4-Tu";

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
      });
  };

  return (
    <div className={styles["contact-form"]}>
      <form onSubmit={handleSubmit}>
        <div className={styles["form-group"]}>
          <Inputs
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleFullNameChange}
          />
        </div>

        <div className={styles["form-group"]}>
          <Inputs
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleEmailChange}
          />
        </div>

        <div className={styles["form-group"]}>
          <PhoneInput
            label="Phone Number"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handlePhoneChange}
          />
        </div>

        <div className={styles["form-group"]}>
          <CheckboxGroup
            label="Your Interest"
            options={[
              { label: "Brand strategy", value: "brand-strategy" },
              { label: "Design and creative", value: "design-creative" },
              {
                label: "Digital products and website",
                value: "digital-products",
              },
              { label: "Help me choose", value: "help-me-choose" },
            ]}
            onChange={handleInterestChange}
          />
        </div>

        <div className={styles["form-group"]}>
          <Inputs
            label="Your Message"
            type="text"
            placeholder="Enter your message"
            value={formData.message}
            onChange={handleMessageChange}
          />
        </div>

        <div className={styles["form-group"]}>
          <p className={styles["privacy-policy"]}>
            By pressing submit you agree for your information to be processed
            according to our<a href="/privacy-policy"> privacy policy</a>.
          </p>
          <Button type="submit" variant="primary">
            Submit
          </Button>
        </div>
      </form>
      <Modal
        isOpen={isModalOpen}
        variant="success"
        title="Success"
        onClose={() => {
          setIsModalOpen(false);
          window.location.reload();
        }}
      >
        Email successfully sent
      </Modal>
    </div>
  );
};

export default ContactForm;
