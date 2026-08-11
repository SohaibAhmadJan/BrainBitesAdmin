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
import { useTheme } from '../../context/ThemeContext';

interface UserSiteDrawerProps {
  user: UserProfile;
  allAchievements: Achievement[];
  onClose: () => void;
}

const UserSiteDrawer: React.FC<UserSiteDrawerProps> = ({ user, allAchievements, onClose }) => {
  const earnedAchievements = allAchievements.filter(a => user.achievements.includes(a.id));
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-bg/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className={cn(
        "relative w-full max-w-2xl border-l shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-500",
        theme === 'dark' ? "bg-brand-surface border-brand-sage/20" : "bg-white border-brand-primary/10"
      )}>

        {/* Header */}
        <div className={cn(
          "p-8 border-b flex justify-between items-start backdrop-blur-xl sticky top-0 z-10",
          theme === 'dark' ? "bg-brand-surface/50 border-brand-sage/10" : "bg-white/80 border-brand-primary/5"
        )}>
           <div className="flex gap-6 items-center">
              <div className={cn(
                "w-24 h-24 rounded-[2rem] border-2 flex items-center justify-center text-4xl font-black shadow-2xl relative",
                theme === 'dark' ? "bg-brand-bg border-brand-sage/20 text-brand-primary" : "bg-brand-primary/5 border-brand-primary/10 text-brand-primary"
              )}>
                {user.displayName[0]}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-primary rounded-full border-4 border-inherit flex items-center justify-center">
                   <ShieldCheck size={10} className="text-white" />
                </div>
              </div>
              <div className="space-y-1">
                 <h2 className={cn("text-3xl font-black tracking-tight", theme === 'dark' ? "text-brand-white" : "text-brand-surface")}>{user.displayName}</h2>
                 <p className="text-brand-primary font-bold text-sm">@{user.userName}</p>
                 <div className="flex gap-3 mt-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                      user.status === 'Active' ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary" : "bg-red-500/10 border-red-500/20 text-red-500"
                    )}>
                      {user.status}
                    </span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      theme === 'dark' ? "bg-brand-bg border-brand-sage/20 text-brand-secondary/40" : "bg-brand-primary/5 border-brand-primary/5 text-brand-primary/60"
                    )}>
                       Level {user.level}
                    </span>
                 </div>
              </div>
           </div>
           <button
            onClick={onClose}
            className={cn(
              "p-2 transition-colors rounded-xl border",
              theme === 'dark' ? "text-brand-secondary/60 hover:text-brand-white bg-brand-bg border-brand-sage/20" : "text-brand-surface/40 hover:text-brand-surface bg-brand-primary/5 border-brand-primary/10"
            )}
           >
             <X size={24} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">

           {/* About Section */}
           <section className="space-y-4">
              <h3 className={cn("text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2", theme === 'dark' ? "text-brand-secondary/40" : "text-brand-primary/40")}>
                 <User size={14} /> Personal Identity
              </h3>
              <div className={cn(
                "border rounded-3xl p-6 leading-relaxed italic shadow-inner font-medium",
                theme === 'dark' ? "bg-brand-bg/50 border-brand-sage/20 text-brand-white/80" : "bg-brand-primary/5 border-brand-primary/10 text-brand-surface/80"
              )}>
                 "{user.about || 'This explorer hasn\'t added a biography yet.'}"
              </div>
           </section>

           {/* Vitals Grid */}
           <section className="grid grid-cols-3 gap-4">
              <div className={cn(
                "border p-6 rounded-[2rem] text-center space-y-1 shadow-sm",
                theme === 'dark' ? "bg-brand-surface border-brand-sage/20" : "bg-white border-brand-primary/10"
              )}>
                 <Flame className="mx-auto text-orange-500" size={24} />
                 <p className={cn("text-2xl font-black", theme === 'dark' ? "text-brand-white" : "text-brand-surface")}>{user.streak}</p>
                 <p className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-widest">Day Streak</p>
              </div>
              <div className={cn(
                "border p-6 rounded-[2rem] text-center space-y-1 shadow-sm",
                theme === 'dark' ? "bg-brand-surface border-brand-sage/20" : "bg-white border-brand-primary/10"
              )}>
                 <Target className="mx-auto text-brand-gold" size={24} />
                 <p className={cn("text-2xl font-black", theme === 'dark' ? "text-brand-white" : "text-brand-surface")}>{user.quizScore}</p>
                 <p className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-widest">BB Points</p>
              </div>
              <div className={cn(
                "border p-6 rounded-[2rem] text-center space-y-1 shadow-sm",
                theme === 'dark' ? "bg-brand-surface border-brand-sage/20" : "bg-white border-brand-primary/10"
              )}>
                 <BookOpen className="mx-auto text-brand-primary" size={24} />
                 <p className={cn("text-2xl font-black", theme === 'dark' ? "text-brand-white" : "text-brand-surface")}>{user.factsViewed}</p>
                 <p className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-widest">Facts Read</p>
              </div>
           </section>

           {/* Achievements Shelf */}
           <section className="space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className={cn("text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2", theme === 'dark' ? "text-brand-secondary/40" : "text-brand-primary/40")}>
                    <Trophy size={14} className="text-brand-gold" /> Milestone Shelf
                 </h3>
                 <span className="text-[10px] font-bold text-brand-secondary/40">{user.achievements.length} Unlocked</span>
              </div>

              {user.achievements.length > 0 ? (
                <div className="grid grid-cols-4 gap-4">
                   {earnedAchievements.map(ach => (
                     <div key={ach.id} className={cn(
                       "group relative aspect-square border rounded-2xl flex items-center justify-center text-2xl hover:border-brand-gold/50 transition-all shadow-lg overflow-hidden",
                       theme === 'dark' ? "bg-brand-bg border-brand-sage/20" : "bg-white border-brand-primary/10"
                     )}>
                        <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {ach.icon}
                        <div className={cn(
                          "absolute bottom-0 left-0 right-0 p-1 border-t translate-y-full group-hover:translate-y-0 transition-transform",
                          theme === 'dark' ? "bg-brand-surface/90 border-brand-sage/20" : "bg-white/95 border-brand-primary/10"
                        )}>
                           <p className={cn("text-[8px] font-black text-center truncate", theme === 'dark' ? "text-brand-white" : "text-brand-surface")}>{ach.title}</p>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className={cn(
                  "py-10 text-center border border-dashed rounded-3xl text-xs font-medium italic",
                  theme === 'dark' ? "border-brand-sage/20 text-brand-secondary/40" : "border-brand-primary/10 text-brand-surface/40"
                )}>
                   No achievements earned in the field yet.
                </div>
              )}
           </section>

           {/* Collection Progress */}
           <section className="space-y-6">
              <h3 className={cn("text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2", theme === 'dark' ? "text-brand-secondary/40" : "text-brand-primary/40")}>
                 <TrendingUp size={14} className="text-brand-secondary" /> Domain Mastery
              </h3>

              <div className="space-y-6">
                 {user.collections.length > 0 ? user.collections.map(col => (
                   <div key={col.id} className="space-y-2">
                      <div className="flex justify-between items-end">
                         <p className={cn("text-[11px] font-black uppercase tracking-tight", theme === 'dark' ? "text-brand-white/80" : "text-brand-surface/80")}>{col.title}</p>
                         <p className="text-[11px] font-black text-brand-primary">{Math.round(col.progress * 100)}%</p>
                      </div>
                      <div className={cn(
                        "h-2 w-full rounded-full border overflow-hidden p-0.5 shadow-inner",
                        theme === 'dark' ? "bg-brand-bg border-brand-sage/20" : "bg-brand-primary/5 border-brand-primary/10"
                      )}>
                         <div
                           className="h-full bg-brand-primary rounded-full transition-all duration-1000 shadow-sm"
                           style={{ width: `${col.progress * 100}%` }}
                         />
                      </div>
                   </div>
                 )) : (
                   <p className="text-center text-brand-secondary/40 text-xs py-4 uppercase font-bold tracking-widest opacity-40">No content domains analyzed yet.</p>
                 )}
              </div>
           </section>

           {/* Registration Details */}
           <div className={cn(
             "pt-10 border-t flex justify-between items-center text-[10px] font-bold uppercase tracking-widest",
             theme === 'dark' ? "border-brand-sage/10 text-brand-secondary/40" : "border-brand-primary/5 text-brand-surface/40"
           )}>
              <div className="flex items-center gap-2">
                 <Calendar size={12} /> Registered: {new Date(user.registrationDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                 <Mail size={12} /> ID: {user.id.slice(0, 12)}...
              </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className={cn(
          "p-8 border-t backdrop-blur-xl flex gap-4",
          theme === 'dark' ? "bg-brand-surface/80 border-brand-sage/10" : "bg-white/80 border-brand-primary/10"
        )}>
           <button className="flex-1 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black rounded-2xl transition-all border border-red-500/20 text-xs uppercase tracking-widest flex items-center justify-center gap-2 group shadow-sm">
              <ShieldAlert size={16} className="group-hover:animate-bounce" />
              Restrict Access
           </button>
           <button className={cn(
             "p-4 rounded-2xl transition-all border",
             theme === 'dark' ? "bg-brand-bg hover:bg-brand-sage text-brand-secondary/60 border-brand-sage/20" : "bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-surface/60 border-brand-primary/10"
           )}>
              <MoreVertical size={20} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default UserSiteDrawer;
