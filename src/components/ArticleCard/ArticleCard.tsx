import React from "react";
import styles from "./ArticleCard.module.css";

interface ArticleCardProps {
  title: string;
  lead?: string;
  link: string;
  readTime: string;
  colorClass?: string;
  className?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  lead,
  link,
  readTime,
  colorClass = "",
  className = "",
}) => {
  return (
    <a
      href={link}
      className={`${styles.card} ${colorClass} ${className}`.trim()}
      onFocus={(e) => e.currentTarget.classList.add(styles.cardFocus)}
      onBlur={(e) => e.currentTarget.classList.remove(styles.cardFocus)}
      onMouseOver={(e) => e.currentTarget.classList.add(styles.cardHover)}
      onMouseOut={(e) => e.currentTarget.classList.remove(styles.cardHover)}
    >
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.lead}>{lead}</p>
      <div className={styles.meta}>
        <span className={styles.readTime}>{readTime}</span>
        <span className={styles.readMore}>Read more</span>
      </div>
    </a>
  );
};

export default ArticleCard;
