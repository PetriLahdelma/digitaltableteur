"use client";

import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@dt/Button";
import { FadeIn } from "../animations/FadeIn";

export interface ContactFormSuccessProps {
  /** Success title */
  title: string;
  /** Success message */
  message: string;
  /** Expected response time */
  responseTime?: string;
  /** Callback to send another message */
  onSendAnother?: () => void;
  /** Button label for sending another message */
  sendAnotherLabel?: string;
  /** Custom className */
  className?: string;
}

export function ContactFormSuccess({
  title,
  message,
  responseTime,
  onSendAnother,
  sendAnotherLabel = "Send another message",
  className,
}: ContactFormSuccessProps) {
  return (
    <FadeIn direction="up">
      <div
        className={cn(
          "flex flex-col items-center text-center py-12 px-6",
          "rounded-lg bg-muted/50",
          className
        )}
      >
        {/* Animated success icon */}
        <div
          className={cn(
            "w-16 h-16 rounded-full",
            "bg-green-500/10 text-green-500",
            "flex items-center justify-center",
            "mb-6",
            "animate-in zoom-in duration-300"
          )}
        >
          <CheckCircle className="w-10 h-10" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h3
          className={cn(
            "font-display font-semibold",
            "text-xl tablet:text-2xl",
            "text-foreground mb-3"
          )}
        >
          {title}
        </h3>

        {/* Message */}
        <p
          className={cn(
            "font-body text-muted-foreground",
            "text-base max-w-md mb-4"
          )}
        >
          {message}
        </p>

        {/* Response time */}
        {responseTime && (
          <p className="font-body text-sm text-muted-foreground mb-6">
            {responseTime}
          </p>
        )}

        {/* Send another button */}
        {onSendAnother && (
          <Button variant="secondary" onClick={onSendAnother}>
            {sendAnotherLabel}
          </Button>
        )}
      </div>
    </FadeIn>
  );
}

ContactFormSuccess.displayName = "ContactFormSuccess";
