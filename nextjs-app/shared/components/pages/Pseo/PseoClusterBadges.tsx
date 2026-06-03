"use client";

import Link from "next/link";

import Badge from "@dt/Badge";

type ClusterBadgesProps = {
  serviceHref: string;
  serviceName: string;
  stackHref: string;
  stackName: string;
  audienceHref: string;
  audienceName: string;
  className?: string;
  linkClassName?: string;
};

export function PseoClusterBadges({
  serviceHref,
  serviceName,
  stackHref,
  stackName,
  audienceHref,
  audienceName,
  className,
  linkClassName,
}: ClusterBadgesProps) {
  return (
    <div className={className} aria-label="Explore this cluster">
      <Link href={serviceHref} className={linkClassName}>
        <Badge design="secondary" state="neutral" removable={false} size="m">
          <span>Service: {serviceName}</span>
        </Badge>
      </Link>
      <Link href={stackHref} className={linkClassName}>
        <Badge design="secondary" state="neutral" removable={false} size="m">
          <span>Stack: {stackName}</span>
        </Badge>
      </Link>
      <Link href={audienceHref} className={linkClassName}>
        <Badge design="secondary" state="neutral" removable={false} size="m">
          <span>Audience: {audienceName}</span>
        </Badge>
      </Link>
    </div>
  );
}
