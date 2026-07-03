"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Container } from "@/nextjs-app/shared/components/Layout";
import { Stack } from "@/nextjs-app/shared/components/Layout";
import DtLink from "@dt/Link";
import { Divider } from "@dt/Divider";
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

/** Production site footer with social and legal links. */
export function SiteFooter({ className }: SiteFooterProps) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn("border-t border-border bg-muted/30 py-16", className)}
    >
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <p className="font-heading text-text-m font-semibold mb-3">
              {t("footerAddressTitle")}
            </p>
            <address className="font-body text-text-m text-muted-foreground not-italic leading-relaxed">
              <Link
                href="/"
                className="font-medium text-foreground hover:underline rounded-sm"
              >
                Digitaltableteur
              </Link>
              <br />
              {t("footerAddress1")}
              <br />
              {t("footerAddress2")}
              <br />
              <a
                href="mailto:mail@digitaltableteur.com"
                className="text-foreground hover:underline rounded-sm"
              >
                mail@digitaltableteur.com
              </a>
            </address>
          </div>

          {/* Billing Info */}
          <div>
            <p className="font-heading text-text-m font-semibold mb-3">
              {t("footerBillingTitle")}
            </p>
            <address className="font-body text-text-s text-muted-foreground not-italic leading-relaxed">
              <span className="font-medium text-foreground">{t("footerBillingEInvoiceLabel")}</span>
              <br />
              {t("footerBillingEInvoice")}
              <br />
              <span className="font-medium text-foreground">{t("footerBillingOperatorLabel")}</span>
              <br />
              {t("footerBillingOperator")}
              <br />
              <span className="font-medium text-foreground">{t("footerBillingOperatorIdLabel")}</span>
              <br />
              {t("footerBillingOperatorId")}
            </address>
          </div>

          {/* Primary navigation */}
          <div>
            <p className="font-heading text-text-m font-semibold mb-3">
              {t("footerExploreTitle")}
            </p>
            <Stack gap="xs">
              <DtLink href="/work" size="sm">
                {t("navWork")}
              </DtLink>
              <DtLink href="/about" size="sm">
                {t("navAbout")}
              </DtLink>
              <DtLink href="/blog" size="sm">
                {t("navBlog")}
              </DtLink>
              <DtLink href="/pricing" size="sm">
                {t("navPricing")}
              </DtLink>
              <DtLink href="/contact" size="sm">
                {t("navContact")}
              </DtLink>
            </Stack>
          </div>

          {/* Legal Links */}
          <div>
            <p className="font-heading text-text-m font-semibold mb-3">
              {t("footerLegalTitle")}
            </p>
            <Stack gap="xs">
              <DtLink href="/privacy-policy" size="sm">
                {t("footerPrivacyPolicy")}
              </DtLink>
              <DtLink href="/imprint" size="sm">
                {t("footerImprint")}
              </DtLink>
              <DtLink href="/ai-use" size="sm">
                {t("footerAiUse")}
              </DtLink>
              <DtLink href="/accessibility" size="sm">
                {t("footerAccessibility")}
              </DtLink>
              <DtLink href="/sitemap" size="sm">
                {t("footerSiteMap")}
              </DtLink>
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
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-sm"
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
