import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import type { SchemaTypeDefinition } from "@sanity/types";
import { schemaTypes as rawSchemaTypes } from "./digitaltableteur-blog/schemaTypes";

const schemaTypes = rawSchemaTypes as unknown as SchemaTypeDefinition[];

export default defineConfig({
  name: "default",
  title: "digitaltableteur",
  basePath: "/studio",

  projectId: "ai4cwr0g",
  dataset: "digitaltableteur-blog",

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },

  vite: {
    optimizeDeps: {
      exclude: ["@dt/*"],
    },
    server: {
      fs: {
        allow: [".", "./digitaltableteur-blog"],
      },
    },
  },
});
