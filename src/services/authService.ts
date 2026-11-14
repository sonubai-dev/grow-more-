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
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Maps Auth error codes to user-friendly messages.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'An unexpected authentication error occurred. Please try again.';
  }

  const err = error as { code?: string; message?: string };
  const code = err.code || '';
  const message = err.message || '';

  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please verify your credentials.';
  }
  if (message.includes('User already registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Please check your email inbox and click the verification link to activate your account.';
  }

  switch (code) {
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid':
      return 'API Key is missing or invalid. Please check your environment variables.';
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
      return 'This sign-in method is not enabled. Please enable Email/Password or Google provider in settings.';
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in window was closed before completing authentication.';
    case 'auth/popup-blocked':
      return 'Google sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/network-request-failed':
      return 'A network connection error occurred. Please check your internet connection.';
    default:
      return message || 'Authentication failed. Please check your details and try again.';
  }
}

/**
 * Register a new user with Email and Password and optional displayName.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<{ uid: string; email: string; displayName?: string } | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: displayName || email.split('@')[0],
          name: displayName || email.split('@')[0],
        },
      },
    });
    if (error) throw error;
    if (data.user) {
      return {
        uid: data.user.id,
        email: data.user.email || email,
        displayName: displayName || email.split('@')[0],
      };
    }
  }

  if (isFirebaseConfigured && auth) {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email || email,
      displayName: userCredential.user.displayName || displayName,
    };
  }

  // Fallback demo user
  return {
    uid: 'user-' + Date.now(),
    email,
    displayName: displayName || email.split('@')[0],
  };
}

/**
 * Sign in existing user with Email and Password.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ uid: string; email: string; displayName?: string } | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    if (data.user) {
      return {
        uid: data.user.id,
        email: data.user.email || email,
        displayName: data.user.user_metadata?.full_name || data.user.user_metadata?.name || email.split('@')[0],
      };
    }
  }

  if (isFirebaseConfigured && auth) {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email || email,
      displayName: userCredential.user.displayName || email.split('@')[0],
    };
  }

  return {
    uid: 'user-demo',
    email,
    displayName: email.split('@')[0],
  };
}

/**
 * Sign in or sign up with Google popup.
 */
export async function signInWithGoogle(): Promise<{ uid: string; email: string; displayName?: string } | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw error;
    return null; // Will redirect via OAuth
  }

  if (isFirebaseConfigured && auth && googleProvider) {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email || '',
      displayName: userCredential.user.displayName || 'Google User',
    };
  }

  throw new Error('Google Sign-in requires configured Auth providers.');
}

/**
 * Send password reset email.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/dashboard`,
    });
    return;
  }
  if (isFirebaseConfigured && auth) {
    await sendPasswordResetEmail(auth, email.trim());
  }
}

/**
 * Sign out current authenticated user.
 */
export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
}
