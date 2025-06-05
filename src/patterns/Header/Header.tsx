import React from "react";
import styles from "./Header.module.css";
import "../../styles/variables.css";
import "../../styles/fonts.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <h1>Digitaltableteur</h1>
      <nav>
        <ul className={styles.nav}>
          <li><a href="/">Home</a></li>
          <li><a href="/work">Work</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;