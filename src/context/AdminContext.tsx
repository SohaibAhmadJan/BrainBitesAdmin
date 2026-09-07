import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth, db, observeAuthState } from '../services/firebaseService';
import { setDoc, doc, getDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { AdminUser, AdminRole } from '../types';

interface AdminContextType {
  adminUser: AdminUser | null;
  firebaseUser: User | null;
  isLoading: boolean;
  isAuthorized: boolean;
  hasPermission: (permission: string) => boolean;
  isRole: (role: AdminRole | AdminRole[]) => boolean;
  isAtLeast: (role: AdminRole) => boolean;
}

const ROLE_LEVELS: Record<AdminRole, number> = {
  'ANALYST': 1,        // Viewer
  'CONTENT_MANAGER': 2, // Author
  'ADMIN': 3,          // Administrator
  'SUPER_ADMIN': 4     // Super Administrator
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPerformingHandshake, setIsPerformingHandshake] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = observeAuthState((user) => {
      setFirebaseUser(user);
      if (!user) {
        setAdminUser(null);
        setIsLoading(false);
        setIsPerformingHandshake(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!firebaseUser || !db) return;

    const executeHandshakeProtocol = async () => {
      setIsLoading(true);
      setIsPerformingHandshake(true);

      const uidRef = doc(db, 'admins', firebaseUser.uid);

      try {
        const uidSnap = await getDoc(uidRef);

        // If real UID record already exists, we are done with pre-flight
        if (uidSnap.exists()) {
          console.log("[Identity] Registry match confirmed via UID.");
          setIsPerformingHandshake(false);
          return;
        }

        // If not, check for email-based invitation
        if (firebaseUser.email) {
          const emailId = firebaseUser.email.toLowerCase().replace(/[@.]/g, '_');
          const emailRef = doc(db, 'admins', emailId);
          const emailSnap = await getDoc(emailRef);

          if (emailSnap.exists()) {
            const inviteData = emailSnap.data();
            console.log(`[Handshake] Pre-assigned invitation discovered for ${firebaseUser.email}. Executing migration...`);

            // Perform Atomic Migration
            await setDoc(uidRef, {
              ...inviteData,
              uid: firebaseUser.uid,
              updatedAt: Date.now()
            });
            await deleteDoc(emailRef);
            console.log("[Handshake] Migration SUCCESS.");
          } else {
            console.log("[Identity] No pre-assigned invitation found.");
          }
        }
      } catch (err) {
        console.error("[Handshake] Protocol Exception:", err);
      } finally {
        setIsPerformingHandshake(false);
      }
    };

    executeHandshakeProtocol();
  }, [firebaseUser]);

  useEffect(() => {
    // Wait for the handshake to finish before starting the real-time listener
    if (!firebaseUser || !db || isPerformingHandshake) return;

    const adminDocRef = doc(db, 'admins', firebaseUser.uid);

    const unsubscribeAdmin = onSnapshot(adminDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AdminUser;
        setAdminUser({ ...data, uid: snapshot.id });
      } else {
        setAdminUser(null);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Administrative Registry Listener Error:", error);
      setAdminUser(null);
      setIsLoading(false);
    });

    return () => unsubscribeAdmin();
  }, [firebaseUser, isPerformingHandshake]);

  const hasPermission = (permission: string): boolean => {
    if (!adminUser || !adminUser.isActive) return false;
    if (adminUser.role === 'SUPER_ADMIN') return true;
    return adminUser.permissions.includes(permission);
  };

  const isRole = (role: AdminRole | AdminRole[]): boolean => {
    if (!adminUser || !adminUser.isActive) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(adminUser.role);
  };

  const isAtLeast = (role: AdminRole): boolean => {
    if (!adminUser || !adminUser.isActive) return false;
    return ROLE_LEVELS[adminUser.role] >= ROLE_LEVELS[role];
  };

  const isAuthorized = !!adminUser && adminUser.isActive;

  return (
    <AdminContext.Provider value={{
      adminUser,
      firebaseUser,
      isLoading,
      isAuthorized,
      hasPermission,
      isRole,
      isAtLeast
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
