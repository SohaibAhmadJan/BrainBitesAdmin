import React, { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, LogOut, RefreshCcw, Lock } from 'lucide-react';
import { isFirebaseConfigured, firebaseInitError, signInAdmin, signOutAdmin } from './services/firebaseService';
import { AdminProvider, useAdmin } from './context/AdminContext';
import ElasticButton from './components/ui/ElasticButton';

interface AuthProps {
  children: ReactNode;
}

const AuthContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { firebaseUser, adminUser, isLoading, isAuthorized } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSigningIn(true);
    try {
      await signInAdmin(email, password);
    } catch (err: any) {
      setError(err.message || 'Identity validation failed. Please retry.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutAdmin();
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin shadow-[0_0_30px_rgba(45,106,79,0.3)] mb-6"></div>
        <p className="text-brand-secondary/40 font-black tracking-[0.4em] text-[10px] uppercase animate-pulse">Syncing Identity Stream</p>
      </div>
    );
  }

  // CASE 1: Not logged into Firebase
  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 antialiased relative overflow-hidden">
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
                disabled={isSigningIn}
                className="w-full py-5 bg-brand-primary hover:bg-brand-primary/90 text-brand-white font-black rounded-2xl transition-all shadow-[0_20px_50px_rgba(45,106,79,0.3)] tracking-[0.3em] text-xs uppercase flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSigningIn ? <RefreshCcw size={18} className="animate-spin" /> : <Lock size={18} />}
                Initiate Handshake
              </motion.button>
            </form>
          </div>
          <p className="text-center text-brand-secondary/20 text-[9px] font-bold tracking-[0.4em] uppercase">Encrypted Multi-Factor Protocol Active</p>
        </motion.div>
      </div>
    );
  }

  // CASE 2: Logged in via Firebase, but NOT an authorized Admin
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 antialiased relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_50%,rgba(239,68,68,0.1),transparent)]"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl glass p-16 rounded-[4rem] border-red-500/20 shadow-2xl text-center space-y-10 relative z-10"
        >
          <div className="w-24 h-24 bg-red-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto text-red-500 shadow-lg shadow-red-500/20">
             <ShieldAlert size={48} strokeWidth={2.5} />
          </div>

          <div className="space-y-4">
             <h2 className="text-4xl font-black text-brand-white tracking-tighter uppercase">Access Denied</h2>
             <p className="text-brand-secondary/60 text-base font-medium max-w-md mx-auto leading-relaxed">
               Your identity signature <span className="text-brand-white font-black">{firebaseUser.email}</span> is not registered within the Administrative Registry or has been deactivated.
             </p>
          </div>

          <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl space-y-2">
             <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Protocol Failure: ERROR_ADMIN_NOT_FOUND</p>
             <p className="text-[9px] text-brand-secondary/40 font-bold uppercase">Contact a SUPER_ADMIN to authorize this node.</p>
          </div>

          <div className="pt-4 flex flex-col gap-4">
             <ElasticButton
               variant="danger"
               className="w-full py-5 rounded-2xl text-xs uppercase tracking-[0.3em] font-black"
               onClick={handleSignOut}
             >
                <LogOut size={18} />
                Switch Identifier
             </ElasticButton>
          </div>
        </motion.div>
      </div>
    );
  }

  // CASE 3: Fully Authorized Admin
  return <>{children}</>;
};

function Auth({ children }: AuthProps) {
  // If config issues exist, we let App.tsx handle the error UI
  if (!isFirebaseConfigured || firebaseInitError) {
    return <>{children}</>;
  }

  return (
    <AdminProvider>
      <AuthContent>
        {children}
      </AuthContent>
    </AdminProvider>
  );
}

export default Auth;
