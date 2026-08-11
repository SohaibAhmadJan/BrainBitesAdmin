import React from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Info, FileJson } from 'lucide-react';
import { cn } from '../utils/cn';

interface ImportExportProps {
  onImport: (files: FileList | null) => void;
  onExport: () => void;
  error?: string;
}

const ImportExport: React.FC<ImportExportProps> = ({ onImport, onExport, error }) => {
  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in duration-500">
      <div className="glass p-10 rounded-[3rem] space-y-8 shadow-2xl relative overflow-hidden">
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
           <FileJson size={24} className="text-brand-primary" />
           Batch Processing Sequence
        </h2>

        <div className="p-10 bg-brand-bg/5 dark:bg-brand-bg/40 border-2 border-dashed border-brand-sage/20 rounded-[2.5rem] text-center space-y-6 group hover:border-brand-primary/50 transition-all duration-500 shadow-inner">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto text-brand-primary shadow-lg group-hover:scale-110 transition-transform">
            <Upload size={32} strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-bold text-lg">Ingest Master Schema</p>
            <p className="text-xs text-sub mt-2 italic font-medium">Map local JSON nodes to Cloud Firestore clusters.</p>
          </div>
          <input
            type="file"
            accept="application/json"
            multiple
            onChange={(e) => onImport(e.target.files)}
            className="hidden"
            id="json-upload"
          />
          <label
            htmlFor="json-upload"
            className="inline-block px-10 py-3.5 bg-brand-primary hover:bg-brand-primary/90 text-brand-white text-xs font-black rounded-2xl cursor-pointer transition-all active:scale-95 uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20"
          >
            Select Sequence File
          </label>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-xs font-black uppercase tracking-widest bg-red-500/10 py-2 rounded-xl mt-4"
            >
              {error}
            </motion.p>
          )}
        </div>

        <div className="pt-8 border-t border-brand-sage/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h4 className="font-bold text-lg">Extract Master Snapshot</h4>
            <p className="text-xs text-sub opacity-60 mt-1 font-medium italic">Download current system state for redundancy.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExport}
            className="px-8 py-3.5 bg-brand-bg/5 dark:bg-brand-bg border border-brand-sage/20 text-sub hover:text-brand-primary hover:border-brand-primary rounded-2xl transition-all text-xs font-black uppercase tracking-widest shadow-xl"
          >
            <Download size={18} className="inline mr-2" /> Extract to JSON
          </motion.button>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />
      </div>

      <div className="p-8 bg-brand-primary/5 border border-brand-primary/10 rounded-[2rem] flex gap-6 shadow-sm">
        <div className="text-brand-primary pt-1">
           <Info size={20} />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-black uppercase tracking-widest opacity-80">Schema Mapping Protocol</h4>
          <p className="text-xs text-sub leading-relaxed font-medium">
            Ensure your source definitions align with the `BiteItem` cluster specification. Nodes with missing identity hashes will be automatically normalized using system-wide defaults during the ingestion sequence.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
