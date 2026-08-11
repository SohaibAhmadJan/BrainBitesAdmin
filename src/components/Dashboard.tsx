import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

interface DashboardProps {
  stats: { label: string; value: number }[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-8 rounded-[2.5rem] shadow-xl hover:border-brand-primary/40 transition-all group relative overflow-hidden"
          >
            <p className="text-sub text-[10px] font-black uppercase tracking-[0.3em]">{stat.label}</p>
            <h2 className="text-5xl font-black mt-2 group-hover:text-brand-primary transition-colors tracking-tighter">{stat.value}</h2>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-brand-primary/5 blur-2xl rounded-full" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
      >
        <h2 className="text-3xl font-black tracking-tight mb-4">Command Terminal Alpha</h2>
        <p className="text-sub leading-relaxed max-w-2xl font-medium italic">
          Orchestrate the BrainBites content ecosystem with live Firestore synchronisation. Changes deployed here are instantly propagated to the mobile repository layer.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
          <div className="p-6 bg-brand-primary/5 border border-brand-primary/10 rounded-[2rem] shadow-sm">
            <h4 className="font-black text-brand-primary uppercase tracking-widest text-xs">Ingestion Hub</h4>
            <p className="text-[11px] text-sub mt-2 font-medium">Full CRUD support for sequence insights and psychometric challenges.</p>
          </div>
          <div className="p-6 bg-brand-secondary/10 border border-brand-secondary/10 rounded-[2rem] shadow-sm">
            <h4 className="font-black text-brand-secondary uppercase tracking-widest text-xs">Broadcast Carrier</h4>
            <p className="text-[11px] text-sub mt-2 font-medium">Global push dispatching for high-priority system announcements.</p>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />
      </motion.div>
    </div>
  );
};

export default Dashboard;
