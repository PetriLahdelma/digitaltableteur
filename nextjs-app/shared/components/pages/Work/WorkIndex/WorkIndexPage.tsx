"use client";

import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Container } from "../../../../components/Container";
import { Section } from "../../../../components/Section";
import { WorkHero } from "../../../../patterns/WorkHero";
import { CategoryFilter } from "../../../../components/CategoryFilter";
import { WorkGrid } from "../../../../components/WorkGrid";
import { FadeIn } from "../../../../components/animations/FadeIn";
import {
  projects,
  categories,
  filterProjects,
  type ProjectCategory,
} from "../../../../data/projects";

export interface WorkIndexPageProps {
  /** Optional navigation component (e.g., NextWorkNav) */
  nav?: React.ReactNode;
}

export function WorkIndexPage({ nav }: WorkIndexPageProps) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("all");

  // Filter projects based on active category
  const filteredProjects = useMemo(() => {
    return filterProjects(projects, activeCategory);
  }, [activeCategory]);

  // Map categories to include translated labels
  const translatedCategories = useMemo(() => {
    return categories.map((cat) => ({
      value: cat.value,
      label: t(cat.labelKey, cat.labelKey),
    }));
  }, [t]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category as ProjectCategory);
  };

  return (
    <main className="min-h-screen" data-donny-target="work.index">
      {/* Navigation (if provided) */}
      {nav}

      {/* Hero Section */}
      <WorkHero />

      {/* Projects Section */}
      <Section spacing="follow" background="default">
        <Container size="lg">
          {/* Filter Bar with entrance animation */}
          <FadeIn delay={0.3} direction="up" distance={20} className="mb-12 tablet:mb-16">
            <CategoryFilter
              categories={translatedCategories}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              variant="pills"
              size="md"
            />
          </FadeIn>

          {/* Project Grid - removed project count for cleaner design */}
          <WorkGrid
            projects={filteredProjects}
            columns={4}
            animateItems={true}
            aspectRatio="square"
            showCategory={true}
          />
        </Container>
      </Section>
    </main>
  );
}
