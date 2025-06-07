import React from "react";
import Grid from "../components/Grid/Grid";
import styles from "./Home.module.css";
import "../styles/variables.css";

const Home = () => {
  return (
    <div className={styles.home}>
      <Grid columns={1} gap="1rem">
        <div
          className={styles["grid-item-blank"]}
          style={{
            gridColumn: "1 / span 3",
            background:
              "linear-gradient(120deg, #007cf0 0%, #ff0080 50%, #fff200 100%)",
            backgroundSize: "200% 200%",
            animation: "gradientMove 4s ease-in-out infinite",
            height: "50vh",
          }}
        ></div>
        <style>
          {`
            @keyframes gradientMove {
              0% {
          background-position: 0% 50%;
              }
              50% {
          background-position: 100% 50%;
              }
              100% {
          background-position: 0% 50%;
              }
            }
          `}
        </style>
      </Grid>
      <h2>Creative & Development</h2>
      <Grid columns={3} gap="1rem">
        <div
          className={styles["grid-item-blank"]}
          style={{ gridColumn: "2 / span 2" }}
        >
          <p className={styles.lead}>
            That&apos;s what makes Digitaltableteur — a design-led digital
            studio. Based online, working globally. Helping brands and
            individuals rethink, simplify, and stand out. Whether it’s strategy,
            identity, interface, or experience — DS cuts through the noise to
            deliver clarity, presence, and expression. Well known for obsession
            to craft, systems, and a little bit of chaos.
          </p>
        </div>
      </Grid>
    </div>
  );
};

export default Home;
