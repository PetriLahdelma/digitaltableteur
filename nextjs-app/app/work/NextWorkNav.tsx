"use client";

import { usePathname, useRouter } from "next/navigation";

import Button from "@dt/Button";
import Icon from "@dt/Icon";

const workPages = [
  { path: "/work/new-things-co", label: "New Things Co" },
  { path: "/work/illustrations", label: "Illustrations" },
  { path: "/work/garage-junction", label: "Garage Junction" },
];

export function NextWorkNav() {
  const pathname = usePathname();
  const router = useRouter();
  const currentIndex = workPages.findIndex((p) => p.path === pathname);

  return (
    <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.25rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="tertiary"
          size="m"
          icon={<Icon name="briefcase" ariaLabel="Back to work" />}
          onClick={() => router.push("/work")}
        >
          Back to work
        </Button>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
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
            Previous
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
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
