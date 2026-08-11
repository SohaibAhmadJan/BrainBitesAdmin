import React, { useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { motion } from 'framer-motion';
import { isFirebaseConfigured, firebaseInitError, observeAuthState, signInAdmin } from './services/firebaseService';

interface AuthProps {
  children: ReactNode;
}

function Auth({ children }: AuthProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // If config issues exist, don't try to observe auth state as it might be null
    if (!isFirebaseConfigured || firebaseInitError) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = observeAuthState((currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return unsubscribe;
    } catch (err) {
      console.error('Auth state observation failed', err);
      setLoading(false);
    }
  }, []);

  // If there's a configuration error, we let App.tsx handle the error UI
  if (!isFirebaseConfigured || firebaseInitError) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center relative overflow-hidden">
        <div className="w-12 h-12 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin shadow-[0_0_20px_rgba(45,106,79,0.2)]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 antialiased relative overflow-hidden">
        {/* Animated Mesh Background */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-primary/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-secondary/5 blur-[120px] rounded-full"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg space-y-10 relative z-10"
        >
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-black text-brand-white tracking-tighter flex items-center justify-center gap-3">
               <div className="w-3 h-10 bg-brand-primary rounded-full shadow-[0_0_20px_rgba(45,106,79,0.8)]" />
               BrainBites
            </h1>
            <p className="text-brand-secondary/40 font-black tracking-[0.4em] text-[10px] uppercase">Access Terminal Alpha • Security Root</p>
          </div>

          <div className="glass p-12 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-brand-sage/20 relative overflow-hidden">
            <form onSubmit={signIn} className="space-y-8 relative z-10">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center uppercase tracking-widest"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-secondary/30 uppercase tracking-[0.3em] ml-2">Agent Identifier</label>
                <input
                  type="email"
                  className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-6 py-4 text-brand-white text-base focus:outline-none focus:border-brand-primary transition-all shadow-inner font-medium"
                  placeholder="admin@brainbites.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-secondary/30 uppercase tracking-[0.3em] ml-2">Access Cipher</label>
                <input
                  type="password"
                  className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-6 py-4 text-brand-white text-base focus:outline-none focus:border-brand-primary transition-all shadow-inner font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-5 bg-brand-primary hover:bg-brand-primary/90 text-brand-white font-black rounded-2xl transition-all shadow-[0_20px_50px_rgba(45,106,79,0.3)] tracking-[0.3em] text-xs uppercase"
              >
                Initiate Handshake
              </motion.button>
            </form>
          </div>

          <p className="text-center text-brand-secondary/20 text-[9px] font-bold tracking-[0.4em] uppercase">Encrypted Multi-Factor Protocol Active</p>
        </motion.div>
      </div>
    );
  }

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInAdmin(email, password);
    } catch (err: any) {
      setError(err.message || 'Identity validation failed. Please retry.');
    }
  };

  return <>{children}</>;
}

export default Auth;
