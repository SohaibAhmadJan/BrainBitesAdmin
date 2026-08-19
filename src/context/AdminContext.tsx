import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, observeAuthState } from '../services/firebaseService';
import { AdminUser, AdminRole } from '../types';

interface AdminContextType {
  adminUser: AdminUser | null;
  firebaseUser: User | null;
  isLoading: boolean;
  isAuthorized: boolean;
  hasPermission: (permission: string) => boolean;
  isRole: (role: AdminRole | AdminRole[]) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = observeAuthState((user) => {
      setFirebaseUser(user);
      if (!user) {
        setAdminUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!firebaseUser || !db) return;

    setIsLoading(true);
    const adminDocRef = doc(db, 'admins', firebaseUser.uid);

    // Use onSnapshot for real-time status/role updates (e.g. if access is revoked while logged in)
    const unsubscribeAdmin = onSnapshot(adminDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AdminUser;
        setAdminUser({ ...data, uid: snapshot.id });
      } else {
        setAdminUser(null);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Admin verification failed:", error);
      setAdminUser(null);
      setIsLoading(false);
    });

    return () => unsubscribeAdmin();
  }, [firebaseUser]);

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

  const isAuthorized = !!adminUser && adminUser.isActive;

  return (
    <AdminContext.Provider value={{
      adminUser,
      firebaseUser,
      isLoading,
      isAuthorized,
      hasPermission,
      isRole
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
