import React from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import "../../styles/variables.css";
import "../../styles/fonts.css";
import Logo from "../../assets/images/01jy60fd46fxwvk450w70bmyzm_1750401080.webp";
import { useTheme } from "../../components/ThemeProvider/ThemeProvider";
import { WiMoonAltNew } from "react-icons/wi";
import { IoSunnySharp } from "react-icons/io5";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className={styles.header}>
      <Link to="/">
        <img src={Logo} alt="Digitaltableteur Logo" className={styles.logo} />
      </Link>
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
      <button
        onClick={toggleTheme}
        className={styles.themeToggle}
        aria-label="Toggle dark mode"
        style={{ marginLeft: "auto", marginRight: 0 }}
      >
        {theme === "dark" ? <WiMoonAltNew /> : <IoSunnySharp />}
      </button>
    </header>
  );
};

export default Header;
