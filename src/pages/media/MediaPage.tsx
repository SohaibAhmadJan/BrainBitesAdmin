import React, { useState, useEffect } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { ref, listAll, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../services/firebaseService';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

interface MediaItem {
  name: string;
  url: string;
  fullPath: string;
  size?: number;
  updated?: string;
}

const MediaPage = () => {
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
      toast.success('Upload successful');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (fullPath: string) => {
    if (!window.confirm('Delete this image permanently?')) return;
    try {
      await deleteObject(ref(storage, fullPath));
      setItems(prev => prev.filter(i => i.fullPath !== fullPath));
      toast.success('Asset deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL Copied to clipboard');
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
             <ImageIcon className="text-purple-500" size={32} />
             Media Library
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium italic uppercase tracking-widest text-[10px]">Cloud Asset Manager & Storage</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="bg-slate-800 p-1 rounded-xl flex">
              <button
                onClick={() => setViewMode('grid')}
                className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300")}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300")}
              >
                <ListIcon size={18} />
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
              "flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-black px-8 py-3 rounded-2xl transition-all shadow-lg shadow-purple-600/20 cursor-pointer active:scale-95",
              uploading && "opacity-50 pointer-events-none"
            )}
           >
             {uploading ? <RefreshCcw size={18} className="animate-spin" /> : <Upload size={18} strokeWidth={3} />}
             Upload Image
           </label>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-8">
        <div className="flex justify-between items-center">
           <div className="relative w-96 group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-purple-500 transition-colors" size={16} />
             <input
               type="text"
               placeholder="Search assets..."
               className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all shadow-inner"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Storage: <span className="text-slate-400 font-mono">/media/*</span></p>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-600 gap-4 animate-pulse">
            <RefreshCcw size={32} className="animate-spin opacity-20" />
            <p className="font-bold tracking-widest text-[10px] uppercase">Retrieving cloud assets...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {filteredItems.map((item) => (
                <div key={item.fullPath} className="group relative aspect-square bg-slate-950 rounded-[2rem] border border-slate-800 overflow-hidden hover:border-purple-500/30 transition-all">
                  <img src={item.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt={item.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 gap-2">
                    <p className="text-[10px] font-bold text-white truncate mb-1">{item.name}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(item.url)}
                        className="flex-1 p-2 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-all flex items-center justify-center text-white"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.fullPath)}
                        className="flex-1 p-2 bg-red-500/20 backdrop-blur-md rounded-xl hover:bg-red-500/40 transition-all flex items-center justify-center text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
               {filteredItems.map(item => (
                 <div key={item.fullPath} className="py-4 flex items-center gap-6 group">
                    <div className="w-16 h-16 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                       <img src={item.url} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-white truncate">{item.name}</p>
                       <p className="text-[10px] text-slate-600 font-mono mt-0.5">{item.fullPath}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => copyToClipboard(item.url)} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
                        <Copy size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.fullPath)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                 </div>
               ))}
            </div>
          )
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-700 gap-4">
             <ImageIcon size={48} className="opacity-20" />
             <p className="font-black uppercase tracking-widest text-[10px]">No assets found in cloud storage</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaPage;
