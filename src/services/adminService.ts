import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import {
  Business,
  FeedbackItem,
  PlatformSettings,
  AdminDashboardMetrics,
  BusinessAggregatedStatsDoc,
} from '../types';
import { mapDocToBusiness } from './businessService';
import { MOCK_BUSINESSES, MOCK_FEEDBACK, MOCK_ADMIN_METRICS } from '../data/mockData';
import { AppError, toAppError } from '../lib/apiError';

const SETTINGS_DOC_ID = 'settings';
const LOCAL_STORAGE_SETTINGS_KEY = 'reviewflow_system_settings';
const LOCAL_STORAGE_BIZ_ALL_KEY = 'reviewflow_all_businesses_store';

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  platformName: 'ZellonAI Reputation Suite',
  maintenanceMode: false,
  allowSignups: true,
  defaultTrialDays: 14,
  googleSyncInterval: 15,
  supportEmail: 'support@ZellonAI.com',
  defaultThresholdRating: 4,
  requireEmailVerification: false,
  updatedAt: new Date().toISOString(),
};

/**
 * Load cached local businesses list
 */
export function getLocalAllBusinesses(): Business[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BIZ_ALL_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

export function saveLocalAllBusinesses(businesses: Business[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_BIZ_ALL_KEY, JSON.stringify(businesses));
  } catch {}
}

/**
 * Check if the given user or current authenticated user is an authorized admin.
 * Securely verifies Firestore users collection and Firebase Auth token claims.
 */
export async function verifyUserAdminRole(userId: string): Promise<boolean> {
  if (!userId) return false;

  // 1. Fast check for bootstrap admin email via environment variables
  const currentEmail = auth?.currentUser?.email?.toLowerCase();
  
  if (currentEmail) {
    const adminEmailsStr = import.meta.env.VITE_ADMIN_EMAILS || '';
    const adminEmails = adminEmailsStr.split(',').map((e: string) => e.trim().toLowerCase());
    
    if (adminEmails.includes(currentEmail)) {
      return true;
    }
  }

  // 2. Check current user's Firebase Auth Custom Claims (using cached claims first)
  if (auth?.currentUser && auth.currentUser.uid === userId) {
    try {
      const tokenResult = await auth.currentUser.getIdTokenResult(false);
      if (tokenResult.claims.admin === true || tokenResult.claims.role === 'admin') {
        return true;
      }
    } catch (e) {
      console.warn('Could not verify token claims:', e);
    }
  }

  // 3. Check Firestore /users/{userId} document
  if (db) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.role === 'admin') {
          return true;
        }
      }
    } catch (e) {
      console.warn('Error checking Firestore user role:', e);
    }
  }

  return false;
}

/**
 * Sets user role in Firestore /users/{userId} (admin only operation)
 */
export async function setUserRoleInFirestore(userId: string, email: string, role: 'admin' | 'business', name?: string) {
  if (db && userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        email,
        name: name || email.split('@')[0],
        role,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.warn('Error setting user role in Firestore:', e);
    }
  }
}

/**
 * Fetch all registered businesses from Firestore for Platform Admins.
 * Strictly verifies admin role so standard tenants cannot scrape platform directory.
 */
export async function fetchAllBusinesses(requesterUserId?: string): Promise<Business[]> {
  const currentUid = requesterUserId || auth?.currentUser?.uid;
  if (!currentUid) {
    throw new AppError('Authentication Required: Admin sign-in is required.', 401, 'UNAUTHORIZED');
  }
  const isAuthorizedAdmin = await verifyUserAdminRole(currentUid);
  if (!isAuthorizedAdmin) {
    throw new AppError('Forbidden: Only authorized platform administrators can access the business directory.', 403, 'FORBIDDEN');
  }

  if (db) {
    try {
      const businessesRef = collection(db, 'businesses');
      const snap = await getDocs(businessesRef);

      if (!snap.empty) {
        // Also fetch stats for each business to ensure accurate feedback/clicks
        const statsSnap = await getDocs(collection(db, 'businessStats'));
        const statsMap = new Map<string, any>();
        statsSnap.docs.forEach((d) => statsMap.set(d.id, d.data()));

        const items: Business[] = snap.docs.map((d) => {
          const biz = mapDocToBusiness(d.id, d.data());
          const stats = statsMap.get(d.id);
          if (stats) {
            biz.stats = {
              totalFeedback: stats.totalFeedback || 0,
              averageRating: stats.averageRating || 5,
              fiveStarCount: stats.totalFiveStar || 0,
              googleClicks: stats.googleClicks || 0,
            };
          }
          return biz;
        });

        saveLocalAllBusinesses(items);
        return items;
      }
    } catch (err) {
      console.warn('Firestore fetchAllBusinesses notice (using local cache):', err);
    }
  }

  return getLocalAllBusinesses();
}

