import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import styles from "./Contact.module.css";
import ContactForm from "../components/Contact Form/ContactForm";
import Title from "../components/Title/Title";
import Text from "../components/Text/Text";
import Link from "../components/Link/Link";

const Contact = () => {
  return (
    <>
      <HelmetProvider>
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
      </HelmetProvider>
      <div className={styles.contact}>
        <Title size="L">
          Connect for a free strategy session tailored to your vision.
        </Title>

        <Text className={styles.contactFormTitle}>Contact Request Form</Text>
        <Text className={styles.contactInfo}>
          For new business enquiries, please use the form or
        </Text>
        <Link href="mailto:mail@digitaltableteur.com">
          mail@digitaltableteur.com
        </Link>
        <ContactForm />
      </div>
    </>
  );
};

export default Contact;
