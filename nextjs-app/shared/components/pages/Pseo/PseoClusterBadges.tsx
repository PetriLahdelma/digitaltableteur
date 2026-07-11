"use client";

import Link from "next/link";

import { Badge } from "@digitaltableteur/react";

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
        <Badge variant="secondary" tone="neutral" removable={false} size="md">
          <span>Service: {serviceName}</span>
        </Badge>
      </Link>
      <Link href={stackHref} className={linkClassName}>
        <Badge variant="secondary" tone="neutral" removable={false} size="md">
          <span>Stack: {stackName}</span>
        </Badge>
      </Link>
      <Link href={audienceHref} className={linkClassName}>
        <Badge variant="secondary" tone="neutral" removable={false} size="md">
          <span>Audience: {audienceName}</span>
        </Badge>
      </Link>
    </div>
  );
}
