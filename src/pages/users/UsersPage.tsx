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
import { calculateMastery } from '../../utils/masteryUtils';
import { getAvatarUrl } from '../../utils/avatarUtils';
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass p-5 rounded-2xl flex flex-col xl:flex-row justify-between items-center gap-4 backdrop-blur-xl">
        <div className="relative flex-1 md:w-[32rem] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within:text-brand-primary group-focus-within:opacity-100 transition-all" size={18} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-xl pl-12 pr-4 py-2.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-brand-primary/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
            <select
                className="bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-brand-primary/30 transition-all"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
            >
                <option value="engagement">Top Engagement</option>
                <option value="newest">Newest</option>
            </select>

            <select
                className="bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-brand-primary/30 transition-all"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
            >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
            </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-primary/5 border-b border-brand-sage/10 text-[9px] font-bold text-sub uppercase tracking-widest">
                <th className="p-4">User</th>
                <th className="p-4">Status</th>
                <th className="p-4">Mastery</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sage/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="p-4">
                       <div className="h-10 bg-brand-primary/5 rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <EmptyBuffer
                      icon={Users}
                      title="Zero Matches Found"
                      message="No user profiles match your query."
                    />
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredUsers.map((user, idx) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-brand-primary/5 transition-colors group cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-brand-bg/5 dark:bg-brand-bg/80 border border-brand-sage/10 flex items-center justify-center text-brand-primary font-black text-sm shadow-sm overflow-hidden">
                            {(() => {
                              const avatarUrl = getAvatarUrl(user.profile.photoUrl);
                              return avatarUrl ? (
                                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                user.profile.displayName[0]?.toUpperCase() || 'U'
                              );
                            })()}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{user.profile.displayName}</p>
                            <p className="text-[9px] text-sub font-mono uppercase tracking-widest">{user.profile.email || user.id.slice(0, 12)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                          user.account.status === 'ACTIVE' ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary" :
                          user.account.status === 'DISABLED' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                          "bg-brand-bg/5 text-sub border-brand-sage/10"
                        )}>
                          <div className={cn("w-1 h-1 rounded-full", user.account.status === 'ACTIVE' ? 'bg-brand-primary' : 'bg-red-500')} />
                          {user.account.status}
                        </div>
                      </td>
                      <td className="p-4">
                        {(() => {
                          const mastery = calculateMastery(user.stats.factsReadCount);
                          return (
                            <div className={cn(
                              "inline-flex items-center gap-2 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border w-fit",
                              mastery.level > 1 ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary" : "bg-brand-bg/5 border-brand-sage/10 text-sub"
                            )}>
                              LV. {mastery.level} • {mastery.title}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                           <span className="text-xs font-medium">{new Date(user.account.createdAt).toLocaleDateString()}</span>
                           <span className="text-[9px] text-sub uppercase font-bold tracking-widest opacity-60">Joined</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                         <div className="flex justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                              className="p-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-brand-white rounded-lg transition-all"
                              title="Inspect Identity"
                            >
                              <TrendingUp size={14} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-brand-white rounded-lg transition-all"
                              title="Restrict Access"
                            >
                              <ShieldAlert size={14} />
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

      <div className="flex justify-between items-center text-sub px-6 font-bold uppercase tracking-widest text-[9px]">
         <p>Total Users: {filteredUsers.length}</p>
         <div className="flex gap-2">
            <button className="p-2 rounded-xl glass hover:text-brand-primary transition-all"><ChevronLeft size={16} /></button>
            <button className="p-2 rounded-xl glass hover:text-brand-primary transition-all"><ChevronRight size={16} /></button>
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
