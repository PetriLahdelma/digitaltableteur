import styles from "./PlanCard.module.css";

export interface PlanCardProps {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}

export default function PlanCard({
  name,
  price,
  features,
  highlighted = false,
}: PlanCardProps) {
  return (
    <article
      className={`${styles.card} ${highlighted ? styles.highlighted : ""}`}
      aria-labelledby={`plan-${name}`}
    >
      <h3 id={`plan-${name}`} className={styles.name}>
        {name}
      </h3>
      <p className={styles.price}>{price}</p>
      <ul className={styles.features}>
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <button type="button" className={styles.action}>
        Choose {name}
      </button>
    </article>
  );
}
