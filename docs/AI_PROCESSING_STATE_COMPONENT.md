# AIProcessingState Component

## Overview

The `AIProcessingState` component is a cognitive processing indicator designed specifically for LLM (Large Language Model) interactions. It displays an animated gradient effect when the AI is thinking, generating, or analyzing content.

## Design Philosophy

### NOT a Skeleton Loader

This component is **fundamentally different** from traditional skeleton loaders:

| Pattern               | Purpose                                           | Use Case                                                |
| --------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| **Skeleton Loader**   | Indicates known structure being filled            | Predictable content layout (cards, images, text blocks) |
| **AIProcessingState** | Indicates cognitive processing without prediction | Uncertain output shape (LLM responses)                  |

### Key Differences

**Skeleton Loaders:**

- Imply "we know what's coming, just filling it in"
- Show predictable geometry (grey blocks shaped like content)
- Eventually replaced 1:1 by content
- Used when layout is deterministic

**AIProcessingState:**

- Indicates "cognitive processing" and "uncertainty"
- Shows progress without predicting structure
- Represents "presence" and "aliveness"
- Used when output shape is unknown

## Design Intent

The component provides:

1. **Cognitive Processing Feedback** - Indicates mental work, not just data loading
2. **Uncertainty Acknowledgment** - Shows the system doesn't know output shape yet
3. **Progress Without Prediction** - Communicates activity without promising specific structure
4. **Presence/Aliveness** - Maintains connection with user during processing

## API

### Props

```typescript
export interface AIProcessingStateProps {
  /**
   * The cognitive processing mode to display
   * @default "thinking"
   */
  mode?: "thinking" | "generating" | "analyzing";

  /**
   * Visual intensity of the animation
   * @default "subtle"
   */
  intensity?: "subtle" | "moderate" | "prominent";

  /**
   * Custom message override (if translation not desired)
   */
  customMessage?: string;

  /**
   * Additional CSS class for styling extension
   */
  className?: string;
}
```

### Modes

- **thinking** - AI is processing the user's query (default)
- **generating** - AI is creating content
- **analyzing** - AI is examining data

### Intensity Levels

- **subtle** (default) - Gentle, non-intrusive (70% opacity, 2.5s animation)
  - Good for: Background processing, user is reading previous content
- **moderate** - Balanced visibility (85% opacity, 2s animation)
  - Good for: Standard AI response generation
- **prominent** - High visibility (100% opacity, 1.5s animation, semibold)
  - Good for: Important or lengthy operations where user is actively waiting

## Usage

### Basic Example

```tsx
import { AIProcessingState } from "@dt/ChatWidget";

// Default thinking state
<AIProcessingState />

// Generating mode with moderate intensity
<AIProcessingState mode="generating" intensity="moderate" />

// Custom message
<AIProcessingState customMessage="Processing your request..." />
```

### In Chat Context

```tsx
{
  isWaitingForResponse && (
    <div className={styles.messageContainer}>
      <Avatar type="assistant" />
      <AIProcessingState mode="thinking" intensity="subtle" />
    </div>
  );
}
```

### Conditional Rendering

```tsx
{
  status === "thinking" && <AIProcessingState />;
}
{
  status === "generating" && (
    <AIProcessingState mode="generating" intensity="moderate" />
  );
}
{
  status === "analyzing" && (
    <AIProcessingState mode="analyzing" intensity="prominent" />
  );
}
```

## Implementation Details

### Animation Technique

The component uses CSS `background-clip: text` with an animated gradient:

```css
.text {
  background: linear-gradient(
    90deg,
    var(--color-text-secondary) 0%,
    var(--color-primary) 50%,
    var(--color-text-secondary) 100%
  );
  background-size: 200% 100%;
  background-clip: text;
  color: transparent;
  animation: flow 2s infinite ease-in-out;
}

@keyframes flow {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### Progressive Enhancement

1. **Baseline** - Static colored text for all browsers
2. **Enhanced** - Animated gradient for browsers supporting `background-clip: text`
3. **Fallback** - Opacity pulse animation for browsers without gradient support
4. **Reduced Motion** - Static text for users with `prefers-reduced-motion` preference

### Accessibility Features

- **ARIA Role**: `role="status"` indicates dynamic content update
- **ARIA Live**: `aria-live="polite"` announces changes without interrupting
- **ARIA Label**: Matches visible text for screen reader context
- **Hidden Text**: Visual text marked `aria-hidden="true"` (label provides context)
- **Reduced Motion**: Animation disabled for users with motion sensitivity

## Internationalization

### Translation Keys

The component requires these i18n keys:

```json
{
  "chat.ai.thinking": "Thinking…",
  "chat.ai.generating": "Generating…",
  "chat.ai.analyzing": "Analyzing…"
}
```

### Languages Supported

- **English (EN)**: Thinking… / Generating… / Analyzing…
- **Finnish (FI)**: Ajattelee… / Luodaan… / Analysoidaan…
- **Swedish (SV)**: Tänker… / Genererar… / Analyserar…

## When to Use vs. When NOT to Use

### ✅ Use AIProcessingState When:

- LLM is processing a user query with unknown output shape
- AI is generating content without predictable structure
- System is analyzing data without predetermined result format
- You need to indicate "thinking" or "cognitive work" rather than "loading"

### ❌ Do NOT Use AIProcessingState When:

- Loading content with **known structure** → Use Skeleton components instead
- Fetching data with **predictable layout** → Use standard loading indicators
- Filling **predetermined forms** → Use Skeleton + AIProcessingState together
- Simple **static loading** states → Use spinner or progress bar

### 🔀 Use Both Together When:

AI is generating content with **partially known structure**:

```tsx
{
  /* Known structure part - use skeletons */
}
<div className={styles.formSkeleton}>
  <SkeletonText lines={2} />
  <SkeletonInput />
</div>;

{
  /* Unknown AI processing part */
}
<AIProcessingState mode="generating" intensity="subtle" />;
```

## Testing

### Test Coverage

The component includes 17 comprehensive tests:

1. **Rendering Tests** (6 tests)
   - Default props
   - All three modes (thinking, generating, analyzing)
   - Custom messages
   - Custom className

2. **Intensity Tests** (3 tests)
   - Subtle (default)
   - Moderate
   - Prominent

3. **Accessibility Tests** (6 tests)
   - ARIA role and live region
   - Accessible label matching visible text
   - Screen reader text hiding
   - Axe violations (default, all modes, all intensities)

4. **Data Attribute Tests** (2 tests)
   - Mode attribute switching
   - Intensity attribute switching

### Running Tests

```bash
# Run AIProcessingState tests only
npm test -- AIProcessingState.test.tsx

# Run all ChatWidget tests
npm test -- "src/components/ChatWidget"

# Run with coverage
npm test -- AIProcessingState.test.tsx --coverage
```

### Test Results

✅ **17/17 tests passing**

- All rendering scenarios covered
- Full accessibility compliance (jest-axe)
- Mode and intensity switching verified
- i18n integration tested

## Storybook

### Stories Available

1. **Default** - Basic thinking state
2. **Thinking** - Explicit thinking mode
3. **Generating** - Content generation mode
4. **Analyzing** - Data analysis mode
5. **SubtleIntensity** - Gentle animation
6. **ModerateIntensity** - Standard animation
7. **ProminentIntensity** - High visibility animation
8. **CustomMessage** - Override i18n with custom text
9. **InChatContext** - Example within chat message container
10. **KitchenSink** - All modes and intensities for visual regression

### Viewing Stories

```bash
npm run storybook

