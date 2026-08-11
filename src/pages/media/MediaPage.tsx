import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Copy,
  Search,
  Grid,
  List as ListIcon,
  RefreshCcw,
  Plus,
  ExternalLink,
  CheckCircle2,
  FileSearch,
  HardDrive
} from 'lucide-react';
import { ref, listAll, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../services/firebaseService';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

interface MediaItem {
  name: string;
  url: string;
  fullPath: string;
  size?: number;
  updated?: string;
}

const MediaPage = () => {
  const { theme } = useTheme();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const storageRef = ref(storage, 'media');
      const result = await listAll(storageRef);

      const mediaItems = await Promise.all(
        result.items.map(async (item) => ({
          name: item.name,
          url: await getDownloadURL(item),
          fullPath: item.fullPath
        }))
      );

      setItems(mediaItems);
    } catch (err) {
      console.error('Load media failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const fileRef = ref(storage, `media/${file.name}`);
      await uploadBytes(fileRef, file);
      await loadMedia();
      toast.success('Asset ingested successfully');
    } catch (err) {
      toast.error('Ingestion failure');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (fullPath: string) => {
    if (!window.confirm('Erase this asset from cloud storage?')) return;
    try {
      await deleteObject(ref(storage, fullPath));
      setItems(prev => prev.filter(i => i.fullPath !== fullPath));
      toast.success('Asset expunged');
    } catch (err) {
      toast.error('Deletion failure');
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL mapped to clipboard');
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* High-End Header */}
      <div className="glass p-10 rounded-[3rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4">
             <div className="p-3 bg-brand-primary/10 rounded-2xl">
                <ImageIcon className="text-brand-primary" size={32} />
             </div>
             Asset Library
          </h2>
          <p className="text-sub text-xs font-black uppercase tracking-[0.4em] mt-2 ml-1">Cloud Content Storage • Visual Orchestration</p>
        </div>

        <div className="flex items-center gap-6 w-full xl:w-auto relative z-10">
           <div className="flex p-1.5 glass rounded-2xl border border-brand-sage/10">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300",
                  viewMode === 'grid' ? "bg-brand-primary text-brand-white shadow-lg" : "text-sub hover:text-brand-primary"
                )}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300",
                  viewMode === 'list' ? "bg-brand-primary text-brand-white shadow-lg" : "text-sub hover:text-brand-primary"
                )}
              >
                <ListIcon size={20} />
              </button>
           </div>

           <input
            type="file"
            id="media-upload"
            className="hidden"
            onChange={handleUpload}
            accept="image/*"
           />
           <label
            htmlFor="media-upload"
            className={cn(
              "flex items-center gap-3 bg-brand-primary hover:bg-brand-primary/90 text-brand-white font-black px-10 py-4 rounded-2xl transition-all shadow-xl shadow-brand-primary/30 cursor-pointer active:scale-95 text-xs uppercase tracking-[0.2em] whitespace-nowrap",
              uploading && "opacity-50 pointer-events-none"
            )}
           >
             {uploading ? <RefreshCcw size={20} className="animate-spin" /> : <Upload size={20} strokeWidth={3} />}
             Ingest Asset
           </label>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="glass rounded-[3rem] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.3)] space-y-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
           <div className="relative w-full md:w-[30rem] group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary/30 group-focus-within:text-brand-primary transition-colors" size={20} />
             <input
               type="text"
               placeholder="Filter assets by identity..."
               className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-[1.5rem] pl-12 pr-6 py-4 text-sm focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <div className="flex items-center gap-3 px-6 py-3 glass rounded-2xl border border-brand-sage/5">
              <HardDrive size={16} className="text-brand-primary" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Root Segment: <span className="text-brand-primary font-mono lowercase">/media/internal/*</span></p>
           </div>
        </div>

        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center gap-6 animate-pulse opacity-20">
            <RefreshCcw size={48} className="animate-spin" />
            <p className="font-black uppercase tracking-[0.4em] text-sm">Syncing Cloud Bucket...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <AnimatePresence>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                {filteredItems.map((item, idx) => (
                  <motion.div
                    key={item.fullPath}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="group relative aspect-square bg-brand-bg/5 dark:bg-brand-bg rounded-[2.5rem] border border-brand-sage/20 overflow-hidden hover:border-brand-primary/40 transition-all shadow-xl"
                  >
                    <img src={item.url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt={item.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 gap-3">
                      <p className="text-[10px] font-black text-brand-white truncate mb-2 uppercase tracking-widest">{item.name}</p>
                      <div className="flex gap-2">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => copyToClipboard(item.url)}
                          className="flex-1 py-2.5 bg-brand-primary/80 backdrop-blur-xl rounded-xl hover:bg-brand-primary transition-all flex items-center justify-center text-brand-white shadow-lg"
                        >
                          <Copy size={16} />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(item.fullPath)}
                          className="flex-1 py-2.5 bg-red-500/80 backdrop-blur-xl rounded-xl hover:bg-red-500 transition-all flex items-center justify-center text-white shadow-lg"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-brand-sage/5">
                 {filteredItems.map((item, idx) => (
                   <motion.div
                    key={item.fullPath}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="py-6 flex items-center gap-8 group hover:bg-brand-primary/5 transition-all px-6 rounded-3xl"
                   >
                      <div className="w-20 h-20 bg-brand-bg/5 dark:bg-brand-bg rounded-2xl border border-brand-sage/10 overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-500">
                         <img src={item.url} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-lg font-bold truncate group-hover:text-brand-primary transition-colors">{item.name}</p>
                         <p className="text-[10px] text-sub font-mono mt-1 opacity-40 uppercase tracking-widest">{item.fullPath}</p>
                      </div>
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => copyToClipboard(item.url)}
                          className="p-3 bg-brand-bg/5 dark:bg-brand-bg text-sub hover:text-brand-primary rounded-xl border border-brand-sage/10 transition-all"
                        >
                          <Copy size={20} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleDelete(item.fullPath)}
                          className="p-3 bg-brand-bg/5 dark:bg-brand-bg text-sub hover:text-red-500 rounded-xl border border-brand-sage/10 transition-all"
                        >
                          <Trash2 size={20} />
                        </motion.button>
                      </div>
                   </motion.div>
                 ))}
              </div>
            )}
          </AnimatePresence>
        ) : (
          <div className="py-40 flex flex-col items-center justify-center text-sub opacity-10 gap-6">
             <FileSearch size={80} />
             <p className="font-black uppercase tracking-[0.4em] text-xl">Cloud Bucket Empty</p>
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />
      </div>
    </div>
  );
};

export default MediaPage;
