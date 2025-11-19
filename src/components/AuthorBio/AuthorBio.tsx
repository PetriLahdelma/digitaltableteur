import React from "react";
import ReactMarkdown from "react-markdown";
import Avatar from "@dt/Avatar";
import styles from "./AuthorBio.module.css";
import { getAuthorBySlug } from "../../data/authors";

type AuthorBioProps = {
  slug: string;
  className?: string;
  heading?: string;
};

const AuthorBio: React.FC<AuthorBioProps> = ({ slug, className, heading }) => {
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
    <section className={rootClassName} aria-label={`About ${author.name}`}>
      <div className={styles.header}>
        {author.imageUrl && (
          <Avatar imageUrl={author.imageUrl} name={author.name} size="64px" />
        )}
        <div>
          <h3 className={styles.name}>{heading ?? author.name}</h3>
        </div>
      </div>
      {leadText && <p className={styles.tagline}>{leadText}</p>}
      {remainder && (
        <ReactMarkdown className={styles.bioContent}>{remainder}</ReactMarkdown>
      )}
    </section>
  );
};

export default AuthorBio;
