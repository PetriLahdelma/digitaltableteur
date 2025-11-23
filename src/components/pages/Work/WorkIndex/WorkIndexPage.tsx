"use client";

import React from "react";

import PageLayout from "../../../../patterns/PageLayout/PageLayout";
import styles from "./workIndex.module.css";

export function WorkIndexPage({ nav }: { nav?: React.ReactNode }) {
  return (
    <div className={styles.workPageContent}>
      {nav}
      <PageLayout maxWidth="full" spacing="comfortable" as="section">
        <section className={styles.works}>
          <div className={styles.worksGrid}>
            <a
              href="/work/new-things-co"
              rel="noopener noreferrer"
              className={styles.workItem}
              aria-label="View New Things Co project details"
            >
              <img
                src="/images/portfolio/new_things_co/new_things_co_item.webp"
                alt="New Things Co project preview"
                className={styles.workImage}
              />
              <span className="visuallyHidden">View New Things Co project</span>
            </a>
            <a
              href="/work/illustrations"
              rel="noopener noreferrer"
              className={styles.workItem}
              aria-label="View Illustrations project details"
            >
              <img
                src="/images/portfolio/illustrations/ice-cream.webp"
                alt="Illustrations project preview"
                className={styles.workImage}
              />
              <span className="visuallyHidden">View Illustrations project</span>
            </a>
            <a
              href="/work/garage-junction"
              rel="noopener noreferrer"
              className={styles.workItem}
              aria-label="View Garage Junction project details"
            >
              <img
                src="/images/portfolio/garage_junction/check_pattern@2x.webp"
                alt="Garage Junction project preview"
                className={styles.workImage}
              />
              <span className="visuallyHidden">
                View Garage Junction project
              </span>
            </a>
          </div>
        </section>
      </PageLayout>
    </div>
  );
}
