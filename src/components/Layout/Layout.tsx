import React from "react";
import Header from "../../patterns/Header/Header";
import Footer from "../../patterns/Footer/Footer";
import Button from "../../Components/Button";
import ChatWidget from "../ChatWidget/ChatWidget";
import styles from "./Layout.module.css";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={styles.layout}>
      <Button
        variant="primary"
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
      <ChatWidget />
    </div>
  );
};

export default Layout;
