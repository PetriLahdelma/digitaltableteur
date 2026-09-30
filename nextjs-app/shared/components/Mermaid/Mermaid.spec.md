# Mermaid

## Intent

Render Mermaid diagrams without making sight or visual parsing a prerequisite
for understanding their information and relationships.

## Design notes

Keep the visual diagram and its text alternative adjacent. Preserve authored
diagram colors, while disclosure spacing and focus indicators use site tokens.
Loading and error states must leave the text alternative available.

## Interaction contract

- The SVG remains visible and horizontally scrollable when needed.
- The diagram is exposed as one named image with a concise description.
- A native disclosure immediately after the image provides the complete text
  alternative. Use nested lists for hierarchies and ordered lists for flows.
- Generated SVG internals are hidden from assistive technology so labels are
  not announced out of order or duplicated.

## Do / don't

- Do describe every branch, connection, sequence, and grouping that carries
  meaning in `accessibleDetails`.
- Do keep `title` concise and `description` to one or two sentences.
- Don't repeat the Mermaid source as the alternative; translate the visual
  grammar into ordinary prose and semantic lists.
