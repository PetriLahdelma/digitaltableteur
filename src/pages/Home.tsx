import Grid from "../components/Grid";
import styles from "./Home.module.css";
import "../styles/variables.css";

const Home = () => {
  console.log(styles); // Debugging the styles object

  return (
    <div className={styles.home}>
      <p>Digitaltableteur</p>
      <h2>Creative & Development</h2>
      <Grid columns={3} gap="1rem">
        <div className={styles["grid-item-pink"]}></div>
        <div className={styles["grid-item-purple"]}></div>
        <div className={styles["grid-item-teal"]}></div>
        <div className={styles["grid-item-violet"]}></div>
        <div className={styles["grid-item-cyan"]}></div>
        <div className={styles["grid-item-yellow"]}></div>
      </Grid>
    </div>
  );
};

export default Home;
