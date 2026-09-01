"use client";

import { useTranslate } from "../../lib/translation";
import { useCookieConsentOptional } from "../../lib/cookieConsent";
import { cn } from "../../lib/cn";
import { Link as RouterLink } from "../../lib/linkComponent";
import { Container } from "../../components/Container";
import { Stack } from "../../components/Stack";
import DtLink from "../../components/Link";
import { SocialIconLink } from "../../components/SocialIconLink";
import { Divider } from "../../components/Divider";
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
  /** Optional wrapper class. */
  className?: string;
}

/** Production site footer with social and legal links. */
export function SiteFooter({ className }: SiteFooterProps) {
  const t = useTranslate();
  const currentYear = new Date().getFullYear();
  // Null-safe: renders the "Cookie preferences" trigger only where a
  // CookieConsentProvider is present (the live site). Stories/tests that render
  // the footer bare simply omit it, so the footer stays provider-agnostic.
  const consent = useCookieConsentOptional();

  return (
    <footer
      className={cn("border-t border-border bg-muted/30 py-16", className)}
    >
      <Container>
        {/* Below tablet only the Legal column survives. Stacked, the four
            columns ran 1328px on an 844px viewport — 1.57 screens of footer.
            Compressing them into narrow columns just traded height for a
            cramped measure, so the redundant ones are dropped instead:
            Explore is the burger menu verbatim, Billing is reproduced in full
            on /imprint, and Visit's contact route is the burger's Contact
            entry. All three stay in the DOM for tablet and desktop, where the
            footer is the "reached the bottom, where next?" affordance. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="hidden md:block lg:col-span-2">
            <p className="font-heading text-text-m font-semibold mb-3">
              {t("footerAddressTitle")}
            </p>
            <address className="font-body text-text-m text-muted-foreground not-italic leading-relaxed">
              <RouterLink
                href="/"
                className="font-medium text-foreground hover:underline rounded-sm"
              >
                Digitaltableteur
              </RouterLink>
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
          <div className="hidden md:block">
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
          <div className="hidden md:block">
            <p className="font-heading text-text-m font-semibold mb-3">
              {t("footerExploreTitle")}
            </p>
            <Stack gap="xs" align="start">
              <DtLink underline="hover" href="/" size="sm">
                {t("navHome")}
              </DtLink>
              <DtLink underline="hover" href="/work" size="sm">
                {t("navWork")}
              </DtLink>
              <DtLink underline="hover" href="/about" size="sm">
                {t("navAbout")}
              </DtLink>
              <DtLink underline="hover" href="/pricing" size="sm">
                {t("navPricing")}
              </DtLink>
              <DtLink underline="hover" href="/blog" size="sm">
                {t("navBlog")}
              </DtLink>
              <DtLink underline="hover" href="/contact" size="sm">
                {t("navContact")}
              </DtLink>
            </Stack>
          </div>

          {/* Legal Links */}
          <div>
            <p className="font-heading text-text-m font-semibold mb-3">
              {t("footerLegalTitle")}
            </p>
            <Stack gap="xs" align="start">
              <DtLink underline="hover" href="/privacy-policy" size="sm">
                {t("footerPrivacyPolicy")}
              </DtLink>
              <DtLink underline="hover" href="/imprint" size="sm">
                {t("footerImprint")}
              </DtLink>
              <DtLink underline="hover" href="/ai-use" size="sm">
                {t("footerAiUse")}
              </DtLink>
              <DtLink underline="hover" href="/accessibility" size="sm">
                {t("footerAccessibility")}
              </DtLink>
              <DtLink underline="hover" href="/sitemap" size="sm">
                {t("footerSiteMap")}
              </DtLink>
              {consent ? (
                // "Cookie preferences" belongs with the legal links. Link is
                // anchor-only, so this is a real <button> matched to the sibling
                // DtLinks (themed --link-color, 1rem, hover underline). Only
                // rendered where a CookieConsentProvider exists.
                <button
                  type="button"
                  onClick={consent.openBanner}
                  className="font-body text-base text-[color:var(--link-color)] bg-transparent border-0 p-0 cursor-pointer text-left hover:underline rounded-sm"
                >
                  {t("footerCookiePreferences")}
                </button>
              ) : null}
            </Stack>
          </div>
        </div>

        <Divider className="my-8" />

        {/* Social Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Stack direction="horizontal" gap="sm">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <SocialIconLink key={href} href={href} label={t(label)}>
                <Icon />
              </SocialIconLink>
            ))}
          </Stack>

          {/* <span>, not <p>: a global `p { margin-block-end }` rule (unlayered,
              so it beats Tailwind's m-0) added an asymmetric bottom margin that
              pushed the copyright above the social icons' centre in this row. */}
          <span className="font-body text-text-s text-muted-foreground">
            &copy; {currentYear} Digitaltableteur. {t("footerCopyright")}
          </span>
        </div>
      </Container>
    </footer>
  );
}
