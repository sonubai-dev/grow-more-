import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Business } from '../types';
import {
  getBusinessesByOwnerFromSupabase,
  createBusinessInSupabase,
  updateBusinessInSupabase,
  upsertProfileInSupabase,
} from '../services/supabaseService';
import { sendSubscriptionStartedEmail } from '../services/emailService';

import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  sendPasswordReset,
} from '../services/authService';
import {
  getBusinessByOwnerId,
  getBusinessesByOwnerId,
  createBusinessProfile,
  updateBusinessProfile,
  CreateBusinessInput,
  UpdateBusinessInput,
} from '../services/businessService';
import {
  verifyUserAdminRole,
  setUserRoleInFirestore,
} from '../services/adminService';
import { AppError } from '../lib/apiError';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  currentBusiness: Business | null;
  userBusinesses: Business[];
  loading: boolean;
  businessLoading: boolean;
  needsOnboarding: boolean;
  isFirebaseConfigured: boolean;
  signup: (
    email: string,
    password: string,
    displayName?: string,
    businessName?: string,
    category?: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  createBusiness: (input: Omit<CreateBusinessInput, 'ownerId'>) => Promise<Business>;
  updateBusiness: (updates: UpdateBusinessInput) => Promise<Business>;
  refreshBusiness: () => Promise<Business | null>;
  updateCurrentBusiness: (updated: Partial<Business>) => void;
  switchBusiness: (businessId: string) => void;
  verifyAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'reviewflow_auth_user';
const LOCAL_STORAGE_BIZ_KEY = 'reviewflow_auth_biz';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [userBusinesses, setUserBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessLoading, setBusinessLoading] = useState(false);

  const inFlightBusinessRef = useRef<{ userId: string; promise: Promise<Business | null> } | null>(null);

  const switchBusiness = (businessId: string) => {
    const biz = userBusinesses.find(b => b.id === businessId);
    if (biz) {
      setCurrentBusiness(biz);
      try {
        localStorage.setItem(LOCAL_STORAGE_BIZ_KEY, JSON.stringify(biz));
      } catch {}
    }
  };

  // Load business from Firestore or local cache with in-flight deduplication
  const loadUserBusiness = async (userId: string, email: string): Promise<Business | null> => {
    if (inFlightBusinessRef.current && inFlightBusinessRef.current.userId === userId) {
      return inFlightBusinessRef.current.promise;
    }

    const fetchPromise = (async () => {
      setBusinessLoading(true);
      try {
        if (isSupabaseConfigured) {
          const supabaseBiz = await getBusinessesByOwnerFromSupabase(userId);
          if (supabaseBiz && supabaseBiz.length > 0) {
            setUserBusinesses(supabaseBiz);
            setCurrentBusiness(supabaseBiz[0]);
            try {
              localStorage.setItem(LOCAL_STORAGE_BIZ_KEY, JSON.stringify(supabaseBiz[0]));
            } catch {}
            return supabaseBiz[0];
          }
        }

        if (isFirebaseConfigured) {
          const allBiz = await getBusinessesByOwnerId(userId, userId);
          setUserBusinesses(allBiz || []);
          
          if (allBiz && allBiz.length > 0) {
            let selectedBiz = allBiz[0];
            const cached = localStorage.getItem(LOCAL_STORAGE_BIZ_KEY);
            if (cached) {
              const parsed: Business = JSON.parse(cached);
              const found = allBiz.find(b => b.id === parsed.id);
              if (found) {
                selectedBiz = found;
              }
            }

            setCurrentBusiness(selectedBiz);
            try {
              localStorage.setItem(LOCAL_STORAGE_BIZ_KEY, JSON.stringify(selectedBiz));
            } catch {}
            return selectedBiz;
          }
        }

        // Check local cache if offline or no businesses
        const cached = localStorage.getItem(LOCAL_STORAGE_BIZ_KEY);
        if (cached) {
          const parsed: Business = JSON.parse(cached);
          if (parsed.ownerId === userId || parsed.contactEmail === email) {
            setCurrentBusiness(parsed);
            setUserBusinesses([parsed]);
            return parsed;
          }
        }

        setCurrentBusiness(null);
        setUserBusinesses([]);
        return null;
      } catch (err) {
        console.warn('Error loading user business from Firestore:', err);
        setCurrentBusiness(null);
        setUserBusinesses([]);
        return null;
      } finally {
        setBusinessLoading(false);
        inFlightBusinessRef.current = null;
      }
    })();

    inFlightBusinessRef.current = { userId, promise: fetchPromise };
    return fetchPromise;
  };

  // Safe session initialization
  useEffect(() => {
    let unsubscribed = false;

    if (isSupabaseConfigured) {
      // 1. Get initial Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (unsubscribed) return;
        if (session?.user) {
          const email = session.user.email || '';
          const displayName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0];
          const adminEmailsStr = import.meta.env.VITE_ADMIN_EMAILS || 'admin@zellonai.online,ssdd747346@gmail.com';
          const adminEmails = adminEmailsStr.split(',').map((e: string) => e.trim().toLowerCase());
          const isAdmin = adminEmails.includes(email.toLowerCase());

          // Ensure profile exists in profiles table
          upsertProfileInSupabase(session.user.id, email, displayName, isAdmin ? 'admin' : 'business_owner').catch(console.warn);

          const appUser: User = {
            id: session.user.id,
            email,
            name: displayName,
            role: isAdmin ? 'admin' : 'business',
            avatarUrl: session.user.user_metadata?.avatar_url,
          };
          setUser(appUser);
          if (!isAdmin) {
            loadUserBusiness(session.user.id, email);
          }
        }
        setLoading(false);
      });

      // 2. Subscribe to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (unsubscribed) return;
        if (session?.user) {
          const email = session.user.email || '';
          const displayName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0];
          const adminEmailsStr = import.meta.env.VITE_ADMIN_EMAILS || 'admin@zellonai.online,ssdd747346@gmail.com';
          const adminEmails = adminEmailsStr.split(',').map((e: string) => e.trim().toLowerCase());
          const isAdmin = adminEmails.includes(email.toLowerCase());

          // Ensure profile exists in profiles table
          upsertProfileInSupabase(session.user.id, email, displayName, isAdmin ? 'admin' : 'business_owner').catch(console.warn);

          const appUser: User = {
            id: session.user.id,
            email,
            name: displayName,
            role: isAdmin ? 'admin' : 'business',
            avatarUrl: session.user.user_metadata?.avatar_url,
          };
          setUser(appUser);
          if (!isAdmin) {
            await loadUserBusiness(session.user.id, email);
          }
        } else {
          setUser(null);
          setCurrentBusiness(null);
        }
        setLoading(false);
      });

      return () => {
        unsubscribed = true;
        subscription.unsubscribe();
      };
    } else if (isFirebaseConfigured && auth) {
      try {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          setFirebaseUser(fbUser);
          if (fbUser) {
            const email = fbUser.email || '';
            const displayName = fbUser.displayName || email.split('@')[0] || 'User';
            
            const isVerifiedAdmin = await verifyUserAdminRole(fbUser.uid);

            const appUser: User = {
              id: fbUser.uid,
              email: email,
              name: displayName,
              role: isVerifiedAdmin ? 'admin' : 'business',
              avatarUrl: fbUser.photoURL || undefined,
            };
            setUser(appUser);

            if (!isVerifiedAdmin) {
              await loadUserBusiness(fbUser.uid, email);
            } else {
              setCurrentBusiness(null);
            }
          } else {
            setUser(null);
            setCurrentBusiness(null);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.warn('onAuthStateChanged error:', err);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const verifyAdminStatus = async (): Promise<boolean> => {
    if (user?.id) {
      return await verifyUserAdminRole(user.id);
    }
    return user?.role === 'admin';
  };

  const signup = async (
    email: string,
    password: string,
    displayName?: string,
    businessName?: string,
    category?: string
  ) => {
    const resolvedName = displayName || email.split('@')[0];

    // Store pending onboarding info for BusinessOnboardingView
    if (businessName || category) {
      try {
        localStorage.setItem(
          'reviewflow_pending_onboarding',
          JSON.stringify({
            businessName: businessName || '',
            category: category || '',
            ownerName: resolvedName,
          })
        );
      } catch (e) {
        console.warn('Failed to save pending onboarding data', e);
      }
    }

    if (!isSupabaseConfigured && (!isFirebaseConfigured || !auth)) {
      throw new Error('Sign up is currently unavailable. Please check system configuration.');
    }

    const createdUser = await signUpWithEmail(email, password, resolvedName);
    const uid = createdUser?.uid;
    
    if (!uid) {
      throw new Error('Sign up failed: Missing UID.');
    }

    if (isSupabaseConfigured) {
      await upsertProfileInSupabase(uid, email, resolvedName, 'business_owner');
    } else if (isFirebaseConfigured) {
      // Initialize user record in Firestore with non-admin role
      await setUserRoleInFirestore(uid, email, 'business', resolvedName);
    }

    const appUser: User = {
      id: uid,
      email: email,
      name: resolvedName,
      role: 'business',
      avatarUrl: undefined,
    };
    setUser(appUser);
    setCurrentBusiness(null); // Triggers onboarding
  };

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured && (!isFirebaseConfigured || !auth)) {
      throw new Error('Authentication is currently unavailable. Please check system configuration.');
    }
    const loggedInUser = await signInWithEmail(email, password);
    const displayName = loggedInUser?.displayName || email.split('@')[0];
    const uid = loggedInUser?.uid;
    
    if (!uid) {
      throw new Error('Authentication failed: Missing UID.');
    }
    
    const adminEmailsStr = import.meta.env.VITE_ADMIN_EMAILS || 'admin@zellonai.online,ssdd747346@gmail.com';
    const adminEmails = adminEmailsStr.split(',').map((e: string) => e.trim().toLowerCase());
    const isVerifiedAdmin = adminEmails.includes((loggedInUser?.email || email).toLowerCase()) || (isFirebaseConfigured ? await verifyUserAdminRole(uid) : false);

    if (isSupabaseConfigured) {
      await upsertProfileInSupabase(uid, loggedInUser?.email || email, displayName, isVerifiedAdmin ? 'admin' : 'business_owner');
    }

    const appUser: User = {
      id: uid,
      email: loggedInUser?.email || email,
      name: displayName,
      role: isVerifiedAdmin ? 'admin' : 'business',
      avatarUrl: undefined,
    };
    setUser(appUser);

    if (!isVerifiedAdmin) {
      await loadUserBusiness(uid, loggedInUser?.email || email);
    } else {
      setCurrentBusiness(null);
    }
  };

  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured && (!isFirebaseConfigured || !auth)) {
      throw new Error('Google Sign-in is currently unavailable.');
    }
    const gUser = await signInWithGoogle();
    if (!gUser) {
      // For Supabase OAuth, it redirects to the provider so nothing further is needed here
      return;
    }
    const email = gUser.email || '';
    const name = gUser.displayName || email.split('@')[0] || 'Google User';
    const adminEmailsStr = import.meta.env.VITE_ADMIN_EMAILS || 'admin@zellonai.online,ssdd747346@gmail.com';
    const adminEmails = adminEmailsStr.split(',').map((e: string) => e.trim().toLowerCase());
    const isVerifiedAdmin = adminEmails.includes(email.toLowerCase()) || (isFirebaseConfigured ? await verifyUserAdminRole(gUser.uid) : false);

    if (isSupabaseConfigured) {
      await upsertProfileInSupabase(gUser.uid, email, name, isVerifiedAdmin ? 'admin' : 'business_owner');
    }

    const appUser: User = {
      id: gUser.uid,
      email: email,
      name: name,
      role: isVerifiedAdmin ? 'admin' : 'business',
      avatarUrl: undefined,
    };

    setUser(appUser);
    if (!isVerifiedAdmin) {
      await loadUserBusiness(gUser.uid, email);
    } else {
      setCurrentBusiness(null);
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setUser(null);
    setFirebaseUser(null);
    setCurrentBusiness(null);
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('reviewflow_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      console.warn('Error clearing cache on logout:', e);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordReset(email);
  };

  const createBusiness = async (input: Omit<CreateBusinessInput, 'ownerId'>): Promise<Business> => {
    if (!user) throw new AppError('You must be signed in to create a business profile.', 401, 'UNAUTHORIZED');
    let newBiz: Business;
    if (isSupabaseConfigured) {
      newBiz = await createBusinessInSupabase({
        ...input,
        ownerId: user.id,
      });
    } else {
      newBiz = await createBusinessProfile({
        ...input,
        ownerId: user.id,
      });
    }
    setCurrentBusiness(newBiz);
    try {
      localStorage.setItem(LOCAL_STORAGE_BIZ_KEY, JSON.stringify(newBiz));
    } catch {}

    // Dispatch subscription started notification to user and admin
    sendSubscriptionStartedEmail({
      to: newBiz.contactEmail || user.email,
      ownerName: newBiz.ownerName || user.name,
      businessName: newBiz.name || newBiz.businessName,
      planName: '₹499 Premium Plan',
      amount: '₹499 / month',
      trialDays: 14,
    }).catch(console.warn);

    return newBiz;
  };

  const updateBusiness = async (updates: UpdateBusinessInput): Promise<Business> => {
    if (!currentBusiness) throw new AppError('No active business profile to update.', 404, 'NOT_FOUND');
    if (!user) throw new AppError('You must be signed in to update your business profile.', 401, 'UNAUTHORIZED');

    let updated: Business;
    if (isSupabaseConfigured) {
      updated = await updateBusinessInSupabase(currentBusiness.id, updates as any);
    } else {
      updated = await updateBusinessProfile(currentBusiness.id, user.id, updates);
    }
    setCurrentBusiness(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_BIZ_KEY, JSON.stringify(updated));
    } catch {}
    return updated;
  };

  const refreshBusiness = async (): Promise<Business | null> => {
    if (!user) return null;
    return await loadUserBusiness(user.id, user.email);
  };

  // Remove loginAsBusiness and loginAsAdmin

  const updateCurrentBusiness = (updated: Partial<Business>) => {
    if (currentBusiness) {
      setCurrentBusiness((prev) => {
        const next = prev ? { ...prev, ...updated } : null;
        if (next) {
          try {
            localStorage.setItem(LOCAL_STORAGE_BIZ_KEY, JSON.stringify(next));
          } catch {}
        }
        return next;
      });
    }
  };

  const needsOnboarding = Boolean(
    !loading && !businessLoading && user && user.role === 'business' && !currentBusiness
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        currentBusiness,
        userBusinesses,
        loading,
        businessLoading,
        needsOnboarding,
        isFirebaseConfigured,
        signup,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        createBusiness,
        updateBusiness,
        refreshBusiness,
        updateCurrentBusiness,
        switchBusiness,
        verifyAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

