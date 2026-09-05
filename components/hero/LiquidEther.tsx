"use client";

import React, { useEffect, useRef } from "react";

interface LiquidEtherProps {
  className?: string;
  colors?: string[];
  speed?: number;
  interactive?: boolean;
}

export const LiquidEther: React.FC<LiquidEtherProps> = ({
  className = "",
  colors = ["#5227FF", "#7B5CFF", "#B497CF", "#FF9FFC"],
  speed = 0.5,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Mouse interactive coordinates
    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Fluid blobs simulation
    const blobs = [
      { x: width * 0.3, y: height * 0.3, radius: Math.max(width, height) * 0.45, color: colors[0], vx: 1.2 * speed, vy: 0.8 * speed, angle: 0 },
      { x: width * 0.7, y: height * 0.4, radius: Math.max(width, height) * 0.5, color: colors[1], vx: -1.0 * speed, vy: 1.1 * speed, angle: 2 },
      { x: width * 0.5, y: height * 0.7, radius: Math.max(width, height) * 0.4, color: colors[2], vx: 0.9 * speed, vy: -1.2 * speed, angle: 4 },
      { x: width * 0.4, y: height * 0.5, radius: Math.max(width, height) * 0.35, color: colors[3], vx: -1.3 * speed, vy: -0.9 * speed, angle: 1 },
    ];

    let time = 0;

    const render = () => {
      time += 0.015 * speed;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Dark base background
      ctx.fillStyle = "#0B0910";
      ctx.fillRect(0, 0, width, height);

      // Draw flowing fluid blobs with global composite overlay
      ctx.globalCompositeOperation = "screen";

      blobs.forEach((blob, idx) => {
        // Orbital harmonic motion
        blob.angle += 0.01 * speed * (idx % 2 === 0 ? 1 : -1);
        blob.x += Math.cos(blob.angle) * 1.5;
        blob.y += Math.sin(blob.angle) * 1.5;

        // Bounce off edges smoothly
        if (blob.x < -blob.radius * 0.2 || blob.x > width + blob.radius * 0.2) blob.vx *= -1;
        if (blob.y < -blob.radius * 0.2 || blob.y > height + blob.radius * 0.2) blob.vy *= -1;

        // Subtle gravitational pull toward mouse if interactive
        if (interactive && idx === 0) {
          const dx = mouse.x - blob.x;
          const dy = mouse.y - blob.y;
          blob.x += dx * 0.015;
          blob.y += dy * 0.015;
        }

        const gradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          blob.radius
        );

        gradient.addColorStop(0, `${blob.color}dd`); // 85% opacity
        gradient.addColorStop(0.5, `${blob.color}66`); // 40% opacity
        gradient.addColorStop(1, "rgba(11, 9, 16, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";

      // Dark overlays to ensure text remains 100% readable
      const overlayGradient = ctx.createLinearGradient(0, 0, 0, height);
      overlayGradient.addColorStop(0, "rgba(11, 9, 16, 0.65)");
      overlayGradient.addColorStop(0.5, "rgba(11, 9, 16, 0.5)");
      overlayGradient.addColorStop(1, "rgba(11, 9, 16, 0.85)");
      ctx.fillStyle = overlayGradient;
      ctx.fillRect(0, 0, width, height);

      // Vignette effect
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.4,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      vignette.addColorStop(0, "rgba(11, 9, 16, 0)");
      vignette.addColorStop(1, "rgba(11, 9, 16, 0.9)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [colors, speed, interactive]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block filter blur-3xl opacity-90 transition-opacity duration-1000" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0910]/70 via-transparent to-[#0B0910] pointer-events-none" />
    </div>
  );
};
