import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Grid from "../components/Grid/Grid";
import styles from "./Home.module.css";
import "../styles/variables.css";

const Home = () => {
  const [currentText, setCurrentText] = useState("Creative & Development");
  const texts = [
    "Creative & Development",
    "Strategy & Branding",
    "Illustration & Editorial Design",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prevText) => {
        const currentIndex = texts.indexOf(prevText);
        const nextIndex = (currentIndex + 1) % texts.length;
        return texts[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Helmet>
        <title>Digitaltableteur - Creative & Development</title>
        <meta
          name="description"
          content="Design-led digital studio delivering strategy, branding and development."
        />
      </Helmet>
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
              height: "75vh",
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
        <h1>{currentText}</h1>
        <Grid columns={3} gap="1rem">
          <div
            className={styles["grid-item-blank"]}
            style={{ gridColumn: "2 / span 2" }}
          >
            <p className={styles.lead}>
              That&apos;s what makes Digitaltableteur — a design-led digital
              studio. Based online, working globally. Helping brands and
              individuals rethink, simplify, and stand out. Whether it’s
              strategy, identity, interface, or experience — DS cuts through the
              noise to deliver clarity, presence, and expression. Well known for
              obsession to craft, systems, and a little bit of chaos.
            </p>
          </div>
        </Grid>
      </div>
    </>
  );
};

export default Home;
