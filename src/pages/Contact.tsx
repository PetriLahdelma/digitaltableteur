import React from "react";
import { Helmet } from "react-helmet";
import styles from "./Contact.module.css";
import ContactForm from "../components/Contact Form/ContactForm";

const Contact = () => {
  return (
    <>
      <Helmet>
        <title>Contact | Digitaltableteur</title>
        <meta
          name="description"
          content="Get in touch with Digitaltableteur to discuss your next project."
        />
      </Helmet>
      <div className={styles.contact}>
        <h1>
          Connect with us for a free strategy session tailored to your vision.
        </h1>

        <h2>Contact Request Form</h2>
        <p className={styles.contactInfo}>
          For new business enquiries, please use the form or{" "}
          <a href="mailto:mail@digitaltableteur.com">
            mail@digitaltableteur.com
          </a>
        </p>
        <ContactForm />
      </div>
    </>
  );
};

export default Contact;
