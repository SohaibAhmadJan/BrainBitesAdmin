import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Calendar,
  Award,
  TrendingUp,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  SearchX
} from 'lucide-react';
import { UserProfile, Achievement } from '../../types';
import { fetchUsers, fetchAchievements } from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import UserSiteDrawer from './UserSiteDrawer';
import { useTheme } from '../../context/ThemeContext';
import ActionBadge from '../../components/ui/ActionBadge';
import ElasticButton from '../../components/ui/ElasticButton';
import LoadingNode from '../../components/ui/LoadingNode';
import EmptyBuffer from '../../components/ui/EmptyBuffer';

const UsersPage = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All');
  const [sortBy, setSortBy] = useState<'engagement' | 'newest'>('engagement');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userData, achData] = await Promise.all([
        fetchUsers(),
        fetchAchievements()
      ]);
      setUsers(userData);
      setAchievements(achData);
    } catch (err) {
      console.error('Load data failed', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users
    .filter(user =>
        (user.profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.profile.displayName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === 'All' || user.account.status === statusFilter.toUpperCase())
    )
    .sort((a, b) => {
        if (sortBy === 'engagement') return b.stats.factsReadCount - a.stats.factsReadCount;
        return b.account.createdAt - a.account.createdAt;
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* High-Fidelity Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div>
           <motion.h1
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-4xl font-black tracking-tighter uppercase"
           >
             User <span className="text-brand-primary">Directory</span>
           </motion.h1>
           <div className="flex items-center gap-4 mt-3">
              <ActionBadge variant="info" className="px-5 py-1.5">Engagement Tracking</ActionBadge>
              <p className="text-sub font-black uppercase tracking-[0.4em] text-[10px] opacity-40 italic">Identity Management \u0026 Intelligence</p>
           </div>
        </div>
      </div>

      <div className="glass p-8 rounded-[2rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-8 relative overflow-hidden backdrop-blur-3xl">
        <div className="relative flex-1 md:w-[32rem] group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within:text-brand-primary group-focus-within:opacity-100 transition-all" size={24} />
          <input
            type="text"
            placeholder="Query identity identifiers or email profiles..."
            className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl pl-14 pr-6 py-5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
            <select
                className="bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-brand-primary/30 transition-all shadow-sm"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
            >
                <option value="engagement">High Engagement</option>
                <option value="newest">Recent Onboarding</option>
            </select>

            <select
                className="bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-brand-primary/30 transition-all shadow-sm"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
            >
                <option value="All">All Status</option>
                <option value="Active">Active Only</option>
                <option value="Suspended">Disabled Only</option>
            </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass rounded-[2rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-primary/5 border-b border-brand-sage/10 text-[10px] font-black text-sub uppercase tracking-[0.3em]">
                <th className="p-8">Participant Identity</th>
                <th className="p-8">Security Status</th>
                <th className="p-8">Engagement Profile</th>
                <th className="p-8">Last Sequence</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sage/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="p-8">
                       <div className="h-12 bg-brand-primary/5 rounded-2xl w-full relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                       </div>
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <EmptyBuffer
                      icon={Users}
                      title="Zero Matches Found"
                      message="No user profiles in the global audience index match your identity query sequence."
                    />
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredUsers.map((user, idx) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-brand-primary/5 transition-colors group cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="p-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-3xl bg-brand-bg/5 dark:bg-brand-bg/80 border border-brand-sage/10 flex items-center justify-center text-brand-primary font-black text-xl shadow-md group-hover:scale-110 group-hover:border-brand-primary/40 transition-all duration-500 overflow-hidden relative">
                            {user.profile.displayName[0]?.toUpperCase() || 'U'}
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                            <p className="text-base font-bold group-hover:text-brand-primary transition-colors">{user.profile.displayName}</p>
                            <p className="text-[10px] text-sub font-mono mt-1 uppercase tracking-[0.2em]">{user.profile.email || user.id.slice(0, 16)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg",
                          user.account.status === 'ACTIVE' ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary shadow-brand-primary/5" :
                          user.account.status === 'DISABLED' ? "bg-red-500/10 border-red-500/20 text-red-500 shadow-red-500/5" :
                          "bg-brand-bg/5 text-sub border-brand-sage/10 shadow-inner"
                        )}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", user.account.status === 'ACTIVE' ? 'bg-brand-primary animate-pulse' : 'bg-red-500')} />
                          {user.account.status}
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-8">
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-sub uppercase tracking-widest opacity-60">Read Facts</span>
                            <span className="text-sm font-black opacity-80">{user.stats.factsReadCount}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-sub uppercase tracking-widest opacity-60">Streak</span>
                            <span className="text-sm font-black text-brand-gold">{user.stats.streakCount}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-sub uppercase tracking-widest opacity-60">Favs</span>
                            <span className="text-sm font-black text-brand-primary">{user.stats.favoritesCount} \ud83d\udc99</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex flex-col gap-1">
                           <span className="text-sm font-bold opacity-70">{new Date(user.stats.lastActiveAt).toLocaleDateString()}</span>
                           <span className="text-[9px] text-sub uppercase font-black tracking-widest flex items-center gap-1 opacity-60">
                             <Calendar size={10} /> Joined {new Date(user.account.createdAt).toLocaleDateString()}
                           </span>
                        </div>
                      </td>
                      <td className="p-8 text-right">
                         <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                              className="p-3 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-brand-white rounded-2xl transition-all shadow-xl"
                              title="Inspect Identity"
                            >
                              <TrendingUp size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-brand-white rounded-2xl transition-all shadow-xl"
                              title="Restrict Access"
                            >
                              <ShieldAlert size={18} />
                            </motion.button>
                         </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center text-sub px-10 font-bold uppercase tracking-[0.2em] text-[10px]">
         <p>Global Audience Index: {filteredUsers.length} Active Profiles</p>
         <div className="flex gap-4">
            <motion.button whileHover={{ x: -2 }} className="p-3 rounded-2xl glass hover:text-brand-primary transition-all"><ChevronLeft size={20} /></motion.button>
            <motion.button whileHover={{ x: 2 }} className="p-3 rounded-2xl glass hover:text-brand-primary transition-all"><ChevronRight size={20} /></motion.button>
         </div>
      </div>

      {selectedUser && (
        <UserSiteDrawer
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default UsersPage;
