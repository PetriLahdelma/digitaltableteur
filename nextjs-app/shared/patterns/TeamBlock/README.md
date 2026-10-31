# TeamBlock

A centred grid of team members: an `Avatar`, the name and the role. Case studies use it to credit project teams.

## Usage

```tsx
import TeamBlock from "@/shared/patterns/TeamBlock";

<TeamBlock
  members={[
    { name: "Laura Karhu", title: "Project Lead", image: "/images/team/laura.png" },
    { name: "Petri Lahdelma", title: "Senior UX Designer", image: "/images/team/petri.png" },
    { name: "Roni Helppi", title: "UX Designer" }, // no photo: initials
  ]}
  sectionTitle="Project Team"
  columns={5}
/>;
```

## Props

| Prop              | Type                                                    | Default         | Description                                         |
| ----------------- | ------------------------------------------------------- | --------------- | --------------------------------------------------- |
| `members`         | `TeamMember[]`                                          | required        | Team members to display                             |
| `sectionTitle`    | `string`                                                | `"Team"`        | Section heading; an empty string hides it           |
| `description`     | `React.ReactNode`                                       |                 | Lead copy under the heading                         |
| `columns`         | `2 \| 3 \| 4 \| 5 \| 6`                                 | `5`             | Most members per row at desktop width               |
| `avatarSize`      | `string`                                                | `"7rem"`        | Avatar diameter as any CSS length                   |
| `backgroundColor` | `"light" \| "white" \| "transparent"`                   | `"transparent"` | Section background                                  |
| `maxWidth`        | `"sm" \| "md" \| "lg" \| "xl" \| "full"`                | `"lg"`          | Width constraint via PageLayout                     |
| `spacing`         | `"compact" \| "default" \| "comfortable" \| "spacious"` | `"comfortable"` | Spacing via PageLayout                              |
| `as`              | `"section" \| "article" \| "div"`                       | `"section"`     | Wrapper element                                     |
| `ariaLabel`       | `string`                                                | `sectionTitle`  | Accessible name of the wrapper                      |
| `className`       | `string`                                                |                 | Extra class on the wrapper                          |

```ts
interface TeamMember {
  name: string;
  title: string;
  /** Photo path; without one the avatar shows initials. */
  image?: string;
  /** External profile link; opens in a new tab. */
  link?: string;
}
```

## Layout

The grid is a wrapping flex row. Each member takes one column's width, so a row with fewer members than `columns` stays centred instead of hugging the start edge.

| `columns` | < 640px | 640px | 768px | 1024px |
| --------- | ------- | ----- | ----- | ------ |
| 2         | 1       | 2     | 2     | 2      |
| 3         | 1       | 2     | 2     | 3      |
| 4         | 1       | 2     | 2     | 4      |
| 5         | 1       | 2     | 3     | 5      |
| 6         | 1       | 2     | 3     | 6      |

## Accessibility

- The name and role are printed under each avatar, so the avatar renders with `alt=""` (initials are `aria-hidden`) and nothing is read twice.
- The section title is an H2, member names H4.
- Linked members open in a new tab with `rel="noopener noreferrer"` and show a focus ring.
- Hover lift is off under `prefers-reduced-motion`; names go bold under `prefers-contrast: more`.
