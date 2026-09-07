import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileJson, RefreshCcw, Database } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

const ExportPage = () => {
  const { theme } = useTheme();
  const { isAtLeast } = useAdmin();
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* High-End Header */}
      <div className="glass p-6 rounded-2xl shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tighter flex items-center gap-4">
             <div className="p-2.5 bg-brand-primary/10 rounded-xl">
                <FileJson className="text-brand-primary" size={24} />
             </div>
             Export Repository
          </h2>
          <p className="text-sub text-[10px] font-black uppercase tracking-[0.3em] mt-1 ml-1 opacity-60">System Backups • Secondary Hub</p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
           <div className="flex items-center gap-3 px-4 py-2 glass rounded-xl border border-brand-sage/5">
              <Database size={14} className="text-brand-primary" />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">System State: <span className="text-brand-primary">Ready</span></p>
           </div>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[80px] rounded-full pointer-events-none" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-10 shadow-2xl relative overflow-hidden min-h-[400px] flex items-center justify-center border-dashed border-2 border-brand-sage/10"
      >
        <div className="text-center space-y-4 relative z-10">
           <p className="text-sub text-sm font-bold uppercase tracking-[0.4em] opacity-20 italic">Awaiting Module Configuration...</p>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-brand-bg/60 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300">
             <RefreshCcw className="animate-spin text-brand-primary" size={48} />
             <p className="font-black uppercase tracking-[0.4em] text-sm">Processing Data Stream...</p>
          </div>
        )}

        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />
      </motion.div>
    </div>
  );
};

export default ExportPage;
