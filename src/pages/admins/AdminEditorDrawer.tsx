import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  X,
  User,
  Shield,
  CheckCircle2,
  ShieldAlert,
  Zap,
  Activity,
  Fingerprint,
  ShieldCheck,
  Key
} from 'lucide-react';
import { AdminUser, AdminRole } from '../../types';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { DRAWER_TRANSITION } from '../../utils/animations';
import ElasticButton from '../../components/ui/ElasticButton';

interface AdminEditorDrawerProps {
  admin: AdminUser | null;
  onClose: () => void;
  onSave: (admin: AdminUser) => void;
}

const AdminEditorDrawer: React.FC<AdminEditorDrawerProps> = ({ admin, onClose, onSave }) => {
  const { theme } = useTheme();
  const [isSyncing, setIsSyncing] = useState(false);

  const [formData, setFormData] = useState<Partial<AdminUser>>({
    uid: admin?.uid || '',
    email: admin?.email || '',
    displayName: admin?.displayName || '',
    role: admin?.role || 'ANALYST',
    isActive: admin?.isActive ?? true,
    permissions: admin?.permissions || ['audit.view', 'analytics.view'],
    createdAt: admin?.createdAt || Date.now()
  });

  const PERMISSIONS_LIST = [
    { id: 'manage.content', label: 'Content Management (Facts, Quizzes)' },
    { id: 'manage.config', label: 'Engine Configuration' },
    { id: 'manage.admins', label: 'Security Registry Access' },
    { id: 'users.edit', label: 'User Modification / Suspension' },
    { id: 'audit.view', label: 'Audit Stream Visibility' },
    { id: 'analytics.view', label: 'Analytics Intel' }
  ];

  const ROLES: { id: AdminRole; label: string; desc: string }[] = [
    { id: 'ANALYST', label: 'Analyst', desc: 'Read-only access to system telemetry' },
    { id: 'CONTENT_MANAGER', label: 'Content Lead', desc: 'Authoritative control over facts & logic' },
    { id: 'ADMIN', label: 'Administrator', desc: 'Full system & user management' },
    { id: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Root-level authoritative override' }
  ];

  const [errors, setErrors] = useState<Record<string, string>>({});
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.displayName?.trim()) newErrors.displayName = "Identity name is required";
    if (!formData.email?.trim()) newErrors.email = "Email identifier is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || '')) newErrors.email = "Invalid email protocol";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      setIsSyncing(true);
      const finalUid = formData.uid || formData.email!.toLowerCase().replace(/[@.]/g, '_');
      onSave({
        ...formData,
        uid: finalUid,
        email: formData.email!.toLowerCase(),
        updatedAt: Date.now()
      } as AdminUser);
      setIsSyncing(false);
    }
  };

  const content = (
    <div className="fixed inset-0 z-[1000] flex flex-col overflow-hidden bg-black/60 backdrop-blur-xl p-0">
      <motion.div
        {...DRAWER_TRANSITION}
        className={cn(
          "w-full h-full flex flex-col overflow-hidden border-[16px] relative rounded-[4.5rem] transition-colors duration-700",
          theme === 'dark' ? "bg-brand-bg border-brand-primary/60 shadow-[inset_0_0_150px_rgba(45,106,79,0.5)]" : "bg-[#F4F8F6] border-brand-primary/30 shadow-[0_40px_100px_rgba(0,0,0,0.1)]"
        )}
      >
        {/* Header */}
        <div className={cn(
          "p-10 flex items-center justify-between backdrop-blur-3xl sticky top-0 z-50 transition-colors duration-500",
          theme === 'dark' ? "bg-brand-surface/90" : "bg-white/95 shadow-sm"
        )}>
          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className={cn(
                "p-4 glass rounded-2xl transition-all shadow-xl",
                theme === 'dark' ? "text-sub hover:text-brand-primary border-brand-sage/10" : "text-brand-primary hover:bg-brand-primary/10 border-brand-primary/20"
              )}
            >
              <X size={28} />
            </motion.button>
            <div>
              <h2 className={cn("text-4xl font-black tracking-tighter uppercase", theme === 'dark' ? "text-white" : "text-brand-primary")}>
                {admin ? 'Refine Registry' : 'Agent Onboarding'}
              </h2>
              <p className={cn("text-xs font-black uppercase tracking-[0.4em] opacity-40 mt-1", theme === 'dark' ? "text-sub" : "text-brand-primary")}>
                {formData.uid || 'AUTHORIZATION_PENDING'} • Security Protocol
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <ElasticButton onClick={handleSave} disabled={isSyncing} className="px-16 py-5 rounded-2xl text-base shadow-[0_0_30px_rgba(45,106,79,0.4)]">
               {isSyncing ? "Authorizing..." : "Execute Sync"}
             </ElasticButton>
          </div>
        </div>

        {/* Matrix View */}
        <div className={cn("flex-1 overflow-hidden flex flex-col min-h-0", theme === 'dark' ? "bg-brand-bg" : "bg-transparent")}>
          <div className={cn("flex w-full h-full min-h-0 divide-x-2", theme === 'dark' ? "divide-brand-primary/20" : "divide-brand-primary/10")}>

            {/* Column 1: Identity Matrix */}
            <div className="flex-1 flex flex-col h-full min-h-0 p-10 space-y-10">
                <section className="flex-1 flex flex-col space-y-4 min-h-0">
                  <div className="flex items-center gap-3 text-brand-primary font-black">
                    <div className="p-2 bg-brand-primary/10 rounded-lg"><User size={18} /></div>
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Identity Matrix</h3>
                  </div>

                  <div className={cn("p-10 rounded-[3.5rem] flex-1 flex flex-col justify-center space-y-8 border-4 relative overflow-hidden transition-all duration-500 group/tile", theme === 'dark' ? "bg-brand-surface/40 border-brand-primary/15 shadow-2xl backdrop-blur-2xl" : "bg-white/90 border-brand-primary/10 shadow-xl")}>
                      <div className="space-y-3">
                        <label className={cn("text-[10px] font-black uppercase tracking-[0.3em] ml-2", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Full Identity Name</label>
                        <input
                          className={cn("w-full border-2 rounded-[2rem] px-8 py-5 text-xl font-black tracking-tight focus:outline-none transition-all", errors.displayName ? "border-red-500/50 bg-red-500/5" : "focus:border-brand-primary/50", theme === 'dark' ? "bg-black/30 border-brand-primary/10" : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary")}
                          placeholder="e.g. John Doe"
                          value={formData.displayName}
                          onChange={e => setFormData({...formData, displayName: e.target.value})}
                        />
                        {errors.displayName && <p className="text-[9px] text-red-500 font-black uppercase ml-4">{errors.displayName}</p>}
                      </div>

                      <div className="space-y-3">
                        <label className={cn("text-[10px] font-black uppercase tracking-[0.3em] ml-2", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Email Identifier</label>
                        <input
                          type="email"
                          className={cn("w-full border-2 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none transition-all shadow-inner", errors.email ? "border-red-500/50 bg-red-500/5" : "focus:border-brand-primary/50", theme === 'dark' ? "bg-black/30 border-brand-primary/10" : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary")}
                          placeholder="admin@brainbites.com"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          disabled={!!admin}
                        />
                        {errors.email && <p className="text-[9px] text-red-500 font-black uppercase ml-4">{errors.email}</p>}
                      </div>

                      <div className="space-y-6 pt-4 border-t border-brand-sage/10">
                        <div className="flex items-center justify-between">
                            <label className={cn("text-[10px] font-black uppercase tracking-[0.3em] ml-2", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Protocol Role Selection</label>
                            <div className="p-1 bg-brand-primary/10 rounded-lg"><Key size={12} className="text-brand-primary" /></div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                           {ROLES.map(role => {
                             const isSelected = formData.role === role.id;
                             return (
                               <button
                                 key={role.id}
                                 type="button"
                                 onClick={() => setFormData({...formData, role: role.id})}
                                 className={cn(
                                   "p-5 rounded-[1.8rem] border-2 text-left transition-all relative group/role",
                                   isSelected
                                     ? "bg-brand-primary/10 border-brand-primary/30 shadow-lg"
                                     : "bg-brand-bg/50 border-brand-sage/10 opacity-40 hover:opacity-100 hover:border-brand-primary/20"
                                 )}
                               >
                                 <div className="flex justify-between items-center mb-1">
                                    <span className={cn("text-[11px] font-black uppercase tracking-widest", isSelected ? "text-brand-primary" : "text-sub")}>{role.label}</span>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(45,106,79,1)] animate-pulse" />}
                                 </div>
                                 <p className="text-[9px] font-medium opacity-50 lowercase italic leading-none">{role.desc}</p>
                               </button>
                             );
                           })}
                        </div>
                      </div>
                  </div>
                </section>
            </div>

            {/* Column 2: Clearance Matrix */}
            <div className="flex-1 flex flex-col h-full min-h-0 p-10 space-y-10">
                <section className="flex-1 flex flex-col space-y-4 min-h-0">
                  <div className="flex items-center gap-3 text-brand-gold font-black">
                    <div className="p-2 bg-brand-gold/10 rounded-lg"><Shield size={18} /></div>
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Clearance Matrix</h3>
                  </div>

                  <div className={cn("p-10 rounded-[4rem] flex-1 flex flex-col border-4 transition-all duration-500 min-h-0 space-y-3 overflow-y-auto scrollbar-thin", theme === 'dark' ? "bg-brand-surface/40 border-brand-primary/15 shadow-2xl backdrop-blur-2xl" : "bg-white/90 border-brand-primary/10 shadow-xl")}>
                      {PERMISSIONS_LIST.map(perm => {
                        const isSelected = formData.permissions?.includes(perm.id);
                        return (
                            <button
                                key={perm.id}
                                type="button"
                                onClick={() => {
                                    const current = formData.permissions || [];
                                    if (current.includes(perm.id)) {
                                        setFormData({...formData, permissions: current.filter(p => p !== perm.id)});
                                    } else {
                                        setFormData({...formData, permissions: [...current, perm.id]});
                                    }
                                }}
                                className={cn(
                                    "w-full text-left p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group/perm",
                                    isSelected
                                        ? "bg-brand-primary/10 border-brand-primary/30"
                                        : "hover:bg-brand-primary/5 border-transparent opacity-60 hover:opacity-100"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-2 h-2 rounded-full", isSelected ? "bg-brand-primary shadow-[0_0_10px_rgba(45,106,79,1)]" : "bg-brand-sage/30")} />
                                    <span className={cn("text-[11px] font-black uppercase tracking-widest", isSelected ? "text-brand-primary" : "text-sub")}>{perm.label}</span>
                                </div>
                                <div className={cn("w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all", isSelected ? "bg-brand-primary border-brand-primary" : "border-brand-sage/20")}>
                                    {isSelected && <CheckCircle2 size={14} className="text-white" />}
                                </div>
                            </button>
                        );
                      })}

                      {formData.role === 'SUPER_ADMIN' && (
                          <div className="mt-6 p-8 bg-red-500/10 border-4 border-red-500/20 rounded-[3rem] flex gap-5 items-start animate-pulse">
                              <ShieldAlert size={32} className="text-red-500 shrink-0" />
                              <p className="text-[11px] font-black text-red-400 uppercase leading-relaxed tracking-[0.2em]">
                                  SUPER_ADMIN Authority Active: This identity bypasses the clearance matrix and possesses root authoritative control over the entire system registry.
                              </p>
                          </div>
                      )}
                  </div>
                </section>
            </div>

            {/* Column 3: Audit & Logic Summary */}
            <div className="flex-1 flex flex-col h-full min-h-0 p-10 space-y-10">
                <section className="flex-1 flex flex-col space-y-4 min-h-0">
                  <div className="flex items-center gap-3 text-brand-primary font-black">
                    <div className="p-2 bg-brand-primary/10 rounded-lg"><Zap size={18} /></div>
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Protocol Summary</h3>
                  </div>

                  <div className={cn("p-10 rounded-[4rem] border-4 shadow-2xl flex-1 flex flex-col justify-between space-y-8 min-h-0 transition-all relative overflow-hidden", theme === 'dark' ? "bg-brand-surface/40 border-brand-primary/15 backdrop-blur-2xl" : "bg-white/90 border-brand-primary/10")}>
                      <div className="space-y-12">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-sub opacity-30 uppercase tracking-[0.3em]">Identity Fingerprint</p>
                            <div className={cn("p-8 rounded-[2rem] border-2 font-mono text-[11px] break-all shadow-inner", theme === 'dark' ? "bg-black/30 border-brand-primary/20 text-brand-primary" : "bg-brand-primary/5 border-brand-primary/10 text-brand-primary shadow-inner")}>
                                {formData.uid || 'AUTHORIZATION_PENDING'}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary border border-brand-primary/20"><Activity size={24} /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-sub opacity-40">System Clearance</p>
                                    <p className="text-xl font-black text-brand-primary uppercase tracking-tighter tabular-nums">{formData.role?.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-6 bg-brand-bg/30 rounded-[2.5rem] border-2 border-brand-sage/10">
                               <div className="flex items-center gap-4">
                                  <div className="p-2.5 bg-brand-gold/10 rounded-xl text-brand-gold border border-brand-gold/20"><Fingerprint size={20} /></div>
                                  <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-sub opacity-40">Registry Entry</p>
                                      <p className="text-base font-black text-brand-gold uppercase tracking-tighter tabular-nums">{new Date(formData.createdAt || Date.now()).toLocaleDateString()}</p>
                                  </div>
                               </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className={cn("text-[10px] font-black uppercase tracking-[0.3em] ml-2", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>System Access State</label>
                            <div className="flex gap-4">
                              <button
                                type="button"
                                onClick={() => setFormData({...formData, isActive: true})}
                                className={cn(
                                  "flex-1 py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                  formData.isActive === true
                                    ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary shadow-lg"
                                    : "bg-brand-bg/50 border-brand-sage/10 text-sub opacity-40"
                                )}
                              >
                                <div className={cn("w-1.5 h-1.5 rounded-full", formData.isActive ? "bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(45,106,79,1)]" : "bg-brand-sage/30")} />
                                Active
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData({...formData, isActive: false})}
                                className={cn(
                                  "flex-1 py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                  formData.isActive === false
                                    ? "bg-red-500/10 border-red-500/30 text-red-500 shadow-lg"
                                    : "bg-brand-bg/50 border-brand-sage/10 text-sub opacity-40"
                                )}
                              >
                                <div className={cn("w-1.5 h-1.5 rounded-full", !formData.isActive ? "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" : "bg-brand-sage/30")} />
                                Restricted
                              </button>
                            </div>
                        </div>
                      </div>

                      <div className={cn("p-8 rounded-[2.5rem] border-4 border-brand-primary/10 space-y-4", theme === 'dark' ? "bg-black/20" : "bg-brand-primary/5")}>
                        <div className="flex items-center gap-3 text-brand-primary font-black">
                            <ShieldCheck size={18} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Integrity Handshake</p>
                        </div>
                        <p className="text-[11px] font-medium leading-relaxed opacity-60 italic">
                            Executing sync will commit this identity to the root administrative registry. This action is audited and irreversible without SUPER_ADMIN clearance.
                        </p>
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

export default AdminEditorDrawer;
