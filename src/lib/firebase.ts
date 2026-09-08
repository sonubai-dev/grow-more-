import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Configuration loaded exclusively via environment variables
const env = (typeof import.meta !== 'undefined' && (import.meta as any).env)
  ? (import.meta as any).env
  : (typeof process !== 'undefined' && process.env ? process.env : {});

const rawApiKey = (env.VITE_FIREBASE_API_KEY || '').trim();
const rawAuthDomain = (env.VITE_FIREBASE_AUTH_DOMAIN || '').trim();
const rawProjectId = (env.VITE_FIREBASE_PROJECT_ID || '').trim();
const rawStorageBucket = (env.VITE_FIREBASE_STORAGE_BUCKET || '').trim();
const rawMessagingSenderId = (env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim();
const rawAppId = (env.VITE_FIREBASE_APP_ID || '').trim();

export const firebaseConfig = {
  apiKey: rawApiKey,
  authDomain: rawAuthDomain,
  projectId: rawProjectId,
  storageBucket: rawStorageBucket,
  messagingSenderId: rawMessagingSenderId,
  appId: rawAppId,
};

// Check if Firebase is properly configured with valid API keys
export const isFirebaseConfigured = Boolean(
  rawApiKey &&
  rawApiKey.length > 10 &&
  rawApiKey !== 'MY_API_KEY' &&
  !rawApiKey.includes('placeholder')
);

import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let googleProviderInstance: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Initialize Firebase App Check if a site key is provided
    if (typeof window !== 'undefined' && env.VITE_RECAPTCHA_SITE_KEY) {
      initializeAppCheck(appInstance, {
        provider: new ReCaptchaV3Provider(env.VITE_RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true
      });
    }

    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    storageInstance = getStorage(appInstance);
    googleProviderInstance = new GoogleAuthProvider();
    googleProviderInstance.setCustomParameters({ prompt: 'select_account' });
  } catch (err) {
    console.warn('Firebase initialization error:', err);
    appInstance = null;
    authInstance = null;
    dbInstance = null;
    storageInstance = null;
    googleProviderInstance = null;
  }
}

// Test connection to Firestore
export async function testFirestoreConnection(): Promise<boolean> {
  if (!dbInstance) return false;
  try {
    await getDocFromServer(doc(dbInstance, '_health', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore connection offline. Please check network/config.');
    }
    return false;
  }
}

// Exported singletons for use throughout the application
export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;
export const googleProvider = googleProviderInstance;
