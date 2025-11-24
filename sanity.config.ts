import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./digitaltableteur-blog/schemaTypes";

export default defineConfig({
  name: "default",
  title: "digitaltableteur",
  basePath: "/studio",

  projectId: "ai4cwr0g",
  dataset: "production",

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
});
