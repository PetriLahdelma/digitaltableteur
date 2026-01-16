import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

// Studio variant types
type AccordionVariant = "default" | "bordered" | "minimal" | "card"

const itemVariantClasses: Record<AccordionVariant, string> = {
  default: "border-b last:border-b-0",
  bordered: "border rounded-md mb-2 last:mb-0",
  minimal: "",
  card: "border rounded-lg mb-3 bg-muted/30 last:mb-0",
}

const triggerVariantClasses: Record<AccordionVariant, string> = {
  default: "",
  bordered: "px-4",
  minimal: "",
  card: "px-4",
}

const contentVariantClasses: Record<AccordionVariant, string> = {
  default: "",
  bordered: "px-4",
  minimal: "",
  card: "px-4",
}

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item> & {
  variant?: AccordionVariant
}) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      data-variant={variant}
      className={cn(itemVariantClasses[variant], className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  variant = "default",
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  variant?: AccordionVariant
}) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "font-heading focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          triggerVariantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  variant = "default",
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content> & {
  variant?: AccordionVariant
}) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", contentVariantClasses[variant], className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
