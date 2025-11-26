import React from "react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import Author from "@dt/Author";
import Text from "@dt/Text";
import styles from "./AuthorBio.module.css";
import { getAuthorBySlug } from "../../data/authors";

/**
 * AuthorBio component displays author information with avatar, name, and biography.
 *
 * @example
 * ```tsx
 * <AuthorBio slug="petri-lahdelma" />
 * <AuthorBio slug="petri-lahdelma" heading="Meet the Author" />
 * ```
 */
export interface AuthorBioProps {
  /** Author slug to fetch data from authors.ts */
  slug: string;
  /** Optional CSS class for styling extension */
  className?: string;
  /** Optional custom heading text (defaults to author.name) */
  heading?: string;
}

const AuthorBio: React.FC<AuthorBioProps> = ({ slug, className, heading }) => {
  const { t } = useTranslation();
  const author = getAuthorBySlug(slug);

  if (!author) {
    return null;
  }

  const rootClassName = className
    ? `${styles.authorBio} ${className}`
    : styles.authorBio;

  const bioContent = author.bio ?? "";
  const [lead = "", ...rest] = bioContent.split(/\n{2,}/);
  const leadText = lead.trim();
  const remainder = rest.join("\n\n").trim();

  return (
    <section
      className={rootClassName}
      aria-label={t("authorBio.ariaLabel", { name: author.name })}
    >
      <div className={styles.header}>
        <Author
          name={heading ?? author.name}
          imageUrl={author.imageUrl ?? ""}
          size="4rem"
        />
      </div>
      {leadText && (
        <Text terminals="sans" className={styles.tagline}>
          {leadText}
        </Text>
      )}
      {remainder && (
        <div className={styles.bioContent}>
          <ReactMarkdown>{remainder}</ReactMarkdown>
        </div>
      )}
    </section>
  );
};

AuthorBio.displayName = "AuthorBio";

export default AuthorBio;
