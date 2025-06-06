import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface MoireBackgroundProps {
  title?: string;
  subtitle?: string;
  lineCount?: number;
  lineSpacing?: number;
  animationSpeed?: number;
  className?: string;
}

export default function MoireBackground({
  title = "",
  subtitle = "",
  lineCount = 50,
  lineSpacing = 10,
  animationSpeed = 0.5,
  className,
}: MoireBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const rippleEffect = useRef({ active: false, radius: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };

    resizeCanvas();

    let offset = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < lineCount; i++) {
        const y = i * lineSpacing + offset;
        const density = Math.sin((i / lineCount) * Math.PI * 2) * 0.5 + 0.5;
        const curveFactor = Math.sin((i + offset) * 0.05) * 20;

        const distanceToMouse = Math.abs(mousePosition.current.y - y);
        const tightness = Math.max(0, 1 - distanceToMouse / canvas.height);

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.quadraticCurveTo(
          canvas.width / 2 + curveFactor * tightness,
          y - curveFactor * tightness,
          canvas.width,
          y,
        );
        ctx.strokeStyle = `rgba(0, 0, 0, ${density})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (rippleEffect.current.active) {
        ctx.beginPath();
        ctx.arc(
          mousePosition.current.x,
          mousePosition.current.y,
          rippleEffect.current.radius,
          0,
          Math.PI * 2,
        );
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();

        rippleEffect.current.radius += 5;
        if (rippleEffect.current.radius > canvas.width / 2) {
          rippleEffect.current.active = false;
          rippleEffect.current.radius = 0;
        }
      }

      offset += animationSpeed;
      if (offset > lineSpacing) offset = 0;

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resizeCanvas();
    };

    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const handleMouseClick = (event: MouseEvent) => {
      mousePosition.current = {
        x: event.clientX,
        y: event.clientY,
      };
      rippleEffect.current.active = true;
      rippleEffect.current.radius = 0;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleMouseClick);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleMouseClick);
    };
  }, [lineCount, lineSpacing, animationSpeed]);

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-white dark:bg-black ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4"
        >
          <h1 className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-black to-black/70 dark:from-white dark:to-white/70 drop-shadow-sm">
            {title}
          </h1>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://kokonutui.com/"
            className="text-xl md:text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-black/90 to-black/50 dark:from-white/90 dark:to-white/50 flex items-center justify-center"
          >
            {subtitle}
          </a>
        </motion.div>
      </div>
    </div>
  );
}
