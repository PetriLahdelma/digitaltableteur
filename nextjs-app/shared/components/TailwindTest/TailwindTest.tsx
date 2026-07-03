"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  FadeIn,
  SlideIn,
  TextReveal,
  Parallax,
} from "@/nextjs-app/shared/components/animations";
import {
  Container,
  Stack,
  Center,
  AspectRatio,
} from "@/nextjs-app/shared/components/Layout";
import {
  Divider,
  IconButton,
  Prose,
  FormField,
} from "@/nextjs-app/shared/components/ui";
import Badge from "@dt/Badge";
import Checkbox from "@dt/Checkbox";
import Link from "@dt/Link";
import { useToast } from "@/providers/ToastProvider";
import { Lightbox } from "@/nextjs-app/shared/components/Lightbox";
import { ArrowRight, Heart, Share, Star, Image as ImageIcon } from "@phosphor-icons/react";
import { NavLink } from "@/nextjs-app/shared/patterns/navigation";

/**
 * Temporary test component to verify Tailwind CSS + shadcn/ui integration.
 * DELETE THIS after Phase 01 is verified working.
 */
export default function TailwindTest() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <div className="p-8 bg-background border border-border rounded-lg max-w-2xl mx-auto my-8">
      <h2 className="font-serif text-2xl text-foreground mb-4">
        Tailwind + shadcn/ui Test
      </h2>

      <p className="font-sans text-base text-muted-foreground mb-8">
        If you can see this styled correctly, the setup is working!
      </p>

      {/* shadcn/ui Button variants */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Button>Primary Button</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>

      {/* shadcn/ui Dialog */}
      <div className="mb-8">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accessible Dialog</DialogTitle>
              <DialogDescription>
                This dialog is built with Radix UI primitives and is fully
                accessible (keyboard navigation, focus trap, screen reader
                support).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" className="col-span-3" />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* shadcn/ui Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. Built on Radix UI primitives with full keyboard navigation and
            ARIA support.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled with Tailwind?</AccordionTrigger>
          <AccordionContent>
            Yes. All styles use Tailwind utilities mapped to our design tokens.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Does it support our themes?</AccordionTrigger>
          <AccordionContent>
            Yes. The shadcn/ui CSS variables are mapped to our existing theme
            system (light, dark, HC white, HC black).
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-8 p-4 bg-muted rounded-sm">
        <p className="text-sm text-muted-foreground">
          Theme tokens from CSS variables are being used via Tailwind utilities
          + shadcn/ui components.
        </p>
      </div>

      {/* Typography Demo - Phase 02 */}
      <div className="mt-8 pt-8 border-t border-border">
        <h3 className="font-heading text-title-m font-bold mb-6">
          Typography System (Satoshi)
        </h3>

        <div className="space-y-4">
          <p className="font-heading text-display font-bold leading-tight">
            Display — SatoshiBold
          </p>
          <p className="font-heading text-title-xl font-semibold">
            Heading XL — SatoshiSemibold
          </p>
          <p className="font-heading text-title-l font-medium">
            Heading L — SatoshiMedium
          </p>
          <p className="font-heading text-title-m">
            Heading M — SatoshiRegular
          </p>
          <p className="font-body text-text-l">
            Body Large — Satoshi for body text and UI elements
          </p>
          <p className="font-body text-text-m">
            Body Medium — Clean and readable at any size
          </p>
          <p className="font-body text-text-s text-muted-foreground">
            Body Small — Muted for secondary content
          </p>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-sm">
          <p className="font-body text-text-s">
            <strong className="font-heading">Font Stack:</strong> Satoshi (single typeface, headings + body)
          </p>
        </div>
      </div>

      {/* Animation Demo - Phase 03 */}
      <div className="mt-8 pt-8 border-t border-border">
        <h3 className="font-heading text-title-m font-bold mb-6">
          Animation Primitives (GSAP + Lenis)
        </h3>

        {/* FadeIn Demo */}
        <div className="space-y-4 mb-8">
          <FadeIn direction="up" delay={0}>
            <div className="p-4 bg-muted rounded-sm">
              <p className="font-body text-text-m">
                <strong>FadeIn Up</strong> — Fades in from below on scroll
              </p>
            </div>
          </FadeIn>

          <FadeIn direction="left" delay={0.1}>
            <div className="p-4 bg-muted rounded-sm">
              <p className="font-body text-text-m">
                <strong>FadeIn Left</strong> — Fades in from the left
              </p>
            </div>
          </FadeIn>

          <FadeIn direction="right" delay={0.2}>
            <div className="p-4 bg-muted rounded-sm">
              <p className="font-body text-text-m">
                <strong>FadeIn Right</strong> — Fades in from the right
              </p>
            </div>
          </FadeIn>
        </div>

        {/* SlideIn Demo */}
        <div className="mb-8">
          <p className="font-body text-text-s text-muted-foreground mb-2">
            SlideIn with stagger effect:
          </p>
          <SlideIn direction="left" stagger={0.15}>
            <div className="p-3 bg-primary/10 rounded-sm mb-2">
              <p className="font-body text-text-m">SlideIn Item 1</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-sm mb-2">
              <p className="font-body text-text-m">SlideIn Item 2</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-sm">
              <p className="font-body text-text-m">SlideIn Item 3</p>
            </div>
          </SlideIn>
        </div>

        {/* TextReveal Demo */}
        <div className="mb-8 space-y-4">
          <TextReveal
            as="h4"
            type="words"
            animation="slide"
            className="font-heading text-title-l font-bold"
          >
            Kinetic Typography Demo
          </TextReveal>

          <TextReveal as="p" type="chars" animation="wave" stagger={0.01}>
            Each character animates individually with a wave effect.
          </TextReveal>
        </div>

        {/* Parallax Demo */}
        <div className="mb-8 h-32 bg-muted/30 rounded-sm overflow-hidden">
          <Parallax speed={-0.2}>
            <div className="p-6 text-center">
              <p className="font-body text-text-l">
                This content moves slower than scroll (parallax effect)
              </p>
            </div>
          </Parallax>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-sm">
          <p className="font-body text-text-s">
            <strong className="font-heading">Animation Stack:</strong> GSAP (animations) + Lenis (smooth scroll) + ScrollTrigger (scroll-driven)
          </p>
          <p className="font-body text-text-s text-muted-foreground mt-2">
            All animations respect prefers-reduced-motion for accessibility.
          </p>
        </div>
      </div>

      {/* Layout Demo - Phase 04 */}
      <div className="mt-8 pt-8 border-t border-border">
        <h3 className="font-heading text-title-m font-bold mb-6">
          Layout Primitives
        </h3>

        <Stack gap="lg">
          {/* Container demo */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-2">Container (md):</p>
            <Container size="md" className="bg-primary/10 p-4 rounded">
              <p className="font-body text-text-m text-center">Centered content with max-width</p>
            </Container>
          </div>

          {/* Stack demo */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-2">Stack (horizontal, gap-md):</p>
            <Stack direction="horizontal" gap="md">
              <div className="bg-primary/20 p-3 rounded">Item 1</div>
              <div className="bg-primary/20 p-3 rounded">Item 2</div>
              <div className="bg-primary/20 p-3 rounded">Item 3</div>
            </Stack>
          </div>

          {/* Center demo */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-2">Center:</p>
            <Center className="h-24 bg-primary/10 rounded">
              <p className="font-body text-text-m">Centered content</p>
            </Center>
          </div>

          {/* AspectRatio demo */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-2">AspectRatio (16:9):</p>
            <AspectRatio ratio="16:9" className="bg-primary/20 rounded max-w-sm">
              <Center className="h-full">
                <p className="font-body text-text-m">16:9 Container</p>
              </Center>
            </AspectRatio>
          </div>
        </Stack>

        <div className="mt-6 p-4 bg-muted/50 rounded-sm">
          <p className="font-body text-text-s">
            <strong className="font-heading">Layout Stack:</strong> Container, Section, Stack, Spacer, Center, AspectRatio + existing Grid/FlexBox
          </p>
        </div>
      </div>

      {/* UI Components Demo - Phase 05 */}
      <div className="mt-8 pt-8 border-t border-border">
        <h3 className="font-heading text-title-m font-bold mb-6">
          UI Components (Tailwind-first)
        </h3>

        <Stack gap="lg">
          {/* Studio Button Variants */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-3">Button Studio Variants:</p>
            <Stack direction="horizontal" gap="sm" wrap>
              <Button variant="primary">Primary</Button>
              <Button variant="inverse">Inverse</Button>
              <Button variant="minimal">Minimal</Button>
              <Button variant="primary" size="xl">XL Size</Button>
            </Stack>
          </div>

          {/* Link Variants */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-3">Link Variants:</p>
            <Stack direction="horizontal" gap="md" wrap>
              <Link href="/about" size="sm">Default Link</Link>
              <Link href="/work" size="md">Medium Link</Link>
              <Link href="/contact" size="lg">Large Link</Link>
              <Link href="https://example.com">
                External Link <ArrowRight className="inline" weight="bold" />
              </Link>
            </Stack>
          </div>

          {/* Badge Variants (Tag was folded into Badge) */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-3">Badge Variants:</p>
            <Stack direction="horizontal" gap="sm" wrap>
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge tone="success">Success</Badge>
              <Badge tone="warning">Warning</Badge>
              <Badge tone="error">Error</Badge>
              <Badge tone="info">Info</Badge>
              <Badge size="lg">Large Badge</Badge>
            </Stack>
          </div>

          {/* Divider */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-3">Divider:</p>
            <p className="font-body text-text-m mb-2">Content above divider</p>
            <Divider />
            <p className="font-body text-text-m mt-2">Content below divider</p>
            <div className="flex items-center gap-4 mt-4 h-8">
              <span className="font-body text-text-m">Left</span>
              <Divider orientation="vertical" />
              <span className="font-body text-text-m">Right</span>
            </div>
          </div>

          {/* IconButton */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-3">IconButton:</p>
            <Stack direction="horizontal" gap="sm">
              <IconButton icon={<Heart className="h-5 w-5" />} label="Like" />
              <IconButton icon={<Share className="h-5 w-5" />} label="Share" variant="secondary" />
              <IconButton icon={<Star className="h-5 w-5" />} label="Favorite" variant="tertiary" />
              <IconButton icon={<ArrowRight className="h-6 w-6" />} label="Next" size="lg" />
            </Stack>
          </div>

          {/* Prose */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-3">Prose (Rich Text):</p>
            <Prose size="sm">
              <p>
                The <strong>Prose</strong> component wraps rich text content with proper typography styles.
                It handles headings, paragraphs, lists, and code blocks automatically.
              </p>
            </Prose>
          </div>
        </Stack>

        <div className="mt-6 p-4 bg-muted/50 rounded-sm">
          <p className="font-body text-text-s">
            <strong className="font-heading">UI Components:</strong> Button (studio variants), Link, Tag, Divider, IconButton, VisuallyHidden, Prose
          </p>
        </div>
      </div>

      {/* Form Components Demo - Phase 05-2 */}
      <div className="mt-8 pt-8 border-t border-border">
        <h3 className="font-heading text-title-m font-bold mb-6">
          Form Components
        </h3>

        <Stack gap="lg">
          {/* FormField group mode (absorbs former FormGroup + CheckboxField) */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-3">FormField (group mode):</p>
            <FormField
              legend="Notification preferences"
              groupDescription="Choose how you would like to hear from us"
            >
              <Checkbox
                label="Accept terms and conditions"
                required
              />
              <Checkbox label="Subscribe to newsletter" />
            </FormField>
          </div>
        </Stack>

        <div className="mt-6 p-4 bg-muted/50 rounded-sm">
          <p className="font-body text-text-s">
            <strong className="font-heading">Form Stack:</strong> FormField (group/fieldset mode only; controls own their own label/error), Checkbox. See <code>@dt/TextInput</code> and <code>@dt/TextArea</code> for the canonical text field components.
          </p>
        </div>
      </div>

      {/* Interactive Components Demo - Phase 06 */}
      <div className="mt-8 pt-8 border-t border-border">
        <h3 className="font-heading text-title-m font-bold mb-6">
          Interactive Components
        </h3>

        <Stack gap="lg">
          {/* Dialog with size variants */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-3">Dialog Size Variants:</p>
            <Stack direction="horizontal" gap="sm" wrap>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Small Dialog</Button>
                </DialogTrigger>
                <DialogContent size="sm">
                  <DialogHeader>
                    <DialogTitle>Small Dialog</DialogTitle>
                    <DialogDescription>
                      A compact dialog for simple confirmations.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Large Dialog</Button>
                </DialogTrigger>
                <DialogContent size="lg">
                  <DialogHeader>
                    <DialogTitle>Large Dialog</DialogTitle>
                    <DialogDescription>
                      A larger dialog for more content or complex forms.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Warning Dialog</Button>
                </DialogTrigger>
                <DialogContent severity="warning">
                  <DialogHeader>
                    <DialogTitle>Warning</DialogTitle>
                    <DialogDescription>
                      This dialog has a warning severity border.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </Stack>
          </div>

          {/* Accordion Variants */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-3">Accordion Card Variant:</p>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="card-1" variant="card">
                <AccordionTrigger variant="card">Card Style Item 1</AccordionTrigger>
                <AccordionContent variant="card">
                  Accordion items with the card variant have a filled background and rounded borders.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="card-2" variant="card">
                <AccordionTrigger variant="card">Card Style Item 2</AccordionTrigger>
                <AccordionContent variant="card">
                  Each item is visually separated for a modern card-based UI.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Tabs Variants */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-3">Tabs Variants:</p>
            <Stack gap="md">
              <div>
                <p className="font-body text-text-xs text-muted-foreground mb-2">Underline:</p>
                <Tabs defaultValue="tab1">
                  <TabsList variant="underline">
                    <TabsTrigger value="tab1" variant="underline">Overview</TabsTrigger>
                    <TabsTrigger value="tab2" variant="underline">Details</TabsTrigger>
                    <TabsTrigger value="tab3" variant="underline">Settings</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div>
                <p className="font-body text-text-xs text-muted-foreground mb-2">Pills:</p>
                <Tabs defaultValue="tab1">
                  <TabsList variant="pills">
                    <TabsTrigger value="tab1" variant="pills">All</TabsTrigger>
                    <TabsTrigger value="tab2" variant="pills">Active</TabsTrigger>
                    <TabsTrigger value="tab3" variant="pills">Archived</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </Stack>
          </div>

          {/* Tooltip */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-3">Tooltip:</p>
            <Stack direction="horizontal" gap="md">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover for tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a helpful tooltip!</p>
                </TooltipContent>
              </Tooltip>
            </Stack>
          </div>

          {/* Toast */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-3">Toast Notifications:</p>
            <Stack direction="horizontal" gap="sm" wrap>
              <Button
                variant="outline"
                onClick={() => showToast("This is a success message!", { tone: "success" })}
              >
                Success Toast
              </Button>
              <Button
                variant="outline"
                onClick={() => showToast("Something went wrong.", { tone: "error" })}
              >
                Error Toast
              </Button>
              <Button
                variant="outline"
                onClick={() => showToast("Please check your input.", { tone: "warning" })}
              >
                Warning Toast
              </Button>
              <Button
                variant="outline"
                onClick={() => showToast("Here is some information.", { tone: "info" })}
              >
                Info Toast
              </Button>
            </Stack>
          </div>

          {/* Lightbox */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-3">Lightbox:</p>
            <Button variant="outline" onClick={() => setLightboxOpen(true)}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Open Lightbox Demo
            </Button>
          </div>
        </Stack>

        <div className="mt-6 p-4 bg-muted/50 rounded-sm">
          <p className="font-body text-text-s">
            <strong className="font-heading">Interactive Stack:</strong> Dialog (size/severity), Accordion (variants), Tabs (variants), Tooltip, Toast, Lightbox
          </p>
        </div>
      </div>

      {/* Navigation Components Demo - Phase 06-2 */}
      <div className="mt-8 pt-8 border-t border-border">
        <h3 className="font-heading text-title-m font-bold mb-6">
          Navigation Components
        </h3>

        <Stack gap="lg">
          {/* NavLink */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-3">NavLink (active state detection):</p>
            <Stack direction="horizontal" gap="md" wrap>
              <NavLink href="/" exact>Home</NavLink>
              <NavLink href="/work">Work</NavLink>
              <NavLink href="/about">About</NavLink>
              <NavLink href="/blog">Blog</NavLink>
              <NavLink href="/contact">Contact</NavLink>
              <NavLink href="/dev/tailwind-test">Test Page (active)</NavLink>
            </Stack>
          </div>

          {/* SkipLink demo note */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-3">SkipLink (accessibility):</p>
            <p className="font-body text-text-m">
              Press <kbd className="px-2 py-0.5 bg-muted border border-border rounded text-text-s font-mono">Tab</kbd> at the top of the page to see the skip link.
            </p>
            <p className="font-body text-text-s text-muted-foreground mt-2">
              The SkipLink is hidden by default and becomes visible when focused, allowing keyboard users to bypass navigation.
            </p>
          </div>

          {/* SiteHeader/SiteFooter note */}
          <div className="bg-muted/30 p-4 rounded-sm">
            <p className="font-body text-text-s text-muted-foreground mb-3">SiteHeader & SiteFooter:</p>
            <p className="font-body text-text-m">
              Look at the header and footer of this page. They are now using the new Tailwind-first navigation components with:
            </p>
            <ul className="font-body text-text-s text-muted-foreground mt-2 list-disc list-inside space-y-1">
              <li>Sticky header with backdrop blur</li>
              <li>Desktop navigation with NavLink active states</li>
              <li>Language switcher (EN/FI/SV)</li>
              <li>Theme toggle with animation</li>
              <li>Mobile drawer with GSAP slide-in animation</li>
              <li>Footer with social links and legal pages</li>
            </ul>
          </div>
        </Stack>

        <div className="mt-6 p-4 bg-muted/50 rounded-sm">
          <p className="font-body text-text-s">
            <strong className="font-heading">Navigation Stack:</strong> SiteHeader, SiteFooter, MobileDrawer, NavLink, SkipLink, useNavigation
          </p>
        </div>
      </div>

      {/* Lightbox component */}
      <Lightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        images={[
          { src: "https://picsum.photos/800/600?random=1", alt: "Demo image 1", caption: "First random image from Picsum" },
          { src: "https://picsum.photos/800/600?random=2", alt: "Demo image 2", caption: "Second random image from Picsum" },
          { src: "https://picsum.photos/800/600?random=3", alt: "Demo image 3", caption: "Third random image from Picsum" },
        ]}
      />
    </div>
  );
}
