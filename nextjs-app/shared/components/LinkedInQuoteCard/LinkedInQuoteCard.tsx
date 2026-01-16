"use client";

import React from "react";
import styles from "./LinkedInQuoteCard.module.css";
import Link from "@dt/Link";
import Icon from "@dt/Icon";

export interface LinkedInQuoteCardProps {
  /**
   * The quote/post text
   */
  quote: string;
  /**
   * Name of the person
   */
  name: string;
  /**
   * Title/position of the person
   */
  title: string;
  /**
   * Company name
   */
  company: string;
  /**
   * Connection degree (e.g., "1st", "2nd", "3rd")
   */
  connectionDegree?: string;
  /**
   * LinkedIn profile URL (optional)
   */
  linkedinUrl?: string;
  /**
   * Avatar image URL (optional)
   */
  avatarUrl?: string;
  /**
   * Company logo URL (optional, displayed at bottom)
   */
  companyLogoUrl?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Background color variant
   */
  variant?: "light" | "dark" | "muted";
}

const LinkedInQuoteCard: React.FC<LinkedInQuoteCardProps> = ({
  quote,
  name,
  title,
  company,
  connectionDegree = "1st",
  linkedinUrl,
  avatarUrl,
  companyLogoUrl,
  className = "",
  variant = "light",
}) => {
  return (
    <div className={styles.wrapper} data-variant={variant}>
      <article
        className={`${styles.card} ${className}`}
        aria-label={`LinkedIn post by ${name}`}
      >
        <header className={styles.header}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`Portrait of ${name}`}
              className={styles.avatar}
              loading="lazy"
            />
          ) : (
            <div className={styles.avatarPlaceholder} aria-hidden="true">
              <Icon name="user" size={24} />
            </div>
          )}
          <div className={styles.authorInfo}>
            <div className={styles.nameRow}>
              <span className={styles.name}>{name}</span>
              {connectionDegree && (
                <>
                  <span className={styles.separator} aria-hidden="true">
                    •
                  </span>
                  <span className={styles.connectionDegree}>
                    {connectionDegree}
                  </span>
                </>
              )}
            </div>
            <div className={styles.titleCompany}>
              {title}, {company}
            </div>
          </div>
          {linkedinUrl && (
            <Link
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkedinLink}
              aria-label={`View ${name}'s LinkedIn profile`}
            >
              <Icon name="linkedin-logo" size={20} weight="fill" />
            </Link>
          )}
        </header>

        <blockquote className={styles.quote}>
          <p className={styles.quoteText}>{quote}</p>
        </blockquote>
      </article>

      {companyLogoUrl && (
        <div className={styles.logoContainer}>
          <img
            src={companyLogoUrl}
            alt={`${company} logo`}
            className={styles.companyLogo}
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};

export default LinkedInQuoteCard;
