import React from "react";
import styles from "../Article.module.css";
import Author from "../../components/Author/Author";
import VaultBoy from "../../assets/images/pete-vault-boy.jpg";

const TemplateArticle = () => {
  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <h1>Template Article Title</h1>
        <Author name="Digitaltableteur" imageUrl={VaultBoy} size="32px" />
      </header>
      <section className={styles.content}>
        <p>
          This is a template article. Replace this text with the actual content
          of your article. Ensure that the content is well-structured and
          formatted according to the design guidelines.
        </p>
        <p>
          Add multiple paragraphs to provide detailed information. Use headings,
          lists, and other HTML elements as needed to enhance readability and
          presentation.
        </p>
        <p>
          Include any relevant images, videos, or other media to support the
          content. Ensure that all media files are properly linked and
          accessible.
        </p>
        <p>
          Remember to validate the article for accessibility and responsiveness.
          Test the article on different devices and screen sizes to ensure a
          consistent user experience.
        </p>
      </section>
    </article>
  );
};

export default TemplateArticle;
