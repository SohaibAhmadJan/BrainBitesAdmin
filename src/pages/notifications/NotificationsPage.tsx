import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Send,
  Image as ImageIcon,
  Link as LinkIcon,
  Search,
  History as HistoryIcon,
  CheckCircle2,
  Smartphone,
  Info,
  Clock,
  ExternalLink,
  ChevronRight,
  Zap,
  Radio,
  Trash2
} from 'lucide-react';
import { AppNotification, NotificationType, BiteItem } from '../../types';
import { fetchNotifications, fetchBites } from '../../services/firestoreService';
import { sendGlobalNotification, deleteNotification } from '../../services/adminApi';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [facts, setFacts] = useState<BiteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'NEW_FACT' as NotificationType,
    imageUrl: '',
    deepLinkFactId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notifs, allFacts] = await Promise.all([
        fetchNotifications(),
        fetchBites()
      ]);
      setNotifications(notifs.sort((a, b) => b.timestamp - a.timestamp));
      setFacts(allFacts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Validation Error: Title and Message required');
      return;
    }

    const newNotif: AppNotification = {
      id: `n-${Math.random().toString(36).slice(2, 11)}`,
      title: form.title,
      message: form.message,
      type: form.type,
      imageUrl: form.imageUrl || null,
      deepLinkFactId: form.deepLinkFactId || null,
      isGlobal: true,
      timestamp: Date.now()
    };

    try {
      await sendGlobalNotification(newNotif, `Global broadcast: ${newNotif.title}`);
      setNotifications([newNotif, ...notifications]);
      setForm({ title: '', message: '', type: 'NEW_FACT', imageUrl: '', deepLinkFactId: '' });
      toast.success('Broadcast Dispatched Globally (Atomic)');
    } catch (err: any) {
      toast.error(`Transmission Failure: ${err.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-700">

      {/* Left: Composer */}
      <div className="lg:col-span-7 space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-10 rounded-[3rem] shadow-2xl space-y-10 relative overflow-hidden"
        >
          <div className="flex items-center justify-between relative z-10">
            <h2 className="text-3xl font-black text-brand-white flex items-center gap-4">
               <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary shadow-lg"><Radio size={28} className="animate-pulse" /></div>
               Broadcast Center
            </h2>
            <div className="flex items-center gap-2 px-5 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] shadow-inner">
               <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-ping" />
               Carrier Online
            </div>
          </div>

          <form onSubmit={handleSend} className="space-y-8 relative z-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-[0.3em] ml-2">Message Headline</label>
                  <input
                    className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-6 py-4 text-brand-white text-sm focus:outline-none focus:border-brand-primary transition-all shadow-inner"
                    placeholder="Input catchy dispatch title..."
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-[0.3em] ml-2">Broadcast Class</label>
                  <div className="relative group">
                    <select
                      className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-6 py-4 text-brand-white text-sm focus:outline-none focus:border-brand-primary appearance-none shadow-inner cursor-pointer"
                      value={form.type}
                      onChange={(e) => setForm({...form, type: e.target.value as any})}
                    >
                      <option value="NEW_FACT">System: New Insight</option>
                      <option value="ACHIEVEMENT">System: Milestone</option>
                      <option value="SYSTEM">Protocol: Admin</option>
                      <option value="GENERAL">Protocol: General</option>
                    </select>
                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary/30 rotate-90" />
                  </div>
                </div>
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-[0.3em] ml-2">Payload Content</label>
                <textarea
                  className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-3xl p-6 text-brand-white text-sm focus:outline-none focus:border-brand-primary transition-all shadow-inner leading-relaxed"
                  rows={5}
                  placeholder="Define the transmission payload for the user base..."
                  value={form.message}
                  onChange={(e) => setForm({...form, message: e.target.value})}
                />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                    <ImageIcon size={14} className="text-brand-primary" /> Visual Asset URL
                  </label>
                  <input
                    className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-6 py-4 text-brand-white text-sm focus:outline-none focus:border-brand-primary transition-all shadow-inner"
                    placeholder="https://cloud.assets/..."
                    value={form.imageUrl}
                    onChange={(e) => setForm({...form, imageUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                    <LinkIcon size={14} className="text-brand-secondary" /> Navigation Anchor
                  </label>
                  <div className="relative group">
                    <select
                      className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-6 py-4 text-brand-white text-sm focus:outline-none focus:border-brand-primary appearance-none shadow-inner cursor-pointer"
                      value={form.deepLinkFactId}
                      onChange={(e) => setForm({...form, deepLinkFactId: e.target.value})}
                    >
                      <option value="">No Sequence Anchor</option>
                      {facts.map(f => (
                        <option key={f.id} value={f.id}>{f.id} - {f.fact.slice(0, 30)}...</option>
                      ))}
                    </select>
                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary/30 rotate-90" />
                  </div>
                </div>
             </div>

             <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-6 bg-brand-primary hover:bg-brand-primary/90 text-brand-white font-black rounded-[2rem] transition-all shadow-[0_20px_60px_rgba(45,106,79,0.3)] active:scale-[0.98] uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-4"
             >
               <Send size={20} className="group-hover:translate-x-1 transition-transform" />
               Execute Push Dispatch
             </motion.button>
          </form>

          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />
        </motion.div>

        {/* High-Fidelity Mobile Preview */}
        <div className="glass p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
           <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-brand-secondary/10 rounded-xl text-brand-secondary"><Smartphone size={20} /></div>
              <h3 className="text-xs font-black text-brand-secondary/40 uppercase tracking-[0.3em]">Identity Hub Simulation</h3>
           </div>

           <div className="max-w-md mx-auto relative group">
              <div className="absolute inset-0 bg-brand-primary/10 blur-[80px] opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>

              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative bg-brand-bg/80 backdrop-blur-3xl rounded-[2.5rem] p-6 border border-brand-sage/30 shadow-[0_40px_100px_rgba(0,0,0,0.6)] flex gap-5 overflow-hidden"
              >
                 <div className="w-14 h-14 shrink-0 bg-brand-primary rounded-[1.2rem] flex items-center justify-center text-brand-white font-black text-lg shadow-xl shadow-brand-primary/20">BB</div>
                 <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                       <h4 className="text-sm font-black text-brand-white group-hover:text-brand-primary transition-colors">{form.title || 'Dispatch Headline'}</h4>
                       <span className="text-[10px] font-black text-brand-secondary/30 uppercase">Active</span>
                    </div>
                    <p className="text-xs text-brand-secondary/60 leading-relaxed line-clamp-2 italic">{form.message || 'Payload content description will appear within the mobile system tray notification stack...'}</p>

                    <AnimatePresence>
                      {form.imageUrl && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: '140px', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 rounded-2xl bg-brand-surface overflow-hidden border border-brand-sage/20 shadow-inner"
                        >
                           <img src={form.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {form.deepLinkFactId && (
                      <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] bg-brand-primary/5 px-3 py-1.5 rounded-lg border border-brand-primary/10 w-fit">
                         <Zap size={10} /> Sequence Link Active
                      </div>
                    )}
                 </div>
              </motion.div>
           </div>
        </div>
      </div>

      {/* Right: Transmission Logs */}
      <div className="lg:col-span-5 space-y-8 h-full flex flex-col">
         <div className="glass p-10 rounded-[3rem] shadow-2xl flex-1 flex flex-col border-brand-secondary/5">
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-secondary/10 rounded-2xl">
                    <HistoryIcon size={24} className="text-brand-secondary" />
                  </div>
                  <h3 className="text-xl font-black text-brand-white tracking-tighter uppercase tracking-[0.2em]">Live Stream</h3>
               </div>
               <span className="text-[10px] font-black text-brand-secondary/30 uppercase bg-brand-bg px-3 py-1 rounded-full border border-brand-sage/20">{notifications.length} Broadcasts</span>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-4 scrollbar-hide">
               {notifications.length === 0 ? (
                 <div className="h-60 flex flex-col items-center justify-center text-brand-secondary/10 gap-4 italic border border-dashed border-brand-sage/20 rounded-[2rem]">
                    <Bell size={48} className="opacity-10" />
                    <p className="text-sm font-black uppercase tracking-widest">Sequence empty</p>
                 </div>
               ) : notifications.map((n, idx) => (
                 <motion.div
                   key={n.id}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="bg-brand-bg/40 border border-brand-sage/10 p-6 rounded-3xl space-y-4 group hover:border-brand-primary/30 transition-all shadow-xl relative overflow-hidden"
                 >
                    <div className="flex justify-between items-start relative z-10">
                       <div>
                          <p className="text-sm font-black text-brand-white/90 group-hover:text-brand-primary transition-colors">{n.title}</p>
                          <span className={cn(
                             "text-[9px] font-black px-2.5 py-1 rounded-lg mt-2 inline-block uppercase tracking-widest border shadow-inner",
                             n.type === 'NEW_FACT' ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' :
                             n.type === 'ACHIEVEMENT' ? 'bg-brand-gold/10 border-brand-gold/20 text-brand-gold' :
                             'bg-brand-secondary/10 border-brand-secondary/20 text-brand-secondary'
                          )}>
                             {n.type}
                          </span>
                       </div>
                       \u003cspan className\u003d"text-[10px] font-black text-brand-secondary/30 tabular-nums"\u003e{new Date(n.timestamp).toLocaleDateString()}\u003c/span\u003e
                    </div>
                    <p className="text-[11px] text-brand-secondary/50 leading-relaxed line-clamp-2 italic">{n.message}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-brand-sage/10 relative z-10">
                       <div className="flex gap-3">
                          {n.imageUrl && <div className="p-1.5 glass rounded-lg"><ImageIcon size={12} className="text-brand-primary" /></div>}
                          {n.deepLinkFactId && <div className="p-1.5 glass rounded-lg"><Zap size={12} className="text-brand-gold" /></div>}
                       </div>
                       <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={async () => {
                                if (!window.confirm('Retract this global broadcast?')) return;
                                try {
                                    await deleteNotification(n.id, 'Manual broadcast retraction');
                                    toast.success('Broadcast retracted');
                                    loadData();
                                } catch (err: any) {
                                    toast.error(`Retraction failed: ${err.message}`);
                                }
                            }}
                            className="p-1.5 hover:bg-red-500/10 text-sub hover:text-red-500 rounded-lg transition-all"
                          >
                             <Trash2 size={14} />
                          </motion.button>
                          <motion.button
                            whileHover={{ x: 3 }}
                            className="text-[9px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-1.5"
                          >
                             Sequence Audit <ChevronRight size={12} />
                          </motion.button>
                       </div>
                    </div>

                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-brand-primary/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                 </motion.div>
               ))}
            </div>
         </div>
      </div>

    </div>
  );
};

export default NotificationsPage;
