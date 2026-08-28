import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

const StatusLight = () => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 80);
      setTimeout(triggerBlink, Math.random() * 6000 + 2000);
    };
    const initialTimer = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(initialTimer);
  }, []);

  return (
    <div className="relative flex items-center justify-center w-6 h-6">
      <div className={cn(
        "w-2.5 h-2.5 rounded-full transition-all duration-75",
        isBlinking
          ? "bg-brand-primary shadow-[0_0_15px_rgba(45,106,79,1)] scale-110"
          : "bg-brand-primary/40 scale-100"
      )} />
      <div className="absolute inset-0 w-full h-full rounded-full bg-brand-primary animate-ping opacity-20" />
    </div>
  );
};

export default StatusLight;
