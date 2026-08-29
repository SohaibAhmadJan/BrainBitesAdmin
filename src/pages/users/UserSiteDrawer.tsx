import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Fingerprint,
  History,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Award,
  SmartphoneNfc
} from 'lucide-react';
import { UserProfile, Achievement, UserDevice, UserQuizResult, CollectionProgress } from '../../types';
import { cn } from '../../utils/cn';
import { calculateMastery } from '../../utils/masteryUtils';
import { getAvatarUrl } from '../../utils/avatarUtils';
import { useTheme } from '../../context/ThemeContext';
import { updateUserStatus, resetUserStats, awardAchievement } from '../../services/adminApi';
import { fetchUserSubcollection, fetchAchievements } from '../../services/firestoreService';
import { DRAWER_TRANSITION, SPRING_SWIFT } from '../../utils/animations';
import toast from 'react-hot-toast';
import ElasticButton from '../../components/ui/ElasticButton';
import ActionBadge from '../../components/ui/ActionBadge';
import LoadingNode from '../../components/ui/LoadingNode';
import EmptyBuffer from '../../components/ui/EmptyBuffer';
import StatusLight from '../../components/ui/StatusLight';

interface UserSiteDrawerProps {
  user: UserProfile;
  onClose: () => void;
}

type TabType = 'HISTORY' | 'ACHIEVEMENTS' | 'DEVICES';

