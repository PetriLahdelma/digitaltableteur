---
name: add-project
description: "Interactive workflow to add new work/portfolio projects. Guides through project setup with questions, then generates all required files: projects.ts entry, page route, page component, CSS module, and navigation integration."
---

# Add Work Project Skill

## Overview

This skill guides you through adding a new portfolio/case study project to the Digitaltableteur website. It uses an interactive Q&A flow to gather project details, then generates all necessary files.

## What Gets Generated

1. **Work Index Integration**
   - Entry in `nextjs-app/shared/data/projects.ts`
   - Thumbnail configuration (static or video with autoplay)

2. **Project Route**
   - `app/work/[slug]/page.tsx` with metadata, OpenGraph, Twitter cards

3. **Project Page Component**
   - `nextjs-app/shared/components/pages/Work/[ProjectName]/[ProjectName]Page.tsx`
   - `nextjs-app/shared/components/pages/Work/[ProjectName]/[projectName].module.css`
   - `nextjs-app/shared/components/pages/Work/[ProjectName]/index.ts`

4. **Navigation Update**
   - Entry in `app/work/NextWorkNav.tsx` workPages array

5. **Assets Checklist**
   - Required images with dimensions
   - Alt text requirements

---

## Interactive Q&A Flow

### Phase 1: Basic Information

Ask these questions ONE AT A TIME using the AskUserQuestion tool:

**Q1: Project Name**
```
What is the project name?
(This will be the display title, e.g., "Helsinki Design System")
```

**Q2: URL Slug**
```
What should the URL slug be?
Options:
- [auto-generated from name, e.g., "helsinki-design-system"] (Recommended)
- Custom slug
```

**Q3: Category**
```
What category does this project belong to?
Options:
- Design Systems
- UX Design
- Branding
- Illustration
```

**Q4: Tags**
```
What tags describe this project? (Select multiple)
Options:
- Design System
- UX Design
- UI Design
- Branding
- Web Design
- Accessibility
- React
- Animation
- Illustration
- Identity
```

**Q5: Short Description**
```
Provide a short description for the work index card (1-2 sentences):
```

**Q6: Featured Status**
```
Should this project be featured on the homepage?
Options:
- Yes (Recommended for major projects)
- No
```

---

### Phase 2: Thumbnail Configuration

**Q7: Thumbnail Type**
```
What type of thumbnail will you use?
Options:
- Static image (PNG/WEBP/JPG)
- Video thumbnail (MOV/MP4/WEBM)
```

**Q8 (if video): Autoplay Behavior**
```
Should the video autoplay continuously on the work index?
Options:
- Yes, autoplay in loop (Recommended for short loops)
- No, play on hover only
```

**Q9: Thumbnail Path**
```
Where will the thumbnail be located?
Default: /images/portfolio/[slug]/[filename]

Provide the full path or just the filename:
```

---

### Phase 3: Page Structure

**Q10: Project Template**
```
Which existing project is most similar in structure?
Options:
- Helsinki Design System (Full case study with process, team, story blocks)
- New Things Co (Brand identity with gallery)
- Garage Junction (Event branding with video)
- Illustrations (Gallery-focused, minimal text)
- Custom (I'll define the structure)
```

**Q11: Content Sections** (if Custom or to modify template)
```
Which sections should the project page include? (Select multiple)
Options:
- Hero with image
- Project metadata (services, duration, tools, team)
- Process phases (Discover, Define, Ideate, Design)
- Story blocks with images
- Image gallery/grid
- Results/conclusion
- Related projects
```

**Q12: Team Members** (if metadata selected)
```
Will you include team member information?
Options:
- Yes, I'll provide names/roles/images
- No, skip team section
```

---

### Phase 4: Project Details

**Q13: Services/Skills**
```
What services/skills were involved? (comma-separated)
Example: UX Design, UI Design, Frontend Development, Documentation
```

**Q14: Duration/Timeline**
```
What was the project duration?
Example: January 2020–March 2022
```

