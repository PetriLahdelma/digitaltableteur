/**
 * Structural view of the prepared stories the docs context exposes. Kept
 * local (not imported from storybook internals) so a minor Storybook bump
 * cannot break the blocks' type surface; the fields below are the stable
 * subset the Stories/Primary blocks themselves rely on.
 */
export type PreparedDocsStory = {
  id: string;
  name: string;
  tags?: string[];
  moduleExport: unknown;
  parameters?: {
    docs?: {
      description?: { story?: string };
    };
  } & Record<string, unknown>;
};
