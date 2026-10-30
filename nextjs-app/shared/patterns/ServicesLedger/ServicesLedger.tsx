"use client";

import { useState } from "react";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { SegmentedControl } from "../../components/SegmentedControl";
import { FadeIn } from "../../components/animations/FadeIn";
import { Link } from "../../lib/linkComponent";
import { cn } from "../../lib/cn";
import styles from "./ServicesLedger.module.css";

export interface ServicesLedgerItem {
  /** Display index, e.g. "01" */
  index: string;
  /** Upper snake-case label for the machine view, e.g. BUILD_THE_SYSTEM */
  machineKey: string;
  title: string;
  description: string;
  capabilities: string[];
  /** Where the row links */
  href: string;
  /** Donny site action target id when this row is a spotlight anchor */
  donnyTarget?: string;
}

export interface ServicesLedgerLink {
  /** Short label, e.g. LLMS */
  label: string;
  href: string;
}

export interface ServicesLedgerLabels {
  /** Accessible name of the Human / Machine switch */
  view: string;
  human: string;
  machine: string;
  /** Heading line of the machine view */
  machineTitle: string;
  /** Comment line under it */
  machineComment: string;
  copy: string;
  copied: string;
}

export interface ServicesLedgerProps {
  title?: string;
  description?: string;
  services: ServicesLedgerItem[];
  /** Machine-readable endpoints listed at the top of the machine view */
  machineLinks?: ServicesLedgerLink[];
  labels: ServicesLedgerLabels;
  className?: string;
  id?: string;
  /** Donny site action target id for this section */
  donnyTarget?: string;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function MachineView({
  services,
  links,
  labels,
}: {
  services: ServicesLedgerItem[];
  links: ServicesLedgerLink[];
  labels: ServicesLedgerLabels;
}) {
  const [copied, setCopied] = useState(false);
  const markdown = [
    `# ${labels.machineTitle}`,
    "",
    ...services.flatMap((s) => [
      `## ${s.index} ${s.title}`,
      s.description,
      "",
      `- capabilities: ${s.capabilities.map(slug).join(", ")}`,
      `- more: ${s.href}`,
      "",
    ]),
  ].join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={styles.machine}>
      <p className={styles.machineTitle}>{labels.machineTitle.toUpperCase()}</p>
      <p className={styles.machineMuted}>{labels.machineComment}</p>
      {links.length > 0 && (
        <dl className={styles.machineIndex}>
          {links.map((l) => (
            <div key={l.href}>
              <dt>{l.label}</dt>
              <dd>
                <a href={l.href}>{l.href}</a>
              </dd>
            </div>
          ))}
        </dl>
      )}
      <p className={styles.machineRule}>
        <span>WHAT_WE_OFFER</span>
      </p>
      <ul className={styles.machineList}>
        {services.map((s) => (
          <li key={s.machineKey}>
            <p className={styles.machineKey}>
              * {s.index} {s.machineKey}
            </p>
            <p>{s.description}</p>
            <p className={styles.machineMuted}>capabilities: {s.capabilities.map(slug).join(", ")}</p>
            <p className={styles.machineMuted}>
              more: <a href={s.href}>{s.href}</a>
            </p>
          </li>
        ))}
      </ul>
      <button type="button" className={styles.pill} onClick={copy} aria-live="polite">
        {copied ? labels.copied : labels.copy}
      </button>
    </div>
  );
}

/**
 * Services as a ruled ledger: one row per offer with its index, title,
 * description and capabilities; the whole row links. A Human / Machine switch
 * re-renders the same offers as plain text with the site's machine endpoints.
 */
export function ServicesLedger({
  title,
  description,
  services,
  machineLinks = [],
  labels,
  className,
  id = "services",
  donnyTarget = "home.services",
}: ServicesLedgerProps) {
  const [mode, setMode] = useState<"human" | "machine">("human");
  const panelId = `${id}-panel`;

  return (
    <Section
      id={id}
      data-donny-target={donnyTarget}
      className={cn("py-24 desktop:py-32", className)}
      aria-labelledby={title ? `${id}-title` : undefined}
    >
      <Container size="lg">
        {(title || description) && (
          // Same header as the other homepage sections (ServicesSection), but
          // the view switch belongs to it: it sits close under the heading,
          // not at the section's heading-to-content distance.
          <FadeIn className="text-center mb-6 desktop:mb-8">
            {title && (
              <h2
                id={`${id}-title`}
                className="font-display font-bold text-4xl tablet:text-5xl desktop:text-6xl text-foreground mb-6 tracking-tight"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="font-body text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {description}
              </p>
            )}
          </FadeIn>
        )}

        <div className={styles.bar}>
          <SegmentedControl
            items={[
              { value: "human", label: labels.human },
              { value: "machine", label: labels.machine },
            ]}
            value={mode}
            onValueChange={(next) => setMode(next as "human" | "machine")}
            ariaLabel={labels.view}
          />
        </div>

        <div id={panelId}>
          {mode === "machine" ? (
            <MachineView services={services} links={machineLinks} labels={labels} />
          ) : (
            <ol className={styles.ledger}>
              {services.map((s) => (
                <li key={s.machineKey}>
                  <Link href={s.href} className={styles.row} data-donny-target={s.donnyTarget}>
                    <span className={styles.index} aria-hidden="true">
                      {s.index}
                    </span>
                    <span className={styles.body}>
                      <span className={styles.rowTitle}>{s.title}</span>
                      <span className={styles.rowText}>{s.description}</span>
                    </span>
                    <ul className={styles.caps}>
                      {s.capabilities.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </Container>
    </Section>
  );
}

ServicesLedger.displayName = "ServicesLedger";
