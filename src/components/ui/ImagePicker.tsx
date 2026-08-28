import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Upload,
  ChevronDown,
  Globe,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  galleryImages: string[];
  label?: string;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ value, onChange, galleryImages, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uniqueGallery = Array.from(new Set(galleryImages.filter(img => img && img.startsWith('http'))));

  const handleExternalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error('Cloudinary configuration missing in .env');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.secure_url) {
        onChange(data.secure_url);
        toast.success('Asset uploaded successfully');
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (err: any) {
      toast.error(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-1.5 relative">
      {label && (
        <label className="text-[9px] font-black text-brand-secondary/40 uppercase tracking-[0.3em] ml-1 flex items-center gap-1.5">
          <ImageIcon size={12} className="text-brand-primary" /> {label}
        </label>
      )}

      <div className="flex gap-1.5">
        <div className="relative flex-1 group">
           <input
             className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-xl px-4 py-2.5 text-brand-white text-[11px] focus:outline-none focus:border-brand-primary transition-all shadow-inner"
             placeholder="Paste URL or upload..."
             value={value}
             onChange={(e) => onChange(e.target.value)}
           />
           {value && (
             <button
               onClick={() => onChange('')}
               className="absolute right-3 top-1/2 -translate-y-1/2 text-sub hover:text-red-400 transition-colors"
             >
               <X size={12} />
             </button>
           )}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-3 bg-brand-bg/50 border border-brand-sage/20 rounded-xl text-sub hover:text-brand-primary transition-all flex items-center justify-center shadow-lg disabled:opacity-50"
          title="Upload from PC"
        >
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "px-3 bg-brand-bg/50 border border-brand-sage/20 rounded-xl text-sub hover:text-brand-primary transition-all flex items-center justify-center shadow-lg",
            isOpen && "border-brand-primary text-brand-primary"
          )}
          title="Cloud Gallery"
        >
          <Globe size={16} />
          <ChevronDown size={12} className={cn("ml-1 transition-transform duration-300", isOpen && "rotate-180")} />
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleExternalUpload}
        className="hidden"
        accept="image/*"
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            className="absolute z-[100] top-full mt-2 left-0 right-0 glass rounded-xl p-3 shadow-2xl border-brand-sage/20 max-h-48 overflow-y-auto scrollbar-hide grid grid-cols-5 gap-2"
          >
            {uniqueGallery.length > 0 ? uniqueGallery.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onChange(img);
                  setIsOpen(false);
                }}
                className="group relative aspect-square rounded-lg overflow-hidden border border-brand-sage/10 hover:border-brand-primary transition-all bg-brand-bg/50"
              >
                <img src={img} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                {value === img && (
                  <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center">
                    <Check size={16} className="text-brand-white" />
                  </div>
                )}
              </button>
            )) : (
              <div className="col-span-full py-6 text-center text-[9px] font-black uppercase tracking-widest text-sub opacity-30">
                Gallery Empty
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {value && !isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="relative pt-1.5"
        >
           <div className="h-14 w-24 rounded-lg border border-brand-sage/10 overflow-hidden shadow-lg bg-brand-bg/30">
              <img src={value} className="w-full h-full object-cover" alt="Preview" />
           </div>
        </motion.div>
      )}
    </div>
  );
};

export default ImagePicker;
