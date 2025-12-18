import type { PseoCopyFile, PseoPageCopy } from "./types";

import copyFile from "@/content/pseo/copy.json";

export function getPseoCopyFile(): PseoCopyFile {
  return copyFile as unknown as PseoCopyFile;
}

export function getPseoPageCopy(slug: string): PseoPageCopy | undefined {
  return getPseoCopyFile().pages[slug];
}

