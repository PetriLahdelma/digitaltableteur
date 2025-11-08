import React, { useEffect, useMemo, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Grid from "@dt/Grid";
import styles from "./Home.module.css";
import "../styles/variables.css";
import Title from "@dt/Title";
import Text from "@dt/Text";
import Link from "@dt/Link";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import Button from "@dt/Button";

const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.15, staggerChildren: 0.25 },
  },
};

const heroTitleVariants = {
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
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

const heroSubtextVariants = {
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
      ease: [0.25, 0.8, 0.25, 1],
    },
  },
};

const heroCtaContainerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delayChildren: 0.35, staggerChildren: 0.12 },
  },
};

const heroCtaItemVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 240, damping: 24 },
  },
};

const Home = () => {
  const { t } = useTranslation();
  const texts = useMemo(
    () => [
      t("homeCreativeDevelopment"),
      t("homeStrategyBranding"),
      t("homeIllustrationEditorial"),
    ],
    [t],
  );
  const [currentText, setCurrentText] = useState(texts[0]);

  useEffect(() => {
    setCurrentText(texts[0]); // Reset on language change
    const interval = setInterval(() => {
      setCurrentText((prevText) => {
        const currentIndex = texts.indexOf(prevText);
        const nextIndex = (currentIndex + 1) % texts.length;
        return texts[nextIndex];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [texts]);

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{t("homeMetaTitle")}</title>
          <meta name="description" content={t("homeMetaDescription")} />
          <meta property="og:title" content={t("homeMetaTitle")} />
          <meta property="og:description" content={t("homeMetaDescription")} />
          <meta property="og:image" content="/logo512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={t("homeMetaTitle")} />
          <meta name="twitter:description" content={t("homeMetaDescription")} />
          <meta name="twitter:image" content="/logo512.png" />
        </Helmet>
      </HelmetProvider>
      <div className={styles.home}>
        <section className={styles.hero}>
          <Grid columns={1} gap="1rem">
            <motion.div
              className={styles.heroGradient}
              variants={heroContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={heroTitleVariants}>
                <Title
                  level={2}
                  size="L"
                  terminals="sans"
                  className={styles.heroTitle}
                >
                  {t("homeHeroGradientTitle")}
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
              >
                <motion.a
                  href="/contact"
                  className={styles.heroCtaLink}
                  variants={heroCtaItemVariants}
                >
                  <Button variant="secondary" inverse size="l">
                    {t("homeHeroContactCta")}
                  </Button>
                </motion.a>
                <motion.a
                  href="/about"
                  className={styles.heroCtaLink}
                  variants={heroCtaItemVariants}
                >
                  <Button variant="secondary" inverse size="l">
                    {t("homeHeroAboutCta")}
                  </Button>
                </motion.a>
              </motion.div>
            </motion.div>
          </Grid>
        </section>
        <section className={styles.about}>
          <Title className={styles.gradientText} level={1} size="XL">
            {currentText}
          </Title>
          <Grid columns="repeat(auto-fit, minmax(280px, 1fr))" gap="1rem">
            <div className={styles["gridItemBlank"]}>
              <p className={styles.lead}>{t("homeAbout")}</p>
            </div>
          </Grid>
        </section>
        <section className={styles.cta}>
          <h2>{t("homeCtaTitle")}</h2>
          <Link className={`${styles.ctaLink} wavyUnderline`.trim()} href="/contact">
            {t("homeCtaLink")}
          </Link>
        </section>
      </div>
    </>
  );
};

export default Home;
