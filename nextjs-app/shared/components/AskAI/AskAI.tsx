"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import Checkbox from "@dt/Checkbox";
import { cn } from "@/lib/utils";
import {
  ChatGPTIcon,
  ClaudeIcon,
  GeminiIcon,
  PerplexityIcon,
  type SvgIconProps,
} from "./ai-icons";
import styles from "./AskAI.module.css";

type Subject = "company" | "founder";
type AIIconComponent = (props: SvgIconProps) => ReactElement;

interface AIModel {
  id: string;
  name: string;
  icon: AIIconComponent;
  getUrl: (prompt: string) => string;
  /** Whether this model supports user profile memory for personalized context */
  supportsMemory?: boolean;
}

const AI_MODELS: AIModel[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    icon: ChatGPTIcon,
    getUrl: (prompt) =>
      `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`,
    supportsMemory: true,
  },
  {
    id: "claude",
    name: "Claude",
    icon: ClaudeIcon,
    getUrl: (prompt) =>
      `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
    supportsMemory: true,
  },
  {
    id: "gemini",
    name: "Gemini",
    icon: GeminiIcon,
    getUrl: (prompt) =>
      `https://gemini.google.com/app?q=${encodeURIComponent(prompt)}`,
    supportsMemory: true,
  },
  {
    id: "perplexity",
    name: "Perplexity",
    icon: PerplexityIcon,
    getUrl: (prompt) =>
      `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`,
    supportsMemory: false,
  },
];

const SUBJECTS: { id: Subject; labelKey: string; defaultLabel: string }[] = [
  { id: "company", labelKey: "askAISubjectCompany", defaultLabel: "Company" },
  { id: "founder", labelKey: "askAISubjectFounder", defaultLabel: "Founder" },
];

export interface AskAIProps {
  className?: string;
}

export function AskAI({ className }: AskAIProps) {
  const { t } = useTranslation();
  const [subject, setSubject] = useState<Subject>("company");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [personalizeContext, setPersonalizeContext] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Portal needs document.body — wait for mount
  useEffect(() => setMounted(true), []);

  const companyPrompt = t("askAIPromptCompany", {
    defaultValue:
      "Tell me about Digitaltableteur, a Finnish design consultancy specializing in Design Systems, DesignOps, and AI-augmented design workflows. What services do they offer and what makes them unique?",
  });

  const founderPrompt = t("askAIPromptFounder", {
    defaultValue:
      "Tell me about Petri Lahdelma, founder of Digitaltableteur. He is a Design Systems Specialist and DesignOps Engineer based in Finland with expertise in React, TypeScript, Figma, and AI-powered design workflows. What is his background and expertise?",
  });

  const personalizedCompanyPrompt = t("askAIPromptCompanyPersonalized", {
    defaultValue:
      "Based on what you know about me and my professional background, suggest how Digitaltableteur (a Finnish design consultancy specializing in Design Systems, DesignOps, and AI-augmented workflows) could help me with my current challenges. Consider my role, industry, and any goals I've shared with you.",
  });

  const personalizedFounderPrompt = t("askAIPromptFounderPersonalized", {
    defaultValue:
      "Based on what you know about me, explain how Petri Lahdelma's expertise (Design Systems, DesignOps, React, TypeScript, Figma, AI-powered workflows) as founder of Digitaltableteur could be relevant to my work or projects. Consider my background when suggesting potential collaboration areas.",
  });

  const basePrompt = subject === "company" ? companyPrompt : founderPrompt;
  const personalizedPrompt = subject === "company" ? personalizedCompanyPrompt : personalizedFounderPrompt;

  const getPromptForModel = (model: AIModel) => {
    if (personalizeContext && model.supportsMemory) {
      return personalizedPrompt;
    }
    return basePrompt;
  };
  const currentSubject = SUBJECTS.find((s) => s.id === subject)!;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [dropdownOpen]);

  const handleSubjectSelect = (newSubject: Subject) => {
    setSubject(newSubject);
    setDropdownOpen(false);
  };

  if (!mounted) return null;

  return createPortal(
    <aside className={cn(styles.container, className)} aria-label={t("askAIAriaLabel", "Ask AI about us")}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t("askAITitle", "Ask AI about")}</h2>
        <div className={styles.splitButton} ref={dropdownRef}>
          <span className={styles.splitButtonLabel}>
            {t(currentSubject.labelKey, currentSubject.defaultLabel)}
          </span>
          <button
            type="button"
            className={styles.splitButtonDropdown}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
            aria-label={t("askAISubjectLabel", "Select subject")}
          >
            <svg
              className={cn(styles.chevron, dropdownOpen && styles.chevronOpen)}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {dropdownOpen && (
            <ul className={styles.dropdown} role="listbox" aria-label={t("askAISubjectLabel", "Select subject")}>
              {SUBJECTS.map((s) => (
                <li key={s.id} role="option" aria-selected={subject === s.id}>
                  <button
                    type="button"
                    className={cn(
                      styles.dropdownItem,
                      subject === s.id && styles.dropdownItemActive
                    )}
                    onClick={() => handleSubjectSelect(s.id)}
                  >
                    {t(s.labelKey, s.defaultLabel)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ul className={styles.iconList}>
        {AI_MODELS.map((model) => {
          const Icon = model.icon;
          const prompt = getPromptForModel(model);
          const isPersonalized = personalizeContext && model.supportsMemory;
          return (
            <li key={model.id} className={styles.iconItem}>
              <a
                href={model.getUrl(prompt)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(styles.iconLink, isPersonalized && styles.iconLinkPersonalized)}
                aria-label={t("askAIOpenWith", { model: model.name, defaultValue: `Ask ${model.name}` })}
              >
                <Icon
                  className={cn(
                    styles.icon,
                    model.id === "gemini" && styles.iconGemini,
                    model.id === "perplexity" && styles.iconPerplexity,
                  )}
                  aria-hidden="true"
                />
              </a>
              <span className={styles.tooltip}>
                {model.name}
                {isPersonalized && ` ✨`}
              </span>
            </li>
          );
        })}
      </ul>

      <div className={styles.personalizeToggle}>
        <Checkbox
          id="askai-personalize"
          size="sm"
          label={t("askAIPersonalizeLabel", "Help me")}
          checked={personalizeContext}
          onCheckedChange={setPersonalizeContext}
        />
      </div>
    </aside>,
    document.body
  );
}

AskAI.displayName = "AskAI";
