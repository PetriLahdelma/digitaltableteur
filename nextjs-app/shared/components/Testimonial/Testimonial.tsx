import React from "react";
import styles from "./Testimonial.module.css";
import Text from "@dt/Text";
import Link from "@dt/Link";
import Icon from "@dt/Icon";

export interface TestimonialProps {
  /**
   * The testimonial quote text
   */
  quote: string;
  /**
   * Name of the person giving the testimonial
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
   * LinkedIn URL (optional)
   */
  linkedinUrl?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Avatar image URL (optional)
   */
  avatarUrl?: string;
}

/**
 * Testimonial component.
 */
export const Testimonial: React.FC<TestimonialProps> = ({
  quote,
  name,
  title,
  company,
  linkedinUrl,
  className = "",
  avatarUrl,
}) => {
  return (
    <blockquote className={`${styles.testimonial} ${className}`}>
      <Text className={styles.quote} size="m">
        &ldquo;{quote}&rdquo;
      </Text>
      <footer className={styles.attribution}>
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt={`Portrait of ${name}`}
            className={styles.avatar}
            loading="lazy"
          />
        )}
        <div className={styles.authorInfo}>
          <div className={styles.nameRow}>
            <Text as="cite" className={styles.name}>
              {name}
            </Text>
            {linkedinUrl && (
              <Link
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkedinLink}
                aria-label={`View ${name}'s LinkedIn profile`}
                title={`View ${name}'s LinkedIn profile`}
              >
                <Icon
                  name="linkedin-logo"
                  size={16}
                  ariaLabel={`View ${name}'s LinkedIn profile`}
                />
              </Link>
            )}
          </div>
          <Text size="s" className={styles.titleCompany}>
            {title} • {company}
          </Text>
        </div>
      </footer>
    </blockquote>
  );
};

export default Testimonial;
