import React from "react";
import styles from "../Article.module.css";
import Author from "../../components/Author/Author";
import VaultBoy from "../../assets/images/pete-vault-boy.jpg";
import Card from "../../components/Card/Card";
import { SocialShare } from "../../components/SocialShare/SocialShare";

const TemplateArticle = () => {
  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <h1>Template Article Title</h1>
        <Author name="Digitaltableteur" imageUrl={VaultBoy} size="32px" />
      </header>
      <p>
        This is a template article. Replace this text with the actual content of
        your article. Ensure that the content is well-structured and formatted
        according to the design guidelines.
      </p>
      <p>Ensure that all media files are properly linked and accessible.</p>
      <h2>Share</h2>
      <SocialShare
        url={window.location.href}
        title="Thoughts on Future Branding"
      />
      <div className={styles.similar}>
        <h2>Similar reads</h2>
        <div className={styles["similar-list"]}>
          <Card
            title="Title of Similar Article"
            link="/blog/template-article"
            className={`${styles["similar-card"]}`}
          ></Card>
          <Card
            title="Title of Similar Article"
            link="/blog/template-article"
            className={`${styles["similar-card"]}`}
          ></Card>
        </div>
      </div>
    </article>
  );
};

export default TemplateArticle;
