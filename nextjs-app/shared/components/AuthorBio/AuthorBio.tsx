import React from "react";
import ReactMarkdown from "react-markdown";
import type { ImageSource as StaticImageData } from "../../lib/imageComponent";
import { useTranslate } from "../../lib/translation";
import Avatar from "@dt/Avatar";
import Link from "@dt/Link";
import Text from "@dt/Text";
import Title from "@dt/Title";
import styles from "./AuthorBio.module.css";
import { getAuthorBySlug } from "../../data/authors";

/**
 * AuthorBio displays author information with avatar, name, role, and biography.
 * Fully input-driven: pass the details directly, or pass `slug` to pull them
 * from the site's author registry. Direct props override slug-derived fields.
 *
 * @example
 * ```tsx
 * <AuthorBio slug="petri-lahdelma" />
 * <AuthorBio name="Jane Doe" imageUrl="/people/jane.jpg" bio="Writes about design." />
 * ```
 */
export interface AuthorBioProps {
  /** Optional author slug resolved from the site's authors registry; direct
   * props below override the registry fields. */
  slug?: string;
  /** Author name. Required unless `slug` resolves it. */
  name?: string;
  /** Avatar image source: a URL, an imported asset path, or static image data. */
  imageUrl?: string | { default: string } | StaticImageData;
  /** Role/title shown under the name (e.g. "Founder, CEO"). */
  role?: string;
  /** Biography text; markdown after the first paragraph. The first paragraph
   * renders as the lead/tagline. */
  bio?: string;
  /** Contact email rendered as a mailto link when `showContact` is set. */
  email?: string;
  /** Optional CSS class for styling extension */
  className?: string;
  /** Optional custom heading text (defaults to the author name) */
  heading?: string;
  /** Render the author's contact email (mailto) after the bio, if the author has one. */
  showContact?: boolean;
}

/**
 * AuthorBio component.
 */
export const AuthorBio: React.FC<AuthorBioProps> = ({
  slug,
  name,
  imageUrl,
  role,
  bio,
  email,
  className,
  heading,
  showContact = false,
}) => {
  const t = useTranslate();
  const registryAuthor = slug ? getAuthorBySlug(slug) : undefined;

  // || not ??: a cleared/seeded Controls text field passes "" and must fall
  // back to the registry field, never blank out a slug-resolved value.
  const author = {
    name: name || registryAuthor?.name,
    imageUrl: imageUrl || registryAuthor?.imageUrl,
    role: role || registryAuthor?.role,
    bio: bio || registryAuthor?.bio,
    email: email || registryAuthor?.email,
  };

  // No name means no attribution to render — unknown slug and empty direct
  // input both land here.
  if (!author.name) {
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
