import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppNotification, NotificationType } from '../types';
import { cn } from '../utils/cn';

interface NotificationEngineProps {
  notifications: AppNotification[];
  onSend: (notif: { title: string; message: string; type: NotificationType }) => void;
}

const NotificationEngine: React.FC<NotificationEngineProps> = ({ notifications, onSend }) => {
  const [form, setForm] = useState<{ title: string; message: string; type: NotificationType }>({
    title: '',
    message: '',
    type: 'NEW_FACT',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    onSend(form);
    setForm({ title: '', message: '', type: 'NEW_FACT' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-500">
      <div className="glass p-10 rounded-[3rem] space-y-8 h-fit shadow-2xl relative overflow-hidden">
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-4 relative z-10">
          <div className="w-2.5 h-2.5 bg-brand-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(45,106,79,1)]"></div>
          Broadcast Composer
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-2">Headline</label>
            <input
              className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner font-medium"
              placeholder="Input dispatch title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-2">Body Payload</label>
            <textarea
              className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-[2rem] px-6 py-4 text-base focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner leading-relaxed"
              rows={5}
              placeholder="What is the message context?"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-2">Broadcast Class</label>
            <select
              className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-brand-primary/50 transition-all appearance-none"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as NotificationType })}
            >
              <option value="NEW_FACT">New Insight Alert</option>
              <option value="ACHIEVEMENT">Achievement Milestone</option>
              <option value="SYSTEM">System Protocol</option>
              <option value="GENERAL">General Handshake</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-5 bg-brand-primary hover:bg-brand-primary/90 text-brand-white font-black rounded-3xl transition-all shadow-xl shadow-brand-primary/20 uppercase tracking-[0.3em] text-xs"
          >
            Dispatch to Global Edge
          </motion.button>
        </form>

        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />
      </div>

      <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] pr-4 scrollbar-hide">
        <h3 className="text-[10px] font-black text-sub uppercase tracking-[0.4em] px-4 opacity-40">Previous Dispatches</h3>
        <AnimatePresence>
          {notifications.map((n, idx) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass p-8 rounded-[2.5rem] space-y-4 group hover:border-brand-primary/20 transition-all shadow-xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start relative z-10">
                <h4 className="font-black text-lg group-hover:text-brand-primary transition-colors italic leading-tight">{n.title}</h4>
                <span className={cn(
                  "text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border shadow-inner",
                  n.type === 'NEW_FACT' ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' :
                  n.type === 'ACHIEVEMENT' ? 'bg-brand-gold/10 border-brand-gold/20 text-brand-gold' :
                  'bg-brand-bg/5 dark:bg-brand-bg/50 text-sub border-brand-sage/10'
                )}>
                  {n.type}
                </span>
              </div>
              <p className="text-sm text-sub opacity-70 leading-relaxed italic">{n.message}</p>
              <p className="text-[9px] font-black text-sub opacity-40 uppercase tracking-widest mt-4">Sequence Logged: {new Date(n.timestamp).toLocaleString()}</p>

              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-brand-primary/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationEngine;
