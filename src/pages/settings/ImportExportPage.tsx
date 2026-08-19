import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Info, CheckCircle2, AlertTriangle, FileJson, Server, RefreshCcw, Database } from 'lucide-react';
import { BiteItem } from '../../types';
import { bulkImportFacts } from '../../services/adminApi';
import { fetchBites } from '../../services/firestoreService';
import ImportExport from '../../components/ImportExport';
import { useTheme } from '../../context/ThemeContext';

const ImportExportPage = () => {
  const { theme } = useTheme();
  const [importError, setImportError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImportError('');
    setLoading(true);
    try {
      let importedFacts: any[] = [];

      for (let i = 0; i < files.length; i++) {
        const text = await files[i].text();
        const parsed = JSON.parse(text);
        if (parsed.facts) importedFacts = [...importedFacts, ...parsed.facts];
        else if (Array.isArray(parsed)) importedFacts = [...importedFacts, ...parsed];
      }

      if (importedFacts.length === 0) {
        throw new Error('No valid facts detected in sequence.');
      }

      const normalized: BiteItem[] = importedFacts.map(fact => {
        return {
          id: String(fact.id),
          fact: fact.fact || '',
          category: fact.category || 'Human Behavior',
          categoryId: fact.categoryId || 'HUMAN_BEHAVIOR',
          title: fact.title || '',
          snippet: fact.snippet || '',
          fullFact: fact.fullFact || '',
          whyItMatters: fact.whyItMatters || '',
          readTimeMinutes: fact.readTimeMinutes || 1,
          imageUrl: fact.imageUrl || null,
          keywords: fact.keywords || '',
          isPublished: fact.isPublished ?? true,
          isFeatured: fact.isFeatured ?? false,
          createdAt: fact.createdAt || Date.now(),
          updatedAt: Date.now()
        };
      });

      await bulkImportFacts(normalized, `Bulk ingestion of ${normalized.length} sequence nodes`);
      alert(`Successfully merged and ingested ${normalized.length} sequence nodes to Cloud Repository (Atomic).`);
    } catch (e: any) {
      setImportError(e.message || 'Node decryption failed: Invalid JSON format');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const facts = await fetchBites();
      const payload = JSON.stringify(facts, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `brainbites-master-backup-${new Date().toISOString().split('T')[0]}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Data extraction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* High-End Header */}
      <div className="glass p-10 rounded-[3rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4">
             <div className="p-3 bg-brand-primary/10 rounded-2xl">
                <FileJson className="text-brand-primary" size={32} />
             </div>
             Data Orchestration
          </h2>
          <p className="text-sub text-xs font-black uppercase tracking-[0.4em] mt-2 ml-1">Cloud Migration Protocols • Repository Backups</p>
        </div>

        <div className="flex items-center gap-6 relative z-10">
           <div className="flex items-center gap-3 px-6 py-3 glass rounded-2xl border border-brand-sage/5">
              <Database size={16} className="text-brand-primary" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">System State: <span className="text-brand-primary">Synchronized</span></p>
           </div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[3rem] p-12 shadow-[0_30px_100px_rgba(0,0,0,0.3)] relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-brand-primary">
                    <Upload size={24} />
                    <h3 className="text-2xl font-black tracking-tight">Ingest Protocols</h3>
                 </div>
                 <p className="text-sub text-sm leading-relaxed font-medium italic opacity-70">
                    Upload standardized JSON sequence definitions to bulk populate the Firestore repository. The system will automatically normalize data nodes and map quiz challenges.
                 </p>
                 <div className="p-6 bg-brand-bg/5 dark:bg-brand-bg/30 border border-brand-sage/10 rounded-3xl space-y-4 shadow-inner">
                    <p className="text-[9px] font-black text-sub uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                       <Info size={12} className="text-brand-primary" /> Protocol Requirements:
                    </p>
                    <ul className="space-y-3">
                       <li className="flex items-center gap-3 text-xs font-bold opacity-60">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(45,106,79,1)]" /> Standard JSON Array Structure
                       </li>
                       <li className="flex items-center gap-3 text-xs font-bold opacity-60">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(45,106,79,1)]" /> UTF-8 Identity Encoding
                       </li>
                    </ul>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-brand-secondary">
                    <Download size={24} />
                    <h3 className="text-2xl font-black tracking-tight">Extraction Protocols</h3>
                 </div>
                 <p className="text-sub text-sm leading-relaxed font-medium italic opacity-70">
                    Extract the entire master fact repository into a portable JSON snapshot. Use this for offline analysis or manual disaster recovery procedures.
                 </p>
                 <div className="p-6 bg-brand-bg/5 dark:bg-brand-bg/30 border border-brand-sage/10 rounded-3xl space-y-4 shadow-inner">
                    <p className="text-[9px] font-black text-sub uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                       <Server size={12} className="text-brand-secondary" /> Engine Status:
                    </p>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold opacity-60 italic">Ready for extraction...</span>
                       <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="pt-10 border-t border-brand-sage/10">
              <ImportExport
                onImport={handleImport}
                onExport={handleExport}
                error={importError}
              />
           </div>
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

export default ImportExportPage;
