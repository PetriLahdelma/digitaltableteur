"use client";

import { Section } from "../../components/Section";
import { Container } from "../../components/Container";
import {
  AnimatedCounter,
  formatStatValue,
  type AnimatedCounterProps,
} from "../../components/animations/AnimatedCounter";
import { FadeIn } from "../../components/animations/FadeIn";
import Title from "../../components/Title";
import { cn } from "../../lib/cn";

export interface StatItem extends Omit<AnimatedCounterProps, "className"> {}

export interface StatsSectionProps {
  title?: string;
  stats: StatItem[];
  background?: "default" | "muted" | "accent" | "primary";
  className?: string;
}

function getStatDisplayValue(stat: StatItem): string {
  return formatStatValue(stat.value, stat.prefix ?? "", stat.suffix ?? "");
}

export function StatsSection({
  title,
  stats,
  background = "muted",
  className,
}: StatsSectionProps) {
  const bgClasses = {
    default: "text-foreground",
    muted: "bg-muted/30 text-foreground",
    accent: "bg-primary/5 text-foreground",
    primary: "bg-primary text-primary-foreground",
  };

  const statsSummaryLabel = title ?? "Statistics";

  return (
    <Section spacing="lg" className={cn(bgClasses[background], className)}>
      <Container size="lg">
        <dl className="sr-only" aria-label={statsSummaryLabel}>
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>
                <data value={stat.value}>{getStatDisplayValue(stat)}</data>
              </dd>
            </div>
          ))}
        </dl>
        <noscript>
          <ul>
            {stats.map((stat) => (
              <li key={stat.label}>
                {getStatDisplayValue(stat)} {stat.label}
              </li>
            ))}
          </ul>
        </noscript>
        {title && (
          <FadeIn direction="up" distance={20}>
            <Title
              level={2}
              unstyled
              className="font-display font-bold text-xl tablet:text-2xl mb-12 text-center"
            >
              {title}
            </Title>
          </FadeIn>
        )}
        <div
          className={cn(
            "grid gap-8 tablet:gap-12",
            stats.length === 3
              ? "grid-cols-1 tablet:grid-cols-3"
              : stats.length === 4
                ? "grid-cols-2 tablet:grid-cols-4"
                : "grid-cols-2 tablet:grid-cols-3",
          )}
          aria-hidden="true"
        >
          {stats.map((stat, index) => (
            <FadeIn
              key={stat.label}
              direction="up"
              delay={index * 0.1}
              distance={20}
            >
              <AnimatedCounter {...stat} />
            </FadeIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}

StatsSection.displayName = "StatsSection";
