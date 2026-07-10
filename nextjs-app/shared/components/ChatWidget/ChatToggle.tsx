import React, { useCallback, useState } from "react";
import Button from "@dt/Button";
import { DonnyAvatar, type DonnyState } from "@dt/DonnyAvatar";
import styles from "./ChatWidget.module.css";
import { useTranslate } from "../../lib/translation";
import Icon from "@dt/Icon";

interface ChatToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  controlsId?: string;
}

// CSS selectors for elements that trigger Donny's curiosity
const CURIOSITY_SELECTORS = [
  "[data-contact-cta]",
  'a[href*="contact"]',
  'a[href*="mailto"]',
  'button[type="submit"]',
  ".contact-form",
  "[data-donny-interest]",
];

const ChatToggle = React.forwardRef<HTMLButtonElement, ChatToggleProps>(
  ({ isOpen, onToggle, controlsId }, ref) => {
    const t = useTranslate();
    const toggleLabel = t("chatToggleLabel", "Chat");
    const ariaLabel = isOpen
      ? `${toggleLabel} — ${t("chatToggleClose", "Hide chat")}`
      : `${toggleLabel} — ${t("chatToggleOpen", "Chat with Donny")}`;

    const [donnyState, setDonnyState] = useState<DonnyState>("idle");
    const [isHovered, setIsHovered] = useState(false);

    // Handle proximity to interesting elements
    const handleProximityChange = useCallback(
      (isNear: boolean, selector?: string) => {
        if (isOpen) return; // Don't react when chat is open

        if (isNear) {
          // React based on what element is nearby
          if (selector?.includes("contact") || selector?.includes("mailto")) {
            setDonnyState("curious");
          } else if (selector?.includes("submit")) {
            setDonnyState("impressed");
          } else {
            setDonnyState("playful");
          }
        } else if (!isHovered) {
          setDonnyState("idle");
        }
      },
      [isOpen, isHovered]
    );

    // Handle hover on the toggle itself
    const handleMouseEnter = useCallback(() => {
      setIsHovered(true);
      if (!isOpen) {
        setDonnyState("greeting");
      }
    }, [isOpen]);

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
      if (!isOpen) {
        setDonnyState("idle");
      }
    }, [isOpen]);

    // When chat opens, show success; when closes, wave goodbye
    React.useEffect(() => {
      if (isOpen) {
        setDonnyState("success");
        const timer = setTimeout(() => setDonnyState("idle"), 1000);
        return () => clearTimeout(timer);
      } else {
        setDonnyState("waving");
        const timer = setTimeout(() => setDonnyState("idle"), 800);
        return () => clearTimeout(timer);
      }
    }, [isOpen]);

    return (
      <Button
        type="button"
        rounded
        className={styles.toggle}
        ref={ref}
        data-open={isOpen}
        onClick={onToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        icon={
          isOpen ? (
            <Icon name="caret-down" ariaLabel={ariaLabel} />
          ) : (
            <DonnyAvatar
              decorative
              state={donnyState}
              size="sm"
              trackMouse={!isOpen}
              proximitySelectors={CURIOSITY_SELECTORS}
              onProximityChange={handleProximityChange}
              enableIdleExpressions={!isOpen}
              idleExpressionInterval={8000}
              enableSleepDetection={!isOpen}
              className={styles.toggleAvatar}
            />
          )
        }
        aria-expanded={isOpen}
        aria-controls={controlsId}
        aria-label={ariaLabel}
        variant="primary"
        size="md"
      >
        <span className={styles.toggleLabel}>{toggleLabel}</span>
      </Button>
    );
  }
);

ChatToggle.displayName = "ChatToggle";

export default ChatToggle;
