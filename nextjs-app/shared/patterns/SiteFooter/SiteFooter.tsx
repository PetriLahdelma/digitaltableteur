"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Container } from "@/nextjs-app/shared/components/Layout";
import { Stack } from "@/nextjs-app/shared/components/Layout";
import { TextLink } from "@/nextjs-app/shared/components/TextLink";
import { Divider } from "@/nextjs-app/shared/components/Divider";
import {
  InstagramLogo,
  FacebookLogo,
  LinkedinLogo,
  GithubLogo,
  XLogo,
  DribbbleLogo,
  Newspaper,
  MediumLogo,
} from "@phosphor-icons/react";

interface SocialLink {
  href: string;
  icon: React.ElementType;
  label: string;
}

const socialLinks: SocialLink[] = [
  {
    href: "https://www.instagram.com/digitaltableteur/",
    icon: InstagramLogo,
    label: "footerAriaInstagram",
  },
  {
    href: "https://www.facebook.com/digitaltableteur",
    icon: FacebookLogo,
    label: "footerAriaFacebook",
  },
  {
    href: "https://www.linkedin.com/company/digitaltableteur/",
    icon: LinkedinLogo,
    label: "footerAriaLinkedin",
  },
  {
    href: "https://medium.com/digitaltableteur",
    icon: MediumLogo,
    label: "footerAriaMedium",
  },
  { href: "https://x.com/dtdoesdesign", icon: XLogo, label: "footerAriaX" },
  {
    href: "https://github.com/PetriLahdelma",
    icon: GithubLogo,
    label: "footerAriaGithub",
  },
  {
    href: "https://substack.com/@petrilahdelma",
    icon: Newspaper,
    label: "footerAriaSubstack",
  },
  {
    href: "https://dribbble.com/digitaltableteur",
    icon: DribbbleLogo,
    label: "footerAriaDribbble",
  },
];

export interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn("border-t border-border bg-muted/30 py-16", className)}
    >
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-heading text-title-m font-bold">
                Digitaltableteur
              </span>
            </Link>
            <div className="space-y-4 font-body text-text-m text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">
                  {t("footerAddressTitle")}
                </p>
                <p>{t("footerAddress1")}</p>
                <p>{t("footerAddress2")}</p>
                <a
                  href="mailto:mail@digitaltableteur.com"
                  className="text-foreground hover:underline"
                >
                  mail@digitaltableteur.com
                </a>
              </div>
            </div>
          </div>

          {/* Billing Info */}
          <div>
            <p className="font-heading text-text-m font-semibold mb-3">
              {t("footerBillingTitle")}
            </p>
            <div className="font-body text-text-s text-muted-foreground space-y-1">
              <p>{t("footerBillingName")}</p>
              <p>{t("footerBillingAddress")}</p>
              <p>{t("footerBillingZip")}</p>
              <p>{t("footerBillingVat")}</p>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <p className="font-heading text-text-m font-semibold mb-3">
              {t("footerLegalTitle")}
            </p>
            <Stack gap="xs">
              <TextLink href="/privacy-policy" variant="muted" underline="hover">
                {t("footerPrivacyPolicy")}
              </TextLink>
              <TextLink href="/ai-use" variant="muted" underline="hover">
                {t("footerAiUse")}
              </TextLink>
              <TextLink href="/accessibility" variant="muted" underline="hover">
                {t("footerAccessibility")}
              </TextLink>
            </Stack>
          </div>
        </div>

        <Divider className="my-8" />

        {/* Social Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Stack direction="horizontal" gap="sm">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={t(label)}
              >
                <Icon className="size-5" />
              </a>
            ))}
          </Stack>

          <p className="font-body text-text-s text-muted-foreground">
            &copy; {currentYear} Digitaltableteur. {t("footerCopyright")}
          </p>
        </div>
      </Container>
    </footer>
  );
}
