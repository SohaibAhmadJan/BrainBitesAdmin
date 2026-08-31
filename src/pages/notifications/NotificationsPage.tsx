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
import { AppNotification, NotificationType, BiteItem, UserProfile } from '../../types';
import { fetchNotifications, fetchBites, dispatchNotificationDirectly, fetchUsers, dispatchTargetedNotification } from '../../services/firestoreService';
import { deleteNotification } from '../../services/adminApi';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';
import ImagePicker from '../../components/ui/ImagePicker';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [facts, setFacts] = useState<BiteItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'NEW_FACT' as NotificationType,
    imageUrl: '',
    deepLinkFactId: '',
    targetType: 'GLOBAL' as 'GLOBAL' | 'USER',
    targetUserId: '',
    isScheduled: false,
    scheduledAt: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notifs, allFacts, allUsers] = await Promise.all([
        fetchNotifications(),
        fetchBites(),
        fetchUsers()
      ]);
      setNotifications(notifs.sort((a, b) => b.timestamp - a.timestamp));
      setFacts(allFacts);
      setUsers(allUsers);
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

    if (form.targetType === 'USER' && !form.targetUserId) {
      toast.error('Targeting Error: Select a user first');
      return;
    }

    const scheduledTimestamp = form.isScheduled && form.scheduledAt
      ? new Date(form.scheduledAt).getTime()
      : null;

    const newNotifBase = {
      title: form.title,
      message: form.message,
      type: form.type,
      imageUrl: form.imageUrl || null,
      deepLinkFactId: form.deepLinkFactId || null,
      isGlobal: form.targetType === 'GLOBAL',
      targetUserId: form.targetType === 'USER' ? form.targetUserId : null,
      scheduledAt: scheduledTimestamp
    };

    try {
      let newId;
      if (form.targetType === 'USER') {
        newId = await dispatchTargetedNotification(form.targetUserId, newNotifBase);
      } else {
        newId = await dispatchNotificationDirectly(newNotifBase);
      }

      const newNotif = { ...newNotifBase, id: newId, timestamp: Date.now() } as AppNotification;
      setNotifications([newNotif, ...notifications]);
      setForm({ ...form, title: '', message: '', imageUrl: '', deepLinkFactId: '', isScheduled: false, scheduledAt: '' });
      toast.success(form.isScheduled ? 'Transmission Scheduled (Local Alarm)' : 'Broadcast Dispatched Successfully');
    } catch (err: any) {
      toast.error(`Transmission Failure: ${err.message}`);
    }
  };

  const galleryImages = [
    ...facts.map(f => f.imageUrl).filter(Boolean),
    ...notifications.map(n => n.imageUrl).filter(Boolean)
  ] as string[];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-in fade-in duration-700 max-w-[1600px] mx-auto px-2">

      {/* Left: Composer */}
      <div className="lg:col-span-7 space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-5 rounded-[1.5rem] shadow-2xl space-y-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between relative z-10 border-b border-brand-sage/10 pb-3 mb-1">
            <h2 className="text-lg font-black text-brand-white flex items-center gap-2">
               <div className="p-1.5 bg-brand-primary/10 rounded-lg text-brand-primary shadow-lg"><Radio size={18} className="animate-pulse" /></div>
               Broadcast Hub
            </h2>
          </div>

          <form onSubmit={handleSend} className="space-y-4 relative z-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-brand-secondary/40 uppercase tracking-[0.3em] ml-1">Headline</label>
                  <input
                    className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-lg px-4 py-2 text-brand-white text-[11px] focus:outline-none focus:border-brand-primary transition-all shadow-inner"
                    placeholder="Dispatch title..."
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-brand-secondary/40 uppercase tracking-[0.3em] ml-1">Class</label>
                  <div className="relative group">
                    <select
                      className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-lg px-4 py-2 text-brand-white text-[11px] focus:outline-none focus:border-brand-primary appearance-none shadow-inner cursor-pointer"
                      value={form.type}
                      onChange={(e) => setForm({...form, type: e.target.value as any})}
                    >
                      <option value="NEW_FACT">New Insight</option>
                      <option value="ACHIEVEMENT">Milestone</option>
                      <option value="SYSTEM">Admin Protocol</option>
                      <option value="GENERAL">General</option>
                    </select>
                    <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary/30 rotate-90" />
                  </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-brand-secondary/40 uppercase tracking-[0.3em] ml-1">Audience</label>
                  <div className="relative group">
                    <select
                      className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-lg px-4 py-2 text-brand-white text-[11px] focus:outline-none focus:border-brand-primary appearance-none shadow-inner cursor-pointer"
                      value={form.targetType}
                      onChange={(e) => setForm({...form, targetType: e.target.value as any})}
                    >
                      <option value="GLOBAL">Everyone</option>
                      <option value="USER">Specific User</option>
                    </select>
                    <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary/30 rotate-90" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-brand-secondary/40 uppercase tracking-[0.3em] ml-1">Recipient</label>
                  <div className="relative group">
                    <select
                      disabled={form.targetType === 'GLOBAL'}
                      className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-lg px-4 py-2 text-brand-white text-[11px] focus:outline-none focus:border-brand-primary appearance-none shadow-inner cursor-pointer disabled:opacity-30"
                      value={form.targetUserId}
                      onChange={(e) => setForm({...form, targetUserId: e.target.value})}
                    >
                      <option value="">Choose profile...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.profile.displayName}</option>
                      ))}
                    </select>
                    <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary/30 rotate-90" />
                  </div>
                </div>
             </div>

             <div className="space-y-1">
                <label className="text-[8px] font-black text-brand-secondary/40 uppercase tracking-[0.3em] ml-1">Payload</label>
                <textarea
                  className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-xl p-3.5 text-brand-white text-[11px] focus:outline-none focus:border-brand-primary transition-all shadow-inner leading-relaxed"
                  rows={2}
                  placeholder="Define transmission content..."
                  value={form.message}
                  onChange={(e) => setForm({...form, message: e.target.value})}
                />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImagePicker
                  label="Visual Asset"
                  value={form.imageUrl}
                  onChange={(url) => setForm({...form, imageUrl: url})}
                  galleryImages={galleryImages}
                />
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-brand-secondary/40 uppercase tracking-[0.3em] ml-1 flex items-center gap-1.5">
                    <Clock size={12} className="text-brand-primary" /> Schedule
                  </label>
                  <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setForm({...form, isScheduled: !form.isScheduled})}
                        className={cn(
                            "px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all shadow-lg",
                            form.isScheduled ? "bg-brand-primary border-brand-primary text-brand-white" : "bg-brand-bg/50 border-brand-sage/20 text-brand-secondary/40"
                        )}
                      >
                        {form.isScheduled ? 'On' : 'Off'}
                      </button>
                      <input
                        type="datetime-local"
                        disabled={!form.isScheduled}
                        className="flex-1 bg-brand-bg/50 border border-brand-sage/20 rounded-lg px-3 py-2 text-brand-white text-[10px] focus:outline-none focus:border-brand-primary disabled:opacity-20"
                        value={form.scheduledAt}
                        onChange={(e) => setForm({...form, scheduledAt: e.target.value})}
                      />
                  </div>
                </div>
             </div>

             <div className="space-y-1">
                  <label className="text-[8px] font-black text-brand-secondary/40 uppercase tracking-[0.3em] ml-1 flex items-center gap-1.5">
                    <LinkIcon size={12} className="text-brand-secondary" /> Navigation Anchor
                  </label>
                  <div className="relative group">
                    <select
                      className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-lg px-4 py-2 text-brand-white text-[11px] focus:outline-none focus:border-brand-primary appearance-none shadow-inner cursor-pointer"
                      value={form.deepLinkFactId}
                      onChange={(e) => setForm({...form, deepLinkFactId: e.target.value})}
                    >
                      <option value="">No Anchor</option>
                      {facts.map(f => (
                        <option key={f.id} value={f.id}>{f.id} - {f.fact.slice(0, 40)}...</option>
                      ))}
                    </select>
                    <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary/30 rotate-90" />
                  </div>
                </div>

             <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full py-3 bg-brand-primary hover:bg-brand-primary/90 text-brand-white font-black rounded-lg transition-all shadow-lg uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-2"
             >
               <Send size={14} />
               Execute Dispatch
             </motion.button>
          </form>

          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />
        </motion.div>

        {/* High-Fidelity Mobile Preview */}
        <div className="glass p-4 rounded-[1.5rem] shadow-2xl relative overflow-hidden">
           <div className="flex items-center gap-2 mb-3">
              <div className="p-1 bg-brand-secondary/10 rounded-lg text-brand-secondary"><Smartphone size={14} /></div>
              <h3 className="text-[8px] font-black text-brand-secondary/40 uppercase tracking-[0.3em]">Identity Hub Simulation</h3>
           </div>

           <div className="max-w-[240px] mx-auto relative group scale-90 origin-top">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative bg-brand-bg/80 backdrop-blur-3xl rounded-[1.2rem] p-3.5 border border-brand-sage/30 shadow-2xl flex gap-3 overflow-hidden"
              >
                 <div className="w-7 h-7 shrink-0 bg-brand-primary rounded-lg flex items-center justify-center text-brand-white font-black text-[10px] shadow-lg">BB</div>
                 <div className="flex-1 space-y-0.5 min-w-0">
                    <div className="flex justify-between items-center">
                       <h4 className="text-[9px] font-black text-brand-white truncate">{form.title || 'Headline'}</h4>
                       <span className="text-[6px] font-black text-brand-secondary/30 uppercase">Now</span>
                    </div>
                    <p className="text-[8px] text-brand-secondary/60 leading-tight line-clamp-2 italic">{form.message || 'Payload content...'}</p>

                    <AnimatePresence>
                      {form.imageUrl && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: '60px', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-1.5 rounded-lg bg-brand-surface overflow-hidden border border-brand-sage/20 shadow-inner"
                        >
                           <img src={form.imageUrl} className="w-full h-full object-cover opacity-80" alt="" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {form.deepLinkFactId && (
                      <div className="mt-1.5 flex items-center gap-1 text-[7px] font-black text-brand-primary uppercase tracking-[0.2em] bg-brand-primary/5 px-1 py-0.5 rounded-md border border-brand-primary/10 w-fit">
                         <Zap size={6} /> Anchor Active
                      </div>
                    )}
                 </div>
              </motion.div>
           </div>
        </div>
      </div>

      {/* Right: Transmission Logs */}
      <div className="lg:col-span-5 h-fit lg:sticky lg:top-0">
         <div className="glass p-5 rounded-[1.5rem] shadow-2xl flex flex-col border-brand-secondary/5 h-[750px]">
            <div className="flex items-center justify-between mb-4 shrink-0 border-b border-brand-sage/10 pb-3">
               <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-brand-secondary/10 rounded-lg">
                    <HistoryIcon size={16} className="text-brand-secondary" />
                  </div>
                  <h3 className="text-sm font-black text-brand-white tracking-tighter uppercase tracking-[0.2em]">Live Stream</h3>
               </div>
               <span className="text-[7px] font-black text-brand-secondary/30 uppercase bg-brand-bg px-2 py-0.5 rounded-full border border-brand-sage/20">{notifications.length} Broadcasts</span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-hide">
               {notifications.length === 0 ? (
                 <div className="h-24 flex flex-col items-center justify-center text-brand-secondary/10 gap-1 italic border border-dashed border-brand-sage/20 rounded-xl">
                    <Bell size={24} className="opacity-10" />
                    <p className="text-[8px] font-black uppercase tracking-widest">Sequence empty</p>
                 </div>
               ) : notifications.map((n, idx) => (
                 <motion.div
                   key={n.id}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="bg-brand-bg/40 border border-brand-sage/10 p-3.5 rounded-xl space-y-2 group hover:border-brand-primary/30 transition-all shadow-xl relative overflow-hidden"
                 >
                    <div className="flex justify-between items-start relative z-10">
                       <div>
                          <p className="text-[10px] font-black text-brand-white/90 group-hover:text-brand-primary transition-colors truncate max-w-[150px]">{n.title}</p>
                          <span className={cn(
                             "text-[6px] font-black px-1.5 py-0.5 rounded-md mt-1 inline-block uppercase tracking-widest border",
                             n.type === 'NEW_FACT' ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' :
                             n.type === 'ACHIEVEMENT' ? 'bg-brand-gold/10 border-brand-gold/20 text-brand-gold' :
                             'bg-brand-secondary/10 border-brand-secondary/20 text-brand-secondary'
                          )}>
                             {n.type}
                          </span>
                          {n.audience && (
                            <span className="text-[6px] font-black px-1.5 py-0.5 rounded-md mt-1 inline-block uppercase tracking-widest border border-brand-sage/20 bg-brand-bg/50 text-sub ml-1">
                               {n.audience}
                            </span>
                          )}
                       </div>
                       <span className="text-[7px] font-black text-brand-secondary/30 tabular-nums">{new Date(n.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[8px] text-brand-secondary/50 leading-relaxed line-clamp-1 italic">{n.message}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-brand-sage/10 relative z-10">
                       <div className="flex gap-1">
                          {n.imageUrl && <div className="p-0.5 glass rounded-md"><ImageIcon size={8} className="text-brand-primary" /></div>}
                          {n.deepLinkFactId && <div className="p-0.5 glass rounded-md"><Zap size={8} className="text-brand-gold" /></div>}
                       </div>
                       <div className="flex gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={async () => {
                                if (!window.confirm('Retract this broadcast?')) return;
                                try {
                                    await deleteNotification(n.id, 'Manual retraction');
                                    toast.success('Retracted');
                                    loadData();
                                } catch (err: any) {
                                    toast.error(`Failed: ${err.message}`);
                                }
                            }}
                            className="p-1 hover:bg-red-500/10 text-sub hover:text-red-500 rounded-md transition-all"
                          >
                             <Trash2 size={9} />
                          </motion.button>
                       </div>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>
      </div>

    </div>
  );
};

export default NotificationsPage;
