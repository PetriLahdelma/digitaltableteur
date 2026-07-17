import React, { useCallback, useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import styles from "./DonnyAvatar.module.css";

/** Every supported Donny expression and lifecycle state. */
export const DONNY_STATES = [
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
] as const;

export type DonnyState = (typeof DONNY_STATES)[number];

const DONNY_STATE_SET = new Set<string>(DONNY_STATES);

/** Checks untrusted host data before it is passed to DonnyAvatar. */
export function isDonnyState(value: string): value is DonnyState {
  return DONNY_STATE_SET.has(value);
}

export interface DonnyAvatarProps {
  /** Current expression or assistant lifecycle state. */
  state?: DonnyState;
  /** Rendered avatar size. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Additional CSS class. */
  className?: string;
  /** Called when the state transition animation ends. */
  onTransitionEnd?: () => void;
  /** Shows the current state label for diagnostics. */
  showLabel?: boolean;
  /** Makes the eyes follow the pointer. */
  trackMouse?: boolean;
  /** CSS selectors whose pointer proximity can trigger curious or playful behavior. */
  proximitySelectors?: string[];
  /** Called when proximity to a tracked target changes. */
  onProximityChange?: (isNearTarget: boolean, targetSelector?: string) => void;
  /** Pointer proximity threshold in pixels (default 150). */
  proximityThreshold?: number;
  /** Enables randomized idle expressions. */
  enableIdleExpressions?: boolean;
  /** Base idle-expression interval in milliseconds (default 8000), randomized by 50 percent. */
  idleExpressionInterval?: number;
  /** Animates the mouth during streaming responses. */
  isSpeaking?: boolean;
  /** Enables sleepy and sleeping states after pointer inactivity. */
  enableSleepDetection?: boolean;
  /** Inactivity delay before the sleepy state, in milliseconds (default 120000). */
  sleepyDelay?: number;
  /** Inactivity delay before the sleeping state, in milliseconds (default 150000). */
  sleepDelay?: number;
  /** Removes role and label when a parent control owns the accessible name (e.g. the chat toggle). */
  decorative?: boolean;
}

/**
 * Eye configurations for each state
 * Uses transform and shape variations to express emotion
 */
const EYE_CONFIGS: Record<
  DonnyState,
  {
    leftEye: string;
    rightEye: string;
    leftTransform?: string;
    rightTransform?: string;
    animation?: string;
  }
> = {
  // Core states
  idle: {
    leftEye: "M12 16 A3 3 0 1 1 12 10 A3 3 0 1 1 12 16",
    rightEye: "M28 16 A3 3 0 1 1 28 10 A3 3 0 1 1 28 16",
    animation: "breathe",
  },
  listening: {
    leftEye: "M12 17 A3.5 3.5 0 1 1 12 10 A3.5 3.5 0 1 1 12 17",
    rightEye: "M28 17 A3.5 3.5 0 1 1 28 10 A3.5 3.5 0 1 1 28 17",
    leftTransform: "translateY(-1px)",
    rightTransform: "translateY(-1px)",
  },
  thinking: {
    leftEye: "M9 13 H15", // Dash
    rightEye: "M25 13 H31", // Dash
    leftTransform: "rotate(-5deg)",
    rightTransform: "rotate(5deg)",
    animation: "thinking",
  },
  searching: {
    leftEye: "M12 16 A3 3 0 1 1 12 10 A3 3 0 1 1 12 16",
    rightEye: "M28 16 A3 3 0 1 1 28 10 A3 3 0 1 1 28 16",
    animation: "scanning",
  },
  success: {
    leftEye: "M9 15 Q12 18 15 15", // Happy curve
    rightEye: "M25 15 Q28 18 31 15", // Happy curve
    animation: "bounce",
  },
  error: {
    leftEye: "M9 10 L15 16 M9 16 L15 10", // X
    rightEye: "M25 10 L31 16 M25 16 L31 10", // X
    animation: "shake",
  },
  confused: {
    leftEye: "M12 16 A3 3 0 1 1 12 10 A3 3 0 1 1 12 16",
    rightEye: "M28 14 A4 4 0 1 1 28 8 A4 4 0 1 1 28 14", // Larger
    leftTransform: "translateY(1px)",
    animation: "tilt",
  },
  handoff: {
    leftEye: "M14 16 A3 3 0 1 1 14 10 A3 3 0 1 1 14 16", // Shifted right
    rightEye: "M30 16 A3 3 0 1 1 30 10 A3 3 0 1 1 30 16", // Shifted right
    animation: "slideOut",
  },

  // Extended states
  greeting: {
    leftEye: "M9 14 Q12 18 15 14",
    rightEye: "M25 14 Q28 18 31 14",
    animation: "popIn",
  },
  acknowledging: {
    leftEye: "M9 14 H15", // Blink
    rightEye: "M25 14 H31", // Blink
    animation: "nod",
  },
  suggesting: {
    leftEye: "M12 15 A2.5 3 0 1 1 12 9 A2.5 3 0 1 1 12 15", // Squint
    rightEye: "M28 15 A2.5 3 0 1 1 28 9 A2.5 3 0 1 1 28 15", // Squint
    leftTransform: "rotate(5deg)",
    rightTransform: "rotate(-5deg)",
  },
  confident: {
    leftEye: "M12 16 A3 3 0 1 1 12 10 A3 3 0 1 1 12 16",
    rightEye: "M28 16 A3 3 0 1 1 28 10 A3 3 0 1 1 28 16",
    animation: "grow",
  },
  curious: {
    leftEye: "M12 16 A3 3 0 1 1 12 10 A3 3 0 1 1 12 16",
    rightEye: "M28 17 A4 4 0 1 1 28 9 A4 4 0 1 1 28 17", // One larger
    leftTransform: "translateY(1px)",
  },
  celebrating: {
    leftEye: "M9 14 Q12 19 15 14",
    rightEye: "M25 14 Q28 19 31 14",
    animation: "celebrate",
  },
  apologetic: {
    leftEye: "M9 16 Q12 14 15 16", // Sad curve
    rightEye: "M25 16 Q28 14 31 16", // Sad curve
    leftTransform: "translateY(2px)",
    rightTransform: "translateY(2px)",
    animation: "shrink",
  },
  typing: {
    leftEye: "M11 13 H13", // Cursor
    rightEye: "M27 13 H29", // Cursor
    animation: "blink",
  },
  loading: {
    leftEye: "M12 13 A5 5 0 0 1 12 13", // Spinner segment
    rightEye: "M28 13 A5 5 0 0 1 28 13", // Spinner segment
    animation: "spin",
  },
  waving: {
    leftEye: "M9 14 Q12 17 15 14",
    rightEye: "M25 14 Q28 17 31 14",
    animation: "wave",
  },
  remembering: {
    leftEye: "M12 14 A3 3 0 1 1 12 8 A3 3 0 1 1 12 14",
    rightEye: "M28 14 A3 3 0 1 1 28 8 A3 3 0 1 1 28 14",
    leftTransform: "translate(-2px, -2px)", // Look up-left
    rightTransform: "translate(-2px, -2px)",
  },
  focused: {
    leftEye: "M10 14 A2 2 0 1 1 10 10 A2 2 0 1 1 10 14", // Narrow
    rightEye: "M26 14 A2 2 0 1 1 26 10 A2 2 0 1 1 26 14", // Narrow
  },
  playful: {
    leftEye: "M9 14 H15", // Wink
    rightEye: "M28 16 A3 3 0 1 1 28 10 A3 3 0 1 1 28 16",
  },
  impressed: {
    leftEye: "M12 18 A4 4 0 1 1 12 10 A4 4 0 1 1 12 18", // Wide
    rightEye: "M28 18 A4 4 0 1 1 28 10 A4 4 0 1 1 28 18", // Wide
    leftTransform: "translateY(-1px)",
    rightTransform: "translateY(-1px)",
  },
  skeptical: {
    leftEye: "M12 16 A3 3 0 1 1 12 10 A3 3 0 1 1 12 16",
    rightEye: "M28 14 A2.5 2 0 1 1 28 10 A2.5 2 0 1 1 28 14", // Raised brow
    rightTransform: "translateY(-2px)",
  },
  sleepy: {
    leftEye: "M9 14 Q12 12 15 14",  // Droopy half-closed
    rightEye: "M25 14 Q28 12 31 14", // Droopy half-closed
    leftTransform: "translateY(1px)",
    rightTransform: "translateY(1px)",
    animation: "drowsy",
  },
  sleeping: {
    leftEye: "M9 13 H15",  // Closed line
    rightEye: "M25 13 H31", // Closed line
    animation: "snooze",
  },
};

/**
 * Mouth configurations for expressive states
 * Most states have no visible mouth - it only appears for strong emotions
 */
type MouthType = "none" | "wide-smile" | "small-smile" | "puckered" | "round" | "slight";

const MOUTH_CONFIGS: Record<DonnyState, MouthType> = {
  // Core states - mostly no mouth
  idle: "none",
  listening: "none",
  thinking: "none",
  searching: "none",
  success: "wide-smile",      // Really happy!
  error: "round",             // Scared/appalled "O" mouth
  confused: "puckered",       // Bewildered pucker
  handoff: "slight",

  // Extended states
  greeting: "small-smile",
  acknowledging: "none",
  suggesting: "none",
  confident: "slight",
  curious: "none",
  celebrating: "wide-smile",  // Really really happy!
  apologetic: "puckered",     // Sad pucker
  typing: "none",
  loading: "none",
  waving: "small-smile",
  remembering: "none",
  focused: "none",
  playful: "small-smile",
  impressed: "round",         // Surprised "O" mouth
  skeptical: "puckered",      // Hmm...
  sleepy: "slight",           // Slightly open, relaxed
  sleeping: "round",          // Slightly open "o" while sleeping
};

/**
 * SVG paths for different mouth shapes
 * Positioned at bottom center of the face (y ~22-24)
 */
const MOUTH_PATHS: Record<Exclude<MouthType, "none">, string> = {
  "wide-smile": "M14 23 Q20 28 26 23",         // Big happy curve
  "small-smile": "M16 23 Q20 25 24 23",        // Gentle smile
  "puckered": "M18 24 Q20 22 22 24 Q20 26 18 24", // Small puckered "~"
  "round": "M18 22 A2 2.5 0 1 0 22 22 A2 2.5 0 1 0 18 22", // Round "O"
  "slight": "M17 24 H23",                       // Slight neutral line
};

// Speaking mouth path - small rounded opening
const SPEAKING_MOUTH = "M17 23 Q20 26 23 23";  // Open mouth for speaking animation

const SIZE_MAP = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

/**
 * DonnyAvatar
 *
 * Animated 2D avatar for the Donny AI assistant.
 * Expresses personality through eye shape and motion.
 * Supports mouse tracking and proximity detection.
 */
export function DonnyAvatar({
  state = "idle",
  size = "md",
  className,
  onTransitionEnd,
  showLabel = false,
  trackMouse = false,
  proximitySelectors = [],
  onProximityChange,
  proximityThreshold = 150,
  enableIdleExpressions = false,
  idleExpressionInterval = 8000,
  isSpeaking = false,
  enableSleepDetection = false,
  sleepyDelay = 120000,  // 2 minutes
  sleepDelay = 150000,   // 2.5 minutes
  decorative = false,
}: DonnyAvatarProps) {
  const [currentState, setCurrentState] = useState<DonnyState>(state);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isNearTarget, setIsNearTarget] = useState(false);
  const [idleExpression, setIdleExpression] = useState<DonnyState | null>(null);
  const [sleepState, setSleepState] = useState<"awake" | "sleepy" | "sleeping">("awake");
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chainedTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sleepyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isNearTargetRef = useRef(isNearTarget);
  const onProximityChangeRef = useRef(onProximityChange);

  // State transition effect
  useEffect(() => {
    if (state !== currentState) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setCurrentState(state);
        setIsTransitioning(false);
        onTransitionEnd?.();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [state, currentState, onTransitionEnd]);

  // Keep refs in sync with state/props
  useEffect(() => {
    isNearTargetRef.current = isNearTarget;
  }, [isNearTarget]);

  useEffect(() => {
    onProximityChangeRef.current = onProximityChange;
  }, [onProximityChange]);

  // Helper to clear all chained timeouts
  const clearChainedTimeouts = () => {
    chainedTimeoutsRef.current.forEach(clearTimeout);
    chainedTimeoutsRef.current = [];
  };

  // Random idle expressions to make Donny feel alive
  useEffect(() => {
    if (!enableIdleExpressions || state !== "idle") {
      // Clear any pending idle expression when disabled or not idle
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }
      clearChainedTimeouts();
      setIdleExpression(null);
      return;
    }

    // Pool of subtle expressions for idle state
    const idleExpressions: DonnyState[] = [
      "curious",      // Raise one eyebrow
      "playful",      // Wink
      "acknowledging", // Blink/nod
      "thinking",     // Brief thinking look
      "remembering",  // Look up-left briefly
      "skeptical",    // Raised eyebrow
    ];

    // Function to schedule the next random expression
    const scheduleNextExpression = () => {
      // Randomize interval: base ± 50% (so 8s becomes 4-12s range)
      const variance = idleExpressionInterval * 0.5;
      const randomizedDelay = idleExpressionInterval + (Math.random() * 2 - 1) * variance;
      
      idleTimeoutRef.current = setTimeout(() => {
        // Pick a random expression
        const expression = idleExpressions[Math.floor(Math.random() * idleExpressions.length)];
        setIdleExpression(expression);
        
        // Chance for consecutive expressions (20% chance for 2nd, 10% for 3rd)
        const consecutiveRolls = [Math.random(), Math.random()];
        const consecutiveCount = consecutiveRolls[0] < 0.2 ? (consecutiveRolls[1] < 0.5 ? 2 : 1) : 0;
        
        // Reset after expression duration, possibly chain more
        let resetDelay = 600; // Single expression duration
        
        if (consecutiveCount > 0) {
          // Schedule chained expressions
          let chainDelay = resetDelay;
          for (let i = 0; i < consecutiveCount; i++) {
            const chainTimerId = setTimeout(() => {
              const chainExpression = idleExpressions[Math.floor(Math.random() * idleExpressions.length)];
              setIdleExpression(chainExpression);
            }, chainDelay);
            chainedTimeoutsRef.current.push(chainTimerId);
            chainDelay += 400 + Math.random() * 300; // 400-700ms between chained expressions
          }
          resetDelay = chainDelay + 400;
        }
        
        const resetTimerId = setTimeout(() => {
          setIdleExpression(null);
          scheduleNextExpression();
        }, resetDelay);
        chainedTimeoutsRef.current.push(resetTimerId);
      }, randomizedDelay);
    };

    scheduleNextExpression();

    return () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }
      clearChainedTimeouts();
    };
  }, [enableIdleExpressions, state, idleExpressionInterval]);

  // Sleep detection - Donny gets sleepy after mouse inactivity
  useEffect(() => {
    if (!enableSleepDetection || typeof window === "undefined") {
      setSleepState("awake");
      return;
    }

    const resetSleepTimers = () => {
      lastActivityRef.current = Date.now();
      setSleepState("awake");
      
      // Clear existing timers
      if (sleepyTimeoutRef.current) {
        clearTimeout(sleepyTimeoutRef.current);
        sleepyTimeoutRef.current = null;
      }
      if (sleepTimeoutRef.current) {
        clearTimeout(sleepTimeoutRef.current);
        sleepTimeoutRef.current = null;
      }

      // Set sleepy timer (2 min)
      sleepyTimeoutRef.current = setTimeout(() => {
        setSleepState("sleepy");
      }, sleepyDelay);

      // Set sleep timer (2.5 min)
      sleepTimeoutRef.current = setTimeout(() => {
        setSleepState("sleeping");
      }, sleepDelay);
    };

    // Initial setup
    resetSleepTimers();

    // Listen for user activity globally
    const handleActivity = () => {
      resetSleepTimers();
    };

    window.addEventListener("mousemove", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity, { passive: true });
    window.addEventListener("click", handleActivity, { passive: true });
    window.addEventListener("scroll", handleActivity, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      if (sleepyTimeoutRef.current) {
        clearTimeout(sleepyTimeoutRef.current);
        sleepyTimeoutRef.current = null;
      }
      if (sleepTimeoutRef.current) {
        clearTimeout(sleepTimeoutRef.current);
        sleepTimeoutRef.current = null;
      }
    };
  }, [enableSleepDetection, sleepyDelay, sleepDelay]);

  // Mouse tracking for eyes
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!containerRef.current || !trackMouse) return;

      // Cancel any pending RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate angle and distance from center
        const deltaX = event.clientX - centerX;
        const deltaY = event.clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Clamp eye movement (max 3px offset)
        const maxOffset = 3;
        const normalizedDistance = Math.min(distance / 200, 1);
        const angle = Math.atan2(deltaY, deltaX);

        const offsetX = Math.cos(angle) * maxOffset * normalizedDistance;
        const offsetY = Math.sin(angle) * maxOffset * normalizedDistance;

        setEyeOffset({ x: offsetX, y: offsetY });

        // Check proximity to tracked elements
        if (proximitySelectors.length > 0) {
          let nearTarget = false;
          let matchedSelector: string | undefined;

          for (const selector of proximitySelectors) {
            try {
              const elements = document.querySelectorAll(selector);
              for (const element of elements) {
                const elRect = element.getBoundingClientRect();
                const elCenterX = elRect.left + elRect.width / 2;
                const elCenterY = elRect.top + elRect.height / 2;
                const distToEl = Math.sqrt(
                  Math.pow(event.clientX - elCenterX, 2) +
                    Math.pow(event.clientY - elCenterY, 2)
                );

                if (distToEl < proximityThreshold) {
                  nearTarget = true;
                  matchedSelector = selector;
                  break;
                }
              }
              if (nearTarget) break;
            } catch {
              // Invalid selector - skip gracefully
              continue;
            }
          }

          // Use ref to avoid stale closure comparison
          if (nearTarget !== isNearTargetRef.current) {
            setIsNearTarget(nearTarget);
            onProximityChangeRef.current?.(nearTarget, matchedSelector);
          }
        }
      });
    },
    [trackMouse, proximitySelectors, proximityThreshold]
  );

  // Setup mouse tracking
  useEffect(() => {
    if (!trackMouse) return;

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [trackMouse, handleMouseMove]);

  // Reset eye offset when mouse leaves window
  useEffect(() => {
    if (!trackMouse) return;

    const handleMouseLeave = () => {
      setEyeOffset({ x: 0, y: 0 });
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [trackMouse]);

  // Use idle expression if active, otherwise use current state
  // Sleep states take priority over idle expressions
  const getDisplayState = (): DonnyState => {
    if (sleepState === "sleeping") return "sleeping";
    if (sleepState === "sleepy") return "sleepy";
    if (idleExpression && state === "idle") return idleExpression;
    return currentState;
  };
  const displayState = getDisplayState();
  const config = EYE_CONFIGS[displayState];
  const dimension = SIZE_MAP[size];

  // Calculate eye transforms with tracking offset
  const getEyeTransform = (baseTransform?: string) => {
    const trackingTransform = trackMouse
      ? `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`
      : "";
    
    if (baseTransform && trackingTransform) {
      return `${baseTransform} ${trackingTransform}`;
    }
    return baseTransform || trackingTransform || undefined;
  };

  return (
    <div
      ref={containerRef}
      className={clsx(styles.container, className)}
      style={{ width: dimension, height: dimension }}
      data-state={currentState}
      data-transitioning={isTransitioning}
      data-tracking={trackMouse}
      data-near-target={isNearTarget}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : `Donny is ${currentState}`}
      role={decorative ? undefined : "img"}
    >
      <svg
        viewBox="0 0 40 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={clsx(styles.avatar, config.animation && styles[config.animation])}
      >
        {/* Body - rounded rectangle */}
        <rect
          x="2"
          y="2"
          width="36"
          height="28"
          rx="8"
          fill="var(--donny-primary, var(--color-text))"
          className={styles.body}
        />

        {/* Left eye */}
        <path
          d={config.leftEye}
          fill="none"
          stroke="var(--donny-eyes, white)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.eye}
          style={{ transform: getEyeTransform(config.leftTransform) }}
        />

        {/* Right eye */}
        <path
          d={config.rightEye}
          fill="none"
          stroke="var(--donny-eyes, white)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.eye}
          style={{ transform: getEyeTransform(config.rightTransform) }}
        />

        {/* Mouth - visible when speaking or for expressive states */}
        {(isSpeaking || MOUTH_CONFIGS[displayState] !== "none") && (
          <path
            d={isSpeaking ? SPEAKING_MOUTH : MOUTH_PATHS[MOUTH_CONFIGS[displayState] as Exclude<MouthType, "none">]}
            fill="none"
            stroke="var(--donny-eyes, white)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={clsx(styles.mouth, isSpeaking && styles.speaking)}
          />
        )}

        {/* Success sparkles */}
        {currentState === "celebrating" && (
          <g className={styles.sparkles}>
            <circle cx="6" cy="6" r="1.5" fill="var(--color-text)" />
            <circle cx="34" cy="6" r="1.5" fill="var(--color-text)" />
            <circle cx="20" cy="2" r="1" fill="var(--color-text)" />
          </g>
        )}

        {/* Confused question mark */}
        {currentState === "confused" && (
          <text
            x="35"
            y="8"
            fill="var(--donny-warning, var(--color-text))"
            fontSize="8"
            fontWeight="bold"
            className={styles.questionMark}
          >
            ?
          </text>
        )}

        {/* Remembering thought bubble */}
        {currentState === "remembering" && (
          <g className={styles.thoughtBubble}>
            <circle cx="36" cy="4" r="2" fill="white" opacity="0.6" />
            <circle cx="38" cy="8" r="1.5" fill="white" opacity="0.4" />
          </g>
        )}
      </svg>

      {/* Sleep bubble with animated Zzz... */}
      {sleepState === "sleeping" && (
        <div className={styles.sleepBubble} aria-hidden="true">
          <span className={styles.sleepText}>
            Zzz
            <span className={styles.dot1}>.</span>
            <span className={styles.dot2}>.</span>
            <span className={styles.dot3}>.</span>
          </span>
        </div>
      )}

      {showLabel && (
        <span className={styles.label}>{currentState}</span>
      )}
    </div>
  );
}

DonnyAvatar.displayName = "DonnyAvatar";

export default DonnyAvatar;
