export { default } from "./ChatWidget";
export { default as ChatComposer } from "./ChatComposer";
export type { ChatComposerProps, ChatComposerHandle } from "./ChatComposer";
export { default as ChatHeader } from "./ChatHeader";
export type { ChatHeaderProps } from "./ChatHeader";
export { default as ChatMessages } from "./ChatMessages";
export type { ChatMessagesProps } from "./ChatMessages";
export { default as ChatMessageBubble } from "./ChatMessageBubble";
export type { ChatMessageBubbleProps } from "./ChatMessageBubble";
export { default as AIProcessingState } from "./AIProcessingState";
export type {
  AIProcessingStateProps,
  ProcessingMode,
  IntensityLevel,
} from "./AIProcessingState";

// Pure message-storage helpers. These were inlined in ChatWidget.tsx and
// re-exposed for unit tests; they are imported by ChatWidget.helpers.test.tsx
// via `@dt/ChatWidget`.
export {
  generateId,
  toStoredMessages,
  parseStoredMessages,
  parseLegacyMessages,
  fromStoredMessages,
  resolveChatErrorMessage,
} from "./ChatWidget";
export {
  resolveChatAvatarState,
  extractLastToolActivity,
  resolveToolAvatarState,
} from "./chatAvatarState";
export type {
  ChatErrorMessages,
  ChatWidgetProps,
} from "./ChatWidget";