const UserSiteDrawer: React.FC<UserSiteDrawerProps> = ({ user, onClose }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('HISTORY');
  const [loading, setLoading] = useState(false);

  // Subcollection State
  const [history, setHistory] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<UserQuizResult[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<any[]>([]);
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    try {
        if (activeTab === 'HISTORY') {
            const [hist, quizzes] = await Promise.all([
                fetchUserSubcollection(user.id, 'history', 30),
                fetchUserSubcollection(user.id, 'quizResults', 30)
            ]);
            setHistory(hist);
            setQuizResults(quizzes);
        } else if (activeTab === 'ACHIEVEMENTS') {
            const [earned, all] = await Promise.all([
                fetchUserSubcollection(user.id, 'achievements', 50),
                fetchAchievements()
            ]);
            setEarnedAchievements(earned);
            setAllAchievements(all);
        } else if (activeTab === 'DEVICES') {
            const devData = await fetchUserSubcollection(user.id, 'devices', 10);
            setDevices(devData);
        }
    } catch (err) {
        toast.error('Failed to sync sub-sector data');
    } finally {
        setLoading(false);
    }
  };

  const handleResetStats = async () => {
    if (!window.confirm('Reset this user\'s engagement statistics? This action is immutable.')) return;
    try {
        await resetUserStats(user.id, ['streakCount', 'factsReadCount'], 'Administrative maintenance reset');
        toast.success('User statistics expunged');
        onClose();
    } catch (err: any) {
        toast.error(`Reset failed: ${err.message}`);
    }
  };

  const handleAwardAchievement = async (achId: string) => {
    try {
        await awardAchievement(user.id, achId, 'Manually awarded via Admin Panel');
        toast.success('Milestone granted to identity');
        loadTabData();
    } catch (err: any) {
        toast.error(`Award failed: ${err.message}`);
    }
  };

  const handleToggleLock = async () => {
    const newStatus = user.account.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    if (!window.confirm(`${newStatus === 'DISABLED' ? 'Terminate' : 'Restore'} access for ${user.profile.displayName}?`)) return;
    try {
        await updateUserStatus(user.id, newStatus, 'Manual administrative intervention');
        toast.success(`Identity status updated to ${newStatus}`);
        onClose();
    } catch (err: any) {
        toast.error(`Update failed: ${err.message}`);
    }
  };

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
                  "p-2.5 glass rounded-xl transition-all shadow-md",
                  theme === 'dark' ? "text-sub hover:text-brand-primary border-brand-sage/10" : "text-brand-primary hover:bg-brand-primary/10 border-brand-primary/20"
                )}
              >
                <X size={20} />
              </motion.button>
              <div>
                <h2 className={cn("text-xl font-bold tracking-tight uppercase", theme === 'dark' ? "text-white" : "text-brand-primary")}>
                   Inspect Identity
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                   <StatusLight />
                   <p className={cn("text-[9px] font-bold uppercase tracking-widest", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary")}>
                     Identity Management System
                   </p>
                </div>
              </div>
           </div>

           <div className="flex items-center gap-4">
              <ElasticButton
                onClick={handleToggleLock}
                variant={user.account.status === 'ACTIVE' ? 'danger' : 'success'}
                className="px-8 py-2.5 rounded-xl text-xs shadow-lg"
              >
                {user.account.status === 'ACTIVE' ? 'Lock Identity' : 'Unlock Identity'}
              </ElasticButton>
           </div>
        </div>

        {/* Matrix Layout */}
        <div className={cn("flex-1 overflow-hidden flex flex-col min-h-0", theme === 'dark' ? "bg-brand-bg" : "bg-transparent")}>
              <div className={cn("flex w-full h-full min-h-0 divide-x-2 justify-center", theme === 'dark' ? "divide-brand-primary/20" : "divide-brand-primary/10")}>

                {/* Column 1: Identity Profile */}
                <div className="w-full max-w-2xl flex flex-col h-full min-h-0 p-6 space-y-6">
                   <section className="flex-1 flex flex-col space-y-3 min-h-0">
                      <div className="flex items-center gap-3 text-brand-primary font-black">
                        <div className="p-2 bg-brand-primary/10 rounded-lg"><User size={18} /></div>
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Core Identity</h3>
                      </div>

                      <div className={cn("p-6 rounded-xl flex-1 flex-col space-y-6 border relative overflow-y-auto scrollbar-hide transition-all duration-500", theme === 'dark' ? "bg-brand-surface/40 border-brand-sage/20 backdrop-blur-2xl" : "bg-white/90 border-brand-primary/10 shadow-sm")}>

                         {/* High-End Profile Header */}
                         <div className="flex gap-6 items-center">
                            <div className={cn(
                              "w-20 h-20 rounded-xl border-2 flex items-center justify-center text-3xl font-bold shadow-lg relative overflow-hidden",
                              theme === 'dark' ? "bg-brand-bg border-brand-sage/20 text-brand-primary" : "bg-brand-primary/5 border-brand-primary/10 text-brand-primary"
                            )}>
                              {(() => {
                                const avatarUrl = getAvatarUrl(user.profile.photoUrl);
                                return avatarUrl ? (
                                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  user.profile.displayName[0]?.toUpperCase() || 'U'
                                );
                              })()}
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-primary rounded-lg border-2 border-inherit flex items-center justify-center shadow-md z-10">
                                 <ShieldCheck size={12} className="text-white" />
                              </div>
                            </div>
                            <div className="space-y-1">
                               <h2 className={cn("text-2xl font-bold tracking-tight uppercase", theme === 'dark' ? "text-brand-white" : "text-brand-surface")}>{user.profile.displayName}</h2>
                               <p className="text-brand-primary font-bold text-[10px] uppercase tracking-widest opacity-60 flex items-center gap-2">
                                  <Mail size={10} /> {user.profile.email}
                               </p>
                               <div className="flex gap-2 mt-2">
                                  <ActionBadge variant={user.account.status === 'ACTIVE' ? 'success' : 'error'}>{user.account.status}</ActionBadge>
                                  {(() => {
                                    const mastery = calculateMastery(user.stats.factsReadCount);
                                    return (
                                      <ActionBadge variant="info">LV. {mastery.level} • {mastery.title.toUpperCase()}</ActionBadge>
                                    );
                                  })()}
                               </div>
                            </div>
                         </div>

                         {/* Bio Section */}
                         <div className="space-y-3">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sub opacity-40 flex items-center gap-2"><Fingerprint size={14} /> Narrative Bio</h3>
                            <div className="glass p-8 rounded-[2.5rem] italic font-medium text-lg leading-relaxed border-brand-sage/5 shadow-inner">
                               "{user.profile.bio || 'Identity narrative pending initialization...'}"
                            </div>
                         </div>

                         {/* Stats Grid */}
                         <div className="grid grid-cols-3 gap-6">
                            {[
                                { label: 'Streak', val: user.stats.streakCount, icon: Flame, color: 'text-orange-500' },
                                { label: 'Favorites', val: user.stats.favoritesCount, icon: Target, color: 'text-brand-gold' },
                                { label: 'Read Nodes', val: user.stats.factsReadCount, icon: BookOpen, color: 'text-brand-primary' },
                            ].map((item, i) => (
                                <div key={i} className="glass p-6 rounded-xl text-center space-y-2 border-brand-sage/5 hover:border-brand-primary/20 transition-all group">
                                    <item.icon className={cn("mx-auto mb-1 group-hover:scale-110 transition-transform", item.color)} size={28} />
                                    <p className="text-3xl font-black tracking-tighter">{item.val}</p>
                                    <p className="text-[9px] font-black text-sub uppercase tracking-widest opacity-40">{item.label}</p>
                                </div>
                            ))}
                         </div>

                         {/* Activity Metadata */}
                         <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sub opacity-40 flex items-center gap-2"><Calendar size={14} /> Activity Signatures</h3>
                            <div className="grid grid-cols-2 gap-4">
                                 <div className="glass p-6 rounded-3xl border-brand-sage/5">
                                     <p className="text-[9px] font-black uppercase text-sub opacity-40 mb-1.5">Initialized On</p>
                                     <p className="text-sm font-bold">{new Date(user.account.createdAt).toLocaleString()}</p>
                                 </div>
                                 <div className="glass p-6 rounded-3xl border-brand-sage/5">
                                     <p className="text-[9px] font-black uppercase text-sub opacity-40 mb-1.5">Last Login</p>
                                     <p className="text-sm font-bold">{new Date(user.account.lastLoginAt).toLocaleString()}</p>
                                 </div>
                            </div>
                         </div>

                         {/* System Controls */}
                         <div className="pt-6 border-t border-brand-sage/10 space-y-4">
                             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500/60">Danger Zone</h3>
                             <ElasticButton variant="secondary" className="w-full py-4 border-red-500/10 hover:bg-red-500/5 text-red-500" onClick={handleResetStats}>
                                 <RotateCcw size={18} /> Reset Identity Vitals
                             </ElasticButton>
                         </div>
                      </div>
                   </section>
                </div>

                {/* Column 2: Advanced Data & Hardware */}
                <div className="w-full max-w-2xl flex flex-col h-full min-h-0 p-6 space-y-6">
                   <section className="flex-1 flex flex-col space-y-3 min-h-0">

                      {/* Tab Navigation */}
                      <div className="flex bg-brand-bg/20 p-2 rounded-[2rem] border-2 border-brand-sage/10">
                          {[
                              { id: 'HISTORY', icon: History, label: 'Activity' },
                              { id: 'ACHIEVEMENTS', icon: Trophy, label: 'Awards' },
                              { id: 'DEVICES', icon: Smartphone, label: 'Devices' }
                          ].map(tab => (
                              <button
                                  key={tab.id}
                                  onClick={() => setActiveTab(tab.id as TabType)}
                                  className={cn(
                                      "flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
                                      activeTab === tab.id
                                          ? "bg-brand-primary text-brand-white shadow-2xl scale-105"
                                          : "text-sub opacity-40 hover:opacity-100"
                                  )}
                              >
                                  <tab.icon size={16} />
                                  {tab.label}
                              </button>
                          ))}
                      </div>

                      <div className={cn("p-8 rounded-[4rem] flex-1 flex flex-col border-4 transition-all duration-500 min-h-0 group/tile relative overflow-hidden", theme === 'dark' ? "bg-brand-surface/40 border-brand-primary/15 shadow-2xl backdrop-blur-2xl" : "bg-white/90 border-brand-primary/10 shadow-xl")}>

                         <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <AnimatePresence mode="wait">
                                {activeTab === 'HISTORY' && (
                                    <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                        {loading ? <LoadingNode /> : (
                                            <>
                                                <div className="space-y-4">
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sub opacity-40">Recent Insight Access</h3>
                                                    {history.length > 0 ? history.map(h => (
                                                        <div key={h.id} className="glass p-6 rounded-3xl flex items-center justify-between border-brand-sage/5 group hover:border-brand-primary/20 transition-all">
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary"><BookOpen size={16} /></div>
                                                                <p className="text-sm font-bold uppercase tracking-tight">Sequence #{h.factId.slice(0, 8)}</p>
                                                            </div>
                                                            <p className="text-[10px] font-mono opacity-40">{new Date(h.timestamp || h.readAt).toLocaleString()}</p>
                                                        </div>
                                                    )) : <EmptyBuffer title="No Field History" message="This agent has not recorded any sequences." />}
                                                </div>

                                                <div className="space-y-4 pt-6 border-t border-brand-sage/10">
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sub opacity-40">Challenge Logic</h3>
                                                    {quizResults.length > 0 ? quizResults.map(q => (
                                                        <div key={q.id} className="glass p-6 rounded-3xl flex items-center justify-between border-brand-sage/5 group hover:border-brand-gold/20 transition-all">
                                                            <div className="flex items-center gap-4">
                                                                <div className={cn("p-3 rounded-xl", q.isCorrect ? "bg-brand-primary/10 text-brand-primary" : "bg-red-500/10 text-red-500")}>
                                                                    {q.isCorrect ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold uppercase tracking-tight">Challenge Sync</p>
                                                                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Score: {q.score} Units</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-[10px] font-mono opacity-40">{new Date(q.attemptedAt).toLocaleString()}</p>
                                                        </div>
                                                    )) : <EmptyBuffer title="Logic Nexus Clean" message="No psychometric challenges detected." />}
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'ACHIEVEMENTS' && (
                                    <motion.div key="achievements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                        {loading ? <LoadingNode /> : (
                                            <>
                                                <section className="space-y-4">
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sub opacity-40">Unlocked Milestones</h3>
                                                    <div className="grid grid-cols-4 gap-4">
                                                        {earnedAchievements.length > 0 ? earnedAchievements.map(ea => (
                                                            <div key={ea.id} className="glass aspect-square rounded-3xl flex flex-col items-center justify-center p-4 border-brand-gold/30 shadow-2xl relative overflow-hidden group">
                                                                <div className="text-4xl mb-2 z-10 transition-transform group-hover:scale-125 duration-500">🏆</div>
                                                                <p className="text-[9px] font-black text-center uppercase tracking-tighter z-10 leading-tight">{ea.title || ea.id}</p>
                                                                <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        )) : <div className="col-span-full py-12 text-center opacity-20 italic text-sm">Zero nodes earned</div>}
                                                    </div>
                                                </section>

                                                <section className="space-y-4 pt-6 border-t border-brand-sage/10">
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sub opacity-40">Grant Protocol</h3>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {allAchievements.filter(a => !earnedAchievements.some(ea => ea.id === a.id)).map(a => (
                                                            <button
                                                                key={a.id}
                                                                onClick={() => handleAwardAchievement(a.id)}
                                                                className="w-full text-left p-5 rounded-2xl glass border-brand-sage/5 hover:border-brand-primary/40 transition-all flex justify-between items-center group"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <Award size={20} className="text-sub group-hover:text-brand-primary transition-colors" />
                                                                    <p className="text-xs font-black uppercase tracking-widest">{a.title}</p>
                                                                </div>
                                                                <Zap size={16} className="opacity-0 group-hover:opacity-40 transition-opacity text-brand-primary" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </section>
                                            </>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'DEVICES' && (
                                    <motion.div key="devices" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                        {loading ? <LoadingNode /> : (
                                            <>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sub opacity-40">Hardware Registry</h3>
                                                {devices.length > 0 ? devices.map(d => (
                                                    <div key={d.id} className="glass p-8 rounded-[2.5rem] border-brand-sage/5 flex items-center gap-8 relative overflow-hidden group">
                                                        <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shadow-inner">
                                                            <SmartphoneNfc size={32} />
                                                        </div>
                                                        <div className="flex-1 min-w-0 space-y-1.5">
                                                            <div className="flex justify-between">
                                                                <p className="text-lg font-black uppercase tracking-tight">{d.platform} Identity</p>
                                                                <ActionBadge variant="success">Online</ActionBadge>
                                                            </div>
                                                            <p className="text-xs font-black text-sub uppercase opacity-40 tracking-widest">Version: {d.appVersion || 'Unknown'}</p>
                                                            <p className="text-[10px] font-mono opacity-30 mt-3 truncate">UUID: {d.id}</p>
                                                        </div>
                                                        <div className="absolute top-0 right-0 w-32 h-full bg-brand-primary/5 -skew-x-12 translate-x-12 group-hover:translate-x-4 transition-transform duration-700" />
                                                    </div>
                                                )) : <EmptyBuffer title="Registry Empty" message="No mobile hardware signatures detected." />}
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                         </div>
                      </div>
                   </section>
                </div>
              </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(content, document.body);
};

export default UserSiteDrawer;
