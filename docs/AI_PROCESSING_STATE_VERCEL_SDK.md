# AIProcessingState - Vercel AI SDK Integration Guide

## Overview

The `AIProcessingState` component is fully compatible with Vercel AI SDK (@ai-sdk/react v2.x) and provides semantic feedback during LLM processing states. This guide demonstrates integration patterns with `useChat`, `useCompletion`, and `useAssistant` hooks.

## Compatibility

### Verified Compatibility

✅ **Package Versions (as of project)**:

- `@ai-sdk/react`: ^2.0.89
- `@ai-sdk/openai`: ^2.0.64
- `@ai-sdk/gateway`: ^2.0.7
- `@ai-sdk/mcp`: ^0.0.8

✅ **Supported Hooks**:

- `useChat` - Multi-turn conversations
- `useCompletion` - Single completions
- `useAssistant` - Assistant API integration

✅ **Supported Providers**:

- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- Mistral
- Custom providers via AI SDK Gateway

## Integration Patterns

### 1. useChat Hook (Most Common)

The `useChat` hook provides a `status` field that maps perfectly to AIProcessingState modes:

```tsx
import { useChat } from "@ai-sdk/react";
import { AIProcessingState } from "@dt/ChatWidget";

function ChatInterface() {
  const { messages, status, sendMessage } = useChat({
    api: "/api/chat",
  });

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>{message.content}</div>
      ))}

      {/* Display while awaiting first response */}
      {status === "submitted" && (
        <AIProcessingState mode="thinking" intensity="subtle" />
      )}

      {/* Display during streaming */}
      {status === "streaming" && (
        <AIProcessingState mode="generating" intensity="moderate" />
      )}
    </div>
  );
}
```

### 2. Status State Mapping

The AI SDK provides these status values that map to AIProcessingState modes:

| SDK Status        | AIProcessingState Mode | Intensity   | Use Case                        |
| ----------------- | ---------------------- | ----------- | ------------------------------- |
| `"submitted"`     | `thinking`             | `subtle`    | Request sent, awaiting response |
| `"streaming"`     | `generating`           | `moderate`  | Receiving streamed chunks       |
| Custom processing | `analyzing`            | `prominent` | Custom analysis tasks           |

### 3. Advanced Pattern: Context-Aware Intensity

Adjust intensity based on response time or message context:

```tsx
function ChatInterfaceAdvanced() {
  const { messages, status } = useChat();
  const [waitTime, setWaitTime] = useState(0);

  useEffect(() => {
    if (status === "submitted") {
      const timer = setInterval(() => setWaitTime((t) => t + 1), 1000);
      return () => clearInterval(timer);
    } else {
      setWaitTime(0);
    }
  }, [status]);

  const intensity = useMemo(() => {
    if (waitTime < 3) return "subtle";
    if (waitTime < 10) return "moderate";
    return "prominent";
  }, [waitTime]);

  return (
    <>
      {status === "submitted" && (
        <AIProcessingState mode="thinking" intensity={intensity} />
      )}
    </>
  );
}
```

### 4. useCompletion Hook Integration

For single completion use cases (not multi-turn chat):

```tsx
import { useCompletion } from "@ai-sdk/react";

function CompletionInterface() {
  const { completion, status, complete } = useCompletion({
    api: "/api/completion",
  });

  return (
    <>
      {completion && <div>{completion}</div>}

      {status === "submitted" && <AIProcessingState mode="generating" />}
    </>
  );
}
```

### 5. useAssistant Hook Integration

For OpenAI Assistant API:

```tsx
import { useAssistant } from "@ai-sdk/react";

function AssistantInterface() {
  const { messages, status, submitMessage } = useAssistant({
    api: "/api/assistant",
  });

  return (
    <>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}

      {status === "in_progress" && (
        <AIProcessingState mode="analyzing" intensity="moderate" />
      )}
    </>
  );
}
```

## Real-World Example: ChatWidget Integration

This is how AIProcessingState is used in the actual ChatWidget component:

```tsx
// From src/components/ChatWidget/ChatWidget.tsx
import { useChat } from "@ai-sdk/react";
import { AIProcessingState } from "@dt/ChatWidget";

const ChatWidget: React.FC<ChatWidgetProps> = () => {
  const { messages, sendMessage, status, error } = useChat({
    id: "donny-chat",
    messages: initialMessages,
    transport,
  });

  const isStreaming = status === "submitted" || status === "streaming";

  return (
    <div>
      <ChatMessages messages={processedMessages} isStreaming={isStreaming} />

      {/* Inside ChatMessages component: */}
      {isStreaming && lastMessage?.role === "assistant" && (
        <AIProcessingState mode="thinking" intensity="subtle" />
      )}
    </div>
  );
};
```

## Best Practices

### 1. Choose Appropriate Mode

```tsx
// ✅ Good - Semantic mode selection
{
  status === "submitted" && (
    <AIProcessingState mode="thinking" /> // User waiting for response
  );
}

{
  status === "streaming" && (
    <AIProcessingState mode="generating" /> // Content being created
  );
}

// ❌ Avoid - Using wrong mode for context
{
  status === "streaming" && (
    <AIProcessingState mode="analyzing" /> // Misleading - not analyzing
  );
}
```

### 2. Intensity Guidelines

```tsx
// Subtle - Background processing, user can do other things
<AIProcessingState intensity="subtle" />

// Moderate - Standard response generation (default for most cases)
<AIProcessingState intensity="moderate" />

// Prominent - Important operation, user actively waiting
<AIProcessingState intensity="prominent" />
```

