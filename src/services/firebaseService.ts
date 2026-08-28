import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Known placeholder values that indicate the user hasn't replaced them yet.
const PLACEHOLDER_VALUES = [
  'YOUR_WEB_APP_ID',
  'YOUR_API_KEY',
  'YOUR_AUTH_DOMAIN',
  'YOUR_PROJECT_ID',
  'YOUR_STORAGE_BUCKET',
  'YOUR_MESSAGING_SENDER_ID',
  'YOUR_APP_ID',
  '',
  undefined,
];

const isPlaceholder = (value: string | undefined): boolean =>
  !value || PLACEHOLDER_VALUES.includes(value);

let _firebaseApp: any = null;
let _firebaseInitError: string | null = null;

// Validate config presence before initializing to prevent internal Firebase throw
const hasConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.storageBucket,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
].every((value) => typeof value === 'string' && value.length > 0 && !isPlaceholder(value));

if (hasConfig) {
  try {
    _firebaseApp = initializeApp(firebaseConfig);
  } catch (err) {
    console.error('Firebase initialization failed:', err);
    _firebaseInitError = err instanceof Error ? err.message : String(err);
  }
} else {
  _firebaseInitError = 'Configuration keys missing or set to placeholders.';
}

export const firebaseInitError = _firebaseInitError;
export const firebaseApp = _firebaseApp;
export const auth = _firebaseApp ? getAuth(_firebaseApp) : null;
export const db = _firebaseApp ? getFirestore(_firebaseApp) : null;
export const storage = _firebaseApp ? getStorage(_firebaseApp) : null;

export const isFirebaseConfigured = hasConfig && !_firebaseInitError;

export const getFirebaseConfigIssues = (): string[] => {
  const issues: string[] = [];
  if (isPlaceholder(firebaseConfig.apiKey)) issues.push('VITE_FIREBASE_API_KEY is invalid.');
  if (isPlaceholder(firebaseConfig.authDomain)) issues.push('VITE_FIREBASE_AUTH_DOMAIN is invalid.');
  if (isPlaceholder(firebaseConfig.projectId)) issues.push('VITE_FIREBASE_PROJECT_ID is invalid.');
  if (isPlaceholder(firebaseConfig.storageBucket)) issues.push('VITE_FIREBASE_STORAGE_BUCKET is invalid.');
  if (isPlaceholder(firebaseConfig.messagingSenderId)) issues.push('VITE_FIREBASE_MESSAGING_SENDER_ID is invalid.');
  if (isPlaceholder(firebaseConfig.appId)) issues.push('VITE_FIREBASE_APP_ID is invalid.');
  if (_firebaseInitError && hasConfig) issues.push(`Initialization Error: ${_firebaseInitError}`);
  return issues;
};

export const signInAdmin = (email: string, password: string) => {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return signInWithEmailAndPassword(auth, email, password);
};

export const triggerPasswordReset = (email: string) => {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return sendPasswordResetEmail(auth, email);
};

export const signOutAdmin = () => auth && signOut(auth);

export const observeAuthState = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};