/**
 * Update business status: 'active' | 'suspended'.
 * Strictly enforces admin authorization.
 */
export async function updateBusinessStatus(
  businessId: string,
  newStatus: 'active' | 'suspended',
  requesterUserId?: string
): Promise<void> {
  if (!businessId?.trim()) {
    throw new AppError('Validation Error: Business ID is required.', 400, 'VALIDATION_ERROR');
  }
  if (newStatus !== 'active' && newStatus !== 'suspended') {
    throw new AppError('Validation Error: Status must be either "active" or "suspended".', 400, 'VALIDATION_ERROR');
  }

  const currentUid = requesterUserId || auth?.currentUser?.uid;
  if (!currentUid) {
    throw new AppError('Authentication Required: Admin sign-in is required.', 401, 'UNAUTHORIZED');
  }
  const isAuthorizedAdmin = await verifyUserAdminRole(currentUid);
  if (!isAuthorizedAdmin) {
    throw new AppError('Forbidden: Only authorized platform administrators can modify business status.', 403, 'FORBIDDEN');
  }

  const isActive = newStatus === 'active';

  if (db && businessId) {
    try {
      const bizRef = doc(db, 'businesses', businessId);
      await updateDoc(bizRef, {
        status: newStatus,
        isActive: isActive,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error updating business status in Firestore:', err);
      throw toAppError(err, 'Failed to update business status.');
    }
  }

  // Update local cache
  const cached = getLocalAllBusinesses();
  const updated = cached.map((b) =>
    b.id === businessId ? { ...b, status: newStatus, isActive: isActive } : b
  );
  saveLocalAllBusinesses(updated);

  // If this matches currently active user business, sync it
  try {
    const currentBizRaw = localStorage.getItem('reviewflow_auth_biz');
    if (currentBizRaw) {
      const currentBiz = JSON.parse(currentBizRaw);
      if (currentBiz.id === businessId) {
        currentBiz.status = newStatus;
        currentBiz.isActive = isActive;
        localStorage.setItem('reviewflow_auth_biz', JSON.stringify(currentBiz));
      }
    }
  } catch {}
}

/**
 * Fetch platform-level aggregate metrics for the Admin Dashboard
 */
export async function fetchAdminDashboardStats(): Promise<AdminDashboardMetrics> {
  const businesses = await fetchAllBusinesses();
  const allFeedback = await fetchPlatformFeedback();

  const totalBusinesses = businesses.length;
  const activeBusinesses = businesses.filter((b) => b.isActive !== false && b.status !== 'suspended').length;
  const suspendedBusinesses = businesses.filter((b) => b.status === 'suspended' || b.isActive === false).length;

  let totalFeedbackCount = 0;
  let totalGoogleClicks = 0;
  let ratingSum = 0;
  let fiveStarCount = 0;

  if (allFeedback.length > 0) {
    totalFeedbackCount = allFeedback.length;
    allFeedback.forEach((f) => {
      ratingSum += f.rating;
      if (f.rating === 5) fiveStarCount++;
      if (f.googleRedirected || f.clickedGoogleReview) totalGoogleClicks++;
    });
  } else {
    // Aggregate from business stats
    businesses.forEach((b) => {
      totalFeedbackCount += b.stats?.totalFeedback || 0;
      totalGoogleClicks += b.stats?.googleClicks || 0;
      ratingSum += (b.stats?.averageRating || 5) * (b.stats?.totalFeedback || 1);
      fiveStarCount += b.stats?.fiveStarCount || 0;
    });
  }

  const averagePlatformRating =
    totalFeedbackCount > 0
      ? Number((ratingSum / (allFeedback.length > 0 ? totalFeedbackCount : Math.max(1, businesses.length))).toFixed(1))
      : 4.9;

  // New businesses (sorted newest first)
  const newBusinesses = [...businesses].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  }).slice(0, 5);

  // Recent feedback across platform (sorted newest first)
  const recentFeedback = [...allFeedback].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  }).slice(0, 8);

  return {
    totalBusinesses: Math.max(totalBusinesses, 1),
    activeBusinesses: Math.max(activeBusinesses, 1),
    suspendedBusinesses,
    totalFeedback: totalFeedbackCount,
    totalGoogleClicks,
    averagePlatformRating,
    fiveStarFeedback: fiveStarCount,
    newBusinesses,
    recentFeedback,
  };
}

/**
 * Fetch all platform-level feedback from Firestore.
 * Strictly enforces admin authorization.
 */
