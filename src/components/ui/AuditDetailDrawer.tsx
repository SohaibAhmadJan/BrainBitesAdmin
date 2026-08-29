import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, User, Target, Info, Clock, ArrowRight, Database } from 'lucide-react';
import { AuditLog } from '../../types';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { DRAWER_TRANSITION } from '../../utils/animations';
import ActionBadge from './ActionBadge';

interface AuditDetailDrawerProps {
  log: AuditLog | null;
  onClose: () => void;
}

const JsonBlock = ({ title, data, color }: { title: string, data: any, color: string }) => {
    const { theme } = useTheme();
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 ml-1">
                <div className={cn("w-1.5 h-1.5 rounded-full", color)} />
                <h4 className="text-[9px] font-bold uppercase tracking-widest opacity-40">{title}</h4>
            </div>
            <div className={cn(
                "p-4 rounded-xl border font-mono text-[10px] overflow-x-auto leading-relaxed shadow-inner max-h-[300px] scrollbar-thin",
                theme === 'dark' ? "bg-black/40 border-brand-sage/10 text-brand-secondary/80" : "bg-brand-primary/5 border-brand-primary/10 text-brand-primary"
            )}>
                {data ? JSON.stringify(data, null, 2) : "NULL_SNAPSHOT"}
            </div>
        </div>
    );
};

const AuditDetailDrawer: React.FC<AuditDetailDrawerProps> = ({ log, onClose }) => {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-brand-bg/90 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        {...DRAWER_TRANSITION}
        className={cn(
          "relative w-full max-w-2xl border-l shadow-[0_0_100px_rgba(0,0,0,0.5)] h-full flex flex-col overflow-hidden",
          theme === 'dark' ? "bg-brand-surface border-brand-sage/20" : "bg-white border-brand-primary/10"
        )}
      >
        {/* Header */}
        <div className={cn(
          "p-4 border-b flex justify-between items-center backdrop-blur-3xl sticky top-0 z-10",
          theme === 'dark' ? "bg-brand-surface/80 border-brand-sage/10" : "bg-white/80 border-brand-primary/5"
        )}>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2.5 glass rounded-xl text-sub hover:text-brand-primary transition-all border-brand-sage/10 shadow-md"
            >
              <X size={20} />
            </motion.button>
            <div>
              <h2 className="text-xl font-bold tracking-tight uppercase">
                Audit Inspection
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                 <div className="w-1 h-1 rounded-full bg-brand-primary animate-pulse" />
                 <p className="text-[9px] text-brand-primary font-bold uppercase tracking-widest">
                   Secure Entry
                 </p>
              </div>
            </div>
          </div>
          <ActionBadge variant="info">{log?.targetType || 'SYSTEM'}</ActionBadge>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">

          {/* Action Overview */}
          <section className="space-y-4">
            <div className="glass p-6 rounded-2xl border-brand-sage/5 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-0.5">
                        <p className="text-[8px] font-bold uppercase text-sub opacity-40 tracking-widest">Protocol Action</p>
                        <h3 className="text-xl font-bold text-brand-primary tracking-tight uppercase">
                            {log?.action.replace(/_/g, ' ')}
                        </h3>
                    </div>
                    <Clock size={16} className="text-sub opacity-20" />
                </div>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-brand-sage/5">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase text-sub opacity-40">Agent UID</p>
                        <p className="text-xs font-mono font-bold truncate">{log?.adminUid}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase text-sub opacity-40">Target ID</p>
                        <p className="text-xs font-mono font-bold truncate">#{log?.targetId}</p>
                    </div>
                </div>
            </div>
          </section>

          {/* Reason Trace */}
          <section className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary"><Info size={16} /></div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sub opacity-40">Administrative Intent</h3>
             </div>
             <div className="glass p-8 rounded-[2rem] italic font-medium leading-relaxed border-brand-sage/5 shadow-inner">
                "{log?.reason || 'Protocol execution trace node synchronization.'}"
             </div>
          </section>

          {/* Data Comparison */}
          <section className="space-y-8">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-gold/10 rounded-xl text-brand-gold"><Database size={16} /></div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sub opacity-40">Snapshot Comparison</h3>
             </div>

             <div className="space-y-10">
                <JsonBlock title="Before State" data={log?.before} color="bg-red-400" />
                <div className="flex justify-center py-2">
                    <div className="p-3 glass rounded-full text-brand-primary border-brand-primary/20 shadow-lg animate-bounce">
                        <ArrowRight size={20} className="rotate-90" />
                    </div>
                </div>
                <JsonBlock title="After State" data={log?.after} color="bg-brand-primary" />
             </div>
          </section>

          {/* Temporal Data */}
          <div className="pt-10 border-t border-brand-sage/10 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] opacity-30">
              <div className="flex items-center gap-2">
                 <Clock size={12} /> Sync: {log ? new Date(log.createdAt).toLocaleString() : ''}
              </div>
              <p>SEQ-{log?.id.slice(0,8)}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuditDetailDrawer;
