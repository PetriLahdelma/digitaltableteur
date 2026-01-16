"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

// Studio variant types
type TabsVariant = "default" | "underline" | "pills" | "bordered"

const listVariantClasses: Record<TabsVariant, string> = {
  default: "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
  underline: "inline-flex h-10 items-center gap-4 border-b border-border bg-transparent p-0",
  pills: "inline-flex h-9 items-center gap-2 bg-transparent p-0",
  bordered: "inline-flex h-9 items-center gap-1 border border-border rounded-lg p-1 bg-transparent",
}

const triggerVariantClasses: Record<TabsVariant, string> = {
  default: "data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-3 py-1.5 h-[calc(100%-1px)]",
  underline: "border-b-2 border-transparent data-[state=active]:border-foreground rounded-none px-1 pb-2.5 pt-2",
  pills: "data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full px-4 py-1.5",
  bordered: "data-[state=active]:bg-accent rounded-md px-3 py-1.5",
}

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: TabsVariant
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(listVariantClasses[variant], className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  variant?: TabsVariant
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "font-body text-foreground dark:text-muted-foreground inline-flex flex-1 items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        triggerVariantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
