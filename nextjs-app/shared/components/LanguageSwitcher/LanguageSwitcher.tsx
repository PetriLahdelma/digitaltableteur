"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import styles from "./LanguageSwitcher.module.css";

export type LanguageSwitcherOption = {
  code: string;
  label: string;
  ariaLabel: string;
};

const defaultButtonClassName =
  "shrink-0 whitespace-nowrap px-2.5 py-1.5 text-sm font-heading font-semibold uppercase tracking-widest transition-colors cursor-pointer rounded-sm border border-transparent bg-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/5 hover:border-border";

const defaultActiveButtonClassName =
  "font-bold text-foreground hover:text-foreground";

/** Selected language when the menu is expanded (focused control). */
const defaultOpenTriggerClassName =
  "bg-foreground/5 border-foreground text-foreground hover:border-foreground";

/* text-foreground (not muted): the fanned-out options are interactive text
   and must meet 4.5:1 — muted-foreground measures ~2.9:1 on light surfaces. */
const defaultFloatedButtonClassName =
  "font-semibold text-foreground/80 hover:text-foreground";

export interface LanguageSwitcherProps {
  languages: LanguageSwitcherOption[];
  currentLang: string;
  onLanguageChange: (code: string) => void;
  className?: string;
  buttonClassName?: string;
  activeButtonClassName?: string;
  openTriggerClassName?: string;
  floatedButtonClassName?: string;
}

const fanSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export function LanguageSwitcher({
  languages,
  currentLang,
  onLanguageChange,
  className,
  buttonClassName = defaultButtonClassName,
  activeButtonClassName = defaultActiveButtonClassName,
  openTriggerClassName = defaultOpenTriggerClassName,
  floatedButtonClassName = defaultFloatedButtonClassName,
}: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const optionsId = useId();
  const prefersReducedMotion = useReducedMotion();

  const current =
    languages.find((lang) => lang.code === currentLang) ?? languages[0];
  const otherLanguages = languages
    .filter((lang) => lang.code !== currentLang)
    .reverse();

  const close = useCallback(() => setIsOpen(false), []);

  const handleSelect = useCallback(
    (code: string) => {
      onLanguageChange(code);
      close();
    },
    [close, onLanguageChange],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, isOpen]);

  return (
    <div
      ref={rootRef}
      className={cn(styles.root, className)}
      role="group"
      aria-label={t("navMenuLanguages", "Language")}
    >
      <div
        className={styles.optionsTrayAnchor}
        data-open={isOpen ? "true" : "false"}
        aria-hidden={!isOpen}
        /* aria-hidden flips at close while the exit animation still renders
           the option buttons; inert keeps that fading window unfocusable so
           keyboard focus can never land inside a hidden tray. */
        inert={!isOpen}
      >
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              className={styles.optionsTrayFan}
              initial={
                prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 10 }
              }
              animate={
                prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }
              }
              exit={
                prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 8 }
              }
              transition={
                prefersReducedMotion ? { duration: 0.12 } : fanSpring
              }
            >
              {otherLanguages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={cn(
                    styles.option,
                    buttonClassName,
                    floatedButtonClassName,
                  )}
                  aria-label={lang.ariaLabel}
                  onClick={() => handleSelect(lang.code)}
                >
                  {lang.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        className={cn(
          styles.trigger,
          styles.option,
          buttonClassName,
          activeButtonClassName,
          isOpen && openTriggerClassName,
        )}
        aria-expanded={isOpen}
        aria-controls={optionsId}
        aria-label={
          isOpen
            ? t("languageSwitcherCollapse", "Hide language options")
            : `${current.ariaLabel}. ${t("languageSwitcherExpand", "Show language options")}`
        }
        aria-current="true"
        onClick={() => setIsOpen((open) => !open)}
      >
        {current.label}
      </button>
      <span id={optionsId} className={styles.srOnly}>
        {isOpen
          ? t("languageSwitcherCollapse", "Hide language options")
          : t("languageSwitcherExpand", "Show language options")}
      </span>
    </div>
  );
}

LanguageSwitcher.displayName = "LanguageSwitcher";

export default LanguageSwitcher;
