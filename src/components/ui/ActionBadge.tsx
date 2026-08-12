import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface ActionBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'success' | 'warning' | 'info' | 'error';
}

const ActionBadge: React.FC<ActionBadgeProps> = ({
  children,
  className,
  variant = 'info'
}) => {
  const variants = {
    success: "bg-brand-primary/10 border-brand-primary/20 text-brand-primary",
    warning: "bg-brand-gold/10 border-brand-gold/20 text-brand-gold",
    info: "bg-brand-secondary/10 border-brand-secondary/20 text-brand-secondary",
    error: "bg-red-500/10 border-red-500/20 text-red-500"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
        variants[variant],
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default ActionBadge;