**Q15: Tools Used** (optional)
```
What tools were used? (comma-separated, or skip)
Example: Figma, Sketch, React, Storybook
```

---

## File Generation

After gathering all information, generate files in this order:

### 1. Update projects.ts

Add entry to the projects array:

```typescript
{
  id: "[slug]",
  slug: "[slug]",
  title: "[Project Name]",
  description: "[Short description]",
  thumbnail: "/images/portfolio/[slug]/[thumbnail]",
  thumbnailVideo: "[if video]",
  autoPlayVideo: [true/false if video],
  category: "[category]",
  tags: ["Tag1", "Tag2"],
  featured: [true/false],
  order: [next order number],
},
```

### 2. Create Route File

`app/work/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";

import { [ProjectName]Page } from "@dt-pages/Work/[ProjectName]";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "[Project Name] Case Study | Digitaltableteur",
  description: "[Description]",
  openGraph: {
    title: "[Project Name] Case Study | Digitaltableteur",
    description: "[Description]",
    type: "article",
    siteName: "Digitaltableteur",
    images: [
      {
        url: "/logo512.png",
        width: 512,
        height: 512,
        alt: "Digitaltableteur Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "[Project Name] Case Study | Digitaltableteur",
    description: "[Description]",
    images: ["/logo512.png"],
  },
  alternates: {
    canonical: "/work/[slug]",
  },
};

export const revalidate = 3600;

export default function [ProjectName]() {
  return <[ProjectName]Page nav={<NextWorkNav />} />;
}
```

### 3. Create Page Component

Use the selected template as a base, replacing content placeholders.

### 4. Update NextWorkNav

Add entry to workPages array:

```typescript
{ path: "/work/[slug]", label: "[Project Name]" },
```

### 5. Generate Assets Checklist

Output a markdown checklist of required assets:

```markdown
## Required Assets for [Project Name]

### Thumbnail
- [ ] `/images/portfolio/[slug]/[thumbnail]`
  - Dimensions: 1200x630 (video aspect ratio) or 800x800 (square)
  - Format: WEBP preferred, PNG/JPG acceptable
  - Alt text: "[Project Name] thumbnail"

### Hero Image (if applicable)
- [ ] `/images/portfolio/[slug]/hero.png`
  - Dimensions: 1200x600
  - Alt text: "[Project Name] hero image"

### Gallery Images (if applicable)
- [ ] `/images/portfolio/[slug]/gallery/[image1].webp`
- [ ] `/images/portfolio/[slug]/gallery/[image2].webp`
...

### Team Photos (if applicable)
- [ ] `/images/portfolio/[slug]/team/[name].png`
  - Dimensions: 200x200 (square)
  - Alt text: "[Name], [Role]"
```

---

## Validation Before Completion

Before finishing, verify:

1. **TypeScript**: Run `npm run typecheck` to verify no type errors
2. **Lint**: Run `npm run lint` to check for issues
3. **Build**: Optionally run `npm run build` to verify page compiles

---

## Example Usage

User: `/add-project`

Agent: "Let's add a new work project! I'll ask a few questions to set everything up."

Agent: [Uses AskUserQuestion for Q1]

User: "Acme Corp Design System"

Agent: [Uses AskUserQuestion for Q2]

... continues through all questions ...

Agent: "Great! I have all the information. Let me generate the files..."

Agent: [Creates all files]

Agent: "Done! Here's what I created:
- ✅ Added entry to projects.ts
- ✅ Created app/work/acme-corp-design-system/page.tsx
- ✅ Created component files
- ✅ Updated NextWorkNav

**Next steps:**
1. Add your images to `/images/portfolio/acme-corp-design-system/`
2. Update the page content with your actual text
3. Run `npm run dev` to preview"

---

## Key Principles

- **One question at a time** - Don't overwhelm with multiple questions
- **Provide defaults** - Always suggest sensible defaults
- **Use templates** - Base new projects on existing successful ones
- **Generate complete files** - Don't leave placeholders that break the build
- **Validate** - Run type checks before declaring success
