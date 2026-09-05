import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { writeBatch, doc } from 'firebase/firestore';
import { db, triggerPasswordReset } from '../../services/firebaseService';
import { AdminUser, AdminRole } from '../../types';
import { fetchAdmins } from '../../services/firestoreService';
import { updateAdmin, deleteAdmin as deleteAdminApi } from '../../services/adminApi';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';
import ActionBadge from '../../components/ui/ActionBadge';
import ElasticButton from '../../components/ui/ElasticButton';
import LoadingNode from '../../components/ui/LoadingNode';
import EmptyBuffer from '../../components/ui/EmptyBuffer';
import PermissionGate from '../../components/ui/PermissionGate';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import AdminEditorModal from './AdminEditorModal';

const AdminsPage = () => {
  const { isRole, adminUser } = useAdmin();
  const { theme } = useTheme();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminRole | 'ALL'>('All' as any);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const data = await fetchAdmins();
      setAdmins(data);
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (admin: AdminUser | null = null) => {
    setSelectedAdmin(admin);
    setIsEditorOpen(true);
  };

  const handleSave = async (adminData: AdminUser, sendInvite: boolean) => {
    if (!db || !adminUser) {
      toast.error('Security protocol not initialized');
      return;
    }

    try {
      const batch = writeBatch(db);
      const adminRef = doc(db, 'admins', adminData.uid);

      // Save Admin Record
      batch.set(adminRef, adminData, { merge: true });

      // Create Audit Log
      const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      batch.set(doc(db, 'audit_logs', logId), {
        adminUid: adminUser.uid,
        action: 'UPDATE_ADMIN_DIRECT',
        targetType: 'ADMIN',
        targetId: adminData.uid,
        reason: `Registry sync for ${adminData.email} (Direct)`,
        createdAt: Date.now()
      });

      await batch.commit();

      // Trigger invitation email if requested
      if (sendInvite) {
        try {
          await triggerPasswordReset(adminData.email);
          toast.success('Invitation email dispatched');
        } catch (emailErr) {
          toast.error('Admin added, but email dispatch failed. Ensure user exists in Auth.');
        }
      }

      toast.success('Registry updated (Direct Sync)');
      setIsEditorOpen(false);
      loadAdmins();
    } catch (err: any) {
      toast.error(`Direct sync failed: ${err.message}`);
    }
  };

  const handleDelete = async (uid: string, email: string) => {
    if (window.confirm(`Revoke administrative access for ${email}?`)) {
      if (!db || !adminUser) {
        toast.error('Security protocol not initialized');
        return;
      }

      try {
        const batch = writeBatch(db);
        batch.delete(doc(db, 'admins', uid));

        // Create Audit Log
        const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        batch.set(doc(db, 'audit_logs', logId), {
          adminUid: adminUser.uid,
          action: 'DELETE_ADMIN_DIRECT',
          targetType: 'ADMIN',
          targetId: uid,
          reason: `Revoked access for ${email} (Direct)`,
          createdAt: Date.now()
        });

        await batch.commit();
        toast.success('Access terminated');
        setAdmins(prev => prev.filter(a => a.uid !== uid));
      } catch (err: any) {
        toast.error(`Termination failed: ${err.message}`);
      }
    }
  };

  const filteredAdmins = admins.filter(a => {
    const matchesSearch = a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || a.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const currentAdmins = filteredAdmins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getRoleLabel = (role: AdminRole) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Administrator';
      case 'ADMIN': return 'Editor';
      case 'CONTENT_MANAGER': return 'Author';
      case 'ANALYST': return 'Analyst';
      default: return role;
    }
  };

  const getRoleStyle = (role: AdminRole) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'ADMIN': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'CONTENT_MANAGER': return 'bg-teal-500/10 text-teal-500 border-teal-500/20';
      case 'ANALYST': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-brand-white/5 text-brand-white/40 border-brand-white/10';
    }
  };

  if (!isRole('SUPER_ADMIN')) {
      return <PermissionGate message="Management of administrative identities is restricted to the SUPER_ADMIN protocol level." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative">

      {/* Header Row */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-6">
        <h1 className="text-3xl font-black tracking-tighter uppercase">Admins</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within:text-brand-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search users"
              className="w-full bg-brand-bg/40 border border-brand-sage/20 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <div className="relative w-full md:w-48 group">
            <select
              className="w-full bg-brand-bg/40 border border-brand-sage/20 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-brand-primary/50 transition-all appearance-none cursor-pointer shadow-inner"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
            >
              <option value="All">All roles</option>
              <option value="SUPER_ADMIN">Administrator</option>
              <option value="ADMIN">Editor</option>
              <option value="CONTENT_MANAGER">Author</option>
              <option value="ANALYST">Analyst</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-sub opacity-30 pointer-events-none" size={16} />
          </div>

          <ElasticButton onClick={() => handleEdit(null)} className="px-6 py-3 text-[11px] h-full shadow-lg">
             <Plus size={16} strokeWidth={3} />
             New user
          </ElasticButton>
        </div>
      </div>

      {/* Registry Section */}
      <div className="glass rounded-[1.5rem] overflow-hidden shadow-2xl relative border border-brand-sage/10">
        <div className="p-6 border-b border-brand-sage/10 bg-brand-primary/5">
           <h3 className="text-xs font-black uppercase tracking-widest text-sub opacity-60">User Directory</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-sage/10 text-[11px] font-black text-sub uppercase tracking-wider">
                <th className="p-6">User</th>
                <th className="p-6">Email</th>
                <th className="p-6">Role</th>
                <th className="p-6">Status</th>
                <th className="p-6">Created</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sage/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                     <td colSpan={6} className="p-6">
                        <div className="h-10 bg-brand-primary/5 rounded-xl w-full" />
                     </td>
                  </tr>
                ))
              ) : currentAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyBuffer
                      icon={ShieldCheck}
                      title="No Verified Agents"
                      message="No users match your criteria."
                    />
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {currentAdmins.map((admin, idx) => (
                    <motion.tr
                      key={admin.uid}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-brand-white/5 transition-colors group"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border border-brand-sage/20 relative overflow-hidden", theme === 'dark' ? "bg-brand-bg/80 text-brand-primary" : "bg-brand-primary text-white")}>
                            {admin.displayName[0]?.toUpperCase() || 'A'}
                          </div>
                          <p className="text-sm font-bold text-brand-white">{admin.displayName}</p>
                        </div>
                      </td>
                      <td className="p-6">
                        <p className="text-sm text-sub opacity-80">{admin.email}</p>
                      </td>
                      <td className="p-6">
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border shadow-sm",
                          getRoleStyle(admin.role)
                        )}>
                          {getRoleLabel(admin.role)}
                        </span>
                      </td>
                      <td className="p-6">
                         <span className={cn(
                           "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border shadow-sm",
                           admin.isActive ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                         )}>
                           {admin.isActive ? 'Active' : 'Suspended'}
                         </span>
                      </td>
                      <td className="p-6">
                         <p className="text-sm text-sub opacity-60 font-medium">{new Date(admin.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </td>
                      <td className="p-6 text-right">
                         <div className="flex justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => handleEdit(admin)}
                              className="p-2.5 bg-brand-bg/40 text-sub hover:text-brand-primary rounded-lg border border-brand-sage/10 transition-all shadow-md"
                            >
                              <Edit3 size={14} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => handleDelete(admin.uid, admin.email)}
                              className="p-2.5 bg-brand-bg/40 text-sub hover:text-red-500 rounded-lg border border-brand-sage/10 transition-all shadow-md"
                            >
                              <Trash2 size={14} />
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

        {/* Footer Info & Pagination */}
        <div className="p-6 bg-brand-primary/5 border-t border-brand-sage/10 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-[11px] font-bold text-sub opacity-50 uppercase tracking-widest">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAdmins.length)} of {filteredAdmins.length} users
           </p>

           <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-brand-sage/20 text-sub hover:bg-brand-primary/10 disabled:opacity-20 transition-all"
              >
                 <ChevronLeft size={16} />
              </button>

              <div className="flex gap-1">
                 {Array.from({ length: totalPages }).map((_, i) => (
                   <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-bold transition-all border",
                      currentPage === i + 1
                        ? "bg-brand-primary border-brand-primary/40 text-white"
                        : "border-brand-sage/20 text-sub hover:bg-brand-primary/5"
                    )}
                   >
                     {i + 1}
                   </button>
                 ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-brand-sage/20 text-sub hover:bg-brand-primary/10 disabled:opacity-20 transition-all"
              >
                 <ChevronRight size={16} />
              </button>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {isEditorOpen && (
          <AdminEditorModal
            admin={selectedAdmin}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminsPage;
