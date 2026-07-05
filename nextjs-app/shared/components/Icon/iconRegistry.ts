"use client";

import type { IconProps as PhosphorIconProps } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  ArrowUp,
  ArrowsClockwise,
  Briefcase,
  Bug,
  Calendar,
  CalendarCheck,
  CalendarX,
  Camera,
  CaretDown,
  CaretRight,
  ChartLineUp,
  Check,
  CheckCircle,
  CircleHalf,
  CircleNotch,
  Code,
  CopySimple,
  Download,
  DribbbleLogo,
  Eye,
  FacebookLogo,
  FileText,
  Folder,
  Gear,
  GithubLogo,
  Heart,
  House,
  Info,
  InstagramLogo,
  Lightning,
  LinkedinLogo,
  List,
  MagnifyingGlass,
  MediumLogo,
  Moon,
  Newspaper,
  NewspaperClipping,
  Palette,
  PaperPlaneTilt,
  Pencil,
  Plus,
  QuestionMark,
  Robot,
  SealCheck,
  ShareNetwork,
  SignOut,
  Star,
  Strategy,
  Sun,
  TextAlignLeft,
  User,
  Warning,
  WarningCircle,
  WhatsappLogo,
  Wrench,
  X,
  XCircle,
  XLogo,
  RedditLogo,
} from "@phosphor-icons/react/ssr";
import { DISCOVERED_ICONS } from "./iconRegistry.discovered";
import { ICON_ALIASES, toPascalCase } from "./iconAliases";

export type PhosphorIconComponent = ComponentType<PhosphorIconProps>;

/**
 * Curated Phosphor icons for data-driven / dynamic usage that the JSX-literal
 * scan can't see (status maps, social platforms, config-supplied slugs). JSX
 * `icon="…"` / `<Icon name="…">` literals are auto-discovered into
 * DISCOVERED_ICONS by `npm run build:icons`, so they need no entry here.
 */
const CURATED_ICONS = {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  ArrowUp,
  ArrowsClockwise,
  Briefcase,
  Bug,
  Calendar,
  CalendarCheck,
  CalendarX,
  Camera,
  CaretDown,
  CaretRight,
  ChartLineUp,
  Check,
  CheckCircle,
  CircleHalf,
  CircleNotch,
  Code,
  CopySimple,
  Download,
  DribbbleLogo,
  Eye,
  FacebookLogo,
  FileText,
  Folder,
  Gear,
  GithubLogo,
  Heart,
  House,
  Info,
  InstagramLogo,
  Lightning,
  LinkedinLogo,
  List,
  MagnifyingGlass,
  MediumLogo,
  Moon,
  Newspaper,
  NewspaperClipping,
  Palette,
  PaperPlaneTilt,
  Pencil,
  Plus,
  QuestionMark,
  Robot,
  SealCheck,
  ShareNetwork,
  SignOut,
  Star,
  Strategy,
  Sun,
  TextAlignLeft,
  User,
  Warning,
  WarningCircle,
  WhatsappLogo,
  Wrench,
  X,
  XCircle,
  XLogo,
  RedditLogo,
} as const satisfies Record<string, PhosphorIconComponent>;

/**
 * The bundled icon set: curated (data-driven) icons plus the auto-discovered
 * JSX-literal icons. A slug used in a JSX `icon=`/`name=` literal registers
 * itself here on the next `build:icons`; only genuinely dynamic names still
 * need a CURATED_ICONS entry.
 */
const PHOSPHOR_ICONS: Record<string, PhosphorIconComponent> = {
  ...CURATED_ICONS,
  ...DISCOVERED_ICONS,
};

export function resolvePhosphorIcon(
  rawName: string,
): PhosphorIconComponent | null {
  const cleaned = rawName?.replace(/^fa-/, "") ?? "";
  const alias =
    ICON_ALIASES[cleaned] ??
    ICON_ALIASES[rawName] ??
    ICON_ALIASES[toPascalCase(cleaned)];
  const candidates = [alias, toPascalCase(cleaned), cleaned, rawName].filter(
    Boolean,
  ) as string[];

  for (const candidate of candidates) {
    const direct = PHOSPHOR_ICONS[candidate as keyof typeof PHOSPHOR_ICONS];
    if (direct) return direct;

    const fromAlias = ICON_ALIASES[candidate];
    if (fromAlias) return PHOSPHOR_ICONS[fromAlias];
  }

  return null;
}