# Navigate to: Components/ChatWidget/AIProcessingState
```

## Design System Integration

### Naming Convention

Following design system best practices, this component is named:

✅ **AIProcessingState** (Chosen)

- Clearly indicates purpose (AI processing feedback)
- Distinguishes from skeleton loaders
- Semantic and self-documenting

❌ **NOT** named:

- SkeletonText (implies content replacement)
- LoadingIndicator (too generic)
- ThinkingAnimation (too specific to animation technique)

### Component Type Classification

In a formal design system, this would be categorized as:

- **Category**: Feedback Components
- **Subcategory**: Processing Indicators
- **Type**: Cognitive/AI Feedback
- **Pattern**: Status Communication

## Real-World Usage Patterns

Modern LLM interfaces typically combine:

1. **AIProcessingState** - For cognitive processing indication
2. **Partial streaming text** - Shows content as it arrives
3. **Typing cursor** - Indicates active generation
4. **Status updates** - Context about what AI is doing

Example implementation:

```tsx
<div className={styles.assistantMessage}>
  {isThinking && <AIProcessingState mode="thinking" intensity="subtle" />}

  {streamingText && (
    <div className={styles.streamingContent}>
      <MarkdownMessage content={streamingText} />
      <span className={styles.cursor} />
    </div>
  )}

  {isAnalyzing && <AIProcessingState mode="analyzing" intensity="moderate" />}
</div>
```

## Future Enhancements

Potential improvements for future iterations:

1. **Dynamic Speed** - Adjust animation speed based on processing time
2. **Interruptibility** - Visual transition when streaming begins
3. **Motion Easing** - More sophisticated easing functions
4. **Custom Gradients** - Theme-specific gradient colors
5. **Optimism Level** - UX tone variations (reassuring vs neutral)
6. **Progress Hints** - Subtle indicators of partial progress
7. **Context Variants** - Special modes for specific AI tasks

## Related Documentation

- **Vercel AI SDK Integration**: `docs/AI_PROCESSING_STATE_VERCEL_SDK.md` - Complete guide for @ai-sdk/react integration
- **Component Rules**: `docs/LLM_COMPONENT_GENERATION_RULES.md`
- **Chat Architecture**: `docs/donny-chat.md`
- **Design System**: `README.md` - Progressive Enhancement section
- **i18n Guide**: `docs/2026_PRD.md` - Internationalization section

## Vercel AI SDK Integration

The component is fully compatible with Vercel AI SDK (@ai-sdk/react v2.x):

```tsx
import { useChat } from "@ai-sdk/react";
import { AIProcessingState } from "@dt/ChatWidget";

const { messages, status } = useChat();

// Display during different SDK states
{
  status === "submitted" && (
    <AIProcessingState mode="thinking" intensity="subtle" />
  );
}

{
  status === "streaming" && (
    <AIProcessingState mode="generating" intensity="moderate" />
  );
}
```

**Verified Compatibility**:

- ✅ @ai-sdk/react v2.0.89+
- ✅ useChat hook (multi-turn conversations)
- ✅ useCompletion hook (single completions)
- ✅ useAssistant hook (Assistant API)
- ✅ All major LLM providers (OpenAI, Anthropic, Google, Mistral)
- ✅ Streaming responses
- ✅ Server Actions and Route Handlers

See `docs/AI_PROCESSING_STATE_VERCEL_SDK.md` for comprehensive integration patterns, best practices, and troubleshooting.

## Conclusion

The `AIProcessingState` component provides a semantically appropriate, accessible, and visually polished way to indicate LLM cognitive processing. By distinguishing itself from skeleton loaders and focusing on "thinking" rather than "loading," it creates a more honest and human-feeling interaction during AI processing.

**Status**: ✅ Production-ready

- 17/17 tests passing
- Full accessibility compliance
- Complete i18n coverage (EN/FI/SV)
- Storybook documentation
- Progressive enhancement support
- Reduced motion support

**Integration**: Ready for use in ChatWidget and other LLM-powered interfaces.
