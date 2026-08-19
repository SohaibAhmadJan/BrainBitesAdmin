import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

interface PermissionGateProps {
  message?: string;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  message = "You do not have the required security clearance to access this sector of the Command Registry."
}) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl glass p-16 rounded-[4rem] border-red-500/20 shadow-2xl text-center space-y-10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_50%,rgba(239,68,68,0.05),transparent)] pointer-events-none"></div>

        <div className="w-24 h-24 bg-red-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto text-red-500 shadow-lg shadow-red-500/20 relative z-10">
           <ShieldAlert size={48} strokeWidth={2.5} />
        </div>

        <div className="space-y-4 relative z-10">
           <h2 className="text-4xl font-black text-brand-white tracking-tighter uppercase">Clearance Denied</h2>
           <p className="text-brand-secondary/60 text-base font-medium max-w-md mx-auto leading-relaxed italic">
             {message}
           </p>
        </div>

        <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl space-y-2 relative z-10">
           <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Protocol Restriction: ACCESS_VIOLATION</p>
           <p className="text-[9px] text-brand-secondary/40 font-bold uppercase">Contact a SUPER_ADMIN to request administrative elevation.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PermissionGate;
