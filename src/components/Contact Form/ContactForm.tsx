import React, { useState } from "react";
import styles from "./ContactForm.module.css";
import Inputs from "../Inputs/Inputs";
import Button from "../Button/Button";
import CheckboxGroup from "../CheckboxGroup/CheckboxGroup";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    interest: "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoLink = `mailto:mail@digitaltableteur.com?subject=Contact Form Submission&body=${encodeURIComponent(
      `Full Name: ${formData.fullName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nInterest: ${formData.interest}\nMessage: ${formData.message}`
    )}`;
    window.location.href = mailtoLink;
    alert("Email sent successfully!");
  };

  return (
    <div className={styles.contactForm}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <Inputs
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleFullNameChange}
          />
        </div>

        <div className={styles.formGroup}>
          <Inputs
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleEmailChange}
          />
        </div>

        <div className={styles.formGroup}>
          <Inputs
            label="Phone Number"
            type="text"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handlePhoneChange}
          />
        </div>

        <div className={styles.formGroup}>
          <CheckboxGroup
            label="Your Interest"
            options={[
              { label: "Brand strategy", value: "brand-strategy" },
              { label: "Design and creative", value: "design-creative" },
              { label: "Digital products and website", value: "digital-products" },
              { label: "Help me choose", value: "help-me-choose" },
            ]}
            onChange={handleInterestChange}
          />
        </div>

        <div className={styles.formGroup}>
          <Inputs
            label="Your Message"
            type="text"
            placeholder="Enter your message"
            value={formData.message}
            onChange={handleMessageChange}
          />
        </div>

        <div className={styles.formGroup}>
          <Button type="submit" variant="primary">
            Submit
          </Button>
        </div>

        <p className={styles.privacyPolicy}>
          By pressing submit you agree for your information to be processed <br /> according to our
          <a href="/privacy-policy"> privacy policy</a>.
        </p>
      </form>
    </div>
  );
};

export default ContactForm;
