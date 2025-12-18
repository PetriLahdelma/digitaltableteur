export type PseoCatalogItem = {
  slug: string;
  name: string;
  shortDescription: string;
};

export type PseoCatalog = {
  version: number;
  services: PseoCatalogItem[];
  stacks: PseoCatalogItem[];
  audiences: PseoCatalogItem[];
  generation?: {
    maxLeafPages?: number;
    relatedLinksPerPage?: number;
  };
};

export type PseoLeafPageKey = {
  serviceSlug: string;
  stackSlug: string;
  audienceSlug: string;
};

export type PseoLeafPage = {
  slug: string;
  title: string;
  description: string;
  service: PseoCatalogItem;
  stack: PseoCatalogItem;
  audience: PseoCatalogItem;
  tags: string[];
};

export type PseoCopySection = {
  id: string;
  title: string;
  bodyMarkdown: string;
};

export type PseoRelatedLinkCopy = {
  slug: string;
  reasonMarkdown: string;
};

export type PseoPageCopy = {
  introMarkdown?: string;
  sections?: PseoCopySection[];
  faqs?: Array<{ question: string; answerMarkdown: string }>;
  related?: PseoRelatedLinkCopy[];
  updatedAt?: string;
};

export type PseoCopyFile = {
  version: number;
  pages: Record<string, PseoPageCopy>;
};

