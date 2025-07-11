import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import styles from "../Article.module.css";
import Author from "@dt/Author";
import VaultBoy from "../../assets/images/pete-vault-boy.jpg";
import Card from "@dt/Card";
import { SocialShare } from "@dt/SocialShare";
import { useTranslation } from "react-i18next";
import BlogNav from "@dt/BlogNav/BlogNav";

const TemplateArticle = () => {
  const { t } = useTranslation();
  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{t("templateArticleMetaTitle")}</title>
          <meta
            name="description"
            content={t("templateArticleMetaDescription")}
          />
          <meta
            property="og:title"
            content={t("templateArticleMetaTitle") as string}
          />
          <meta
            property="og:description"
            content={t("templateArticleMetaDescription") as string}
          />
          <meta property="og:image" content="/logo512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content={t("templateArticleMetaTitle") as string}
          />
          <meta
            name="twitter:description"
            content={t("templateArticleMetaDescription") as string}
          />
          <meta name="twitter:image" content="/logo512.png" />
        </Helmet>
      </HelmetProvider>
      <article className={styles.article}>
        <BlogNav />
        <header className={styles.header}>
          <h1>Template Article Title</h1>
          <Author name="Digitaltableteur" imageUrl={VaultBoy} size="32px" />
        </header>
        <p>
          This is a template article. Replace this text with the actual content
          of your article. Ensure that the content is well-structured and
          formatted according to the design guidelines.
        </p>
        <p>Ensure that all media files are properly linked and accessible.</p>
        <h2>{t("shareHeading")}</h2>
        <SocialShare
          url={window.location.href}
          title="Thoughts on Future Branding"
        />
        <div className={styles.similar}>
          <h2>Similar Reads</h2>
          <div className={styles["similarList"]}>
            <Card
              title="Title of Similar Article"
              link="/blog/template-article"
              className={`${styles["similarCard"]}`}
            ></Card>
            <Card
              title="Title of Similar Article"
              link="/blog/template-article"
              className={`${styles["similarCard"]}`}
            ></Card>
          </div>
        </div>
      </article>
    </>
  );
};

export default TemplateArticle;
