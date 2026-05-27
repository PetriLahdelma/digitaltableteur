"use client";

import React from "react";
import styles from "./Designerman.module.css";

type AnimationName =
  | "idle"
  | "walk"
  | "run"
  | "jump"
  | "punch"
  | "blast"
  | "block";

type AnimationConfig = {
  frames: number[];
  fps: number;
  loop?: boolean;
};

export type DesignermanProps = {
  /** Sprite sheet path (e.g. /sprites/designerman.png) */
  spriteSheet: string;
  /** Frame width in px */
  frameWidth?: number;
  /** Frame height in px */
  frameHeight?: number;
  /** Number of columns in the sheet */
  columns?: number;
  /** Optional custom animations */
  animations?: Partial<Record<AnimationName, AnimationConfig>>;
  /** Scale multiplier for the sprite */
  scale?: number;
  /** Optional looping audio track */
  audioSrc?: string;
};

const DEFAULT_ANIMATIONS: Record<AnimationName, AnimationConfig> = {
  // 4x3 sheet (64px each). Index map:
  // Row 0: [0]=idle1, [1]=idle2, [2]=idle3, [3]=jump start (arm up)
  // Row 1: [4]=run1, [5]=run2, [6]=run3, [7]=punch straight
  // Row 2: [8]=punch impact, [9]=punch windup, [10]=blast, [11]=block/shield
  idle: { frames: [0], fps: 1, loop: true }, // stop any bobbing on idle
  walk: { frames: [4, 5], fps: 8, loop: true },
  run: { frames: [4, 5], fps: 12, loop: true },
  jump: { frames: [6], fps: 1, loop: false },
  punch: { frames: [7, 8, 9], fps: 12, loop: false },
  blast: { frames: [10], fps: 12, loop: false },
  block: { frames: [11], fps: 1, loop: false },
};

const GROUND_Y = 0;

/**
 * Designerman component.
 */
