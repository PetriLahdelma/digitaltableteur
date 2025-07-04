import React from "react";
const UnderDevelopment = () => {
  if (process.env.NODE_ENV !== "production") {
    return null; // Do not show in development
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "var(--color-black)",
        fontFamily: "var(--primary-body-font)",
        fontSize: "2rem",
        color: "var(--color-white)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10000,
      }}
    >
      <h2>Site Under Development! 🚧 Stay tuned!</h2>
    </div>
  );
};

export default UnderDevelopment;
