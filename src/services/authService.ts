import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'An unexpected authentication error occurred. Please try again.';
  }

  const err = error as { code?: string; message?: string };
  const code = err.code || '';

  switch (code) {
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid':
      return 'Firebase API Key is missing or invalid. Please check your environment variables or use Demo Mode.';
    case 'auth/invalid-email':
      return 'The email address is invalid or poorly formatted.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please verify your credentials or reset your password.';
    case 'auth/invalid-credential':
      return 'Invalid login credentials. Please check your email and password.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'The password is too weak. Please use at least 6 characters with letters and numbers.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in Firebase Console. Please enable Email/Password or Google provider in the Authentication settings.';
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in window was closed before completing authentication.';
    case 'auth/popup-blocked':
      return 'Google sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/cancelled-popup-request':
      return 'Multiple popup requests opened simultaneously. Please try again.';
    case 'auth/network-request-failed':
      return 'A network connection error occurred. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Access temporarily disabled due to many failed login attempts. Please reset your password or try again later.';
    case 'auth/requires-recent-login':
      return 'This operation is sensitive and requires recent authentication. Log in again before retrying.';
    case 'auth/unauthorized-domain':
      return 'This app domain is not authorized for OAuth in Firebase Console. Please add this domain to Authorized Domains under Firebase Auth Settings.';
    default:
      if (err.message && (err.message.includes('API key not valid') || err.message.includes('invalid-api-key'))) {
        return 'Firebase API Key is missing or invalid. Please configure VITE_FIREBASE_API_KEY in your settings.';
      }
      return err.message || 'Authentication failed. Please check your details and try again.';
  }
}

/**
 * Register a new user with Email and Password and optional displayName.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<FirebaseUser | null> {
  if (!isFirebaseConfigured || !auth) {
    return null;
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential.user;
}

/**
 * Sign in existing user with Email and Password.
 */
export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser | null> {
  if (!isFirebaseConfigured || !auth) {
    return null;
  }
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return userCredential.user;
}

/**
 * Sign in or sign up with Google popup.
 */
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error('Google Sign-in requires Firebase credentials. Please configure VITE_FIREBASE_API_KEY or use 1-Click Demo Profiles.');
  }
  const userCredential = await signInWithPopup(auth, googleProvider);
  return userCredential.user;
}

/**
 * Send password reset email.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  if (!isFirebaseConfigured || !auth) {
    return; // gracefully resolve in demo mode
  }
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Sign out current authenticated user.
 */
export async function signOutUser(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
}
