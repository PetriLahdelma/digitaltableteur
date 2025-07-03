import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./ArticleCard.module.css";

interface ArticleCardProps {
  title: string;
  lead?: string;
  link: string;
  readTime: string;
  className?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  lead,
  link,
  readTime,
  className = "",
}) => {
  const { t } = useTranslation();
  // Support "3 min read" style: split and translate 'read'
  let readTimeDisplay = readTime;
  const match = readTime.match(/^(\d+)\s*(min)\s*(read)$/i);
  if (match) {
    readTimeDisplay = `${match[1]} min ${t("blogRead")}`;
  }
  return (
    <a
      href={link}
      className={`${styles.card} ${className}`.trim()}
      onFocus={(e) => e.currentTarget.classList.add(styles.cardFocus)}
      onBlur={(e) => e.currentTarget.classList.remove(styles.cardFocus)}
      onMouseOver={(e) => e.currentTarget.classList.add(styles.cardHover)}
      onMouseOut={(e) => e.currentTarget.classList.remove(styles.cardHover)}
    >
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.lead}>{lead}</p>
      <div className={styles.meta}>
        <span className={styles.readTime}>{readTimeDisplay}</span>
        <span className={styles.readMore}>{t("blogReadMore")}</span>
      </div>
    </a>
  );
};

export default ArticleCard;
