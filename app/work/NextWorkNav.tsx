"use client";

import { usePathname, useRouter } from "next/navigation";

import Button from "@dt/Button";
import Icon from "@dt/Icon";
import { sortedProjects } from "@/nextjs-app/shared/data/projects";

import styles from "./NextWorkNav.module.css";

const workPages = sortedProjects.map((p) => ({
  path: `/work/${p.slug}`,
  label: p.title,
}));

export function NextWorkNav() {
  const pathname = usePathname();
  const router = useRouter();
  const currentIndex = workPages.findIndex((p) => p.path === pathname);

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <Button
          variant="tertiary"
          size="m"
          icon={<Icon name="briefcase" ariaLabel="Back to work" />}
          onClick={() => router.push("/work")}
        >
          <span className={styles.buttonLabel}>Back to work</span>
        </Button>
        <div className={styles.navButtons}>
          <Button
            variant="tertiary"
            size="m"
            icon={<Icon name="arrow-left" ariaLabel="Previous" />}
            disabled={currentIndex <= 0}
            onClick={() => {
              if (currentIndex > 0)
                router.push(workPages[currentIndex - 1].path);
            }}
          >
            <span className={styles.buttonLabel}>Previous</span>
          </Button>
          <Button
            variant="tertiary"
            size="m"
            endIcon={<Icon name="arrow-right" ariaLabel="Next" />}
            disabled={currentIndex === workPages.length - 1}
            onClick={() => {
              if (currentIndex < workPages.length - 1)
                router.push(workPages[currentIndex + 1].path);
            }}
          >
            <span className={styles.buttonLabel}>Next</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
