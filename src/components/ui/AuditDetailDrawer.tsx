import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  X,
  Info,
  Clock,
  Terminal
} from 'lucide-react';
import { AuditLog } from '../../types';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { DRAWER_TRANSITION } from '../../utils/animations';
import ActionBadge from './ActionBadge';
import StatusLight from './StatusLight';

interface AuditDetailDrawerProps {
  log: AuditLog | null;
  onClose: () => void;
  adminName?: string;
}

const AuditDetailDrawer: React.FC<AuditDetailDrawerProps> = ({ log, onClose, adminName }) => {
  const { theme } = useTheme();

  if (!log) return null;

  const content = (
    <div className="fixed inset-0 z-[1000] flex flex-col overflow-hidden bg-black/60 backdrop-blur-xl p-0">
      <motion.div
        {...DRAWER_TRANSITION}
        className={cn(
          "w-full h-full flex flex-col overflow-hidden border-[4px] relative rounded-2xl transition-colors duration-700",
          theme === 'dark'
            ? "bg-brand-bg border-brand-primary/40 shadow-2xl"
            : "bg-[#F4F8F6] border-brand-primary/20 shadow-xl"
        )}
      >
        {/* Header */}
        <div className={cn(
          "p-4 flex items-center justify-between backdrop-blur-3xl sticky top-0 z-50 transition-colors duration-500 border-b",
          theme === 'dark' ? "bg-brand-surface/90 border-brand-sage/20" : "bg-white/95 border-brand-primary/5"
        )}>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className={cn(
                "p-3 glass rounded-xl transition-all shadow-md",
                theme === 'dark' ? "text-sub hover:text-brand-primary border-brand-sage/10" : "text-brand-primary hover:bg-brand-primary/10 border-brand-primary/20"
              )}
            >
              <X size={20} />
            </motion.button>
            <div>
              <h2 className={cn("text-xl font-bold tracking-tight uppercase", theme === 'dark' ? "text-white" : "text-brand-primary")}>
                Audit Inspection
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                 <StatusLight />
                 <p className={cn("text-[9px] font-bold uppercase tracking-widest", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary")}>
                   Security Forensics Module
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* Centered Inspection View */}
        <div className={cn("flex-1 overflow-hidden flex flex-col min-h-0 items-center justify-center", theme === 'dark' ? "bg-brand-bg" : "bg-transparent")}>
              <div className="w-full max-w-4xl flex flex-col h-full min-h-0 p-8 space-y-6">
                   <section className="flex-1 flex flex-col space-y-3 min-h-0">
                      <div className="flex items-center gap-3 text-brand-primary font-black">
                        <div className="p-2 bg-brand-primary/10 rounded-lg"><Terminal size={18} /></div>
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Identity Trace</h3>
                      </div>
                      <div className={cn("p-10 rounded-2xl flex-1 flex flex-col justify-start space-y-10 border relative overflow-hidden transition-all duration-500", theme === 'dark' ? "bg-brand-surface/40 border-brand-sage/20 backdrop-blur-2xl" : "bg-white/90 border-brand-primary/10 shadow-sm")}>

                        <div className="space-y-2 text-center">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Protocol Action</p>
                           <h4 className="text-5xl font-black tracking-tighter text-brand-primary uppercase">
                              {log.action.replace(/_/g, ' ')}
                           </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-10">
                           <div className="space-y-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-2 text-center">Administrative Agent</p>
                              <div className={cn("px-6 py-4 rounded-xl border text-sm font-bold truncate text-center", theme === 'dark' ? "bg-black/20 border-brand-sage/10 text-brand-primary" : "bg-brand-primary/5 border-brand-primary/5 text-brand-primary")}>
                                 {adminName || log.adminUid}
                              </div>
                           </div>
                           <div className="space-y-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-2 text-center">Target Resource ID</p>
                              <div className={cn("px-6 py-4 rounded-xl border font-mono text-sm font-bold truncate text-center", theme === 'dark' ? "bg-black/20 border-brand-sage/10 text-sub" : "bg-brand-primary/5 border-brand-primary/5 text-brand-primary")}>
                                 #{log.targetId}
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="flex items-center gap-3 justify-center">
                              <div className="p-2 bg-brand-gold/10 rounded-xl text-brand-gold"><Info size={24} /></div>
                              <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-sub opacity-40">Administrative Intent</h3>
                           </div>
                           <div className={cn("p-12 rounded-[3rem] italic font-medium text-xl text-center leading-relaxed border transition-all duration-500", theme === 'dark' ? "bg-brand-bg/50 border-brand-sage/10 text-brand-white/90" : "bg-brand-primary/5 border-brand-primary/5 shadow-inner")}>
                              "{log.reason || 'No justification provided for this administrative sequence.'}"
                           </div>
                        </div>

                        <div className="mt-auto space-y-3 flex flex-col items-center">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Temporal Verification</p>
                           <div className="flex items-center gap-3 text-brand-primary font-bold">
                              <Clock size={20} />
                              <span className="text-lg tracking-tight">{new Date(log.createdAt).toLocaleString()}</span>
                           </div>
                        </div>
                      </div>
                   </section>
              </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(content, document.body);
};

export default AuditDetailDrawer;
