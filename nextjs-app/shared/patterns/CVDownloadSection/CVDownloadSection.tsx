"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Section } from "../../components/Section";
import { Container } from "../../components/Container";
import { FadeIn } from "../../components/animations/FadeIn";
import SecureCVDownload from "@dt/SecureCVDownload";
import Title from "@dt/Title";

export interface CVDownloadSectionProps {
  /** Section title */
  title: string;
  /** Section description */
  description: string;
  /** Email to request password */
  email: string;
  /** Background variant */
  background?: "primary" | "gradient" | "dark";
  /** Custom className */
  className?: string;
}

const backgroundClasses: Record<
  NonNullable<CVDownloadSectionProps["background"]>,
  string
> = {
  primary: "bg-primary text-primary-foreground",
  gradient:
    "bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground",
  dark: "bg-zinc-900 text-white",
};

export function CVDownloadSection({
  title,
  description,
  email,
  background = "primary",
  className,
}: CVDownloadSectionProps) {
  return (
    <Section
      spacing="none"
      className={cn(
        "py-16 desktop:py-24",
        backgroundClasses[background],
        className,
      )}
    >
      <Container size="md">
        <FadeIn direction="up">
          <div className="flex flex-col items-center text-center gap-6">
            <Title
              level={2}
              className={cn(
                "font-display font-bold",
                "text-2xl tablet:text-3xl desktop:text-4xl",
              )}
            >
              {title}
            </Title>

            <p
              className={cn(
                "font-body text-base tablet:text-lg",
                "text-white/80 max-w-xl",
              )}
            >
              {description}{" "}
              <Link
                href={`mailto:${email}`}
                className="underline underline-offset-4 hover:text-white transition-colors"
              >
                {email}
              </Link>
            </p>

            <div className="mt-2">
              <SecureCVDownload buttonVariant="secondary" inverse />
            </div>
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}

CVDownloadSection.displayName = "CVDownloadSection";
