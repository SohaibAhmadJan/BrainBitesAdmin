import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMousePosition } from '../../hooks/useMousePosition';
import { cn } from '../../utils/cn';
import { SPRING_SMOOTH } from '../../utils/animations';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  layoutId?: string;
  onClick?: () => void;
  glowColor?: string;
}

const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className,
  layoutId,
  onClick,
  glowColor = 'rgba(45, 106, 79, 0.15)'
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition(cardRef);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={cardRef}
      layoutId={layoutId}
      onClick={onClick}
      whileHover={shouldReduceMotion ? { borderColor: 'rgba(45, 106, 79, 0.3)' } : { y: -8, scale: 1.01 }}
      whileTap={shouldReduceMotion ? { opacity: 0.9 } : { scale: 0.98 }}
      transition={SPRING_SMOOTH}
      className={cn(
        "glass rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group cursor-pointer",
        className
      )}
    >
      {/* Dynamic Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle 300px at ${mouse.x}px ${mouse.y}px, ${glowColor}, transparent)`
        }}
      />

      <div className="relative z-10">
        {children}
      </div>

      {/* Decorative Border Glow */}
      <div className="absolute inset-0 border border-brand-primary/10 rounded-[2.5rem] group-hover:border-brand-primary/30 transition-colors" />
    </motion.div>
  );
};

export default PremiumCard;