export function Designerman({
  spriteSheet,
  frameWidth = 64,
  frameHeight = 64,
  columns = 4,
  animations = {},
  scale = 3,
  audioSrc = "/designerman.mp3",
}: DesignermanProps) {
  const animMap = { ...DEFAULT_ANIMATIONS, ...animations };
  const [position, setPosition] = React.useState({ x: 120, y: GROUND_Y });
  const [velocity, setVelocity] = React.useState({ x: 0, y: 0 });
  const [facing, setFacing] = React.useState<1 | -1>(1);
  const [currentAnim, setCurrentAnim] = React.useState<AnimationName>("idle");
  const [frame, setFrame] = React.useState(0);
  const [sheetSize, setSheetSize] = React.useState({
    w: frameWidth * columns,
    h: frameHeight * 3,
  });
  const [muted, setMuted] = React.useState(false);
  const pressed = React.useRef<Set<string>>(new Set());
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const lastTimeRef = React.useRef<number>(performance.now());
  const frameTimerRef = React.useRef(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    const img = new Image();
    img.src = spriteSheet;
    img.onload = () => setSheetSize({ w: img.width, h: img.height });
  }, [spriteSheet]);

  // Focus state tracking for keyboard accessibility
  // State setter used in event handlers; value reserved for future visual feedback
  const [, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only respond to keyboard when focused (accessibility best practice)
      pressed.current.add(e.key.toLowerCase());
      // Prevent scrolling when using arrow keys within the game
      if (
        ["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(
          e.key.toLowerCase()
        )
      ) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      pressed.current.delete(e.key.toLowerCase());
    };

    // Attach to container element (not window) for proper focus handling
    container.addEventListener("keydown", handleKeyDown);
    container.addEventListener("keyup", handleKeyUp);
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      container.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    audio.loop = true;
    if (muted) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        /* autoplay might be blocked; user will need to interact */
      });
    }
  }, [muted, audioSrc]);

  React.useEffect(() => {
    let raf: number;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const delta = Math.min(32, now - lastTimeRef.current);
      lastTimeRef.current = now;

      const inputs = pressed.current;
      const left = inputs.has("arrowleft") || inputs.has("a");
      const right = inputs.has("arrowright") || inputs.has("d");
      const jump = inputs.has("arrowup") || inputs.has("w") || inputs.has(" ");
      const punch = inputs.has("j");
      const blast = inputs.has("k");
      const block = inputs.has("l");
      const run = inputs.has("shift");

      let vx = 0;
      let vy = velocity.y;
      const speed = run ? 0.35 : 0.22;

      if (left) vx = -speed;
      if (right) vx = speed;
      if (left && !right) setFacing(-1);
      if (right && !left) setFacing(1);

      const onGround = position.y <= GROUND_Y + 0.001;
      if (jump && onGround) vy = 0.58;
      vy = Math.max(vy - 0.035, -0.9);

      let anim: AnimationName = "idle";
      if (block) anim = "block";
      else if (punch) anim = "punch";
      else if (blast) anim = "blast";
      else if (!onGround) anim = "jump";
      else if (vx !== 0) anim = run ? "run" : "walk";

      if (anim !== currentAnim) {
        setCurrentAnim(anim);
        setFrame(0);
        frameTimerRef.current = 0;
      }

      const animConf = animMap[anim] || animMap.idle;
      const msPerFrame = 1000 / animConf.fps;
      frameTimerRef.current += delta;
      if (frameTimerRef.current >= msPerFrame) {
        frameTimerRef.current = 0;
        setFrame((prev) => {
          const idx = animConf.frames.indexOf(prev);
          if (idx === -1 || idx === animConf.frames.length - 1) {
            return animConf.loop ? animConf.frames[0] : animConf.frames.at(-1)!;
          }
          return animConf.frames[idx + 1];
        });
      }

      const nextX = position.x + vx * delta;
      const boundedX = Math.max(0, Math.min(nextX, 640 - frameWidth * scale));
      const nextY = Math.max(GROUND_Y, position.y + vy * delta);

      setPosition({ x: boundedX, y: nextY });
      setVelocity({ x: vx, y: vy });
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [
    animMap,
    currentAnim,
    frameHeight,
    frameWidth,
    scale,
    position,
    velocity,
  ]);

  const cols = Math.max(
    1,
    Math.floor(sheetSize.w / frameWidth) || columns || 1,
  );
  const rows = Math.max(1, Math.floor(sheetSize.h / frameHeight) || 1);
  const totalFrames = cols * rows;

  const animConf = animMap[currentAnim];
  const requestedFrame =
    animConf.frames.find((f) => f === frame) ?? animConf.frames[0] ?? 0;
  const safeFrameIdx = Math.min(requestedFrame, totalFrames - 1);
  const col = safeFrameIdx % cols;
  const row = Math.floor(safeFrameIdx / cols);
  const bgX = -(col * frameWidth);
  const bgY = -(row * frameHeight);

  return (
    <div
      ref={containerRef}
      className={styles.canvas}
      role="application"
      aria-label="Designerman interactive sprite game. Use arrow keys to move, Space to jump, J to punch, K to blast, L to block."
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        // Clear pressed keys when focus is lost
        pressed.current.clear();
      }}
    >
      <div className={styles.hud} aria-hidden>
        <div className={styles.hint}>
          <span className={styles.key}>← →</span>
          <span className={styles.key}>Shift</span>
          <span className={styles.key}>Space/W</span>
          <span className={styles.key}>J</span>
          <span className={styles.key}>K</span>
          <span className={styles.key}>L</span>
        </div>
        <div className={styles.hint}>
          <button
            type="button"
            className={styles.controlButton}
            onClick={() => setMuted((m) => !m)}
            aria-pressed={muted}
          >
            {muted ? "Unmute" : "Mute"}
          </button>
          <span>Anim: {currentAnim}</span>
        </div>
      </div>
      <div
        className={styles.sprite}
        style={
          {
            transform: `translate(${position.x}px, ${-position.y + 12}px) scale(${facing * scale}, ${scale})`,
            backgroundImage: `url(${spriteSheet})`,
            backgroundPosition: `${bgX}px ${bgY}px`,
            backgroundSize: `${sheetSize.w}px ${sheetSize.h}px`,
            "--frame-width": `${frameWidth}px`,
            "--frame-height": `${frameHeight}px`,
            "--sheet-width": `${sheetSize.w}px`,
            "--sheet-height": `${sheetSize.h}px`,
          } as React.CSSProperties
        }
      />
      <div className={styles.ground} />
      {audioSrc ? <audio ref={audioRef} src={audioSrc} preload="auto" /> : null}
    </div>
  );
}

export default Designerman;
