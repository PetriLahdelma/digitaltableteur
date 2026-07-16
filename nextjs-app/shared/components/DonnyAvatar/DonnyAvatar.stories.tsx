import contract from "./DonnyAvatar.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, useEffect } from "react";
import { DonnyAvatar, DonnyState } from "./DonnyAvatar";

const meta: Meta<typeof DonnyAvatar> = {
  title: "Site/DonnyAvatar",
  component: DonnyAvatar,
  tags: ["stable", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=492-1578",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "centered",
    docs: {
      description: {
        component: `
The DonnyAvatar component is the visual representation of Donny, the AI assistant.
It uses simple eye expressions and subtle animations to convey personality and state.

## Design Philosophy
- **Minimal**: Simple rounded rectangle with expressive eyes
- **Brand-colored**: Uses \`#041B23\` (--color-primary)
- **Animated**: Subtle CSS animations for each state
- **Accessible**: Respects \`prefers-reduced-motion\`

## Expression System
- **Eyes**: Primary expression through eye shape variations
- **Mouth**: Subtle mouth appears only for strong emotions:
  - **Wide smile**: celebrating, success (really happy)
  - **Small smile**: greeting, waving, playful
  - **Puckered**: confused, apologetic, skeptical (bewildered)
  - **Round "O"**: error, impressed, sleeping (scared/appalled/surprised)
  - **Hidden**: Most states (idle, thinking, etc.)

## Sleep Detection
When \`enableSleepDetection\` is true, Donny will:
- Get **sleepy** after 2 minutes of no mouse movement (droopy eyes)
- Fall **asleep** after 2.5 minutes (closed eyes + animated "Zzz..." bubble)
- Wake up immediately on any user activity

## States
- **Core (8)**: idle, listening, thinking, searching, success, error, confused, handoff
- **Extended (16)**: greeting, acknowledging, suggesting, confident, curious, celebrating, apologetic, typing, loading, waving, remembering, focused, playful, impressed, skeptical
- **Sleep (2)**: sleepy, sleeping
        `,
      },
    },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
};

export default meta;
type Story = StoryObj<typeof DonnyAvatar>;

/** Default idle state */
export const Default: Story = {
  tags: ["beta-matrix"],
  args: { state: "idle", size: "lg" },
};

/** All sizes */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <DonnyAvatar size="sm" showLabel />
      <DonnyAvatar size="md" showLabel />
      <DonnyAvatar size="lg" showLabel />
      <DonnyAvatar size="xl" showLabel />
    </div>
  ),
};

/** Core states grid */
export const CoreStates: Story = {
  render: () => {
    const coreStates: DonnyState[] = [
      "idle",
      "listening",
      "thinking",
      "searching",
      "success",
      "error",
      "confused",
      "handoff",
    ];
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1.5rem",
        }}
      >
        {coreStates.map((state) => (
          <div key={state} style={{ textAlign: "center" }}>
            <DonnyAvatar state={state} size="lg" />
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
              }}
            >
              {state}
            </p>
          </div>
        ))}
      </div>
    );
  },
};

/** Extended states grid */
export const ExtendedStates: Story = {
  render: () => {
    const extendedStates: DonnyState[] = [
      "greeting",
      "acknowledging",
      "suggesting",
      "confident",
      "curious",
      "celebrating",
      "apologetic",
      "typing",
      "loading",
      "waving",
      "remembering",
      "focused",
      "playful",
      "impressed",
      "skeptical",
    ];
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "1.5rem",
        }}
      >
        {extendedStates.map((state) => (
          <div key={state} style={{ textAlign: "center" }}>
            <DonnyAvatar state={state} size="md" />
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.625rem",
                color: "var(--color-text-muted)",
              }}
            >
              {state}
            </p>
          </div>
        ))}
      </div>
    );
  },
};

/** Animated state cycle demo */
const CYCLE_STATES: DonnyState[] = [
  "idle",
  "listening",
  "thinking",
  "searching",
  "success",
  "idle",
  "confused",
  "thinking",
  "success",
  "celebrating",
  "idle",
];

function StateCycleDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CYCLE_STATES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <DonnyAvatar state={CYCLE_STATES[currentIndex]} size="xl" />
      <p
        style={{
          marginTop: "1rem",
          fontSize: "0.875rem",
          fontFamily: "monospace",
        }}
      >
        {CYCLE_STATES[currentIndex]}
      </p>
      <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
        Cycles through states every 2 seconds
      </p>
    </div>
  );
}

export const AnimatedCycle: Story = { render: () => <StateCycleDemo /> };

