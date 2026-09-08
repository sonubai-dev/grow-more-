import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { User, Business } from '../types';
import { MOCK_USERS, MOCK_BUSINESSES } from '../data/mockData';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  sendPasswordReset,
} from '../services/authService';
import {
  getBusinessByOwnerId,
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
  loginAsBusiness: (businessId?: string) => void;
  loginAsAdmin: () => void;
  updateCurrentBusiness: (updated: Partial<Business>) => void;
  verifyAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'reviewflow_auth_user';
const LOCAL_STORAGE_BIZ_KEY = 'reviewflow_auth_biz';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [businessLoading, setBusinessLoading] = useState(false);

  const inFlightBusinessRef = useRef<{ userId: string; promise: Promise<Business | null> } | null>(null);

  // Load business from Firestore or local cache with in-flight deduplication
  const loadUserBusiness = async (userId: string, email: string): Promise<Business | null> => {
    if (inFlightBusinessRef.current && inFlightBusinessRef.current.userId === userId) {
      return inFlightBusinessRef.current.promise;
    }

    const fetchPromise = (async () => {
      setBusinessLoading(true);
      try {
        if (isFirebaseConfigured) {
          const firestoreBiz = await getBusinessByOwnerId(userId, userId);
          if (firestoreBiz) {
            setCurrentBusiness(firestoreBiz);
            try {
              localStorage.setItem(LOCAL_STORAGE_BIZ_KEY, JSON.stringify(firestoreBiz));
            } catch {}
            return firestoreBiz;
          }
        }

        // Check local cache
        const cached = localStorage.getItem(LOCAL_STORAGE_BIZ_KEY);
        if (cached) {
          const parsed: Business = JSON.parse(cached);
          if (parsed.ownerId === userId || parsed.contactEmail === email) {
            setCurrentBusiness(parsed);
            return parsed;
          }
        }

        setCurrentBusiness(null);
        return null;
      } catch (err) {
        console.warn('Error loading user business from Firestore:', err);
        setCurrentBusiness(null);
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
    if (isFirebaseConfigured && auth) {
      try {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          setFirebaseUser(fbUser);
          if (fbUser) {
            const email = fbUser.email || '';
            const displayName = fbUser.displayName || email.split('@')[0] || 'User';
            
            // Securely verify admin authorization via Firebase Custom Claims & Firestore /users document
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
      // Local demo fallback
      try {
        const savedUserStr = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        const savedBizStr = localStorage.getItem(LOCAL_STORAGE_BIZ_KEY);
        if (savedUserStr) {
          const parsedUser = JSON.parse(savedUserStr);
          setUser(parsedUser);
          if (savedBizStr && parsedUser.role !== 'admin') {
            setCurrentBusiness(JSON.parse(savedBizStr));
          }
        }
      } catch (e) {
        console.warn('Error reading saved session:', e);
      }
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

    if (isFirebaseConfigured && auth) {
      const createdUser = await signUpWithEmail(email, password, resolvedName);
      const uid = createdUser?.uid || `user_${Date.now()}`;

      // Initialize user record in Firestore with non-admin role
      await setUserRoleInFirestore(uid, email, 'business', resolvedName);

      const appUser: User = {
        id: uid,
        email: email,
        name: resolvedName,
        role: 'business',
        avatarUrl: createdUser?.photoURL || undefined,
      };
      setUser(appUser);
      setCurrentBusiness(null); // Triggers onboarding
    } else {
      // Local fallback
      const uid = `usr_${Math.random().toString(36).substring(2, 9)}`;
      const appUser: User = {
        id: uid,
        email: email,
        name: resolvedName,
        role: 'business',
      };
      setUser(appUser);
      setCurrentBusiness(null);
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(appUser));
        localStorage.removeItem(LOCAL_STORAGE_BIZ_KEY);
      } catch {}
    }
  };

  const login = async (email: string, password: string) => {
    if (isFirebaseConfigured && auth) {
      const loggedInUser = await signInWithEmail(email, password);
      const displayName = loggedInUser?.displayName || email.split('@')[0];
      const uid = loggedInUser?.uid || `user_${Date.now()}`;
      
      const isVerifiedAdmin = await verifyUserAdminRole(uid);

      const appUser: User = {
        id: uid,
        email: loggedInUser?.email || email,
        name: displayName,
        role: isVerifiedAdmin ? 'admin' : 'business',
        avatarUrl: loggedInUser?.photoURL || undefined,
      };
      setUser(appUser);

      if (!isVerifiedAdmin && loggedInUser?.uid) {
        await loadUserBusiness(loggedInUser.uid, loggedInUser.email || email);
      } else {
        setCurrentBusiness(null);
      }
    } else {
      // Local demo login fallback
      const isAdmin = email.toLowerCase() === 'admin@zellonai.online';
      const displayName = email.split('@')[0];
      const uid = `usr_${Math.random().toString(36).substring(2, 9)}`;

      const appUser: User = {
        id: uid,
        email: email,
        name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        role: isAdmin ? 'admin' : 'business',
      };

      setUser(appUser);
      if (!isAdmin) {
        const demoBiz = MOCK_BUSINESSES[0];
        setCurrentBusiness(demoBiz);
        try {
          localStorage.setItem(LOCAL_STORAGE_BIZ_KEY, JSON.stringify(demoBiz));
        } catch {}
      } else {
        setCurrentBusiness(null);
      }

      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(appUser));
      } catch {}
    }
  };

  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth) {
      const gUser = await signInWithGoogle();
      if (!gUser) throw new Error('Google Sign-in failed');
      const email = gUser.email || '';
      const name = gUser.displayName || email.split('@')[0] || 'Google User';
      const isVerifiedAdmin = await verifyUserAdminRole(gUser.uid);

      const appUser: User = {
        id: gUser.uid,
        email: email,
        name: name,
        role: isVerifiedAdmin ? 'admin' : 'business',
        avatarUrl: gUser.photoURL || undefined,
      };

      setUser(appUser);
      if (!isVerifiedAdmin) {
        await loadUserBusiness(gUser.uid, email);
      } else {
        setCurrentBusiness(null);
      }
    } else {
      // Fallback demo Google user
      const demoEmail = 'demo.owner@google.com';
      const demoName = 'Google Business Demo';
      const demoUid = 'usr_google_demo';
      const biz = MOCK_BUSINESSES[0];

      const appUser: User = {
        id: demoUid,
        email: demoEmail,
        name: demoName,
        role: 'business',
      };
      setUser(appUser);
      setCurrentBusiness(biz);

      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(appUser));
        localStorage.setItem(LOCAL_STORAGE_BIZ_KEY, JSON.stringify(biz));
      } catch {}
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
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      localStorage.removeItem(LOCAL_STORAGE_BIZ_KEY);
      localStorage.removeItem('reviewflow_pending_onboarding');
    } catch {}
  };

  const resetPassword = async (email: string) => {
    await sendPasswordReset(email);
  };

  const createBusiness = async (input: Omit<CreateBusinessInput, 'ownerId'>): Promise<Business> => {
    if (!user) throw new AppError('You must be signed in to create a business profile.', 401, 'UNAUTHORIZED');
    const newBiz = await createBusinessProfile({
      ...input,
      ownerId: user.id,
    });
    setCurrentBusiness(newBiz);
    try {
      localStorage.setItem(LOCAL_STORAGE_BIZ_KEY, JSON.stringify(newBiz));
    } catch {}
    return newBiz;
  };

  const updateBusiness = async (updates: UpdateBusinessInput): Promise<Business> => {
    if (!currentBusiness) throw new AppError('No active business profile to update.', 404, 'NOT_FOUND');
    if (!user) throw new AppError('You must be signed in to update your business profile.', 401, 'UNAUTHORIZED');

    const updated = await updateBusinessProfile(currentBusiness.id, user.id, updates);
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

  // Preset switchers for rapid development testing & role verification
  const loginAsBusiness = (businessId: string = 'biz_1') => {
    const biz = MOCK_BUSINESSES.find((b) => b.id === businessId) || MOCK_BUSINESSES[0];
    const appUser: User = {
      id: `user_${biz.id}`,
      email: biz.contactEmail,
      name: `${biz.name} Admin`,
      role: 'business',
      businessId: biz.id,
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
    };
    setUser(appUser);
    setCurrentBusiness(biz);
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(appUser));
      localStorage.setItem(LOCAL_STORAGE_BIZ_KEY, JSON.stringify(biz));
    } catch {}
  };

  const loginAsAdmin = () => {
    const adminUser = MOCK_USERS[1];
    setUser(adminUser);
    setCurrentBusiness(null);
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(adminUser));
      localStorage.removeItem(LOCAL_STORAGE_BIZ_KEY);
    } catch {}
  };

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
        loginAsBusiness,
        loginAsAdmin,
        updateCurrentBusiness,
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

