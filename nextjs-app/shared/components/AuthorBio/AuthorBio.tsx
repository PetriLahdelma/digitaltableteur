import React from "react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import Avatar from "@dt/Avatar";
import Text from "@dt/Text";
import Title from "@dt/Title";
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

/**
 * AuthorBio component.
 */
export const AuthorBio: React.FC<AuthorBioProps> = ({ slug, className, heading }) => {
  const { t } = useTranslation();
  const author = getAuthorBySlug(slug);

  if (!author) {
    return null;
  }

  const rootClassName = className
    ? `${styles.authorBio} not-prose ${className}`
    : `${styles.authorBio} not-prose`;

  const bioContent = author.bio ?? "";
  const [lead = "", ...rest] = bioContent.split(/\n{2,}/);
  const leadText = lead.trim();
  // The lead can still hold markdown-significant blank lines that the \n{2,}
  // split misses (whitespace-only lines). Collapse internal whitespace so the
  // tagline renders as a single inline paragraph — matching the pre-markdown
  // Text rendering while still resolving inline links.
  const leadInline = leadText.replace(/\s+/g, " ");
  const remainder = rest.join("\n\n").trim();

  return (
    <section
      className={rootClassName}
      aria-label={t("authorBio.ariaLabel", { name: author.name })}
    >
      <div className={styles.header}>
        {author.imageUrl && (
          <Avatar imageUrl={author.imageUrl} name={author.name} size="4rem" />
        )}
        <div>
          <Title level={3} className={styles.name}>
            {/* || not ??: a cleared/seeded Controls text field passes "" and
                must fall back to the author name, never render an empty heading. */}
            {heading || author.name}
          </Title>
        </div>
      </div>
      {leadText && (
        // The lead is markdown like the rest of the bio, so render it through
        // ReactMarkdown too — otherwise inline syntax (e.g. Founder
        // [@](https://digitaltableteur.com)) shows up as raw text. Mapping the
        // paragraph back to Text keeps the tagline typography and divider.
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <Text className={styles.tagline}>{children}</Text>
            ),
          }}
        >
          {leadInline}
        </ReactMarkdown>
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
