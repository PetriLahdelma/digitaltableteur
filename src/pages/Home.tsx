import Grid from "../components/Grid";
import styles from "./Home.module.css";
import "../styles/variables.css";

const Home = () => {
  console.log(styles); // Debugging the styles object

  return (
    <div className={styles.home}>
      <Grid columns={1} gap="1rem">
        <div className={styles["grid-item-purple"]}></div>
      </Grid>
      <h2>Creative & Development</h2>
      <Grid columns={2} gap="1rem">
        <div className={styles["grid-item-blank"]}></div>
        <div className={styles["grid-item-blank"]}><p className={styles.lead}>That's what makes Digitaltableteur — a design-led digital studio. Based online, working globally.
Helping brands and individuals rethink, simplify, and stand out. Whether it’s strategy, identity, interface, or experience — DS cuts through the noise to deliver clarity, presence, and expression.
Well known for obsession to craft, systems, and a little bit of chaos.</p>
</div>
      </Grid>
    </div>
  );
};

export default Home;
