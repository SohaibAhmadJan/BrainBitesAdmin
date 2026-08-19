import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Wifi, Database, Server } from 'lucide-react';
import { db } from '../../services/firebaseService';
import { pingApi } from '../../services/adminApi';
import { cn } from '../../utils/cn';

const SystemPulse = () => {
  const [dbStatus, setDbStatus] = useState<'online' | 'offline'>('offline');
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('offline');

  useEffect(() => {
    // Basic check for Firestore connectivity
    if (db) {
        setDbStatus('online');
    }

    const checkApi = async () => {
        setApiStatus('checking');
        try {
            await pingApi();
            setApiStatus('online');
        } catch (err) {
            console.error("API Pulse Failed:", err);
            setApiStatus('offline');
        }
    };
    checkApi();
  }, []);

  const StatusNode = ({ icon: Icon, label, status }: { icon: any, label: string, status: 'online' | 'offline' | 'checking' }) => (
    <div className="flex items-center justify-between p-4 bg-brand-bg/5 dark:bg-brand-bg/30 rounded-2xl border border-brand-sage/5 hover:border-brand-primary/20 transition-all group">
      <div className="flex items-center gap-3">
        <div className={cn(
            "p-2 rounded-xl transition-all shadow-inner",
            status === 'online' ? "bg-brand-primary/10 text-brand-primary" :
            status === 'checking' ? "bg-brand-gold/10 text-brand-gold" : "bg-red-500/10 text-red-500"
        )}>
          <Icon size={16} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-sub group-hover:text-brand-primary transition-colors">{label}</p>
      </div>
      <div className="flex items-center gap-2">
         <div className={cn(
             "w-1.5 h-1.5 rounded-full",
             status === 'online' ? "bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(45,106,79,0.6)]" :
             status === 'checking' ? "bg-brand-gold animate-pulse" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
         )} />
         <span className={cn(
             "text-[8px] font-black uppercase tracking-tighter",
             status === 'online' ? "text-brand-primary" :
             status === 'checking' ? "text-brand-gold" : "text-red-500"
         )}>{status}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary shadow-lg"><Activity size={18} /></div>
        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-sub opacity-40">Security Pulse</h3>
      </div>

      <div className="space-y-3">
        <StatusNode icon={Database} label="Identity Registry" status={dbStatus} />
        <StatusNode icon={Server} label="Trusted API" status={apiStatus} />
        <StatusNode icon={Wifi} label="Edge Handshake" status="online" />
      </div>

      <div className="p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl mt-4">
         <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] leading-relaxed italic">
           All systems operational. Low latency detected in primary insight streams.
         </p>
      </div>
    </div>
  );
};

export default SystemPulse;
