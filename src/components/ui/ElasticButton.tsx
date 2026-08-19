import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { SPRING_SWIFT } from '../../utils/animations';

interface ElasticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const ElasticButton: React.FC<ElasticButtonProps> = ({
  children,
  onClick,
  className,
  variant = 'primary',
  disabled = false,
  type = 'button'
}) => {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    primary: "bg-brand-primary text-brand-white shadow-[0_20px_50px_rgba(45,106,79,0.3)]",
    secondary: "glass text-brand-primary border-brand-primary/20",
    ghost: "bg-transparent text-sub hover:text-brand-primary",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={shouldReduceMotion ? { opacity: 0.8 } : { scale: 1.02, y: -2 }}
      whileTap={shouldReduceMotion ? { opacity: 0.6 } : { scale: 0.98 }}
      transition={SPRING_SWIFT}
      onClick={onClick}
      className={cn(
        "px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className
      )}
    >
      {children}
    </motion.button>
  );
};

export default ElasticButton;
