import styles from "./Contact.module.css";
import ContactForm from "../components/Contact Form/ContactForm";

const Contact = () => {
  return (
    <div className={styles.contact}>
      <h2>Contact Us</h2>
      <ContactForm />
    </div>
  );
};

export default Contact;
