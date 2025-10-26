import React, { useState } from "react";
import Modal from "@dt/Modal";
import Button from "@dt/Button";
import Text from "@dt/Text";
import styles from "./SecureCVDownload.module.css";

export interface SecureCVDownloadProps {
  /** Button text to trigger the modal */
  buttonText?: string;
  /** Button variant */
  buttonVariant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "error"
    | "warning"
    | "success"
    | "info";
}

const SecureCVDownload: React.FC<SecureCVDownloadProps> = ({
  buttonText = "Download CV",
  buttonVariant = "primary",
}) => {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://digitaltableteursecureproxy.vercel.app/api/download-cv",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || "Incorrect password");
        setLoading(false);
        return;
      }

      // Download file
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "CV.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      // Reset and close modal
      setPassword("");
      setError("");
      setShowModal(false);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setPassword("");
    setError("");
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleDownload();
    }
  };

  return (
    <>
      <Button variant={buttonVariant} onClick={() => setShowModal(true)}>
        {buttonText}
      </Button>

      <Modal
        isOpen={showModal}
        title="Enter Password"
        onClose={handleClose}
        showCloseIcon={true}
        footer={
          <div className={styles.modalFooter}>
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDownload}
              disabled={loading || !password.trim()}
            >
              {loading ? "Checking..." : "Download"}
            </Button>
          </div>
        }
      >
        <div className={styles.modalContent}>
          <Text className={styles.description}>
            Please enter the password to download the CV.
          </Text>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter password"
            className={styles.passwordInput}
            disabled={loading}
            autoFocus
          />
          {error && <Text className={styles.errorText}>{error}</Text>}
        </div>
      </Modal>
    </>
  );
};

export default SecureCVDownload;
