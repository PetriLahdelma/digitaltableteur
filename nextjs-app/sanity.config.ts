import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./digitaltableteur-blog/schemaTypes";

export default defineConfig({
  name: "default",
  title: "digitaltableteur",
  basePath: "/studio",

  projectId: "ai4cwr0g",
  dataset: "digitaltableteur-blog",

  plugins: [structureTool(), visionTool()],

  schema: {
    // Type assertion due to duplicate @sanity/types in node_modules (root vs digitaltableteur-blog)
    types: schemaTypes as any,
  },
});
