import React, { useEffect, useRef } from "react";
import styles from "./VoidVortex.module.css";

type VoidVortexProps = {
  className?: string;
};

type Particle = {
  angle: number;
  baseRadius: number;
  speed: number;
  size: number;
  offset: number;
  drift: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const VoidVortex = ({ className }: VoidVortexProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const state = {
      width: 0,
      height: 0,
      maxRadius: 0,
      innerRadius: 0,
    };

    let particles: Particle[] = [];
    let animationHandle: number | null = null;
    let isAnimating = false;
    let lastTime = 0;

    const initParticles = () => {
      const { width, height, maxRadius, innerRadius } = state;
      if (!width || !height || !maxRadius || !innerRadius) {
        particles = [];
        return;
      }

      const areaFactor = clamp((width * height) / (1440 * 900), 0.5, 1.6);
      const particleCount = Math.floor(clamp(900 * areaFactor, 420, 1500));

      particles = Array.from({ length: particleCount }, () => {
        const radiusBias = Math.pow(Math.random(), 1.6);
        return {
          angle: Math.random() * Math.PI * 2,
          baseRadius: innerRadius + radiusBias * (maxRadius - innerRadius),
          speed: 0.00004 + Math.random() * 0.00016,
          size: 0.5 + Math.random() * 1.3,
          offset: Math.random() * Math.PI * 2,
          drift: (Math.random() - 0.5) * 0.0006,
        };
      });
    };

    const setCanvasSize = () => {
      const parent = canvas.parentElement;
      if (!parent) {
        return;
      }

      const rect = parent.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (!width || !height) {
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);

      state.width = width;
      state.height = height;
      const diagonal = Math.hypot(width, height); // ensure coverage to all edges
      state.maxRadius = diagonal * 0.5;
      state.innerRadius = state.maxRadius * 0.35;

      initParticles();
      drawFrame(performance.now(), true);
    };

    const drawFrame = (time: number, singleFrame = false) => {
      const { width, height, maxRadius, innerRadius } = state;
      if (!width || !height || !maxRadius || !innerRadius) {
        return;
      }

      const delta = lastTime ? Math.min(32, time - lastTime) : 16;
      lastTime = time || 16;

      context.globalCompositeOperation = "source-over";
      context.fillStyle = "rgba(0, 0, 0, 0.22)";
      context.fillRect(0, 0, width, height);

      context.globalCompositeOperation = "lighter";
      const centerX = width / 2;
      const centerY = height / 2;

      const pulsate = Math.sin(time * 0.00015) * 6;

      particles.forEach((particle, index) => {
        const angleDrift =
          particle.drift * delta * Math.sin(time * 0.0002 + particle.offset);
        particle.angle += delta * (particle.speed + angleDrift);

        const wave = Math.sin(time * 0.00032 + particle.offset * 2) * 14;
        const spiral = (index % 7) * 0.35;
        const radius = particle.baseRadius + wave + spiral + pulsate;
        const wobble =
          1 + 0.12 * Math.sin(time * 0.0004 + particle.baseRadius * 0.1);

        const x = centerX + Math.cos(particle.angle) * radius * wobble;
        const y = centerY + Math.sin(particle.angle) * radius * wobble;

        const depth = clamp(radius / maxRadius, 0, 1);
        const alpha = 0.2 + depth * 0.55;
        const size = particle.size * (0.6 + depth * 1.4);

        context.beginPath();
        context.fillStyle = `rgba(244, 235, 184, ${alpha})`;
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
      });

      context.globalCompositeOperation = "destination-out";
      const voidRadius =
        innerRadius * (0.85 + Math.sin(time * 0.0003) * 0.03) + 6;
      const gradient = context.createRadialGradient(
        centerX,
        centerY,
        voidRadius * 0.5,
        centerX,
        centerY,
        voidRadius,
      );
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.9)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      context.fillStyle = gradient;
      context.beginPath();
      context.arc(centerX, centerY, voidRadius, 0, Math.PI * 2);
      context.fill();

      context.globalCompositeOperation = "source-over";

      if (!singleFrame && isAnimating) {
        animationHandle = window.requestAnimationFrame(drawFrame);
      }
    };

    const startAnimation = () => {
      if (isAnimating) {
        return;
      }
      isAnimating = true;
      lastTime = 0;
      animationHandle = window.requestAnimationFrame(drawFrame);
    };

    const stopAnimation = () => {
      isAnimating = false;
      if (animationHandle !== null) {
        cancelAnimationFrame(animationHandle);
        animationHandle = null;
      }
    };

    const handleResize = () => {
      setCanvasSize();
    };

    setCanvasSize();

    const motionMedia = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;

    if (motionMedia?.matches) {
      drawFrame(performance.now(), true);
    } else {
      startAnimation();
    }

    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        stopAnimation();
        drawFrame(performance.now(), true);
      } else {
        startAnimation();
      }
    };

    if (motionMedia?.addEventListener) {
      motionMedia.addEventListener("change", handleMotionChange);
    } else if (motionMedia?.addListener) {
      motionMedia.addListener(handleMotionChange);
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && canvas.parentElement) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(canvas.parentElement);
    } else {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      stopAnimation();
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", handleResize);
      }

      if (motionMedia?.removeEventListener) {
        motionMedia.removeEventListener("change", handleMotionChange);
      } else if (motionMedia?.removeListener) {
        motionMedia.removeListener(handleMotionChange);
      }
    };
  }, []);

  const wrapperClassName = [styles.wrapper, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClassName}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
};

export default VoidVortex;
