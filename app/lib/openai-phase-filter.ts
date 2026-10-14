import type { LanguageModelMiddleware } from "ai";

/**
 * Hides OpenAI "commentary" (preamble) text from Donny's replies.
 *
 * Observed 2026-10-14 with gpt-6-luna on the Responses API: a turn can carry
 * a message with `phase: "commentary"` followed by a `phase: "final_answer"`
 * message with almost the same text, so the chat bubble showed the reply
 * twice. OpenAI documents filtering on phase as the way to handle this; there
 * is no request option that turns preambles off.
 *
 * Commentary parts are held back. They are dropped when a final answer or a
 * tool call follows in the same step, and released only when the step ends
 * with nothing else, so Donny never goes silent. Parts without a phase pass
 * straight through, so other models are unaffected.
 */

type StreamPart = {
  type?: string;
  id?: string;
  providerMetadata?: { openai?: { phase?: unknown } };
};

function phaseOf(part: StreamPart): unknown {
  return part.providerMetadata?.openai?.phase;
}

export function createPhaseFilter() {
  const commentaryIds = new Set<string>();
  let held: StreamPart[] = [];
  let sawFinalContent = false;

  const dropHeld = () => {
    held = [];
  };

  return {
    /** Returns the parts to emit for one incoming part. */
    push(part: StreamPart): StreamPart[] {
      const { type, id } = part;

      if (type === "text-start" && phaseOf(part) === "commentary" && id) {
        commentaryIds.add(id);
        held.push(part);
        return [];
      }
      if ((type === "text-delta" || type === "text-end") && id && commentaryIds.has(id)) {
        held.push(part);
        return [];
      }
      if (type === "text-start" || type === "tool-input-start" || type === "tool-call") {
        sawFinalContent = true;
        dropHeld();
        return [part];
      }
      if (type === "finish") {
        const flushed = sawFinalContent ? [] : held;
        dropHeld();
        return [...flushed, part];
      }
      return [part];
    },
  };
}

export const openAiPhaseFilterMiddleware: LanguageModelMiddleware = {
  wrapStream: async ({ doStream }) => {
    const { stream, ...rest } = await doStream();
    const filter = createPhaseFilter();
    return {
      ...rest,
      stream: stream.pipeThrough(
        new TransformStream({
          transform(part, controller) {
            for (const out of filter.push(part as StreamPart)) {
              controller.enqueue(out as typeof part);
            }
          },
        }),
      ),
    };
  },
};
