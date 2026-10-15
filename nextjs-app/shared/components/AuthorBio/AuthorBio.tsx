"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import {
  Image,
  type ImageSource as StaticImageData,
} from "../../lib/imageComponent";
import { useTranslate } from "../../lib/translation";
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
  /** Biography text (markdown). Paragraphs are separated by blank lines; the
   * `compact` variant renders only the first one. */
  bio?: string;
  /** Contact email rendered as a mailto link when `showContact` is set. */
  email?: string;
  /** Optional CSS class for styling extension */
  className?: string;
  /** Optional custom heading text (defaults to the author name) */
  heading?: string;
  /** Render the author's contact email (mailto) after the bio, if the author has one. */
  showContact?: boolean;
  /** Link the author's name to their profile page (e.g. `/blog/authors/<slug>`). */
  profileHref?: string;
  /**
   * `full` renders the whole biography (author pages). `compact` renders only
   * the lead paragraph, for the end of an article. @default "full"
   */
  variant?: "full" | "compact";
}

const resolveImageSrc = (
  source: NonNullable<AuthorBioProps["imageUrl"]>,
): string | StaticImageData =>
  typeof source === "object" && "default" in source ? source.default : source;

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
  profileHref,
  variant = "full",
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

  const bioContent = (author.bio ?? "").trim();
  const [lead = ""] = bioContent.split(/\n\s*\n/);
  const bioToRender = variant === "compact" ? lead.trim() : bioContent;
  const displayName = heading || author.name;

  return (
    <section
      className={rootClassName}
      aria-label={t("authorBio.ariaLabel", { name: author.name })}
    >
      {author.imageUrl && (
        <div className={styles.media}>
          {/* Decorative: the name sits right beside the photo. */}
          <Image
            src={resolveImageSrc(author.imageUrl)}
            alt=""
            width={120}
            height={120}
            sizes="120px"
            className={styles.photo}
          />
        </div>
      )}
      <div className={styles.body}>
        <Title level={3} size="xxs" className={styles.name}>
          {/* || not ??: a cleared/seeded Controls text field passes "" and
              must fall back to the author name, never render an empty heading. */}
          {profileHref ? (
            <Link href={profileHref} className={styles.nameLink}>
              {displayName}
            </Link>
          ) : (
            displayName
          )}
        </Title>
        {author.role && (
          <Text size="s" className={styles.role}>
            {author.role}
          </Text>
        )}
        {bioToRender && (
          <div className={styles.bioContent}>
            <ReactMarkdown>{bioToRender}</ReactMarkdown>
          </div>
        )}
        {showContact && author.email && (
          <Text className={styles.contact}>
            {t("authorGetInTouch")}:{" "}
            <Link href={`mailto:${author.email}`}>{author.email}</Link>
          </Text>
        )}
      </div>
    </section>
  );
};

AuthorBio.displayName = "AuthorBio";

export default AuthorBio;