/** Conversation simulation */
const CONVERSATION_SCRIPT: {
  state: DonnyState;
  delay: number;
  label: string;
}[] = [
  { state: "greeting", delay: 0, label: "User opens chat" },
  { state: "idle", delay: 1500, label: "Waiting for input" },
  { state: "listening", delay: 3000, label: "User typing..." },
  { state: "thinking", delay: 5000, label: "Processing query" },
  { state: "searching", delay: 6500, label: "Looking up info" },
  { state: "success", delay: 8500, label: "Found answer!" },
  { state: "idle", delay: 10000, label: "Ready for next" },
];

function ConversationDemo() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    CONVERSATION_SCRIPT.forEach((step, i) => {
      timers.push(setTimeout(() => setCurrent(i), step.delay));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <DonnyAvatar state={CONVERSATION_SCRIPT[current].state} size="xl" />
      <p style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
        {CONVERSATION_SCRIPT[current].label}
      </p>
      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--color-text-muted)",
          fontFamily: "monospace",
        }}
      >
        State: {CONVERSATION_SCRIPT[current].state}
      </p>
    </div>
  );
}

export const ConversationSimulation: Story = {
  render: () => <ConversationDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Simulates a typical conversation flow: greeting → idle → listening → thinking → searching → success",
      },
    },
  },
};

/** Interactive state selector */
const ALL_STATES: DonnyState[] = [
  "idle",
  "listening",
  "thinking",
  "searching",
  "success",
  "error",
  "confused",
  "handoff",
  "greeting",
  "acknowledging",
  "suggesting",
  "confident",
  "curious",
  "celebrating",
  "apologetic",
  "typing",
  "loading",
  "waving",
  "remembering",
  "focused",
  "playful",
  "impressed",
  "skeptical",
  "sleepy",
  "sleeping",
];

function InteractiveDemo() {
  const [state, setState] = useState<DonnyState>("idle");

  return (
    <div style={{ textAlign: "center" }}>
      <DonnyAvatar state={state} size="xl" />
      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          justifyContent: "center",
          maxWidth: "500px",
        }}
      >
        {ALL_STATES.map((s) => (
          <button
            key={s}
            onClick={() => setState(s)}
            style={{
              padding: "0.25rem 0.5rem",
              fontSize: "0.625rem",
              fontFamily: "monospace",
              border:
                state === s
                  ? "2px solid var(--color-primary)"
                  : "1px solid var(--color-border)",
              borderRadius: "4px",
              background: state === s ? "var(--color-primary)" : "transparent",
              color: state === s ? "white" : "inherit",
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export const Interactive: Story = { render: () => <InteractiveDemo /> };

/** Eye tracking demo - move your mouse around! */
function EyeTrackingDemo() {
  const [proximityState, setProximityState] = useState<DonnyState>("idle");
  const [nearTarget, setNearTarget] = useState<string | null>(null);

  const handleProximityChange = (isNear: boolean, selector?: string) => {
    if (isNear) {
      setNearTarget(selector || "unknown");
      if (selector?.includes("contact")) {
        setProximityState("curious");
      } else if (selector?.includes("submit")) {
        setProximityState("impressed");
      } else {
        setProximityState("playful");
      }
    } else {
      setNearTarget(null);
      setProximityState("idle");
    }
  };

  return (
    <div style={{ padding: "2rem", minHeight: "400px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "2rem",
        }}
      >
        <DonnyAvatar
          state={proximityState}
          size="xl"
          trackMouse
          proximitySelectors={["[data-contact-cta]", "[data-submit-btn]"]}
          onProximityChange={handleProximityChange}
        />
      </div>

      <p
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          color: "var(--color-text-muted)",
        }}
      >
        Move your mouse around - Donny follows! Hover near the buttons below.
      </p>

      <div
        style={{
          display: "flex",
          gap: "2rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          data-contact-cta
          style={{
            padding: "1rem 2rem",
            fontSize: "1rem",
            background: "var(--color-primary)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Contact Us
        </button>

        <button
          data-submit-btn
          style={{
            padding: "1rem 2rem",
            fontSize: "1rem",
            background: "var(--color-success)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Submit Form
        </button>
      </div>

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <p style={{ fontSize: "0.875rem", fontFamily: "monospace" }}>
          State: <strong>{proximityState}</strong>
          {nearTarget && (
            <>
              {" "}
              | Near: <code>{nearTarget}</code>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export const EyeTracking: Story = {
  render: () => <EyeTrackingDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Donny follows your mouse cursor and reacts when you hover near contact CTAs or submit buttons!",
      },
    },
  },
};

export const Playground = Default;
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
