import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trophy,
  Flame,
  Target,
  BookOpen,
  User,
  Mail,
  Calendar,
  Zap,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  MoreVertical,
  Fingerprint
} from 'lucide-react';
import { UserProfile, Achievement } from '../../types';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import ElasticButton from '../../components/ui/ElasticButton';
import ActionBadge from '../../components/ui/ActionBadge';

interface UserSiteDrawerProps {
  user: UserProfile;
  allAchievements: Achievement[];
  onClose: () => void;
}

const UserSiteDrawer: React.FC<UserSiteDrawerProps> = ({ user, allAchievements, onClose }) => {
  const earnedAchievements = allAchievements.filter(a => user.achievements.includes(a.id));
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-brand-bg/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Side Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "relative w-full max-w-2xl border-l shadow-[0_0_100px_rgba(0,0,0,0.5)] h-full flex flex-col overflow-hidden",
          theme === 'dark' ? "bg-brand-surface border-brand-sage/20" : "bg-white border-brand-primary/10"
        )}
      >

        {/* Header */}
        <div className={cn(
          "p-10 border-b flex justify-between items-start backdrop-blur-3xl sticky top-0 z-10",
          theme === 'dark' ? "bg-brand-surface/80 border-brand-sage/10" : "bg-white/80 border-brand-primary/5"
        )}>
           <div className="flex gap-8 items-center">
              <div className={cn(
                "w-28 h-28 rounded-[2.5rem] border-4 flex items-center justify-center text-5xl font-black shadow-2xl relative transition-transform duration-700 hover:rotate-6",
                theme === 'dark' ? "bg-brand-bg border-brand-sage/20 text-brand-primary" : "bg-brand-primary/5 border-brand-primary/10 text-brand-primary"
              )}>
                {user.displayName[0]}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-primary rounded-2xl border-4 border-inherit flex items-center justify-center shadow-xl">
                   <ShieldCheck size={20} className="text-white" />
                </div>
              </div>
              <div className="space-y-2">
                 <h2 className={cn("text-4xl font-black tracking-tighter", theme === 'dark' ? "text-brand-white" : "text-brand-surface")}>{user.displayName}</h2>
                 <p className="text-brand-primary font-black text-sm uppercase tracking-[0.2em] opacity-60">@{user.userName}</p>
                 <div className="flex gap-4 mt-3">
                    <ActionBadge variant={user.status === 'Active' ? 'success' : 'error'}>{user.status}</ActionBadge>
                    <ActionBadge variant="info">Level {user.level}</ActionBadge>
                 </div>
              </div>
           </div>
           <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-4 glass rounded-2xl text-sub hover:text-brand-primary transition-all border-brand-sage/10 shadow-xl"
           >
             <X size={28} />
           </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">

           {/* About Section */}
           <section className="space-y-5">
              <h3 className={cn("text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3", theme === 'dark' ? "text-brand-secondary/40" : "text-brand-primary/40")}>
                 <Fingerprint size={16} /> Identity Signature
              </h3>
              <div className={cn(
                "border rounded-[2rem] p-8 leading-relaxed italic shadow-inner font-medium text-lg",
                theme === 'dark' ? "bg-brand-bg/50 border-brand-sage/20 text-brand-white/80" : "bg-brand-primary/5 border-brand-primary/10 text-brand-surface/80"
              )}>
                 "{user.about || 'Identity narrative pending initialization...'}"
              </div>
           </section>

           {/* Vitals Grid */}
           <section className="grid grid-cols-3 gap-6">
              {[
                { label: 'Day Streak', val: user.streak, icon: Flame, color: 'text-orange-500' },
                { label: 'BB Points', val: user.quizScore, icon: Target, color: 'text-brand-gold' },
                { label: 'Facts Read', val: user.factsViewed, icon: BookOpen, color: 'text-brand-primary' },
              ].map((item, i) => (
                <div key={i} className={cn(
                  "border p-8 rounded-[2.5rem] text-center space-y-2 shadow-sm group hover:scale-105 transition-all duration-500",
                  theme === 'dark' ? "bg-brand-surface border-brand-sage/20" : "bg-white border-brand-primary/10"
                )}>
                   <item.icon className={cn("mx-auto transition-transform duration-500 group-hover:scale-110", item.color)} size={32} />
                   <p className={cn("text-3xl font-black tracking-tighter", theme === 'dark' ? "text-brand-white" : "text-brand-surface")}>{item.val}</p>
                   <p className="text-[9px] font-black text-brand-secondary/40 uppercase tracking-widest">{item.label}</p>
                </div>
              ))}
           </section>

           {/* Achievements Shelf */}
           <section className="space-y-8">
              <div className="flex justify-between items-end border-b border-brand-sage/5 pb-4">
                 <h3 className={cn("text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3", theme === 'dark' ? "text-brand-secondary/40" : "text-brand-primary/40")}>
                    <Trophy size={16} className="text-brand-gold" /> Milestone Collection
                 </h3>
                 <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/5 px-3 py-1 rounded-lg border border-brand-primary/10">{user.achievements.length} Unlocked</span>
              </div>

              {user.achievements.length > 0 ? (
                <div className="grid grid-cols-4 gap-6">
                   {earnedAchievements.map(ach => (
                     <div key={ach.id} className={cn(
                       "group relative aspect-square border rounded-3xl flex items-center justify-center text-4xl hover:border-brand-gold/50 transition-all shadow-xl overflow-hidden cursor-help",
                       theme === 'dark' ? "bg-brand-bg border-brand-sage/20" : "bg-white border-brand-primary/10"
                     )}>
                        <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="group-hover:scale-110 transition-transform duration-500">{ach.icon}</span>
                        <div className={cn(
                          "absolute bottom-0 left-0 right-0 p-2 border-t translate-y-full group-hover:translate-y-0 transition-transform duration-300",
                          theme === 'dark' ? "bg-brand-surface/90 border-brand-sage/20" : "bg-white/95 border-brand-primary/10"
                        )}>
                           <p className={cn("text-[8px] font-black text-center truncate uppercase tracking-tighter", theme === 'dark' ? "text-brand-white" : "text-brand-surface")}>{ach.title}</p>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className={cn(
                  "py-16 text-center border-2 border-dashed rounded-[3rem] text-xs font-black uppercase tracking-widest opacity-30 italic",
                  theme === 'dark' ? "border-brand-sage/20" : "border-brand-primary/10"
                )}>
                   Zero field milestones recorded
                </div>
              )}
           </section>

           {/* Collection Progress */}
           <section className="space-y-8">
              <h3 className={cn("text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3", theme === 'dark' ? "text-brand-secondary/40" : "text-brand-primary/40")}>
                 <TrendingUp size={16} /> Domain Synchronization
              </h3>

              <div className="space-y-8">
                 {user.collections.length > 0 ? user.collections.map(col => (
                   <div key={col.id} className="space-y-3">
                      <div className="flex justify-between items-end px-1">
                         <p className={cn("text-xs font-black uppercase tracking-widest", theme === 'dark' ? "text-brand-white/80" : "text-brand-surface/80")}>{col.title}</p>
                         <p className="text-xs font-black text-brand-primary tracking-tighter">{Math.round(col.progress * 100)}%</p>
                      </div>
                      <div className={cn(
                        "h-3 w-full rounded-full border overflow-hidden p-1 shadow-inner",
                        theme === 'dark' ? "bg-brand-bg border-brand-sage/20" : "bg-brand-primary/5 border-brand-primary/10"
                      )}>
                         <motion.div
                           initial={{ width: 0 }}
                           animate={{ width: `${col.progress * 100}%` }}
                           transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                           className="h-full bg-brand-primary rounded-full shadow-[0_0_15px_rgba(45,106,79,0.5)]"
                         />
                      </div>
                   </div>
                 )) : (
                   <div className="text-center py-8 opacity-20 flex flex-col items-center gap-3">
                      <Zap size={32} />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">No behavioral data sets found</p>
                   </div>
                 )}
              </div>
           </section>

           {/* Registration Details */}
           <div className={cn(
             "pt-12 border-t flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] opacity-40",
             theme === 'dark' ? "border-brand-sage/10" : "border-brand-primary/5"
           )}>
              <div className="flex items-center gap-2">
                 <Calendar size={14} /> Established: {new Date(user.registrationDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                 <Mail size={14} /> UID: {user.id.slice(0, 16)}
              </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className={cn(
          "p-10 border-t backdrop-blur-3xl flex gap-6",
          theme === 'dark' ? "bg-brand-surface/80 border-brand-sage/10" : "bg-white/80 border-brand-primary/10"
        )}>
           <ElasticButton
            variant="danger"
            className="flex-1 rounded-[1.8rem] py-5"
           >
              <ShieldAlert size={20} className="group-hover:animate-bounce" />
              Terminate Access
           </ElasticButton>
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className={cn(
               "p-5 rounded-[1.5rem] transition-all border shadow-lg",
               theme === 'dark' ? "bg-brand-bg hover:bg-brand-sage text-brand-secondary border-brand-sage/20" : "bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary border-brand-primary/10"
             )}
           >
              <MoreVertical size={24} />
           </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default UserSiteDrawer;
