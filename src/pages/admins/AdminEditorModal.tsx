import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AdminUser, AdminRole } from '../../types';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { SPRING_SMOOTH } from '../../utils/animations';
import ElasticButton from '../../components/ui/ElasticButton';

interface AdminEditorModalProps {
  admin: AdminUser | null;
  onClose: () => void;
  onSave: (admin: AdminUser, sendInvite: boolean) => void;
}

const AdminEditorModal: React.FC<AdminEditorModalProps> = ({ admin, onClose, onSave }) => {
  const { theme } = useTheme();
  const [isSyncing, setIsSyncing] = useState(false);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  const [formData, setFormData] = useState<Partial<AdminUser>>({
    uid: admin?.uid || '',
    email: admin?.email || '',
    displayName: admin?.displayName || '',
    role: admin?.role || 'ANALYST',
    isActive: admin?.isActive ?? true,
    permissions: admin?.permissions || ['audit.view', 'analytics.view'],
    createdAt: admin?.createdAt || Date.now()
  });

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
      try {
        const finalUid = formData.uid || formData.email!.toLowerCase().replace(/[@.]/g, '_');
        await onSave({
          ...formData,
          uid: finalUid,
          email: formData.email!.toLowerCase(),
          updatedAt: Date.now()
        } as AdminUser, sendWelcomeEmail);
      } catch (err) {
        console.error("Save failed", err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={SPRING_SMOOTH}
        className={cn(
          "relative w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl border transition-colors duration-500",
          theme === 'dark' ? "bg-brand-surface border-brand-sage/20 shadow-black/50" : "bg-white border-brand-primary/10 shadow-black/10"
        )}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-brand-sage/10 flex items-center justify-between">
           <h2 className="text-xl font-bold tracking-tight">{admin ? 'Edit User' : 'Add New User'}</h2>
           <button onClick={onClose} className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors text-sub">
              <X size={20} />
           </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6">
           <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-60 ml-1">Full Name</label>
              <input
                className={cn(
                  "w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all shadow-inner",
                  errors.displayName ? "border-red-500/50 bg-red-500/5" : "border-brand-sage/20 focus:border-brand-primary/50",
                  theme === 'dark' ? "bg-black/20 text-white" : "bg-brand-primary/5 text-brand-primary"
                )}
                placeholder="e.g. Jane Doe"
                value={formData.displayName}
                onChange={e => setFormData({...formData, displayName: e.target.value})}
              />
              {errors.displayName && <p className="text-[10px] text-red-500 font-bold uppercase mt-1 ml-1">{errors.displayName}</p>}
           </div>

           <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-60 ml-1">Email Address</label>
              <input
                type="email"
                className={cn(
                  "w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all shadow-inner",
                  errors.email ? "border-red-500/50 bg-red-500/5" : "border-brand-sage/20 focus:border-brand-primary/50",
                  theme === 'dark' ? "bg-black/20 text-white" : "bg-brand-primary/5 text-brand-primary",
                  admin && "opacity-50 cursor-not-allowed"
                )}
                placeholder="name@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                disabled={!!admin}
              />
              {errors.email ? (
                <p className="text-[10px] text-red-500 font-bold uppercase mt-1 ml-1">{errors.email}</p>
              ) : (
                <p className="text-[10px] text-sub opacity-40 italic mt-1 ml-1">The invitation will be sent to this address.</p>
              )}
           </div>

           <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-60 ml-1">Role</label>
              <select
                className={cn(
                  "w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all appearance-none cursor-pointer shadow-inner",
                  theme === 'dark' ? "bg-black/20 border-brand-sage/20 text-white" : "bg-brand-primary/5 border-brand-primary/10 text-brand-primary"
                )}
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as AdminRole})}
              >
                <option value="SUPER_ADMIN">Administrator</option>
                <option value="ADMIN">Editor</option>
                <option value="CONTENT_MANAGER">Author</option>
                <option value="ANALYST">Analyst</option>
              </select>
           </div>

           <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="welcome-email"
                className="w-4 h-4 rounded border-brand-sage/30 bg-brand-bg/20 text-brand-primary focus:ring-brand-primary/20 cursor-pointer"
                checked={sendWelcomeEmail}
                onChange={e => setSendWelcomeEmail(e.target.checked)}
              />
              <label htmlFor="welcome-email" className="text-sm font-medium cursor-pointer select-none opacity-80">
                Send a welcome email with login details
              </label>
           </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-brand-primary/5 border-t border-brand-sage/10 flex items-center justify-end gap-4">
           <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-sub hover:bg-brand-primary/10 transition-all">
              Cancel
           </button>
           <ElasticButton onClick={handleSave} disabled={isSyncing} className="px-8 py-3 rounded-xl text-sm shadow-xl">
              {isSyncing ? 'Processing...' : admin ? 'Update User' : 'Create User'}
           </ElasticButton>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AdminEditorModal;
