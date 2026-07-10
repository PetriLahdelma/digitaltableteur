import * as React from "react";
import { useTheme } from "@/nextjs-app/shared/components/ThemeProvider";
import { Image } from "../../lib/imageComponent";
import styles from "./Logo.module.css";

interface LogoProps {
  variant?: "filled" | "outline";
  className?: string;
  onClick?: () => void;
}

const Logo = ({ variant = "filled", className, onClick }: LogoProps) => {
  const { theme } = useTheme();

  // Map theme to logo filename
  const getLogoPath = () => {
    switch (theme) {
      case "dark":
        return "/dt-outline-dark@2x.webp";
      case "hcb":
        return "/dt-outline-HCB@2x.webp";
      case "hcw":
        return "/dt-outline-HCW@2x.webp";
      case "light":
      default:
        return "/dt-outline@2x.webp";
    }
  };

  if (variant === "outline") {
    const logoPath = getLogoPath();
    const shouldApplyBlur = theme !== "hcb" && theme !== "hcw";

    return (
      <div className={`${styles.logoWrapper} ${className || ""}`}>
        {shouldApplyBlur && (
          <div
            className={styles.logoBlur}
            style={{ backgroundImage: `url(${logoPath})` }}
          />
        )}
        <Image
          src={logoPath}
          alt="Digitaltableteur logo"
          width={256}
          height={256}
          onClick={onClick}
          className={`${styles.logoImage} ${shouldApplyBlur ? styles.logoImageBlend : styles.logoImageNormal}`}
        />
      </div>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      role={onClick ? "button" : "img"}
      className={className}
      onClick={onClick}
    >
      <path
        d="M105.7,76.3c-1.6,0-3.2.7-4.3,2.5-5.3,8.4-7.8,11.5-10.9,11.5s-2.5-5.7-2.5-10.1v-29.7c0-.3.2-.5.5-.5h9.2c6.5,0,6.5-10.4,0-10.4h-9.6c-.1,0-.2,0-.2-.2v-4.7c0-4.1-2.4-6.1-4.9-6.1s-4.9,2-4.9,6.1v4.7c0,.1,0,.2-.2.2h-20.8c-.1,0-.2,0-.2-.2v-6.3c0-3.3-2.4-4.9-4.9-4.9s-4.9,1.6-4.9,4.9v6.3c0,.1,0,.2-.2.2h-8c-6.5,0-6.5,10.4,0,10.4h8c.1,0,.2,0,.2.2v28.7c0,.3,0,.7-.2,1-1.8,5.1-7.8,10.3-13.6,10.3s-6.2-2.9-6.2-6.3,2.5-6.6,6.2-9.2c2.4-1.7,4.8-2.8,7.3-3.5,0,0,0,0,0,0,5.5-2.7,2.8-10.2-2.2-10.2h0c-.9,0-1.8.2-2.7.7-2.7,1.4-5.8,2.4-8.6,4.4-6.7,4.8-10.6,9.4-10.6,17.9s8,16.8,16.7,16.8,10.6-2.4,14.9-6c.1,0,.3,0,.3,0,1.5,3.9,5.6,6,11.5,6s12.9-6.9,17.5-14.6.4,0,.4.1c.3,7.5,2.1,14.5,12.2,14.5s11.6-2.7,20.1-16.3c2.6-4.2-1-8.2-4.7-8.2ZM78.2,69.1c0,2.3-11.8,21.9-17,21.9s-5.2-4.4-5.2-7.5c0-.5,0-.9,0-1.4v-31.1c0-.6.4-1,1-1h20.2c.6,0,1,.4,1,1v18.1Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default Logo;
