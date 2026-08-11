import React from 'react';
import {
  X,
  Trophy,
  Flame,
  Target,
  Award,
  BookOpen,
  User,
  Mail,
  Calendar,
  Zap,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  MoreVertical
} from 'lucide-react';
import { UserProfile, Achievement } from '../../types';
import { cn } from '../../utils/cn';

interface UserSiteDrawerProps {
  user: UserProfile;
  allAchievements: Achievement[];
  onClose: () => void;
}

const UserSiteDrawer: React.FC<UserSiteDrawerProps> = ({ user, allAchievements, onClose }) => {
  const earnedAchievements = allAchievements.filter(a => user.achievements.includes(a.id));

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className="relative w-full max-w-2xl bg-brand-surface border-l border-brand-sage shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-500">

        {/* Header */}
        <div className="p-8 border-b border-brand-sage flex justify-between items-start bg-brand-surface/50 backdrop-blur-xl sticky top-0 z-10">
           <div className="flex gap-6 items-center">
              <div className="w-24 h-24 rounded-[2rem] bg-brand-bg border-2 border-brand-sage flex items-center justify-center text-4xl font-black text-brand-primary shadow-2xl relative">
                {user.displayName[0]}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-primary rounded-full border-4 border-brand-surface flex items-center justify-center">
                   <ShieldCheck size={10} className="text-brand-bg" />
                </div>
              </div>
              <div className="space-y-1">
                 <h2 className="text-3xl font-black text-brand-white tracking-tight">{user.displayName}</h2>
                 <p className="text-brand-secondary font-bold text-sm">@{user.userName}</p>
                 <div className="flex gap-3 mt-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      user.status === 'Active' ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary" : "bg-red-500/10 border-red-500/20 text-red-500"
                    )}>
                      {user.status}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-brand-bg border border-brand-sage text-[10px] font-black text-brand-secondary/60 uppercase tracking-widest">
                       Level {user.level}
                    </span>
                 </div>
              </div>
           </div>
           <button onClick={onClose} className="p-2 text-brand-secondary/60 hover:text-brand-white transition-colors bg-brand-bg rounded-xl border border-brand-sage/50">
             <X size={24} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">

           {/* About Section */}
           <section className="space-y-4">
              <h3 className="text-xs font-black text-brand-secondary/40 uppercase tracking-[0.2em] flex items-center gap-2">
                 <User size={14} /> Personal Identity
              </h3>
              <div className="bg-brand-bg/50 border border-brand-sage rounded-3xl p-6 leading-relaxed text-brand-white/80 italic shadow-inner font-medium">
                 "{user.about || 'This explorer hasn\'t added a biography yet.'}"
              </div>
           </section>

           {/* Vitals Grid */}
           <section className="grid grid-cols-3 gap-4">
              <div className="bg-brand-surface border border-brand-sage p-6 rounded-[2rem] text-center space-y-1">
                 <Flame className="mx-auto text-orange-500" size={24} />
                 <p className="text-2xl font-black text-brand-white">{user.streak}</p>
                 <p className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-widest">Day Streak</p>
              </div>
              <div className="bg-brand-surface border border-brand-sage p-6 rounded-[2rem] text-center space-y-1">
                 <Target className="mx-auto text-brand-gold" size={24} />
                 <p className="text-2xl font-black text-brand-white">{user.quizScore}</p>
                 <p className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-widest">BB Points</p>
              </div>
              <div className="bg-brand-surface border border-brand-sage p-6 rounded-[2rem] text-center space-y-1">
                 <BookOpen className="mx-auto text-brand-primary" size={24} />
                 <p className="text-2xl font-black text-brand-white">{user.factsViewed}</p>
                 <p className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-widest">Facts Read</p>
              </div>
           </section>

           {/* Achievements Shelf */}
           <section className="space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="text-xs font-black text-brand-secondary/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Trophy size={14} className="text-brand-gold" /> Milestone Shelf
                 </h3>
                 <span className="text-[10px] font-bold text-brand-secondary/40">{user.achievements.length} Unlocked</span>
              </div>

              {user.achievements.length > 0 ? (
                <div className="grid grid-cols-4 gap-4">
                   {earnedAchievements.map(ach => (
                     <div key={ach.id} className="group relative aspect-square bg-brand-bg border border-brand-sage rounded-2xl flex items-center justify-center text-2xl hover:border-brand-gold/50 transition-all shadow-lg overflow-hidden">
                        <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {ach.icon}
                        <div className="absolute bottom-0 left-0 right-0 p-1 bg-brand-surface/90 border-t border-brand-sage translate-y-full group-hover:translate-y-0 transition-transform">
                           <p className="text-[8px] font-black text-brand-white text-center truncate">{ach.title}</p>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="py-10 text-center border border-dashed border-brand-sage rounded-3xl text-brand-secondary/40 text-xs font-medium italic">
                   No achievements earned in the field yet.
                </div>
              )}
           </section>

           {/* Collection Progress */}
           <section className="space-y-6">
              <h3 className="text-xs font-black text-brand-secondary/40 uppercase tracking-[0.2em] flex items-center gap-2">
                 <TrendingUp size={14} className="text-brand-secondary" /> Domain Mastery
              </h3>

              <div className="space-y-6">
                 {user.collections.length > 0 ? user.collections.map(col => (
                   <div key={col.id} className="space-y-2">
                      <div className="flex justify-between items-end">
                         <p className="text-[11px] font-black text-brand-white/80 uppercase tracking-tight">{col.title}</p>
                         <p className="text-[11px] font-black text-brand-primary">{Math.round(col.progress * 100)}%</p>
                      </div>
                      <div className="h-2 w-full bg-brand-bg rounded-full border border-brand-sage overflow-hidden p-0.5">
                         <div
                           className="h-full bg-brand-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(45,106,79,0.3)]"
                           style={{ width: `${col.progress * 100}%` }}
                         />
                      </div>
                   </div>
                 )) : (
                   <p className="text-center text-brand-secondary/40 text-xs py-4">No content collections explored yet.</p>
                 )}
              </div>
           </section>

           {/* Registration Details */}
           <div className="pt-10 border-t border-brand-sage flex justify-between items-center text-[10px] font-bold text-brand-secondary/40 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                 <Calendar size={12} /> Registered: {new Date(user.registrationDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                 <Mail size={12} /> ID: {user.id}
              </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-brand-sage bg-brand-surface/80 backdrop-blur-xl flex gap-4">
           <button className="flex-1 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black rounded-2xl transition-all border border-red-500/20 text-xs uppercase tracking-widest flex items-center justify-center gap-2 group">
              <ShieldAlert size={16} className="group-hover:animate-bounce" />
              Suspend Access
           </button>
           <button className="p-4 bg-brand-bg hover:bg-brand-sage text-brand-secondary/60 rounded-2xl transition-all border border-brand-sage">
              <MoreVertical size={20} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default UserSiteDrawer;
