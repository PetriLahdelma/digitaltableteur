import React from "react";
import styles from "./Grid.module.css";

interface GridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: string;
  className?: string;
}

const Grid: React.FC<GridProps> = ({
  children,
  columns = 1,
  gap = "1rem",
  className = "",
}) => {
  return (
    <div
      className={`${styles.grid} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
      }}
    >
      {children}
    </div>
  );
};

export default Grid;
