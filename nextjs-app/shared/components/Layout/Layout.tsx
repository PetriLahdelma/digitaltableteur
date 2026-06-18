import React from "react";
import Header from "../../patterns/Header/Header";
import Footer from "../../patterns/Footer/Footer";
import Button from "@dt/Button";
import ChatWidget from "@dt/ChatWidget";
import styles from "./Layout.module.css";

export interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Vite-era page shell: skip link, header, main landmark, footer, and chat widget.
 */
const Layout = ({ children }: LayoutProps) => {
  return (
    <div className={styles.layout}>
      <Button
        variant="primary"
        role="link"
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
