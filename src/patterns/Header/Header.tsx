import React from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import "../../styles/variables.css";
import "../../styles/fonts.css";
import Logo from "../../assets/images/01jy60fd46fxwvk450w70bmyzm_1750401080.webp";
import ScrollTitle from "../../components/ScrollTitle/ScrollTitle";

const Header = () => {
  return (
    <header className={styles.header}>
      <Link to="/">
        <img
          src={Logo}
          alt="Digitaltableteur Logo"
          className={`${styles.logo} ${
            typeof window !== "undefined" && window.scrollY > 50
              ? styles.logoScrolled
              : ""
          }`}
        />
      </Link>
      {typeof window !== "undefined" && <ScrollTitle />}

      <nav>
        <ul className={styles.nav}>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/work">Work</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/blog">Blog</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
