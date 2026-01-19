import React from "react";
import { cn } from "@/lib/utils";
import styles from "./GradientDots.module.css";

export interface GradientDotsProps {
  className?: string;
}

const GradientDots: React.FC<GradientDotsProps> = ({ className }) => {
  return <div className={cn(styles.root, className)} aria-hidden="true" />;
};

export default GradientDots;
