"use client";

import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { FadeIn } from "../../components/animations/FadeIn";
import { ServiceCard } from "../../components/ServiceCard";
import { cn } from "@/lib/utils";

export interface ServiceItem {
  /** Icon element */
  icon: ReactNode;
  /** Service title */
  title: string;
  /** Service description */
  description: string;
  /** Optional link URL */
  href?: string;
}

export interface ServicesSectionProps {
  /** Section title */
  title?: string;
  /** Section description/lead text */
  description?: string;
  /** Array of services to display */
  services: ServiceItem[];
  /** Number of columns (responsive) */
  columns?: 2 | 3 | 4;
  /** Card style variant */
  cardVariant?: "default" | "bordered" | "elevated" | "minimal";
  /** Custom className */
  className?: string;
  /** Section ID for navigation */
  id?: string;
}

const columnClasses: Record<NonNullable<ServicesSectionProps["columns"]>, string> = {
  2: "grid-cols-1 tablet:grid-cols-2",
  3: "grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3",
  4: "grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4",
};

export function ServicesSection({
  title,
  description,
  services,
  columns = 3,
  cardVariant = "default",
  className,
  id = "services",
}: ServicesSectionProps) {
  const { t } = useTranslation();

  return (
    <Section
      id={id}
      className={cn("py-20 desktop:py-28", className)}
      aria-labelledby={title ? `${id}-title` : undefined}
    >
      <Container size="lg">
        {/* Section Header */}
        {(title || description) && (
          <FadeIn className="text-center mb-12 desktop:mb-16">
            {title && (
              <h2
                id={`${id}-title`}
                className="font-display font-bold text-3xl tablet:text-4xl desktop:text-5xl text-foreground mb-4"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </FadeIn>
        )}

        {/* Services Grid */}
        <div className={cn("grid gap-6", columnClasses[columns])}>
          {services.map((service, index) => (
            <FadeIn
              key={service.title}
              delay={index * 0.1}
              direction="up"
              distance={30}
            >
              <ServiceCard
                icon={service.icon}
                title={service.title}
                description={service.description}
                href={service.href}
                variant={cardVariant}
              />
            </FadeIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}

ServicesSection.displayName = "ServicesSection";
