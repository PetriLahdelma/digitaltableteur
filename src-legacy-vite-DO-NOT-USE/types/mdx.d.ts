declare module "*.mdx" {
  import type { ComponentType } from "react";

  const MDXComponent: ComponentType;
  export const frontmatter: Record<string, unknown>;
  export default MDXComponent;
}
