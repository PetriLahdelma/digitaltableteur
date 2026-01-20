# Donny Character Design Specification

> **Purpose**: Hand this document to designers, animators, or AI generation tools to create a consistent, personality-rich character.

---

## 1. Character Overview

**Name**: Donny  
**Role**: AI Creative Director & Studio Assistant for Digitaltableteur  
**Archetype**: "Helpful creative director + systems thinker"

### Visual Identity

| Attribute | Specification |
|-----------|---------------|
| **Style** | Minimal 2D geometric, inspired by Bauhaus/Swiss design |
| **Primary Color** | `#041B23` (Digitaltableteur brand) |
| **Accent Color** | `#3B82F6` (active/interactive states) |
| **Form Factor** | Abstract face/head shape (not human, not robot) |
| **Base Shape** | Rounded rectangle or soft pill shape with expressive eyes |
| **Eyes** | Two simple dots or dashes—primary expression vehicle |
| **No mouth** | Expressions conveyed through eye shape, position, and motion |

### Design Principles

1. **Readable at 32×32px** — Works as favicon, chat bubble, small widget
2. **Animates smoothly** — No complex articulation; uses scale, rotation, position
3. **Brand-aligned** — Uses DT color palette and geometric language
4. **Friendly but professional** — Not childish, not cold

---

## 2. Character States (Animation Library)

### Core States (Required)

| State | Description | Eye Expression | Motion |
|-------|-------------|----------------|--------|
| `idle` | Resting, ready to help | Neutral dots, gentle breathing motion | Subtle float/pulse (0.5s cycle) |
| `listening` | User is typing | Widened eyes, slight lean forward | Eyes track upward, anticipatory |
| `thinking` | Processing response | Eyes become dashes, looking up-right | Slow rotation, gentle bounce |
| `searching` | Querying data/tools | Eyes sweep left-right | Scanning motion, subtle zoom |
| `success` | Task completed | Happy curves (◡ ◡) | Quick bounce up, settle |
| `error` | Something failed | X shapes or concerned | Shake side-to-side, red tint |
| `confused` | Needs clarification | Asymmetric eyes (one raised) | Slight tilt, question mark float |
| `handoff` | Transferring to human | Eyes shift to side, wave gesture | Slide motion toward edge |

### Extended States (Personality)

| State | Description | Eye Expression | Motion |
|-------|-------------|----------------|--------|
| `greeting` | First interaction | Bright, welcoming eyes | Pop-in with slight bounce |
| `acknowledging` | Received input | Brief nod/blink | Single downward motion |
| `suggesting` | Offering options | Thoughtful look, slight squint | Gentle side tilt |
| `confident` | Making a recommendation | Strong, centered eyes | Solid stance, slight grow |
| `curious` | Asking a question | One eye larger | Lean forward, tilt |
| `celebrating` | Major milestone | Stars/sparkles around eyes | Jump with particle burst |
| `apologetic` | Minor issue | Droopy eyes | Shrink slightly, bow |
| `typing` | Generating response | Eyes as blinking cursor | Rhythmic blink pattern |
| `loading` | Waiting for data | Spinner replaces eyes | Rotation |
| `waving` | Hello/goodbye | Eyes curve happy | Side-to-side wave motion |
| `pointing` | Drawing attention | Eyes direct to side | Arrow/direction indicator |
| `remembering` | Recalling user info | Eyes look up-left | Thought bubble appears |
| `focused` | Deep work mode | Narrowed, intense eyes | Minimal motion, concentration |
| `playful` | Light moment | Wink or bounce | Quick asymmetric blink |
| `impressed` | User did something good | Wide eyes, eyebrows up | Slight backward lean |
| `skeptical` | Needs more info | One eyebrow raised | Slight head tilt |

### Transition States

| From → To | Animation |
|-----------|-----------|
| `idle` → `listening` | Eyes widen over 200ms |
| `listening` → `thinking` | Eyes become dashes, start rotation |
| `thinking` → `success` | Eyes pop to curves, bounce |
| `thinking` → `error` | Shake, red overlay flash |
| `any` → `idle` | Gentle ease back to neutral |

---

## 3. Personality Voice & Behavior

### Communication Style

```
TONE: Concise, direct, design-literate
REGISTER: Professional but warm
HUMOR: Dry wit, occasional—never forced
VERBOSITY: Default short; expand only when asked
```

### Signature Patterns

**Pattern 1: Clarify → Propose → Commit**
```
"Here's what I think you mean…"
"Options A/B/C…"  
"I'd do B. Here's the plan."
```

**Pattern 2: Quick Briefs (<90 seconds)**
```
Goal → Audience → Constraints → Timeline → Assets → References
```

**Pattern 3: Memory Callbacks**
```
"Last time you mentioned you prefer X—still true?"
```

### Example Donny Lines

| Context | Donny Says |
|---------|------------|
| **Speed vs. Quality** | "Cool—do you want speed or craft here? I can optimize for one." |
| **Design Direction** | "Two routes: clean system or loud statement. Which is closer?" |
| **Deliverable Offer** | "I can draft the spec and the first implementation checklist—want it dev-ready?" |
| **Clarification** | "Quick check: are we designing for existing users or acquisition?" |
| **Constraint Hit** | "That's outside my wheelhouse, but I can get you 80% there with a focused brief." |
| **Memory Use** | "Using your saved preferences: concise + dev-ready specs." |
| **Returning User** | "Welcome back. Want me to continue where we left off?" |