### 3. Conditional Rendering

Only show AIProcessingState when actually processing:

```tsx
// ✅ Good - Only show during active processing
{
  (status === "submitted" || status === "streaming") && (
    <AIProcessingState mode="thinking" />
  );
}

// ❌ Avoid - Showing when no processing happening
{
  status === "awaiting_message" && (
    <AIProcessingState mode="thinking" /> // Wrong - not processing
  );
}
```

### 4. Combine with Partial Content

Show AIProcessingState alongside streaming content:

```tsx
<div className="message">
  {/* Show partial streamed content */}
  {partialMessage && <MarkdownMessage content={partialMessage} />}

  {/* Show processing state after content */}
  {status === "streaming" && (
    <AIProcessingState mode="generating" intensity="subtle" />
  )}
</div>
```

## Status Flow Diagram

```
User sends message
        ↓
status: "submitted"  → AIProcessingState mode="thinking"
        ↓
First chunk arrives
        ↓
status: "streaming"  → AIProcessingState mode="generating"
        ↓
Stream complete
        ↓
status: "awaiting_message"  → (hide AIProcessingState)
```

## Error Handling

Don't show AIProcessingState during error states:

```tsx
const { status, error } = useChat();

return (
  <>
    {error && <ErrorMessage message={error.message} />}

    {/* Only show if no error */}
    {!error && status === "submitted" && <AIProcessingState mode="thinking" />}
  </>
);
```

## Performance Considerations

### Memoization

AIProcessingState is lightweight, but you can memoize for frequently re-rendering components:

```tsx
const processingIndicator = useMemo(() => {
  if (status !== "submitted" && status !== "streaming") return null;

  return (
    <AIProcessingState
      mode={status === "submitted" ? "thinking" : "generating"}
    />
  );
}, [status]);

return <>{processingIndicator}</>;
```

### Avoid Unnecessary Re-renders

```tsx
// ✅ Good - Memoized component
const ChatMessage = React.memo(({ message, isStreaming }) => (
  <div>
    {message.content}
    {isStreaming && <AIProcessingState mode="generating" />}
  </div>
));

// ❌ Avoid - Creating new component on every render
{
  messages.map((msg) => (
    <div key={msg.id}>
      {msg.content}
      {isStreaming && <AIProcessingState />}
    </div>
  ));
}
```

## Testing Integration

### Mock useChat for Testing

```tsx
import { vi } from "vitest";

vi.mock("@ai-sdk/react", () => ({
  useChat: vi.fn(() => ({
    messages: [],
    status: "submitted",
    sendMessage: vi.fn(),
  })),
}));

test("shows processing state when status is submitted", () => {
  render(<ChatInterface />);
  expect(screen.getByTestId("ai-processing-state")).toBeInTheDocument();
});
```

### Test Different Status States

```tsx
test.each([
  ["submitted", "thinking"],
  ["streaming", "generating"],
])("shows correct mode for status %s", (status, expectedMode) => {
  (useChat as Mock).mockReturnValue({
    status,
    messages: [],
  });

  render(<ChatInterface />);
  const indicator = screen.getByTestId("ai-processing-state");
  expect(indicator).toHaveAttribute("data-mode", expectedMode);
});
```

## Troubleshooting

### Issue: Processing state doesn't appear

**Check 1**: Verify status is correct

```tsx
console.log("Current status:", status); // Should be "submitted" or "streaming"
```

**Check 2**: Ensure conditional rendering is correct

```tsx
// Add debug logging
{
  console.log("Should show?", status === "submitted") || null;
}
{
  status === "submitted" && <AIProcessingState />;
}
```

**Check 3**: Verify AI SDK version

```bash
npm list @ai-sdk/react
# Should be v2.x
```

### Issue: Processing state shows during idle

**Problem**: Status not resetting properly

**Solution**: Explicitly check for active states

```tsx
const isProcessing = ["submitted", "streaming"].includes(status);

{
  isProcessing && <AIProcessingState />;
}
```

## Migration from Legacy Patterns

### Old Pattern (Boolean Flag)

```tsx
// ❌ Old way
const [isLoading, setIsLoading] = useState(false);

{
  isLoading && <div>Loading...</div>;
}
```

### New Pattern (AI SDK Status)

```tsx
// ✅ New way
const { status } = useChat();

{
  status === "submitted" && <AIProcessingState mode="thinking" />;
}
```

## Related Documentation

- **Component API**: `docs/AI_PROCESSING_STATE_COMPONENT.md`
- **Vercel AI SDK**: https://sdk.vercel.ai/docs
- **useChat Hook**: https://sdk.vercel.ai/docs/reference/ai-sdk-ui/use-chat
- **Streaming**: https://sdk.vercel.ai/docs/concepts/streaming

## Conclusion

The `AIProcessingState` component provides semantic, accessible feedback during LLM processing with full Vercel AI SDK compatibility. It maps naturally to SDK status states and enhances user experience during AI interactions.

**Key Takeaways**:

- ✅ Use `status === "submitted"` → `mode="thinking"`
- ✅ Use `status === "streaming"` → `mode="generating"`
- ✅ Choose intensity based on context (subtle/moderate/prominent)
- ✅ Combine with partial streaming content
- ✅ Hide during error states and idle

**Status**: Production-ready and battle-tested in ChatWidget component with @ai-sdk/react v2.0.89+
