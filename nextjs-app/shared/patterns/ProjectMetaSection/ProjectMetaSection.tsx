"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { FadeIn } from "../../components/animations/FadeIn";

export interface ToolItem {
  /** Tool icon */
  icon: ReactNode;
  /** Tool name */
  name: string;
  /** Unique key for React */
  key: string;
}

export interface TeamMember {
  /** Member name */
  name: string;
  /** Member role */
  role: string;
  /** Member image path */
  image?: string;
}

export interface ClientInfo {
  /** Client name */
  name: string;
  /** Client logo path */
  logo?: string;
}

export interface ProjectMetaSectionProps {
  /** List of services/skills */
  services: string[];
  /** Project duration */
  duration?: string;
  /** Tools used */
  tools?: ToolItem[];
  /** Team members */
  team?: TeamMember[];
  /** Client info */
  client?: ClientInfo;
  /** Overview content */
  overview?: ReactNode;
  /** Background variant */
  background?: "default" | "muted" | "accent";
  /** Custom className */
  className?: string;
}

const backgroundClasses: Record<NonNullable<ProjectMetaSectionProps["background"]>, string> = {
  default: "bg-background",
  muted: "bg-muted/30",
  accent: "bg-primary/5",
};

export function ProjectMetaSection({
  services,
  duration,
  tools,
  team,
  client,
  overview,
  background = "default",
  className,
}: ProjectMetaSectionProps) {
  const { t } = useTranslation();

  return (
    <Section
      spacing="lg"
      background="default"
      className={cn(backgroundClasses[background], className)}
    >
      <Container size="md">
        <div className="grid grid-cols-1 desktop:grid-cols-12 gap-8 desktop:gap-12">
          {/* Left column: Services, Duration, Tools */}
          <div className="desktop:col-span-4 space-y-8">
            {/* Services */}
            <FadeIn direction="up" delay={0} distance={20}>
              <div>
                <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                  {t("projectServicesTitle", "Services")}
                </h3>
                <ul className="space-y-2">
                  {services.map((service) => (
                    <li
                      key={service}
                      className="font-body text-sm text-foreground flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            {/* Duration */}
            {duration && (
              <FadeIn direction="up" delay={0.1} distance={20}>
                <div>
                  <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">
                    {t("projectDurationLabel", "Duration")}
                  </h3>
                  <p className="font-body text-sm text-foreground">{duration}</p>
                </div>
              </FadeIn>
            )}

            {/* Tools */}
            {tools && tools.length > 0 && (
              <FadeIn direction="up" delay={0.2} distance={20}>
                <div>
                  <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                    {t("projectToolsLabel", "Tools")}
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {tools.map((tool) => (
                      <div
                        key={tool.key}
                        className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        title={tool.name}
                      >
                        <span className="sr-only">{tool.name}</span>
                        {tool.icon}
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Client */}
            {client && (
              <FadeIn direction="up" delay={0.3} distance={20}>
                <div>
                  <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">
                    Client
                  </h3>
                  {client.logo ? (
                    <div className="relative h-10 w-auto">
                      <Image
                        src={client.logo}
                        alt={client.name}
                        height={40}
                        width={120}
                        className="object-contain object-left h-full w-auto"
                      />
                    </div>
                  ) : (
                    <p className="font-body text-sm font-medium text-foreground">
                      {client.name}
                    </p>
                  )}
                </div>
              </FadeIn>
            )}
          </div>

          {/* Right column: Overview */}
          <div className="desktop:col-span-8">
            <FadeIn direction="up" delay={0.2} distance={30}>
              <div>
                <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                  {t("projectOverviewLabel", "Overview")}
                </h3>
                <div className="prose prose-sm max-w-none font-body text-foreground">
                  {overview}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Team section (if provided, full width) */}
        {team && team.length > 0 && (
          <FadeIn direction="up" delay={0.4} distance={30}>
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-6">
                Team
              </h3>
              <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-5 gap-6">
                {team.map((member) => (
                  <div key={member.name} className="text-center">
                    {member.image ? (
                      <div className="relative w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-muted">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-2xl font-medium text-muted-foreground">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <p className="font-body font-medium text-sm text-foreground">
                      {member.name}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}
      </Container>
    </Section>
  );
}

ProjectMetaSection.displayName = "ProjectMetaSection";
