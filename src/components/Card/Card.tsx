import React from "react";
import styles from "./Card.module.css";

export interface CardProps {
  title: string;
  body?: string;
  link?: string;
  icon?: React.ReactNode;
  linkLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  body,
  link,
  icon,
  linkLabel,
  className = "",
  children,
}) => {
  const content = (
    <div className={`${styles.card} ${className}`} tabIndex={link ? -1 : 0}>
      <div className={styles.header}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.title}>{title}</span>
      </div>
      {body && <div className={styles.body}>{body}</div>}
      {children && <div className={styles.body}>{children}</div>}
    </div>
  );

  return link ? (
    <a href={link} className={`${styles.card} ${className}`} tabIndex={0}>
      <div className={styles.header}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.title}>{title}</span>
      </div>
      {body && <div className={styles.body}>{body}</div>}
      {children && <div className={styles.body}>{children}</div>}
    </a>
  ) : (
    content
  );
};

export default Card;
