import React from "react";
import styles from "./Contact.module.css";
import ContactForm from "../components/Contact Form/ContactForm";

const Contact = () => {
  return (
    <div className={styles.contact}>
      <h2>Contact</h2>
      <p className={styles.contactInfo}>
        For new business enquiries, please use the form or{" "}
        <a href="mailto:mail@digitaltableteur.com">mail@digitaltableteur.com</a>
        .
      </p>
      <ContactForm />
      <h2>
        onnect with us for a free strategy session tailored to your vision.
      </h2>
    </div>
  );
};

export default Contact;
