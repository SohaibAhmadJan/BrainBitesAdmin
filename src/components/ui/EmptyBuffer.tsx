import React from 'react';
import { LucideIcon, Database } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyBufferProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
}

const EmptyBuffer: React.FC<EmptyBufferProps> = ({
  icon: Icon = Database,
  title = "Zero matches in sequence buffer",
  message = "The repository section is currently empty or your query returned no matches."
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full py-32 glass rounded-[3.5rem] border-2 border-dashed border-brand-sage/10 text-center flex flex-col items-center gap-8 relative overflow-hidden group w-full"
    >
      <div className="p-10 bg-brand-primary/5 rounded-full relative">
         <Icon size={80} className="text-brand-primary opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
         <div className="absolute inset-0 bg-brand-primary/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      </div>

      <div className="space-y-3 relative z-10 px-6">
        <p className="text-3xl font-black uppercase tracking-[0.4em] text-brand-white/80">{title}</p>
        <p className="text-sm font-medium text-sub max-w-md mx-auto italic leading-relaxed">{message}</p>
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />
    </motion.div>
  );
};

export default EmptyBuffer;
