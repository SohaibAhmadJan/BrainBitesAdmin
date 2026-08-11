import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index';
import { isFirebaseConfigured, firebaseInitError, getFirebaseConfigIssues } from './services/firebaseService';

function App() {
  if (!isFirebaseConfigured || firebaseInitError) {
    const configIssues = getFirebaseConfigIssues();
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center text-brand-white antialiased relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-secondary/5 blur-[100px] rounded-full"></div>

        <div className="relative z-10 w-full max-w-lg space-y-8">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto text-red-500 border border-red-500/20 shadow-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-black text-brand-white tracking-tighter">System Offline</h2>
            <p className="text-brand-secondary/60 mt-2 font-medium">Firebase Security Protocol Incomplete</p>
          </div>

          <div className="glass p-8 text-left rounded-[2rem] shadow-2xl border-red-500/10">
             <h3 className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-4">Pending Validation:</h3>
             <ul className="space-y-4">
               {configIssues.map((issue, i) => (
                 <li key={i} className="text-xs text-brand-white/70 flex items-start leading-relaxed">
                   <div className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                   {issue}
                 </li>
               ))}
             </ul>
          </div>

          <p className="text-brand-secondary/30 text-[10px] font-black uppercase tracking-[0.3em] pt-4">Environment Handshake Error • Verify .env</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;
