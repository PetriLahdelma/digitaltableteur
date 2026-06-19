"use client";

import Link from "next/link";

import Badge from "@dt/Badge";

export type PseoMetaBadgeLink = {
  href: string;
  label: string;
};

export function PseoPillarMetaBadgeLinks({
  links,
  className,
  linkClassName,
  ariaLabel = "Explore related pillars",
}: {
  links: PseoMetaBadgeLink[];
  className?: string;
  linkClassName?: string;
  ariaLabel?: string;
}) {
  return (
    <div className={className} aria-label={ariaLabel}>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={linkClassName}>
          <Badge variant="secondary" tone="neutral" removable={false} size="md">
            <span>{link.label}</span>
          </Badge>
        </Link>
      ))}
    </div>
  );
}
