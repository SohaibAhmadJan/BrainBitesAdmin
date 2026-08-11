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
  Monitor
} from 'lucide-react';
import { AppSettings } from '../../types';
import { fetchAppSettings, updateAppSettings, createAuditLog } from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

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
      dailyFactEnabled: true
    }
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
    if (data) setSettings(data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAppSettings(settings);
      await createAuditLog({
        adminEmail: 'master@brainbites.com',
        action: 'UPDATE_SYSTEM_SETTINGS',
        details: `Maintenance: ${settings.maintenanceMode}, Version: ${settings.latestVersion}`
      });
      toast.success('System configuration updated successfully.');
    } catch (err) {
      toast.error('System update failed');
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
    <div className="max-w-6xl space-y-8 animate-in fade-in duration-700">

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left: Core Config & Theme */}
        <div className="space-y-8">
          <div className="glass p-8 rounded-[2.5rem] shadow-2xl space-y-8">
            <h2 className="text-2xl font-black flex items-center gap-3">
               <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary"><Monitor size={24} /></div>
               Appearance & Branding
            </h2>

            <div className="space-y-4">
               <div className="flex items-center justify-between p-5 bg-brand-bg/50 border border-brand-sage/20 rounded-3xl group hover:border-brand-primary/30 transition-all">
                  <div className="flex gap-4 items-center">
                    <div className="p-3 bg-brand-surface rounded-2xl text-brand-primary shadow-lg">
                       {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <div>
                       <p className="text-sm font-black tracking-tight">Interface Theme</p>
                       <p className="text-[10px] text-brand-secondary/40 font-medium uppercase tracking-widest">Toggle between light and dark mode</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={cn(
                      "w-14 h-8 rounded-full relative transition-all duration-500",
                      theme === 'light' ? "bg-brand-primary shadow-[0_0_15px_rgba(45,106,79,0.3)]" : "bg-brand-sage"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-md",
                      theme === 'light' ? "left-7" : "left-1"
                    )} />
                  </button>
               </div>
            </div>
          </div>

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
                  className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-2xl p-4 text-sm focus:outline-none focus:border-red-500/50 transition-all shadow-inner"
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
        </div>

        {/* Right: Feature Flags */}
        <div className="space-y-8">
           <div className="glass p-8 rounded-[2.5rem] shadow-2xl space-y-8">
              <h2 className="text-2xl font-black flex items-center gap-3">
                 <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary"><Flag size={24} /></div>
                 Feature Manifest
              </h2>

              <div className="space-y-4">
                 {[
                   { id: 'quizzesEnabled', label: 'Psychometric Challenges', desc: 'Enable quiz repository & point system', icon: Info },
                   { id: 'achievementsEnabled', label: 'Reward Milestones', desc: 'Active achievement tracking & notifications', icon: Info },
                   { id: 'dailyFactEnabled', label: 'Smart Daily Insights', desc: 'Automated "Fact of the Day" delivery', icon: Info },
                 ].map((flag) => (
                   <div key={flag.id} className="flex items-center justify-between p-5 bg-brand-bg/50 border border-brand-sage/20 rounded-3xl group hover:border-brand-primary/30 transition-all">
                      <div className="flex gap-4 items-center">
                         <div className="p-2 bg-brand-surface rounded-xl text-brand-secondary/60 group-hover:text-brand-primary transition-colors border border-brand-sage/10">
                           <flag.icon size={16} />
                         </div>
                         <div>
                            <p className="text-sm font-black tracking-tight">{flag.label}</p>
                            <p className="text-[10px] text-brand-secondary/40 font-medium uppercase tracking-tighter">{flag.desc}</p>
                         </div>
                      </div>
                      <button
                        onClick={() => setSettings({
                          ...settings,
                          featureFlags: { ...settings.featureFlags, [flag.id]: !((settings.featureFlags as any)[flag.id]) }
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

              <div className="p-6 bg-brand-gold/5 border border-brand-gold/10 rounded-3xl flex gap-4">
                 <AlertTriangle className="text-brand-gold shrink-0" size={20} />
                 <p className="text-[10px] text-brand-secondary/40 font-bold leading-relaxed uppercase tracking-tight">
                   Changes to Feature Manifest are propagated to mobile clients via real-time listeners. Disabling a core feature may affect user progress tracking.
                 </p>
              </div>
           </div>

           <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-5 bg-brand-primary hover:bg-brand-primary/90 text-brand-white font-black rounded-[2rem] transition-all shadow-2xl shadow-brand-primary/30 active:scale-[0.98] uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 disabled:opacity-50"
           >
             {saving ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />}
             Commit Changes to Engine
           </button>
        </div>

      </div>
    </div>
  );
};

export default AppSettingsPage;
