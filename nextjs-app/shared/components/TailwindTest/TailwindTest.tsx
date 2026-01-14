"use client";

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

/**
 * Temporary test component to verify Tailwind CSS + shadcn/ui integration.
 * DELETE THIS after Phase 01 is verified working.
 */
export default function TailwindTest() {
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
          Typography System (Syne + Satoshi)
        </h3>

        <div className="space-y-4">
          <p className="font-heading text-display font-bold leading-tight">
            Display — Syne Bold
          </p>
          <p className="font-heading text-title-xl font-semibold">
            Heading XL — Syne Semibold
          </p>
          <p className="font-heading text-title-l font-medium">
            Heading L — Syne Medium
          </p>
          <p className="font-heading text-title-m">
            Heading M — Syne Regular
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
            <strong className="font-heading">Font Stack:</strong> Syne (heading/display) + Satoshi (body/text)
          </p>
        </div>
      </div>
    </div>
  );
}
