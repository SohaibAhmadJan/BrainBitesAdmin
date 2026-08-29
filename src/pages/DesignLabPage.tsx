import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Smartphone,
  Layout,
  Zap,
  Clock,
  ShieldCheck,
  ArrowRight,
  Mail,
  Lock,
  ChevronRight,
  User,
  Heart,
  Eye,
  CheckCircle2,
  AlertCircle,
  Activity,
  Trophy
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useTheme } from '../context/ThemeContext';
import PremiumCard from '../components/ui/PremiumCard';
import ElasticButton from '../components/ui/ElasticButton';

const SectionHeader = ({ title, desc }: { title: string, desc: string }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold tracking-tight text-brand-primary uppercase">{title}</h2>
    <p className="text-sm text-sub font-medium mt-1">{desc}</p>
  </div>
);

const DesignLabPage = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('PROTOTYPES');

  return (
    <div className="space-y-16 pb-20">
      {/* Page Hero */}
      <div className="glass p-10 rounded-3xl border-brand-primary/20 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-4 italic">
            UI <span className="text-brand-primary">Design Lab</span>
          </h1>
          <p className="text-lg text-sub font-medium max-w-2xl leading-relaxed">
            Welcome to the experimental zone. Here you can visually inspect 4 major professional UI recommendations before we apply them globally to BrainBites Admin.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 blur-[120px] rounded-full" />
      </div>

      {/* 1. PROTOTYPE: Split-Screen Auth */}
      <section>
        <SectionHeader
          title="1. The Split-Screen Auth"
          desc="Inspired by Metronic & Horizon UI. Moves away from centered cards to an immersive brand experience."
        />
        <div className="glass overflow-hidden rounded-3xl grid grid-cols-1 lg:grid-cols-2 h-[600px] shadow-2xl">
          {/* Brand Side */}
          <div className="hidden lg:flex bg-brand-bg relative items-center justify-center p-20 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-transparent" />
             <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-brand-primary rounded-3xl mx-auto mb-8 shadow-2xl flex items-center justify-center">
                  <Monitor size={40} className="text-white" />
                </div>
                <h3 className="text-4xl font-black tracking-tighter uppercase mb-4">Deep Insight Protocol</h3>
                <p className="text-brand-secondary font-bold uppercase tracking-[0.3em] text-xs">Administrative Core v2.0</p>
             </div>
             {/* Decorative drifting particles would go here */}
             <motion.div
               animate={{ y: [0, -20, 0] }}
               transition={{ duration: 5, repeat: Infinity }}
               className="absolute bottom-20 left-20 w-32 h-32 bg-brand-primary/5 blur-3xl rounded-full"
             />
          </div>
          {/* Form Side */}
          <div className={cn("flex flex-col justify-center p-12 lg:p-20", theme === 'dark' ? "bg-brand-surface" : "bg-white")}>
             <div className="max-w-md w-full mx-auto space-y-8">
                <div>
                   <h4 className="text-3xl font-bold tracking-tight">Access Registry</h4>
                   <p className="text-sub text-sm mt-2">Identify yourself to continue to the dashboard.</p>
                </div>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Credential ID</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-sub/30" size={18} />
                        <input className="w-full bg-brand-bg/5 border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-brand-primary/50 transition-all" placeholder="admin@brainbites.com" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Security Token</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sub/30" size={18} />
                        <input type="password"  className="w-full bg-brand-bg/5 border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-brand-primary/50 transition-all" placeholder="••••••••" />
                      </div>
                   </div>
                </div>
                <ElasticButton className="w-full py-4 rounded-xl shadow-xl">
                   Synchronize Identity <ArrowRight className="ml-2" size={18} />
                </ElasticButton>
             </div>
          </div>
        </div>
      </section>

      {/* 2. PROTOTYPE: Bento Grid Dashboard */}
      <section>
        <SectionHeader
          title="2. Bento Grid Metrics"
          desc="Inspired by Apple & Modern SaaS. Replaces rigid rows with modular, proportional data tiles."
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Stat (Large) */}
          <PremiumCard className="md:col-span-2 md:row-span-2 p-10 flex flex-col justify-between" glowColor="rgba(45, 106, 79, 0.1)">
             <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-brand-primary">System Population</p>
                <h3 className="text-6xl font-black tracking-tighter tabular-nums">12,842</h3>
             </div>
             <div className="pt-8 border-t border-brand-sage/10 mt-8">
                <div className="flex justify-between items-end">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-sub uppercase">Weekly Velocity</p>
                      <p className="text-xl font-black text-brand-primary">+12% GROWTH</p>
                   </div>
                   <div className="h-16 w-32 bg-brand-primary/10 rounded-xl" /> {/* Placeholder for mini chart */}
                </div>
             </div>
          </PremiumCard>

          {/* Secondary Stats */}
          <PremiumCard className="p-8 group hover:scale-[1.02] transition-transform">
             <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-6">
                <Clock size={24} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-sub opacity-50">Active Now</p>
             <h4 className="text-3xl font-black tracking-tight mt-1">428</h4>
          </PremiumCard>

          <PremiumCard className="p-8 group hover:scale-[1.02] transition-transform">
             <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-6">
                <Trophy size={24} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-sub opacity-50">Awards Won</p>
             <h4 className="text-3xl font-black tracking-tight mt-1">1,204</h4>
          </PremiumCard>

          {/* Medium Widget */}
          <PremiumCard className="md:col-span-2 p-8 flex items-center justify-between">
             <div className="flex items-center gap-6">
                <div className="p-4 bg-brand-primary/10 rounded-2xl text-brand-primary"><ShieldCheck size={28} /></div>
                <div>
                   <h4 className="text-xl font-bold tracking-tight">Security Audit</h4>
                   <p className="text-xs text-sub font-medium">All protocols reporting optimal status</p>
                </div>
             </div>
             <button className="p-3 glass rounded-xl text-brand-primary hover:bg-brand-primary hover:text-white transition-all">
                <ChevronRight size={20} />
             </button>
          </PremiumCard>
        </div>
      </section>

      {/* 3. PROTOTYPE: Activity Timeline */}
      <section>
        <SectionHeader
          title="3. User Activity Timeline"
          desc="Inspired by Metronic. A clean chronological trace for deeper identity inspection."
        />
        <div className="glass p-10 rounded-3xl space-y-12 relative overflow-hidden">
           {/* Timeline Line */}
           <div className="absolute left-[59px] top-20 bottom-20 w-0.5 bg-brand-primary/10" />

           {[
             { time: '12:42 PM', user: 'Sohaib', action: 'Read Insight #104', sub: 'The Psychology of Habit', icon: Eye, color: 'text-brand-primary' },
             { time: '11:15 AM', user: 'User_492', action: 'Award Earned: Early Bird', sub: 'Completed 5 facts before 9 AM', icon: Trophy, color: 'text-brand-gold' },
             { time: '09:30 AM', user: 'Knowledge Seeker', action: 'Identity Sync', sub: 'Logged in via Google Auth', icon: User, color: 'text-brand-secondary' },
             { time: 'Yesterday', user: 'Admin_Root', action: 'System Update', sub: 'Published 12 new psychology nodes', icon: Activity, color: 'text-brand-primary' },
           ].map((event, i) => (
             <div key={i} className="flex gap-10 items-start relative z-10 group">
                <div className="w-10 text-right">
                   <p className="text-[9px] font-black uppercase text-sub opacity-40 mt-1">{event.time}</p>
                </div>
                <div className={cn("w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center border-2 border-brand-sage/10 transition-transform group-hover:scale-110", event.color)}>
                   <event.icon size={20} />
                </div>
                <div className="flex-1">
                   <p className="text-sm font-bold tracking-tight">
                      <span className="text-brand-primary font-black uppercase tracking-tighter mr-2">{event.user}</span>
                      {event.action}
                   </p>
                   <p className="text-xs text-sub font-medium italic opacity-60 mt-1">{event.sub}</p>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* 4. PROTOTYPE: High-Fidelity Glass Depth */}
      <section>
        <SectionHeader
          title="4. Glass Depth Variations"
          desc="Testing the 'Zero-Gravity' feel. Which level of transparency and blur feels most premium?"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 p-10 bg-brand-bg rounded-3xl border-2 border-dashed border-brand-sage/20 relative overflow-hidden">

           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070')] bg-cover opacity-10" />

           {/* Variant A: Frost White */}
           <div className="relative z-10 glass p-10 bg-white/40 border-white/20 backdrop-blur-md shadow-2xl flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border border-white/30"><Zap className="text-white" /></div>
              <h4 className="text-lg font-bold text-white uppercase tracking-widest">Minimal Frost</h4>
              <p className="text-xs text-white/60">Subtle blur, high transparency. Light and airy.</p>
           </div>

           {/* Variant B: Emerald Depth */}
           <div className="relative z-10 glass p-10 bg-brand-primary/10 border-brand-primary/30 backdrop-blur-2xl shadow-[0_20px_60px_rgba(45,106,79,0.3)] flex flex-col items-center text-center space-y-4 border-2">
              <div className="w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center border border-brand-primary/40"><Zap className="text-brand-primary" /></div>
              <h4 className="text-lg font-bold text-brand-primary uppercase tracking-widest">Deep Emerald</h4>
              <p className="text-xs text-brand-primary/60">Heavy blur, tinted border. Immersive and branded.</p>
           </div>

           {/* Variant C: Obsidian Glass */}
           <div className="relative z-10 glass p-10 bg-black/60 border-brand-sage/30 backdrop-blur-3xl shadow-2xl flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10"><Zap className="text-brand-secondary" /></div>
              <h4 className="text-lg font-bold text-brand-white uppercase tracking-widest">Obsidian Focus</h4>
              <p className="text-xs text-brand-white/40">Dark mode primary. Maximum contrast for readability.</p>
           </div>

        </div>
      </section>
    </div>
  );
};

export default DesignLabPage;
