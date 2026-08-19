import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Plus,
  Search,
  MoreVertical,
  Mail,
  User,
  Shield,
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  Key,
  ShieldAlert
} from 'lucide-react';
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

const AdminsPage = () => {
  const { isRole } = useAdmin();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'ANALYST' as AdminRole,
    isActive: true,
    permissions: [] as string[]
  });

  const PERMISSIONS_LIST = [
    { id: 'manage.content', label: 'Content Management (Facts, Quizzes)' },
    { id: 'manage.config', label: 'Engine Configuration' },
    { id: 'manage.admins', label: 'Security Registry Access' },
    { id: 'users.edit', label: 'User Modification / Suspension' },
    { id: 'audit.view', label: 'Audit Stream Visibility' },
    { id: 'analytics.view', label: 'Analytics Intel' }
  ];

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

  const handleOpenModal = (admin: AdminUser | null = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        email: admin.email,
        displayName: admin.displayName,
        role: admin.role,
        isActive: admin.isActive,
        permissions: admin.permissions || []
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        email: '',
        displayName: '',
        role: 'ANALYST',
        isActive: true,
        permissions: ['audit.view', 'analytics.view']
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.displayName) {
      toast.error('Identity validation required');
      return;
    }

    const adminData: AdminUser = {
      uid: editingAdmin?.uid || formData.email.replace(/[@.]/g, '_'),
      email: formData.email,
      displayName: formData.displayName,
      role: formData.role,
      permissions: formData.permissions,
      isActive: formData.isActive,
      createdAt: editingAdmin?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    try {
      await updateAdmin(adminData.uid, adminData, `Registry sync for ${adminData.email}`);
      toast.success('Registry updated (Atomic)');
      setIsModalOpen(false);
      loadAdmins();
    } catch (err: any) {
      toast.error(`Cloud sync failed: ${err.message}`);
    }
  };

  const handleDelete = async (uid: string, email: string) => {
    if (window.confirm(`Revoke administrative access for ${email}?`)) {
      try {
        await deleteAdminApi(uid, `Revoked access for ${email}`);
        toast.success('Access terminated');
        setAdmins(prev => prev.filter(a => a.uid !== uid));
      } catch (err: any) {
        toast.error(`Termination failed: ${err.message}`);
      }
    }
  };

  const filteredAdmins = admins.filter(a =>
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleStyle = (role: AdminRole) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20 shadow-brand-primary/10';
      case 'ADMIN': return 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20 shadow-brand-secondary/10';
      case 'CONTENT_MANAGER': return 'bg-brand-gold/10 text-brand-gold border-brand-gold/20 shadow-brand-gold/10';
      case 'ANALYST': return 'bg-brand-white/5 text-brand-white/40 border-brand-white/10 shadow-inner';
      default: return 'bg-brand-white/5 text-brand-white/40 border-brand-white/10';
    }
  };

  if (!isRole('SUPER_ADMIN')) {
      return <PermissionGate message="Management of administrative identities is restricted to the SUPER_ADMIN protocol level." />;
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* High-Fidelity Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div>
           <motion.h1
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-4xl font-black tracking-tighter uppercase"
           >
             Security <span className="text-brand-primary">Governance</span>
           </motion.h1>
           <div className="flex items-center gap-4 mt-3">
              <ActionBadge variant="error" className="px-5 py-1.5">Administrative Root</ActionBadge>
              <p className="text-sub font-black uppercase tracking-[0.4em] text-[10px] opacity-40 italic">System Access Control \u0026 Registry</p>
           </div>
        </div>
        <div className="flex gap-4">
           <ElasticButton onClick={() => handleOpenModal()}>
              <Plus size={18} strokeWidth={3} />
              Register Agent
           </ElasticButton>
        </div>
      </div>

      {/* Search \u0026 Action Bar */}
      <div className="glass p-8 rounded-[2rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-8 relative overflow-hidden backdrop-blur-3xl">
        <div className="relative flex-1 md:w-[32rem] group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within:text-brand-primary transition-colors" size={24} />
          <input
            type="text"
            placeholder="Query administrative identifiers..."
            className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl pl-14 pr-6 py-5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Registry Table */}
      <div className="glass rounded-[2rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-primary/5 border-b border-brand-sage/10 text-[10px] font-black text-sub uppercase tracking-[0.3em]">
                <th className="p-8">Agent Identity</th>
                <th className="p-8">Protocol Role</th>
                <th className="p-8">Connection State</th>
                <th className="p-8">Registry Date</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sage/5">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                     <td colSpan={5} className="p-10">
                        <div className="h-10 bg-brand-primary/5 rounded-2xl w-full relative overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                        </div>
                     </td>
                  </tr>
                ))
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <EmptyBuffer
                      icon={ShieldCheck}
                      title="No Verified Agents"
                      message="The administrative registry is currently empty or no agents match your identity query."
                    />
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredAdmins.map((admin, idx) => (
                    <motion.tr
                      key={admin.uid}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-brand-white/5 transition-colors group cursor-pointer"
                      onClick={() => handleOpenModal(admin)}
                    >
                      <td className="p-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-3xl bg-brand-bg/80 border border-brand-sage/30 flex items-center justify-center text-brand-primary font-black text-xl shadow-xl group-hover:scale-110 group-hover:border-brand-primary/40 transition-all duration-500 overflow-hidden relative">
                            {admin.displayName[0]?.toUpperCase() || 'A'}
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-brand-white group-hover:text-brand-primary transition-colors">{admin.displayName}</p>
                            <p className="text-[10px] text-brand-secondary/30 font-mono mt-1 uppercase tracking-[0.2em]">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-lg",
                          getRoleStyle(admin.role)
                        )}>
                          {admin.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-8">
                         <div className="flex items-center gap-3">
                           <div className={cn("w-2 h-2 rounded-full", admin.isActive ? "bg-brand-primary animate-pulse shadow-[0_0_10px_rgba(45,106,79,1)]" : "bg-brand-sage")} />
                           <span className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-widest">{admin.isActive ? 'Active' : 'Inactive'}</span>
                         </div>
                      </td>
                      <td className="p-8">
                         <p className="text-xs font-bold text-brand-secondary/30">{new Date(admin.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="p-8 text-right">
                         <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.stopPropagation(); handleOpenModal(admin); }}
                              className="p-3 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-brand-white rounded-2xl transition-all shadow-xl"
                            >
                              <Edit3 size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.stopPropagation(); handleDelete(admin.uid, admin.email); }}
                              className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-brand-white rounded-2xl transition-all shadow-xl"
                            >
                              <Trash2 size={18} />
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

      {/* Modern Modal Overhaul */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-bg/90 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-brand-surface border border-brand-sage/20 rounded-[3rem] shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden"
            >
               <div className="p-10 border-b border-brand-sage/10 flex justify-between items-center bg-brand-primary/5">
                  <div>
                    <h3 className="text-2xl font-black text-brand-white tracking-tighter">{editingAdmin ? 'Refine Registry' : 'Agent Onboarding'}</h3>
                    <p className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-[0.3em] mt-1">Identity Access Authorization</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 glass hover:text-brand-white transition-colors rounded-2xl">
                    <X size={24} />
                  </button>
               </div>

               <form onSubmit={handleSubmit} className="p-10 space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-brand-secondary/50 uppercase tracking-[0.3em] ml-2">Full Identity Name</label>
                    <input
                      className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-6 py-4 text-brand-white text-sm focus:outline-none focus:border-brand-primary transition-all shadow-inner"
                      placeholder="e.g. John Doe"
                      value={formData.displayName}
                      onChange={e => setFormData({...formData, displayName: e.target.value})}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-brand-secondary/50 uppercase tracking-[0.3em] ml-2">Email Identifier</label>
                    <input
                      type="email"
                      className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-6 py-4 text-brand-white text-sm focus:outline-none focus:border-brand-primary transition-all shadow-inner"
                      placeholder="admin@brainbites.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      disabled={!!editingAdmin}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-brand-secondary/50 uppercase tracking-[0.3em] ml-2">Protocol Role</label>
                        <select
                          className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-5 py-4 text-brand-white text-xs font-bold focus:outline-none focus:border-brand-primary appearance-none uppercase tracking-widest"
                          value={formData.role}
                          onChange={e => setFormData({...formData, role: e.target.value as AdminRole})}
                        >
                          <option value="ANALYST">Analyst</option>
                          <option value="CONTENT_MANAGER">Content Manager</option>
                          <option value="ADMIN">Admin</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-brand-secondary/50 uppercase tracking-[0.3em] ml-2">System Status</label>
                        <select
                          className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-5 py-4 text-brand-white text-xs font-bold focus:outline-none focus:border-brand-primary appearance-none uppercase tracking-widest"
                          value={formData.isActive ? 'Active' : 'Inactive'}
                          onChange={e => setFormData({...formData, isActive: e.target.value === 'Active'})}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-brand-secondary/50 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                        <Shield size={14} className="text-brand-primary" /> Clearance Matrix
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
                        {PERMISSIONS_LIST.map(perm => (
                            <label
                                key={perm.id}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group",
                                    formData.permissions.includes(perm.id)
                                        ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
                                        : "bg-brand-bg/50 border-brand-sage/10 text-sub opacity-60 hover:opacity-100"
                                )}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-widest">{perm.label}</span>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={formData.permissions.includes(perm.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFormData({...formData, permissions: [...formData.permissions, perm.id]});
                                        } else {
                                            setFormData({...formData, permissions: formData.permissions.filter(p => p !== perm.id)});
                                        }
                                    }}
                                />
                                <div className={cn(
                                    "w-4 h-4 rounded-md border-2 transition-all flex items-center justify-center",
                                    formData.permissions.includes(perm.id) ? "bg-brand-primary border-brand-primary" : "border-brand-sage/20"
                                )}>
                                    {formData.permissions.includes(perm.id) && <CheckCircle2 size={10} className="text-white" />}
                                </div>
                            </label>
                        ))}
                    </div>
                  </div>

                  {formData.role === 'SUPER_ADMIN' && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-4 items-start animate-pulse">
                          <ShieldAlert size={20} className="text-red-500 shrink-0" />
                          <p className="text-[9px] font-black text-red-400 uppercase leading-relaxed tracking-widest">
                              Warning: SUPER_ADMIN bypasses the clearance matrix and has full authoritative control over the root registry.
                          </p>
                      </div>
                  )}

                  <div className="pt-6">
                     <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full py-5 bg-brand-primary hover:bg-brand-primary/90 text-brand-white font-black rounded-3xl transition-all shadow-[0_20px_50px_rgba(45,106,79,0.3)] text-xs uppercase tracking-[0.3em]"
                     >
                       {editingAdmin ? 'Sync Registry Profile' : 'Authorize Identity'}
                     </motion.button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminsPage;
