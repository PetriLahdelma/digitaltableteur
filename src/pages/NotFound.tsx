import React from "react";
import styles from "./NotFound.module.css";
import notFoundImage from "../assets/images/404.webp";
import Button from "../components/Button/Button";

const NotFound = () => {
  return (
    <div className={styles.notFoundPage}>
      <img src={notFoundImage} alt="404 Not Found" />
      <Button variant="secondary" onClick={() => (window.location.href = "/")}>
        Go back to Home
      </Button>
    </div>
  );
};

export default NotFound;
