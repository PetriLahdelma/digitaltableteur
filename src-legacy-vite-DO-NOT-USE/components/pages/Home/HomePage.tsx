"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion, type Transition, type Variants } from "motion/react";

import Button from "@dt/Button";
import Card from "@dt/Card";
import Grid from "@dt/Grid";
import Link from "@dt/Link";
import Text from "@dt/Text";
import Title from "@dt/Title";
import { useTranslation } from "react-i18next";

import PageLayout from "../../../patterns/PageLayout/PageLayout";
import styles from "./Home.module.css";

const heroContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.15, staggerChildren: 0.25 },
  },
};

const heroTitleEase = [0.16, 1, 0.3, 1] as [number, number, number, number];
const heroTitleVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 96,
    scale: 0.9,
    rotateX: 0,
    skewY: 0,
    filter: "blur(18px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    skewY: 0,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: heroTitleEase },
  },
};

const heroSubtextEase = [0.25, 0.8, 0.25, 1] as [
  number,
  number,
  number,
  number,
];
const heroSubtextVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 48,
    scaleX: 0.7,
    filter: "blur(12px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scaleX: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.95,
      delay: 0.2,
      ease: heroSubtextEase,
    },
  },
};

const heroCtaContainerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delayChildren: 0.35, staggerChildren: 0.12 },
  },
};

const heroCtaSpring: Transition = {
  type: "spring",
  stiffness: 240,
  damping: 24,
};

const heroCtaItemVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: heroCtaSpring,
  },
};

export function HomePage() {
  const { t, i18n } = useTranslation();

  const getHeroTitleOptions = useCallback(() => {
    const options = t("homeHeroGradientTitleOptions", { returnObjects: true });

    if (Array.isArray(options)) {
      return options.filter(
        (option): option is string =>
          typeof option === "string" && option.trim().length > 0,
      );
    }

    return [] as string[];
  }, [i18n.language, t]);

  const pickHeroTitle = useCallback(() => {
    const options = getHeroTitleOptions();

    if (options.length === 0) {
      return t("homeHeroGradientTitle");
    }

    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  }, [getHeroTitleOptions, t]);

  const [heroTitle, setHeroTitle] = useState<string>(
    t("homeHeroGradientTitle"),
  );

  useEffect(() => {
    setHeroTitle(pickHeroTitle());
  }, [pickHeroTitle]);
  const highlightCards = useMemo(
    () => [
      {
        key: "ux-interfaces",
        title: t("homeUxInterfacesTitle"),
        description: t("homeUxInterfacesDescription"),
        variant: "outlined" as const,
      },
      {
        key: "creative",
        title: t("homeCreativeDevelopment"),
        description: t("homeCreativeDescription"),
        variant: "outlined" as const,
      },
      {
        key: "strategy",
        title: t("homeStrategyBranding"),
        description: t("homeStrategyDescription"),
        variant: "outlined" as const,
      },
      {
        key: "illustration",
        title: t("homeIllustrationEditorial"),
        description: t("homeIllustrationDescription"),
        variant: "outlined" as const,
      },
      {
        key: "ai",
        title: t("homeAiSolutionsTitle"),
        description: t("homeAiSolutionsDescription"),
        variant: "outlined" as const,
      },
      {
        key: "design systems",
        title: t("homeDesignSystemsTitle"),
        description: t("homeDesignSystemsDescription"),
        variant: "outlined" as const,
      },
    ],
    [t],
  );

  return (
    <div className={styles.home}>
      <PageLayout
        maxWidth="full"
        withMargins={false}
        spacing="compact"
        as="section"
      >
        <section className={styles.hero}>
          <Grid columns={1} gap="1rem">
            <motion.div
              className={styles.heroGradient}
              variants={heroContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={heroTitleVariants}
                className={styles.heroTitleWrapper}
              >
                <Title
                  level={2}
                  size="L"
                  terminals="sans"
                  className={styles.heroTitle}
                >
                  {heroTitle}
                </Title>
              </motion.div>
              <motion.div variants={heroSubtextVariants}>
                <Text size="M" terminals="sans" className={styles.heroSubtext}>
                  {t("homeHeroGradientSubtext")}
                </Text>
              </motion.div>
              <motion.div
                className={styles.heroCtas}
                variants={heroCtaContainerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={heroCtaItemVariants}>
                  <Button size="l" variant="secondary" inverse href="/contact">
                    {t("homeHeroCallToAction")}
                  </Button>
                </motion.div>
                <motion.div variants={heroCtaItemVariants}>
                  <Button size="l" variant="secondary" inverse href="/about">
                    {t("homeHeroAboutCta")}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </Grid>
        </section>
      </PageLayout>

      <PageLayout maxWidth="lg" spacing="comfortable" withMargins as="section">
        <section className={styles.heroHighlights}>
          <Grid
            className={styles.heroHighlightsGrid}
            columns="repeat(auto-fit, minmax(280px, 1fr))"
            gap="1.5rem"
          >
            {highlightCards.map((item) => (
              <Card
                key={item.key}
                title={item.title}
                size="M"
                className={styles.card}
              >
                <Text terminals="sans" size="M">
                  {item.description}
                </Text>
              </Card>
            ))}
          </Grid>
          <Title
            terminals="sans"
            level={2}
            size="S"
            lineHeight="snug"
            className={styles.lead}
          >
            {t("homeAbout")}
          </Title>
        </section>
      </PageLayout>

      <PageLayout maxWidth="full" spacing="comfortable" as="section">
        <section className={styles.cta}>
          <Title
            level={2}
            terminals="sans"
            size="L"
            className={styles.ctaTitle}
          >
            {t("homeCtaTitle")}
          </Title>
          <div className={styles.heroCtas}>
            <Link
              href="/contact"
              className={styles.heroCtaLink}
              aria-label={t("homeHeroCallToAction")}
            >
              {t("homeCtaLink")}
            </Link>
          </div>
        </section>
      </PageLayout>
    </div>
  );
}
