import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const LivingEmeraldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Brand Colors
    const primaryColor = theme === 'dark' ? '#2D6A4F' : '#95D5B2';
    const secondaryColor = theme === 'dark' ? '#1A2B22' : '#E6F4EA';
    const bgColor = theme === 'dark' ? '#0F1F17' : '#F7FBF9';

    const draw = () => {
      time += 0.005;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;

      // 1. Primary "Breathing" Pulse
      const pulseAlpha = 0.05 + Math.sin(time * 2) * 0.03;

      // Layer 1: Deep Slow Mist (Top-Right focus)
      const x1 = width * 0.8 + (width * 0.1) * Math.cos(time * 0.5);
      const y1 = height * 0.2 + (height * 0.05) * Math.sin(time * 0.5);

      const grad1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, width * 1.2);
      grad1.addColorStop(0, hexToRgba(primaryColor, pulseAlpha));
      grad1.addColorStop(1, 'transparent');

      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(x1, y1, width * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Layer 2: Vibrant Mid Mist (Bottom-Left focus)
      const x2 = width * 0.2 + (width * 0.15) * Math.sin(time * 0.7);
      const y2 = height * 0.7 + (height * 0.1) * Math.cos(time * 0.7);

      const grad2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, width * 1.5);
      grad2.addColorStop(0, hexToRgba(primaryColor, pulseAlpha * 0.8));
      grad2.addColorStop(1, 'transparent');

      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(x2, y2, width * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Layer 3: Accent Glow (Center breathing)
      const grad3 = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
      grad3.addColorStop(0, hexToRgba(secondaryColor, theme === 'dark' ? 0.04 : 0.1));
      grad3.addColorStop(1, 'transparent');

      ctx.fillStyle = grad3;
      ctx.beginPath();
      ctx.arc(width/2, height/2, width * 0.8, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none transition-colors duration-1000"
    />
  );
};

export default LivingEmeraldBackground;
