import React from "react";
import Header from "../../patterns/Header/Header";
import Footer from "../../patterns/Footer/Footer";
import Button from "../../components/Button/Button";
import styles from "./Layout.module.css";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={styles.layout}>
      <Button
        variant="secondary"
        accessibleRole="link"
        className={styles.skipLink}
        onClick={(e) => {
          e.preventDefault();
          const main = document.getElementById("main");
          if (main) main.focus();
          window.location.hash = "main";
        }}
      >
        Skip to main content
      </Button>
      <Header />
      <main id="main" className={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
