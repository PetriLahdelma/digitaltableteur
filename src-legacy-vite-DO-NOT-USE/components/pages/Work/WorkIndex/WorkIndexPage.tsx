"use client";

import React from "react";

import PageLayout from "../../../../patterns/PageLayout/PageLayout";
import styles from "./workIndex.module.css";
import Image from "next/image";
import Link from "next/link";

export function WorkIndexPage({ nav }: { nav?: React.ReactNode }) {
  return (
    <div className={styles.workPageContent}>
      {nav}
      <PageLayout maxWidth="full" spacing="comfortable" as="section">
        <section className={styles.works}>
          <div className={styles.worksGrid}>
            <Link
              href="/work/new-things-co"
              rel="noopener noreferrer"
              className={styles.workItem}
              aria-label="View New Things Co project details"
            >
              <Image
                src="/images/portfolio/new_things_co/new_things_co_item.webp"
                alt="New Things Co project preview"
                className={styles.workImage}
                width={1200}
                height={800}
              />
              <span className="visuallyHidden">View New Things Co project</span>
            </Link>
            <Link
              href="/work/illustrations"
              rel="noopener noreferrer"
              className={styles.workItem}
              aria-label="View Illustrations project details"
            >
              <Image
                src="/images/portfolio/illustrations/ice-cream.webp"
                alt="Illustrations project preview"
                className={styles.workImage}
                width={1200}
                height={800}
              />
              <span className="visuallyHidden">View Illustrations project</span>
            </Link>
            <Link
              href="/work/garage-junction"
              rel="noopener noreferrer"
              className={styles.workItem}
              aria-label="View Garage Junction project details"
            >
              <Image
                src="/images/portfolio/garage_junction/check_pattern@2x.webp"
                alt="Garage Junction project preview"
                className={styles.workImage}
                width={1200}
                height={800}
              />
              <span className="visuallyHidden">
                View Garage Junction project
              </span>
            </Link>
          </div>
        </section>
      </PageLayout>
    </div>
  );
}
