import React, { useState, useEffect } from 'react';
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
import { useTheme } from '../../context/ThemeContext';
import { updateUserStatus, resetUserStats, awardAchievement } from '../../services/adminApi';
import { fetchUserSubcollection, fetchAchievements } from '../../services/firestoreService';
import { DRAWER_TRANSITION, SPRING_SWIFT } from '../../utils/animations';
import toast from 'react-hot-toast';
import ElasticButton from '../../components/ui/ElasticButton';
import ActionBadge from '../../components/ui/ActionBadge';
import LoadingNode from '../../components/ui/LoadingNode';
import EmptyBuffer from '../../components/ui/EmptyBuffer';

interface UserSiteDrawerProps {
  user: UserProfile;
  onClose: () => void;
}

type TabType = 'OVERVIEW' | 'HISTORY' | 'ACHIEVEMENTS' | 'DEVICES';

const UserSiteDrawer: React.FC<UserSiteDrawerProps> = ({ user, onClose }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [loading, setLoading] = useState(false);

  // Subcollection State
  const [history, setHistory] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<UserQuizResult[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<any[]>([]);
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    if (activeTab !== 'OVERVIEW') {
        loadTabData();
    }
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

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
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
          "p-8 border-b flex justify-between items-start backdrop-blur-3xl sticky top-0 z-10",
          theme === 'dark' ? "bg-brand-surface/80 border-brand-sage/10" : "bg-white/80 border-brand-primary/5"
        )}>
           <div className="flex gap-6 items-center">
              <div className={cn(
                "w-20 h-20 rounded-3xl border-4 flex items-center justify-center text-4xl font-black shadow-xl relative",
                theme === 'dark' ? "bg-brand-bg border-brand-sage/20 text-brand-primary" : "bg-brand-primary/5 border-brand-primary/10 text-brand-primary"
              )}>
                {user.profile.displayName[0]?.toUpperCase() || 'U'}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-primary rounded-xl border-2 border-inherit flex items-center justify-center shadow-lg">
                   <ShieldCheck size={14} className="text-white" />
                </div>
              </div>
              <div className="space-y-1">
                 <h2 className={cn("text-2xl font-black tracking-tighter uppercase", theme === 'dark' ? "text-brand-white" : "text-brand-surface")}>{user.profile.displayName}</h2>
                 <p className="text-brand-primary font-black text-[10px] uppercase tracking-[0.2em] opacity-60">{user.profile.email}</p>
                 <div className="flex gap-2 mt-2">
                    <ActionBadge variant={user.account.status === 'ACTIVE' ? 'success' : 'error'}>{user.account.status}</ActionBadge>
                    <ActionBadge variant="info">LEVEL {Math.floor(user.stats.factsReadCount / 10) + 1}</ActionBadge>
                 </div>
              </div>
           </div>

           <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-3 glass rounded-xl text-sub hover:text-brand-primary transition-all border-brand-sage/10 shadow-lg"
              >
                <X size={24} />
              </motion.button>
           </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-brand-bg/20 p-2 border-b border-brand-sage/5">
            {[
                { id: 'OVERVIEW', icon: User, label: 'Profile' },
                { id: 'HISTORY', icon: History, label: 'Activity' },
                { id: 'ACHIEVEMENTS', icon: Trophy, label: 'Awards' },
                { id: 'DEVICES', icon: Smartphone, label: 'Fleet' }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === tab.id
                            ? "bg-brand-primary text-brand-white shadow-lg"
                            : "text-sub opacity-40 hover:opacity-100"
                    )}
                >
                    <tab.icon size={14} />
                    {!loading || activeTab === tab.id ? tab.label : ''}
                </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
            <AnimatePresence mode="wait">
                {activeTab === 'OVERVIEW' && (
                    <motion.div key="overview" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-10">
                        <section className="space-y-4">
                           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sub opacity-40 flex items-center gap-2"><Fingerprint size={14} /> Narrative Sequence</h3>
                           <div className="glass p-8 rounded-[2.5rem] italic font-medium leading-relaxed border-brand-sage/5 shadow-inner">
                              "{user.profile.bio || 'Identity narrative pending initialization...'}"
                           </div>
                        </section>

                        <section className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Streak', val: user.stats.streakCount, icon: Flame, color: 'text-orange-500' },
                                { label: 'Favorites', val: user.stats.favoritesCount, icon: Target, color: 'text-brand-gold' },
                                { label: 'Nodes Read', val: user.stats.factsReadCount, icon: BookOpen, color: 'text-brand-primary' },
                            ].map((item, i) => (
                                <div key={i} className="glass p-6 rounded-[2rem] text-center space-y-1 border-brand-sage/5">
                                    <item.icon className={cn("mx-auto mb-2", item.color)} size={24} />
                                    <p className="text-2xl font-black tracking-tighter">{item.val}</p>
                                    <p className="text-[8px] font-black text-sub uppercase tracking-widest opacity-40">{item.label}</p>
                                </div>
                            ))}
                        </section>

                        <section className="space-y-4">
                           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sub opacity-40 flex items-center gap-2"><Calendar size={14} /> Sequence Data</h3>
                           <div className="grid grid-cols-2 gap-4">
                                <div className="glass p-6 rounded-3xl border-brand-sage/5">
                                    <p className="text-[9px] font-black uppercase text-sub opacity-40 mb-1">Initialized On</p>
                                    <p className="text-sm font-bold">{new Date(user.account.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="glass p-6 rounded-3xl border-brand-sage/5">
                                    <p className="text-[9px] font-black uppercase text-sub opacity-40 mb-1">Last Active Signal</p>
                                    <p className="text-sm font-bold">{new Date(user.stats.lastActiveAt).toLocaleString()}</p>
                                </div>
                           </div>
                        </section>

                        <section className="pt-6 border-t border-brand-sage/5 space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sub opacity-40">System Tools</h3>
                            <ElasticButton variant="secondary" className="w-full" onClick={handleResetStats}>
                                <RotateCcw size={16} /> Reset Identity Vitals
                            </ElasticButton>
                        </section>
                    </motion.div>
                )}

                {activeTab === 'HISTORY' && (
                    <motion.div key="history" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                        {loading ? <LoadingNode /> : (
                            <>
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sub opacity-40">Recent Insight Access</h3>
                                    {history.length > 0 ? history.map(h => (
                                        <div key={h.id} className="glass p-5 rounded-2xl flex items-center justify-between border-brand-sage/5 group hover:border-brand-primary/20 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary"><BookOpen size={14} /></div>
                                                <p className="text-xs font-bold uppercase tracking-tight">Sequence #{h.factId.slice(0, 8)}</p>
                                            </div>
                                            <p className="text-[9px] font-mono opacity-40">{new Date(h.timestamp || h.readAt).toLocaleString()}</p>
                                        </div>
                                    )) : <EmptyBuffer title="No Field History" message="This agent has not recorded any insight reading sequences." />}
                                </div>

                                <div className="space-y-4 pt-6 border-t border-brand-sage/5">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sub opacity-40">Challenge Performance</h3>
                                    {quizResults.length > 0 ? quizResults.map(q => (
                                        <div key={q.id} className="glass p-5 rounded-2xl flex items-center justify-between border-brand-sage/5 group hover:border-brand-gold/20 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("p-2 rounded-lg", q.isCorrect ? "bg-brand-primary/10 text-brand-primary" : "bg-red-500/10 text-red-500")}>
                                                    {q.isCorrect ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-tight">Challenge Sync</p>
                                                    <p className="text-[9px] font-black opacity-40 uppercase">Score: {q.score} Units</p>
                                                </div>
                                            </div>
                                            <p className="text-[9px] font-mono opacity-40">{new Date(q.attemptedAt).toLocaleString()}</p>
                                        </div>
                                    )) : <EmptyBuffer title="Logic Nexus Clean" message="No psychometric challenge attempts detected in the buffer." />}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {activeTab === 'ACHIEVEMENTS' && (
                    <motion.div key="achievements" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                        {loading ? <LoadingNode /> : (
                            <>
                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sub opacity-40">Unlocked Milestones</h3>
                                    <div className="grid grid-cols-4 gap-4">
                                        {earnedAchievements.length > 0 ? earnedAchievements.map(ea => (
                                            <div key={ea.id} className="glass aspect-square rounded-2xl flex flex-col items-center justify-center p-4 border-brand-gold/30 shadow-lg relative overflow-hidden group">
                                                <div className="text-3xl mb-1 z-10">🏆</div>
                                                <p className="text-[8px] font-black text-center uppercase tracking-tighter z-10 leading-tight">{ea.title || ea.id}</p>
                                                <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        )) : <div className="col-span-full py-8 text-center opacity-20 italic text-xs">Zero earned nodes</div>}
                                    </div>
                                </section>

                                <section className="space-y-4 pt-6 border-t border-brand-sage/5">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sub opacity-40">Manual Authority Grant</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {allAchievements.filter(a => !earnedAchievements.some(ea => ea.id === a.id)).map(a => (
                                            <button
                                                key={a.id}
                                                onClick={() => handleAwardAchievement(a.id)}
                                                className="w-full text-left p-4 rounded-xl glass border-brand-sage/5 hover:border-brand-primary/30 transition-all flex justify-between items-center group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Award size={16} className="text-sub group-hover:text-brand-primary transition-colors" />
                                                    <p className="text-xs font-bold uppercase">{a.title}</p>
                                                </div>
                                                <Zap size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}
                    </motion.div>
                )}

                {activeTab === 'DEVICES' && (
                    <motion.div key="devices" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                        {loading ? <LoadingNode /> : (
                            <>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sub opacity-40">Hardware Fleet Registry</h3>
                                {devices.length > 0 ? devices.map(d => (
                                    <div key={d.id} className="glass p-6 rounded-3xl border-brand-sage/5 flex items-center gap-6 relative overflow-hidden group">
                                        <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shadow-inner">
                                            <SmartphoneNfc size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex justify-between">
                                                <p className="text-sm font-black uppercase tracking-tight">{d.platform} Identity</p>
                                                <ActionBadge variant="success">Online</ActionBadge>
                                            </div>
                                            <p className="text-[10px] font-black text-sub uppercase opacity-40 tracking-widest">Version: {d.appVersion || 'Unknown'}</p>
                                            <p className="text-[9px] font-mono opacity-30 mt-2">UUID: {d.id.slice(0, 16)}...</p>
                                        </div>
                                        <div className="absolute top-0 right-0 w-24 h-full bg-brand-primary/5 -skew-x-12 translate-x-12 group-hover:translate-x-4 transition-transform duration-700" />
                                    </div>
                                )) : <EmptyBuffer title="Registry Empty" message="No registered mobile hardware signatures found for this identity." />}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className={cn(
          "p-8 border-t backdrop-blur-3xl flex gap-4",
          theme === 'dark' ? "bg-brand-surface/80 border-brand-sage/10" : "bg-white/80 border-brand-primary/10"
        )}>
           <ElasticButton
            variant="danger"
            className="flex-1 rounded-2xl py-4"
            onClick={async () => {
                const newStatus = user.account.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
                if (!window.confirm(`${newStatus === 'DISABLED' ? 'Terminate' : 'Restore'} access for ${user.profile.displayName}?`)) return;
                try {
                    await updateUserStatus(user.id, newStatus, 'Manual administrative intervention');
                    toast.success(`Identity status updated to ${newStatus}`);
                    onClose();
                } catch (err: any) {
                    toast.error(`Update failed: ${err.message}`);
                }
            }}
           >
              <ShieldAlert size={18} />
              {user.account.status === 'ACTIVE' ? 'Lock Identity' : 'Unlock Identity'}
           </ElasticButton>

           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className={cn(
               "p-4 rounded-xl transition-all border shadow-lg",
               theme === 'dark' ? "bg-brand-bg hover:bg-brand-sage text-brand-secondary border-brand-sage/20" : "bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary border-brand-primary/10"
             )}
           >
              <MoreVertical size={20} />
           </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default UserSiteDrawer;
