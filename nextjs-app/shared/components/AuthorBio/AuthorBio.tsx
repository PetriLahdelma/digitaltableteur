import React from "react";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../lib/translation";
import Avatar from "@dt/Avatar";
import Link from "@dt/Link";
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
  /** Render the author's contact email (mailto) after the bio, if the author has one. */
  showContact?: boolean;
}

/**
 * AuthorBio component.
 */
export const AuthorBio: React.FC<AuthorBioProps> = ({
  slug,
  className,
  heading,
  showContact = false,
}) => {
  const t = useTranslate();
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
          {author.role && (
            <Text size="s" className={styles.role}>
              {author.role}
            </Text>
          )}
        </div>
      </div>
      {leadText && <Text className={styles.tagline}>{leadText}</Text>}
      {remainder && (
        <div className={styles.bioContent}>
          <ReactMarkdown>{remainder}</ReactMarkdown>
        </div>
      )}
      {showContact && author.email && (
        <Text className={styles.contact}>
          {t("authorGetInTouch")}:{" "}
          <Link href={`mailto:${author.email}`}>{author.email}</Link>
        </Text>
      )}
    </section>
  );
};

AuthorBio.displayName = "AuthorBio";

export default AuthorBio;