export async function fetchPlatformFeedback(
  options?: {
    businessId?: string;
    search?: string;
    rating?: number;
  },
  requesterUserId?: string
): Promise<FeedbackItem[]> {
  const currentUid = requesterUserId || auth?.currentUser?.uid;
  if (!currentUid) {
    throw new AppError('Authentication Required: Admin sign-in is required.', 401, 'UNAUTHORIZED');
  }
  const isAuthorizedAdmin = await verifyUserAdminRole(currentUid);
  if (!isAuthorizedAdmin) {
    throw new AppError('Forbidden: Only authorized platform administrators can access the platform feedback stream.', 403, 'FORBIDDEN');
  }

  let items: FeedbackItem[] = [];

  if (db) {
    try {
      const feedbackRef = collection(db, 'feedback');
      let q = query(feedbackRef, orderBy('createdAt', 'desc'), limit(100));

      if (options?.businessId && options.businessId !== 'all') {
        q = query(
          feedbackRef,
          where('businessId', '==', options.businessId),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
      }

      const snap = await getDocs(q);
      if (!snap.empty) {
        items = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            businessId: data.businessId || '',
            ownerId: data.ownerId || '',
            businessName: data.businessName || 'Business Client',
            customerName: data.customerName || 'Anonymous Customer',
            customerEmail: data.customerEmail || '',
            customerPhone: data.customerPhone || '',
            rating: data.rating || 5,
            comment: data.comment || '',
            source: data.source || 'public_review_page',
            status: data.status || 'new',
            googleRedirected: data.googleRedirected || false,
            clickedGoogleReview: data.clickedGoogleReview || false,
            createdAt: data.createdAt ? (typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : String(data.createdAt)) : new Date().toISOString(),
            internalNotes: data.internalNotes || '',
          };
        });
      }
    } catch (err) {
      console.warn('Firestore fetchPlatformFeedback notice:', err);
    }
  }

  if (items.length === 0) {
    try {
      const local = localStorage.getItem('reviewflow_feedback_store');
      if (local) {
        items = JSON.parse(local);
      }
    } catch {}
    if (items.length === 0) {
      items = [];
    }
  }

  // Client-side filters
  return items.filter((item) => {
    if (options?.businessId && options.businessId !== 'all' && item.businessId !== options.businessId) {
      return false;
    }
    if (options?.rating && item.rating !== options.rating) {
      return false;
    }
    if (options?.search?.trim()) {
      const q = options.search.toLowerCase();
      const matchComment = item.comment.toLowerCase().includes(q);
      const matchBiz = item.businessName?.toLowerCase().includes(q);
      const matchCust = item.customerName?.toLowerCase().includes(q);
      const matchEmail = item.customerEmail?.toLowerCase().includes(q);
      return matchComment || matchBiz || matchCust || matchEmail;
    }
    return true;
  });
}

/**
 * Fetch platform system settings
 */
export async function fetchPlatformSettings(): Promise<PlatformSettings> {
  if (db) {
    try {
      const settingRef = doc(db, 'system', SETTINGS_DOC_ID);
      const snap = await getDoc(settingRef);
      if (snap.exists()) {
        const data = snap.data() as PlatformSettings;
        return {
          ...DEFAULT_PLATFORM_SETTINGS,
          ...data,
        };
      }
    } catch (e) {
      console.warn('Error reading system settings from Firestore:', e);
    }
  }

  // Check localStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (raw) {
      return {
        ...DEFAULT_PLATFORM_SETTINGS,
        ...JSON.parse(raw),
      };
    }
  } catch {}

  return DEFAULT_PLATFORM_SETTINGS;
}

/**
 * Update platform system settings in Firestore.
 * Strictly verifies admin role.
 */
export async function updatePlatformSettings(
  settings: PlatformSettings,
  requesterUserId?: string
): Promise<void> {
  const currentUid = requesterUserId || auth?.currentUser?.uid;
  if (!currentUid) {
    throw new AppError('Authentication Required: Admin sign-in is required.', 401, 'UNAUTHORIZED');
  }
  const isAuthorizedAdmin = await verifyUserAdminRole(currentUid);
  if (!isAuthorizedAdmin) {
    throw new AppError('Forbidden: Only authorized platform administrators can modify system settings.', 403, 'FORBIDDEN');
  }

  if (settings.defaultThresholdRating < 1 || settings.defaultThresholdRating > 5) {
    throw new AppError('Validation Error: Threshold rating must be between 1 and 5.', 400, 'VALIDATION_ERROR');
  }

  const payload = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  if (db) {
    try {
      const settingRef = doc(db, 'system', SETTINGS_DOC_ID);
      await setDoc(settingRef, {
        ...payload,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('Error saving system settings to Firestore:', err);
      throw toAppError(err, 'Failed to save system settings.');
    }
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(payload));
  } catch {}
}
