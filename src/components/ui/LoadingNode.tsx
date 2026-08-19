import React from 'react';

interface LoadingNodeProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingNode: React.FC<LoadingNodeProps> = ({
  message = "Synchronizing system state...",
  fullScreen = false
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-12 space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin shadow-[0_0_30px_rgba(45,106,79,0.3)]"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-brand-secondary/40 rounded-full animate-spin [animation-duration:1.5s]"></div>
      </div>
      <p className="text-brand-secondary/40 font-black tracking-[0.4em] text-[10px] uppercase animate-pulse">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingNode;
