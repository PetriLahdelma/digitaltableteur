import styles from "./Work.module.css";
import ParticlesBackground from "../components/ParticlesBackground";

const Work = () => {
  return (
    <div className={styles.workPage}>
      <section className={styles.section1}>
        <ul>
          <li>Strategy</li>
          <li>Concept development</li>
          <li>Identity systems</li>
          <li>Content</li>
          <li>Experimental</li>
          <li>Development</li>
          <li>Impact and sustainability</li>
        </ul>
      </section>
      <section className={styles.section2}>Section 2</section>
      <section className={styles.section3}>
        <ParticlesBackground
          title="Realtime Particle generation"
          subtitle="Particles Background"
          particleCount={2000}
        />
      </section>
      <section className={styles.section4}>Section 4</section>
      <section className={styles.section5}>Section 5</section>
      <section className={styles.section6}>Section 6</section>
      <section className={styles.section7}>Section 7</section>
      <section className={styles.section8}>Section 8</section>
    </div>
  );
};

export default Work;
