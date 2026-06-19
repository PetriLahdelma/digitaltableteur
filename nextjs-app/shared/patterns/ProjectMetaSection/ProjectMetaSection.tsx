"use client";

import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useRef,
} from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "@/nextjs-app/shared/lib/gsap";
import { useAnimationContext } from "@/providers/AnimationProvider";
import PageLayout from "../PageLayout";
import { FadeIn } from "../../components/animations/FadeIn";
import styles from "./ProjectMetaSection.module.css";

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
  /** Max width constraint for the section */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  /** Custom className */
  className?: string;
  /** Donny site action target id for the overview column */
  donnyTarget?: string;
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
  maxWidth = "md",
  className,
  donnyTarget,
}: ProjectMetaSectionProps) {
  const { t } = useTranslation();

  const servicesRef = useRef<HTMLUListElement>(null);
  const { motionPreference } = useAnimationContext();

  useGSAP(
    () => {
      if (motionPreference === "reduced" || !servicesRef.current) return;

      const serviceItems =
        servicesRef.current.querySelectorAll("[data-service]");
      if (!serviceItems.length) return;

      gsap.set(serviceItems, { opacity: 0, x: -10, scale: 0.9 });

      gsap.to(serviceItems, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.06,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: servicesRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: servicesRef, dependencies: [motionPreference] },
  );

  return (
    <section
      className={cn(backgroundClasses[background], className)}
      aria-label={t("projectDetailsSection", "Project Details")}
    >
      <PageLayout
        maxWidth={maxWidth}
        spacing="comfortable"
        as="div"
      >
        <div className="grid grid-cols-1 desktop:grid-cols-12 gap-8 desktop:gap-12">
          {/* Left column: Services, Duration, Tools */}
          <div className="desktop:col-span-4 space-y-8">
            {/* Services */}
            <FadeIn direction="up" delay={0} distance={20}>
              <div>
                <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                  {t("projectServicesTitle", "Services")}
                </h3>
                <ul ref={servicesRef} className="space-y-2">
                  {services.map((service) => (
                    <li
                      key={service}
                      data-service
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
                        {isValidElement(tool.icon)
                          ? cloneElement(
                              tool.icon as ReactElement<{
                                "aria-hidden"?: boolean;
                                focusable?: boolean;
                              }>,
                              {
                                "aria-hidden": true,
                                focusable: false,
                              },
                            )
                          : tool.icon}
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
                    {t("projectClientLabel", "Client")}
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
          <div className="desktop:col-span-8" data-donny-target={donnyTarget}>
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
                {t("projectTeamLabel", "Team")}
              </h3>
              <ul
                role="list"
                aria-label={t("projectTeamMembers", "Team members")}
                className="grid grid-cols-2 md:grid-cols-4 gap-6"
              >
                {team.map((member) => (
                  <li key={member.name} className="text-center">
                    {member.image ? (
                      <div className="relative w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-muted">
                        <Image
                          src={member.image}
                          alt={`${member.name}, ${member.role}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-20 h-20 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center"
                        role="img"
                        aria-label={`${member.name}, ${member.role}`}
                      >
                        <span className="text-2xl font-medium text-muted-foreground" aria-hidden="true">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <p className={cn("font-body font-medium text-sm text-foreground", styles.teamMemberName)}>
                      {member.name}
                    </p>
                    <p className={cn("font-body text-xs text-muted-foreground", styles.teamMemberRole)}>
                      {member.role}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        )}
      </PageLayout>
    </section>
  );
}

ProjectMetaSection.displayName = "ProjectMetaSection";
