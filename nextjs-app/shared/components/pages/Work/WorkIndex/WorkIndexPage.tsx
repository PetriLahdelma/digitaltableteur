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
              href="/work/helsinki-design-system"
              rel="noopener noreferrer"
              className={styles.workItem}
              aria-label="View Helsinki Design System project details"
            >
              <Image
                src="/images/portfolio/helsinki-design-system/HDS_logo.png"
                alt="Helsinki Design System project"
                className={styles.workImage}
                width={500}
                height={500}
              />
              <span className="visuallyHidden">
                View Helsinki Design System project
              </span>
            </Link>
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
                width={500}
                height={500}
              />
              <span className="visuallyHidden">View New Things Co project</span>
            </Link>
            <Link
              href="/work/garage-junction"
              rel="noopener noreferrer"
              className={styles.workItem}
              aria-label="View Garage Junction project details"
            >
              <video
                src="/images/portfolio/garage_junction/GJ_loop.mov"
                className={styles.workImage}
                width={500}
                height={500}
                autoPlay
                loop
                muted
                playsInline
                aria-label="Garage Junction project preview"
              />
              <span className="visuallyHidden">
                View Garage Junction project
              </span>
            </Link>
            <Link
              href="/work/illustrations"
              rel="noopener noreferrer"
              className={styles.workItem}
              aria-label="View Illustrations project details"
            >
              <Image
                src="/images/portfolio/illustrations/ice-cream_square.webp"
                alt="Illustrations project preview"
                className={styles.workImage}
                width={500}
                height={500}
              />
              <span className="visuallyHidden">View Illustrations project</span>
            </Link>
          </div>
        </section>
      </PageLayout>
    </div>
  );
}