### Behavioral Boundaries

| DO | DON'T |
|----|-------|
| Ask 1–2 precise questions when unsure | Send a questionnaire |
| Offer a narrower alternative when out-of-scope | Say "I can't help" |
| Acknowledge limitations matter-of-factly | Use "As an AI…" disclaimers |
| Remember preferences with permission | Reference sensitive personal data |
| Stay action-oriented | Philosophize or hedge endlessly |

---

## 4. Technical Specifications

### Output Formats

| Format | Use Case | Specs |
|--------|----------|-------|
| **Lottie/JSON** | Web animations | 60fps, <50KB per state |
| **Sprite Sheet** | Fallback, game engines | PNG, 512×512 per frame, 12fps |
| **SVG** | Static states | Optimized, <5KB |
| **APNG** | Animated favicon | 32×32, 6fps, <20KB |

### Recommended Dimensions

| Context | Size |
|---------|------|
| Chat widget avatar | 40×40px (display), 120×120px (asset) |
| Expanded state | 80×80px (display), 240×240px (asset) |
| Hero/landing | 200×200px (display), 600×600px (asset) |
| Favicon | 32×32px |

### Animation Timing

| Type | Duration | Easing |
|------|----------|--------|
| State transition | 200–300ms | ease-out |
| Idle loop | 2–4s | ease-in-out |
| Micro-interaction | 100–150ms | ease-out |
| Success celebration | 400–600ms | spring |
| Error shake | 300ms | ease-in-out |

### Color Palette

```css
--donny-primary: #041B23;      /* Main body */
--donny-accent: #3B82F6;       /* Active/interactive */
--donny-success: #22C55E;      /* Success state */
--donny-error: #EF4444;        /* Error state */
--donny-warning: #F59E0B;      /* Confused/warning */
--donny-background: #F8FAFC;   /* Light mode bg */
--donny-background-dark: #0F172A; /* Dark mode bg */
```

---

## 5. Implementation Approach

### Phase 1: Static SVG States (Quick Win)

Create 8 core states as static SVGs:
- `idle`, `listening`, `thinking`, `success`, `error`, `confused`, `greeting`, `handoff`

### Phase 2: CSS Animations

Add transitions between states using CSS:
- Scale, rotation, opacity
- Eye shape morphing via clip-path or SVG SMIL

### Phase 3: Lottie Integration

Convert to Lottie for:
- Smoother interpolation
- Smaller file sizes
- Better mobile performance
- After Effects workflow compatibility

### Phase 4: State Machine

Implement state machine in React:
```typescript
type DonnyState = 
  | 'idle' | 'listening' | 'thinking' | 'searching'
  | 'success' | 'error' | 'confused' | 'handoff'
  | 'greeting' | 'celebrating' | 'remembering';

interface DonnyAvatarProps {
  state: DonnyState;
  size?: 'sm' | 'md' | 'lg';
  onTransitionEnd?: () => void;
}
```

---

## 6. Reference Inspirations

| Reference | What to Take |
|-----------|--------------|
| **Notion AI** | Minimal, productivity-focused presence |
| **Slack Hubot** | Friendly but not cutesy |
| **Linear** | Clean geometric forms |
| **Vercel's Geist** | Typography-first design language |
| **Mailchimp Freddie** | Personality without complexity |

---

## 7. Asset Checklist

### Deliverables

- [ ] Character design sheet (3 sizes, light/dark modes)
- [ ] 8 core state SVGs
- [ ] 16 extended state SVGs  
- [ ] Idle animation (Lottie)
- [ ] Transition animations (Lottie)
- [ ] Sprite sheet (PNG, all states)
- [ ] Favicon set (static + animated)
- [ ] React component with state machine
- [ ] Storybook documentation

### File Structure

```
shared/components/DonnyAvatar/
├── DonnyAvatar.tsx
├── DonnyAvatar.module.css
├── DonnyAvatar.stories.tsx
├── DonnyAvatar.test.tsx
├── index.ts
├── states/
│   ├── idle.svg
│   ├── listening.svg
│   ├── thinking.svg
│   └── ... (all states)
├── animations/
│   ├── idle.json (Lottie)
│   ├── transitions.json
│   └── celebrations.json
└── README.md
```

---

## 8. AI Generation Prompts

### For Image Generation (Midjourney/DALL-E/Stable Diffusion)

```
Minimal 2D geometric character avatar, abstract face design, 
rounded rectangle shape with two simple dot eyes, 
no mouth, Bauhaus/Swiss design inspired, 
dark teal color (#041B23), clean vector style, 
professional but friendly, suitable for AI assistant,
white background, 32x32px optimized
--style raw --v 6
```

### For Animation (Rive/Lottie Creator)

```
Create a looping idle animation for a minimal geometric avatar:
- Base: rounded rectangle, dark teal (#041B23)
- Eyes: two white dots, centered
- Motion: subtle floating/breathing (scale 1.0 to 1.02)
- Duration: 2 seconds
- Easing: ease-in-out
- No rotation, no color change
```

---

*Document Version: 1.0*  
*Last Updated: January 2026*  
*Author: Digitaltableteur*
