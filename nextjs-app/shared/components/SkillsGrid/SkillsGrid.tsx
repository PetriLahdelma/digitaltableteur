"use client";

import { type ReactNode, useMemo } from "react";
import { cn } from "../../lib/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@dt/Tooltip";
import { FadeIn } from "../animations/FadeIn";

export interface Skill {
  /** Icon element for the skill */
  icon: ReactNode;
  /** Skill name */
  name: string;
  /** Optional description shown in tooltip */
  description?: string;
  /** Optional category for grouping */
  category?: string;
}

export interface SkillsGridProps {
  /** Array of skills to display */
  skills: Skill[];
  /** Show category headers */
  showCategories?: boolean;
  /** Number of columns */
  columns?: 4 | 6 | 8;
  /** Custom className */
  className?: string;
}

const columnClasses: Record<NonNullable<SkillsGridProps["columns"]>, string> = {
  4: "grid-cols-2 tablet:grid-cols-4",
  6: "grid-cols-3 tablet:grid-cols-6",
  8: "grid-cols-4 tablet:grid-cols-8",
};

export function SkillsGrid({
  skills,
  showCategories = false,
  columns = 6,
  className,
}: SkillsGridProps) {
  // Group skills by category if enabled
  const groupedSkills = useMemo(() => {
    if (!showCategories) {
      return { Uncategorized: skills };
    }

    return skills.reduce(
      (acc, skill) => {
        const category = skill.category || "Other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(skill);
        return acc;
      },
      {} as Record<string, Skill[]>
    );
  }, [skills, showCategories]);

  const categories = Object.keys(groupedSkills);

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("space-y-8", className)}>
        {categories.map((category, categoryIndex) => (
          <div key={category}>
            {/* Category header */}
            {showCategories && category !== "Uncategorized" && (
              <FadeIn
                direction="up"
                delay={categoryIndex * 0.1}
                distance={20}
              >
                <h3
                  className={cn(
                    "font-display font-semibold",
                    "text-sm uppercase tracking-wider",
                    "text-muted-foreground",
                    "mb-4"
                  )}
                >
                  {category}
                </h3>
              </FadeIn>
            )}

            {/* Skills grid */}
            <div
              className={cn(
                "grid gap-4",
                columnClasses[columns]
              )}
            >
              {groupedSkills[category].map((skill, skillIndex) => (
                <FadeIn
                  key={skill.name}
                  direction="up"
                  delay={0.1 + (categoryIndex * 0.1) + (skillIndex * 0.03)}
                  distance={20}
                >
                  <SkillItem skill={skill} />
                </FadeIn>
              ))}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}

interface SkillItemProps {
  skill: Skill;
}

function SkillItem({ skill }: SkillItemProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center gap-2",
        "p-3 rounded-lg",
        "bg-background border border-border",
        "transition-all duration-200 ease-out",
        "hover:border-primary/50 hover:bg-muted/50",
        "cursor-default"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex items-center justify-center",
          "w-10 h-10",
          "text-muted-foreground",
          "transition-colors duration-200",
          "group-hover:text-primary"
        )}
      >
        {skill.icon}
      </div>

      {/* Name */}
      <span
        className={cn(
          "font-body text-xs",
          "text-muted-foreground text-center",
          "line-clamp-1"
        )}
      >
        {skill.name}
      </span>
    </div>
  );

  // Wrap in tooltip if description exists
  if (skill.description) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="group">{content}</div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-semibold mb-1">{skill.name}</p>
          <p className="opacity-80">{skill.description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return <div className="group">{content}</div>;
}

SkillsGrid.displayName = "SkillsGrid";
