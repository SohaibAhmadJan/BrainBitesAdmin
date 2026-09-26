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
import { UserProfile, Achievement, AdminUser } from '../../types';
import { fetchUsers, fetchAchievements, fetchAdmins } from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import { calculateMastery } from '../../utils/masteryUtils';
import { getAvatarUrl } from '../../utils/avatarUtils';
import UserSiteDrawer from './UserSiteDrawer';
import { useTheme } from '../../context/ThemeContext';
import ActionBadge from '../../components/ui/ActionBadge';
import ElasticButton from '../../components/ui/ElasticButton';
import LoadingNode from '../../components/ui/LoadingNode';
import EmptyBuffer from '../../components/ui/EmptyBuffer';
import toast from 'react-hot-toast';
import { updateUserStatus, deleteUserDirect } from '../../services/adminApi';
import { useAdmin } from '../../context/AdminContext';

const UsersPage = () => {
  const { theme } = useTheme();
  const { isAtLeast } = useAdmin();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'engagement' | 'newest'>('engagement');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userData, achData, adminData] = await Promise.all([
        fetchUsers(),
        fetchAchievements(),
        fetchAdmins()
      ]);

      // Auto-Purge Pipeline Check
      const now = Date.now();
      const validUsers: UserProfile[] = [];

      for (const user of userData) {
        if (user.account?.status === 'PENDING_DELETION' && user.account?.scheduledDeletionAt) {
          if (now > user.account.scheduledDeletionAt) {
            // The 30-day grace period has expired, perform automated purge
            try {
              console.log(`Executing auto-purge for ${user.id}`);
              await deleteUserDirect(user.id);
            } catch (e) {
              console.error(`Failed to auto-purge user ${user.id}`, e);
            }
            continue; // Do not add to validUsers array
          }
        }
        validUsers.push(user);
      }

      setUsers(validUsers);
      setAchievements(achData);
      setAdminIds(new Set(adminData.map(a => a.uid)));
    } catch (err) {
      console.error('Load data failed', err);
    } finally {
      setLoading(false);
    }
  };

    const filteredUsers = users
    .filter(user => {
      const email = user.profile?.email || (user as any).email || '';
      const name = user.profile?.displayName || (user as any).displayName || '';
      
      return !adminIds.has(user.id) &&
      (email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        name.toLowerCase().includes(searchTerm.toLowerCase()));
    })
    .sort((a, b) => {
      if (sortBy === 'engagement') return (b.stats?.factsReadCount || 0) - (a.stats?.factsReadCount || 0);
      return (b.account?.createdAt || 0) - (a.account?.createdAt || 0);
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
        </div>
      </div>

      {/* Users Table */}
      <div className="glass rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-primary/5 border-b border-brand-sage/10 text-[9px] font-bold text-sub uppercase tracking-widest">
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
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
                              const rawPhotoUrl = user.profile?.photoUrl || (user as any).photoUrl || (user as any).picture;
                              const avatarUrl = getAvatarUrl(rawPhotoUrl);
                              const displayName = user.profile?.displayName || (user as any).displayName || 'U';
                              return avatarUrl ? (
                                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                displayName[0]?.toUpperCase() || 'U'
                              );
                            })()}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{user.profile?.displayName || (user as any).displayName || 'Anonymous User'}</p>
                            <p className="text-[8px] text-sub font-mono uppercase tracking-tighter opacity-40">UID: {user.id.slice(0, 8)}</p>
                            {user.account?.status === 'PENDING_DELETION' && user.account?.scheduledDeletionAt && (
                                <span className="mt-1 inline-block text-[8px] font-black text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  Purge in {Math.ceil((user.account.scheduledDeletionAt - Date.now()) / (1000 * 60 * 60 * 24))} days
                                </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-mono font-bold text-sub lowercase">{user.profile?.email || (user as any).email || '—'}</span>
                      </td>
                      <td className="p-4">
                        {(() => {
                          const mastery = calculateMastery(user.stats?.factsReadCount || 0);
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
                          <span className="text-xs font-medium">
                            {(() => {
                              const ca = user.account?.createdAt;
                              if (!ca) return 'Unknown Date';
                              // Handle Firebase Timestamp (seconds) or standard JS ms timestamp
                              const date = (ca as any).seconds ? new Date((ca as any).seconds * 1000) : new Date(ca as number);
                              return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
                            })()}
                          </span>
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
                            className={cn("p-2 rounded-lg transition-all", user.account?.status === 'ACTIVE' ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-brand-white" : "bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-brand-white")}
                            title={user.account?.status === 'ACTIVE' ? "Restrict Access" : "Restore Access"}
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!isAtLeast('ADMIN')) {
                                toast.error('Identity protocol violation: User modification restricted.');
                                return;
                              }
                              const newStatus = user.account?.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
                              if (window.confirm(`${newStatus === 'DISABLED' ? 'Restrict' : 'Restore'} access for ${user.profile?.displayName || 'User'}?`)) {
                                try {
                                  await updateUserStatus(user.id, newStatus, 'Manual administrative intervention');
                                  toast.success(`Identity status updated to ${newStatus}`);
                                  loadData();
                                } catch (err: any) {
                                  toast.error(`Update failed: ${err.message}`);
                                }
                              }
                            }}
                          >
                            {user.account?.status === 'ACTIVE' ? <ShieldAlert size={14} /> : <UserCheck size={14} />}
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-brand-white rounded-lg transition-all"
                            title="Delete User"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!isAtLeast('ADMIN')) {
                                toast.error('Identity protocol violation: User modification restricted.');
                                return;
                              }
                              if (window.confirm(`Permanently delete ${user.profile?.displayName || 'User'}? This action is irreversible.`)) {
                                try {
                                  await deleteUserDirect(user.id);
                                  toast.success('Identity permanently deleted');
                                  loadData();
                                } catch (err: any) {
                                  toast.error(`Deletion failed: ${err.message}`);
                                }
                              }
                            }}
                          >
                            <UserX size={14} />
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
