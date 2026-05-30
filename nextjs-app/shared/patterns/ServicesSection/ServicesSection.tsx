"use client";

import { type ReactNode } from "react";
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
  /** Donny site action target id when this card is a spotlight anchor */
  donnyTarget?: string;
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
  /** Donny site action target id for this section */
  donnyTarget?: string;
}

/**
 * ServicesSection component.
 */
export function ServicesSection({
  title,
  description,
  services,
  columns = 3,
  cardVariant = "default",
  className,
  id = "services",
  donnyTarget = "home.services",
}: ServicesSectionProps) {
  // Grid column classes - using standard Tailwind breakpoints (md: 768px, lg: 1024px)
  const gridClasses = cn(
    "grid gap-8 lg:gap-10",
    columns === 2 && "grid-cols-1 md:grid-cols-2",
    columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  );

  return (
    <Section
      id={id}
      donnyTarget={donnyTarget}
      className={cn("py-24 desktop:py-32", className)}
      aria-labelledby={title ? `${id}-title` : undefined}
    >
      <Container size="lg">
        {/* Section Header */}
        {(title || description) && (
          <FadeIn className="text-center mb-16 desktop:mb-20">
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

        {/* Services Grid */}
        <div className={gridClasses}>
          {services.map((service, index) => (
            <FadeIn
              key={service.title}
              delay={index * 0.1}
              direction="up"
              distance={30}
              className="h-full"
            >
              <ServiceCard
                icon={service.icon}
                title={service.title}
                description={service.description}
                href={service.href}
                variant={cardVariant}
                donnyTarget={service.donnyTarget}
              />
            </FadeIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}

ServicesSection.displayName = "ServicesSection";
