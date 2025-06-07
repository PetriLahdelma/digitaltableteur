import styles from "./Contact.module.css";
import ContactForm from "../components/Contact Form/ContactForm";

const Contact = () => {
  return (
    <div className={styles.contact}>
      <h2>Contact</h2>      <p className={styles.contactInfo}>
        For new business enquiries, please use the form or <a href="mailto:mail@digitaltableteur.com">mail@digitaltableteur.com</a>.
      </p>

      <ContactForm />
    </div>
  );
};

export default Contact;
