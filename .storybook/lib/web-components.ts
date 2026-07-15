import { elementMigrationManifest } from "../../packages/web-components/src/generated/element-contracts";
import { storyIdFromTitle, titleByComponentName } from "./contracts";
import { managerHref } from "../blocks/managerHref";

const nativeComponents = new Set(
  elementMigrationManifest
    .filter((entry) => entry.backend === "native")
    .map((entry) => entry.sourceComponent),
);

export function webComponentStoryHref(componentName: string): string | null {
  if (!nativeComponents.has(componentName)) return null;
  const reactTitle = titleByComponentName[componentName];
  if (!reactTitle) return null;

  return managerHref(
    `/docs/${storyIdFromTitle(`Web Components/${reactTitle}`)}--docs`,
  );
}

export function reactComponentStoryHref(componentName: string): string | null {
  const title = titleByComponentName[componentName];
  if (!title) return null;
  return managerHref(`/docs/${storyIdFromTitle(title)}--docs`);
}
