import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldAlert,
  RefreshCcw,
  Mail,
  CheckCircle2,
  Save,
  AlertTriangle,
  Info,
  Flag,
  Smartphone,
  Server,
  Sun,
  Moon,
  Monitor,
  Lightbulb,
  LayoutGrid,
  ChevronRight
} from 'lucide-react';
import { AppSettings } from '../../types';
import { fetchAppSettings } from '../../services/firestoreService';
import { updateConfig } from '../../services/adminApi';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import ActionBadge from '../../components/ui/ActionBadge';
import ElasticButton from '../../components/ui/ElasticButton';

const AppSettingsPage = () => {
  const [settings, setSettings] = useState<AppSettings>({
    maintenanceMode: false,
    maintenanceMessage: 'BrainBites is currently undergoing scheduled maintenance. Please check back soon!',
    latestVersion: '3.4.8.7',
    minVersion: '3.0.0',
    supportEmail: 'support@brainbites.com',
    featureFlags: {
      quizzesEnabled: true,
      achievementsEnabled: true,
      dailyFactEnabled: true,
    },
    dailyTipTitle: 'The 2-Minute Rule',
    dailyTipMessage: 'If a task takes less than 2 minutes, do it now.',
    featuredFactId: '1',
    homeSectionsOrder: ['HERO', 'CATEGORIES', 'QUICK_ACTIONS', 'MOOD', 'RECENT', 'DISCOVER', 'ACHIEVEMENTS', 'TIP', 'TRENDING'],
    updatedAt: Date.now()
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await fetchAppSettings();
    if (data) {
      // Map legacy flat structure to nested if necessary
      const normalized: AppSettings = {
        ...data,
        featureFlags: data.featureFlags || {
          quizzesEnabled: (data as any).quizzesEnabled ?? true,
          achievementsEnabled: (data as any).achievementsEnabled ?? true,
          dailyFactEnabled: (data as any).dailyFactEnabled ?? true,
        }
      };
      setSettings(normalized);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfig(settings, `Manual update of system state: Version ${settings.latestVersion}`);
      toast.success('System configuration updated successfully (Atomic).');
    } catch (err: any) {
      toast.error(`System update failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center space-y-4">
      <RefreshCcw className="animate-spin text-brand-primary" size={32} />
      <p className="text-brand-secondary/40 font-bold uppercase tracking-widest text-[10px]">Synchronizing system state...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">

      {/* High-Fidelity Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div>
           <h1 className="text-4xl font-black tracking-tighter uppercase">
             Engine <span className="text-brand-primary">Config</span>
           </h1>
        </div>
        <div className="flex gap-4">
           <ElasticButton
             onClick={handleSave}
             disabled={saving}
             className="px-12 py-5 shadow-[0_20px_50px_rgba(45,106,79,0.3)]"
           >
             {saving ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />}
             Execute Master Sync
           </ElasticButton>
        </div>
      </div>

      {/* Maintenance Mode Banner */}
      {settings.maintenanceMode && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] flex items-center gap-6 animate-pulse">
          <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h3 className="text-red-500 font-black uppercase tracking-widest text-sm">System Lockdown Active</h3>
            <p className="text-red-400/80 text-xs mt-1">Mobile users are currently seeing the maintenance screen. Use with caution.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Left: Engine & Flags */}
        <div className="space-y-10">
          <div className="glass p-8 rounded-[2.5rem] shadow-2xl space-y-8">
            <h2 className="text-2xl font-black flex items-center gap-3">
               <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary"><Server size={24} /></div>
               Engine Configuration
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-brand-bg/50 rounded-2xl border border-brand-sage/20">
                <div className="space-y-1">
                   <p className="text-sm font-bold uppercase tracking-tight">Maintenance Mode</p>
                   <p className="text-[10px] text-brand-secondary/40 uppercase font-black tracking-widest">Emergency System Access</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                  className={cn(
                    "w-14 h-8 rounded-full relative transition-all duration-300",
                    settings.maintenanceMode ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "bg-brand-sage"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md",
                    settings.maintenanceMode ? "left-7" : "left-1"
                  )} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-widest ml-1">Lockdown Message</label>
                <textarea
                  className="w-full bg-brand-bg/5 border border-brand-sage/20 rounded-2xl p-4 text-sm focus:outline-none focus:border-red-500/50 transition-all shadow-inner"
                  rows={3}
                  value={settings.maintenanceMessage}
                  onChange={e => setSettings({...settings, maintenanceMessage: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-widest ml-1">Latest Version</label>
                   <input
                    className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-primary shadow-inner"
                    value={settings.latestVersion}
                    onChange={e => setSettings({...settings, latestVersion: e.target.value})}
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-widest ml-1">Support Endpoint</label>
                   <input
                    className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-primary shadow-inner"
                    value={settings.supportEmail}
                    onChange={e => setSettings({...settings, supportEmail: e.target.value})}
                   />
                 </div>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-[2.5rem] shadow-2xl space-y-8">
              <h2 className="text-2xl font-black flex items-center gap-3">
                 <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary"><Flag size={24} /></div>
                 Feature Manifest
              </h2>

              <div className="space-y-4">
                 {[
                   { id: 'quizzesEnabled', label: 'Psychometric Challenges', desc: 'Enable quiz repository & point system' },
                   { id: 'achievementsEnabled', label: 'Reward Milestones', desc: 'Active achievement tracking & notifications' },
                   { id: 'dailyFactEnabled', label: 'Smart Daily Insights', desc: 'Automated "Fact of the Day" delivery' },
                 ].map((flag) => (
                   <div key={flag.id} className="flex items-center justify-between p-5 bg-brand-bg/50 border border-brand-sage/20 rounded-3xl group hover:border-brand-primary/30 transition-all">
                      <div className="flex gap-4 items-center">
                         <div className="p-2 bg-brand-surface rounded-xl text-brand-secondary/60 group-hover:text-brand-primary transition-colors border border-brand-sage/10">
                           <Info size={16} />
                         </div>
                         <div>
                            <p className="text-sm font-black tracking-tight">{flag.label}</p>
                            <p className="text-[10px] text-brand-secondary/40 font-medium uppercase tracking-tighter">{flag.desc}</p>
                         </div>
                      </div>
                      <button
                        onClick={() => setSettings({
                          ...settings,
                          featureFlags: {
                            ...settings.featureFlags,
                            [flag.id]: !(settings.featureFlags as any)[flag.id]
                          }
                        })}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-all duration-300",
                          (settings.featureFlags as any)[flag.id] ? "bg-brand-primary shadow-[0_0_10px_rgba(45,106,79,0.3)]" : "bg-brand-sage"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md",
                          (settings.featureFlags as any)[flag.id] ? "left-7" : "left-1"
                        )} />
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right: Tip & Reordering */}
        <div className="space-y-10">
          <div className="glass p-8 rounded-[2.5rem] shadow-2xl space-y-8">
            <h2 className="text-2xl font-black flex items-center gap-3">
               <div className="p-2 bg-brand-gold/10 rounded-xl text-brand-gold"><Lightbulb size={24} /></div>
               Daily Wisdom Pulse
            </h2>
            <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-widest ml-1">Tip Title Headline</label>
                  <input
                    className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-brand-gold/50 transition-all shadow-inner font-bold"
                    value={settings.dailyTipTitle}
                    onChange={e => setSettings({...settings, dailyTipTitle: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-widest ml-1">Tip Message Payload</label>
                  <textarea
                    className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-2xl p-6 text-sm focus:outline-none focus:border-brand-gold/50 transition-all shadow-inner italic leading-relaxed"
                    rows={4}
                    value={settings.dailyTipMessage}
                    onChange={e => setSettings({...settings, dailyTipMessage: e.target.value})}
                  />
                </div>
            </div>
          </div>

          <div className="glass p-8 rounded-[2.5rem] shadow-2xl space-y-8">
            <h2 className="text-2xl font-black flex items-center gap-3">
               <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary"><LayoutGrid size={24} /></div>
               Hub Section Priority
            </h2>
            <div className="space-y-3">
              {settings.homeSectionsOrder.map((section, idx) => (
                <div key={section} className="flex items-center justify-between p-4 bg-brand-bg/50 border border-brand-sage/10 rounded-2xl group hover:border-brand-primary/30 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="w-6 h-6 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                    <p className="text-xs font-black uppercase tracking-widest">{section.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        if (idx === 0) return;
                        const newOrder = [...settings.homeSectionsOrder];
                        [newOrder[idx], newOrder[idx-1]] = [newOrder[idx-1], newOrder[idx]];
                        setSettings({...settings, homeSectionsOrder: newOrder});
                      }}
                      className="p-2 hover:bg-brand-primary/10 rounded-lg text-sub hover:text-brand-primary transition-all"
                    >
                      <ChevronRight className="-rotate-90" size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (idx === settings.homeSectionsOrder.length - 1) return;
                        const newOrder = [...settings.homeSectionsOrder];
                        [newOrder[idx], newOrder[idx+1]] = [newOrder[idx+1], newOrder[idx]];
                        setSettings({...settings, homeSectionsOrder: newOrder});
                      }}
                      className="p-2 hover:bg-brand-primary/10 rounded-lg text-sub hover:text-brand-primary transition-all"
                    >
                      <ChevronRight className="rotate-90" size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AppSettingsPage;
