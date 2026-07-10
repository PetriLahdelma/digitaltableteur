"use client";

import { MapPin, Mail, Phone } from "lucide-react";
import { cn } from "../../lib/cn";
import { FadeIn } from "../animations/FadeIn";

export interface LocationCardProps {
  /** Office name heading */
  officeName: string;
  /** Address lines */
  address: string[];
  /** Contact email */
  email?: string;
  /** Contact phone */
  phone?: string;
  /** Card variant */
  variant?: "default" | "bordered" | "elevated";
  /** Custom className */
  className?: string;
}

const variantClasses: Record<NonNullable<LocationCardProps["variant"]>, string> = {
  default: "bg-card",
  bordered: "bg-card border border-border",
  elevated: "bg-card shadow-lg",
};

export function LocationCard({
  officeName,
  address,
  email,
  phone,
  variant = "default",
  className,
}: LocationCardProps) {
  return (
    <FadeIn direction="up">
      <div
        className={cn(
          "rounded-lg p-6",
          variantClasses[variant],
          className
        )}
      >
        {/* Office name with map pin */}
        <div className="flex items-start gap-3 mb-4">
          <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <h3 className="font-display font-semibold text-lg text-foreground">
            {officeName}
          </h3>
        </div>

        {/* Address lines */}
        <div className="space-y-1 ml-8 mb-4">
          {address.map((line, index) => (
            <p key={index} className="text-muted-foreground font-body">
              {line}
            </p>
          ))}
        </div>

        {/* Contact info */}
        {(email || phone) && (
          <div className="space-y-2 ml-8 pt-4 border-t border-border">
            {email && (
              <a
                href={`mailto:${email}`}
                className={cn(
                  "flex items-center gap-2",
                  "text-primary transition-colors",
                  "hover:text-primary/80",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded"
                )}
              >
                <Mail className="w-4 h-4" />
                <span className="font-body">{email}</span>
              </a>
            )}
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className={cn(
                  "flex items-center gap-2",
                  "text-primary transition-colors",
                  "hover:text-primary/80",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded"
                )}
              >
                <Phone className="w-4 h-4" />
                <span className="font-body">{phone}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </FadeIn>
  );
}

LocationCard.displayName = "LocationCard";
