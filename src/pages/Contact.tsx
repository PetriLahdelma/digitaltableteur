import React from "react";
import { Helmet } from "react-helmet";
import styles from "./Contact.module.css";
import ContactForm from "../components/Contact Form/ContactForm";
import Title from "../components/Title/Title";
import Text from "../components/Text/Text";

const Contact = () => {
  return (
    <>
      <Helmet>
        <title>Contact | Digitaltableteur</title>
        <meta
          name="description"
          content="Get in touch with Digitaltableteur to discuss your next project."
        />
        <meta property="og:title" content="Contact | Digitaltableteur" />
        <meta
          property="og:description"
          content="Get in touch with Digitaltableteur to discuss your next project."
        />
        <meta property="og:image" content="/logo512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact | Digitaltableteur" />
        <meta
          name="twitter:description"
          content="Get in touch with Digitaltableteur to discuss your next project."
        />
        <meta name="twitter:image" content="/logo512.png" />
      </Helmet>
      <div className={styles.contact}>
        <Title size="L">
          Connect for a free strategy session tailored to your vision.
        </Title>

        <Text>Contact Request Form</Text>
        <Text className={styles.contactInfo}>
          For new business enquiries, please use the form or{" "}
          <a href="mailto:mail@digitaltableteur.com">
            mail@digitaltableteur.com
          </a>
        </Text>
        <ContactForm />
      </div>
    </>
  );
};

export default Contact;
