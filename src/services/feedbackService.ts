import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import {
  FeedbackItem,
  FeedbackSubmissionInput,
  FeedbackStatus,
  FeedbackRating,
  ReviewClickEvent,
  FeedbackStats,
  BusinessAggregatedStatsDoc,
  DateRangeFilter,
  DateFilterPreset,
} from '../types';
import { MOCK_FEEDBACK } from '../data/mockData';
import {
  AppError,
  toAppError,
  validateRating,
  validateEmail,
  validatePhone,
  sanitizeString,
} from '../lib/apiError';
import { sendNegativeReviewAlert } from './emailService';

const LOCAL_STORAGE_FEEDBACK_KEY = 'reviewflow_feedback_store';
const LOCAL_STORAGE_CLICKS_KEY = 'reviewflow_clicks_store';
const LOCAL_STORAGE_STATS_KEY = 'reviewflow_business_stats_store';

function getLocalFeedback(businessId?: string): FeedbackItem[] {
  try {
    if (businessId) {
      const scopedRaw = localStorage.getItem(`${LOCAL_STORAGE_FEEDBACK_KEY}_${businessId}`);
      if (scopedRaw) {
        return JSON.parse(scopedRaw);
      }
    }
    const raw = localStorage.getItem(LOCAL_STORAGE_FEEDBACK_KEY);
    if (raw) {
      const all: FeedbackItem[] = JSON.parse(raw);
      return businessId ? all.filter((item) => item.businessId === businessId) : all;
    }
  } catch (e) {
    console.warn('Error reading local feedback:', e);
  }
  return [];
}

function saveLocalFeedback(items: FeedbackItem[], businessId?: string) {
  try {
    if (businessId) {
      localStorage.setItem(`${LOCAL_STORAGE_FEEDBACK_KEY}_${businessId}`, JSON.stringify(items));
    }
    const raw = localStorage.getItem(LOCAL_STORAGE_FEEDBACK_KEY);
    const existing: FeedbackItem[] = raw ? JSON.parse(raw) : [];
    const map = new Map<string, FeedbackItem>();
    existing.forEach((f) => map.set(f.id, f));
    items.forEach((f) => map.set(f.id, f));
    localStorage.setItem(LOCAL_STORAGE_FEEDBACK_KEY, JSON.stringify(Array.from(map.values())));
  } catch (e) {
    console.warn('Error saving local feedback:', e);
  }
}

function getLocalClicks(businessId?: string): ReviewClickEvent[] {
  try {
    if (businessId) {
      const scopedRaw = localStorage.getItem(`${LOCAL_STORAGE_CLICKS_KEY}_${businessId}`);
      if (scopedRaw) {
        return JSON.parse(scopedRaw);
      }
    }
    const raw = localStorage.getItem(LOCAL_STORAGE_CLICKS_KEY);
    if (raw) {
      const all: ReviewClickEvent[] = JSON.parse(raw);
      return businessId ? all.filter((c) => c.businessId === businessId) : all;
    }
  } catch (e) {
    console.warn('Error reading local clicks:', e);
  }
  return [];
}

function saveLocalClicks(items: ReviewClickEvent[], businessId?: string) {
  try {
    if (businessId) {
      localStorage.setItem(`${LOCAL_STORAGE_CLICKS_KEY}_${businessId}`, JSON.stringify(items));
    }
    const raw = localStorage.getItem(LOCAL_STORAGE_CLICKS_KEY);
    const existing: ReviewClickEvent[] = raw ? JSON.parse(raw) : [];
    const map = new Map<string, ReviewClickEvent>();
    existing.forEach((c) => map.set(c.id, c));
    items.forEach((c) => map.set(c.id, c));
    localStorage.setItem(LOCAL_STORAGE_CLICKS_KEY, JSON.stringify(Array.from(map.values())));
  } catch (e) {
    console.warn('Error saving local clicks:', e);
  }
}

/**
 * Get or initialize aggregated stats in localStorage cache
 */
function getLocalAggregatedStats(businessId: string): BusinessAggregatedStatsDoc | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_STATS_KEY}_${businessId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading local aggregated stats:', e);
  }
  return null;
}

function saveLocalAggregatedStats(businessId: string, stats: BusinessAggregatedStatsDoc) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_STATS_KEY}_${businessId}`, JSON.stringify(stats));
  } catch (e) {
    console.warn('Error saving local aggregated stats:', e);
  }
}

/**
 * Helper to update aggregated stats document in Firestore and locally
 * Creates/increments businessStats/{businessId}
 */
async function updateAggregatedStatsOnFeedback(
  businessId: string,
  rating: FeedbackRating,
  ownerId?: string,
  dateIso?: string
) {
  const dateKey = (dateIso || new Date().toISOString()).split('T')[0];
  const starKey = rating === 5 ? 'totalFiveStar' :
                  rating === 4 ? 'totalFourStar' :
                  rating === 3 ? 'totalThreeStar' :
                  rating === 2 ? 'totalTwoStar' : 'totalOneStar';

  if (db && businessId) {
    try {
      const statsDocRef = doc(db, 'businessStats', businessId);
      const snap = await getDoc(statsDocRef);

      if (snap.exists()) {
        const currentData = snap.data();
        const currentTotal = (currentData.totalFeedback || 0) + 1;
        const current5 = (currentData.totalFiveStar || 0) + (rating === 5 ? 1 : 0);
        const current4 = (currentData.totalFourStar || 0) + (rating === 4 ? 1 : 0);
        const current3 = (currentData.totalThreeStar || 0) + (rating === 3 ? 1 : 0);
        const current2 = (currentData.totalTwoStar || 0) + (rating === 2 ? 1 : 0);
        const current1 = (currentData.totalOneStar || 0) + (rating === 1 ? 1 : 0);
        const sumRatings = (current5 * 5) + (current4 * 4) + (current3 * 3) + (current2 * 2) + (current1 * 1);
        const avg = Number((sumRatings / currentTotal).toFixed(1));
        const googleClicks = currentData.googleClicks || 0;
        const clickRate = current5 > 0 ? Number(((googleClicks / current5) * 100).toFixed(1)) : 0;

        const currentDaily = currentData.dailyStats || {};
        const dayRecord = currentDaily[dateKey] || { feedback: 0, clicks: 0, stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
        const dayStars = dayRecord.stars || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        dayStars[rating] = (dayStars[rating] || 0) + 1;

        await setDoc(statsDocRef, {
          businessId,
          ownerId: ownerId || currentData.ownerId || '',
          totalFeedback: currentTotal,
          averageRating: avg,
          totalFiveStar: current5,
          totalFourStar: current4,
          totalThreeStar: current3,
          totalTwoStar: current2,
          totalOneStar: current1,
          googleClicks,
          googleClickRate: clickRate,
          updatedAt: serverTimestamp(),
          dailyStats: {
            ...currentDaily,
            [dateKey]: {
              feedback: (dayRecord.feedback || 0) + 1,
              clicks: dayRecord.clicks || 0,
              stars: dayStars,
            }
          }
        }, { merge: true });
      } else {
        const is5 = rating === 5 ? 1 : 0;
        const is4 = rating === 4 ? 1 : 0;
        const is3 = rating === 3 ? 1 : 0;
        const is2 = rating === 2 ? 1 : 0;
        const is1 = rating === 1 ? 1 : 0;

        await setDoc(statsDocRef, {
          businessId,
          ownerId: ownerId || '',
          totalFeedback: 1,
          averageRating: rating,
          totalFiveStar: is5,
          totalFourStar: is4,
          totalThreeStar: is3,
          totalTwoStar: is2,
          totalOneStar: is1,
          googleClicks: 0,
          googleClickRate: 0,
          updatedAt: serverTimestamp(),
          dailyStats: {
            [dateKey]: {
              feedback: 1,
              clicks: 0,
              stars: { [rating]: 1 }
            }
          }
        });
      }
    } catch (e) {
      console.warn('Could not update Firestore aggregated stats:', e);
    }
  }

  // Update local aggregated stats cache
  const localStats = getLocalAggregatedStats(businessId) || {
    businessId,
    ownerId: ownerId || '',
    totalFeedback: 0,
    averageRating: 5.0,
    totalFiveStar: 0,
    totalFourStar: 0,
    totalThreeStar: 0,
    totalTwoStar: 0,
    totalOneStar: 0,
    googleClicks: 0,
    googleClickRate: 0,
    dailyStats: {},
  };

  const newTotal = localStats.totalFeedback + 1;
  const new5 = localStats.totalFiveStar + (rating === 5 ? 1 : 0);
  const new4 = localStats.totalFourStar + (rating === 4 ? 1 : 0);
  const new3 = localStats.totalThreeStar + (rating === 3 ? 1 : 0);
  const new2 = localStats.totalTwoStar + (rating === 2 ? 1 : 0);
  const new1 = localStats.totalOneStar + (rating === 1 ? 1 : 0);
  const sumRatings = (new5 * 5) + (new4 * 4) + (new3 * 3) + (new2 * 2) + (new1 * 1);
  const avg = Number((sumRatings / newTotal).toFixed(1));
  const clickRate = new5 > 0 ? Number(((localStats.googleClicks / new5) * 100).toFixed(1)) : 0;

  const currentDaily = localStats.dailyStats || {};
  const dayRecord = currentDaily[dateKey] || { feedback: 0, clicks: 0, stars: {} };
  const dayStars = dayRecord.stars || {};
  dayStars[rating] = (dayStars[rating] || 0) + 1;

  const updatedDoc: BusinessAggregatedStatsDoc = {
    ...localStats,
    totalFeedback: newTotal,
    averageRating: avg,
    totalFiveStar: new5,
    totalFourStar: new4,
    totalThreeStar: new3,
    totalTwoStar: new2,
    totalOneStar: new1,
    googleClickRate: clickRate,
    updatedAt: new Date().toISOString(),
    dailyStats: {
      ...currentDaily,
      [dateKey]: {
        feedback: (dayRecord.feedback || 0) + 1,
        clicks: dayRecord.clicks || 0,
        stars: dayStars,
      }
    }
  };

  saveLocalAggregatedStats(businessId, updatedDoc);
}

/**
 * Helper to update aggregated stats on Google review click
 */
async function updateAggregatedStatsOnClick(
  businessId: string,
  ownerId?: string,
  dateIso?: string
) {
  const dateKey = (dateIso || new Date().toISOString()).split('T')[0];

  if (db && businessId) {
    try {
      const statsDocRef = doc(db, 'businessStats', businessId);
      const snap = await getDoc(statsDocRef);

      if (snap.exists()) {
        const currentData = snap.data();
        const currentClicks = (currentData.googleClicks || 0) + 1;
        const current5 = currentData.totalFiveStar || 0;
        const clickRate = current5 > 0 ? Number(((currentClicks / current5) * 100).toFixed(1)) : 0;

        const currentDaily = currentData.dailyStats || {};
        const dayRecord = currentDaily[dateKey] || { feedback: 0, clicks: 0, stars: {} };

        await setDoc(statsDocRef, {
          googleClicks: currentClicks,
          googleClickRate: clickRate,
          updatedAt: serverTimestamp(),
          dailyStats: {
            ...currentDaily,
            [dateKey]: {
              feedback: dayRecord.feedback || 0,
              clicks: (dayRecord.clicks || 0) + 1,
              stars: dayRecord.stars || {},
            }
          }
        }, { merge: true });
      } else {
        await setDoc(statsDocRef, {
          businessId,
          ownerId: ownerId || '',
          totalFeedback: 0,
          averageRating: 5.0,
          totalFiveStar: 0,
          totalFourStar: 0,
          totalThreeStar: 0,
          totalTwoStar: 0,
          totalOneStar: 0,
          googleClicks: 1,
          googleClickRate: 0,
          updatedAt: serverTimestamp(),
          dailyStats: {
            [dateKey]: {
              feedback: 0,
              clicks: 1,
              stars: {}
            }
          }
        });
      }
    } catch (e) {
      console.warn('Could not update Firestore aggregated stats for click:', e);
    }
  }

  // Local update
  const localStats = getLocalAggregatedStats(businessId) || {
    businessId,
    ownerId: ownerId || '',
    totalFeedback: 0,
    averageRating: 5.0,
    totalFiveStar: 0,
    totalFourStar: 0,
    totalThreeStar: 0,
    totalTwoStar: 0,
    totalOneStar: 0,
    googleClicks: 0,
    googleClickRate: 0,
    dailyStats: {},
  };

  const newClicks = localStats.googleClicks + 1;
  const clickRate = localStats.totalFiveStar > 0 ? Number(((newClicks / localStats.totalFiveStar) * 100).toFixed(1)) : 0;

  const currentDaily = localStats.dailyStats || {};
  const dayRecord = currentDaily[dateKey] || { feedback: 0, clicks: 0, stars: {} };

  const updatedDoc: BusinessAggregatedStatsDoc = {
    ...localStats,
    googleClicks: newClicks,
    googleClickRate: clickRate,
    updatedAt: new Date().toISOString(),
    dailyStats: {
      ...currentDaily,
      [dateKey]: {
        feedback: dayRecord.feedback || 0,
        clicks: (dayRecord.clicks || 0) + 1,
        stars: dayRecord.stars || {},
      }
    }
  };

  saveLocalAggregatedStats(businessId, updatedDoc);
}

/**
 * Submit feedback to Firestore 'feedback' collection and increment businessStats.
 * Validates rating strictly, sanitizes customer comments, and enforces status == 'new'.
 */
export async function submitFeedback(input: FeedbackSubmissionInput): Promise<FeedbackItem> {
  if (!input.businessId?.trim()) {
    throw new AppError('Validation Error: Business ID is required.', 400, 'VALIDATION_ERROR', [
      { field: 'businessId', message: 'Target business ID is required.' }
    ]);
  }

  // Validate star rating strictly (1-5 integer)
  const validatedRating = validateRating(input.rating);

  // Validate and sanitize user input
  const cleanComment = sanitizeString(input.comment, 3000);
  const cleanCustomerName = sanitizeString(input.customerName, 100);
  const cleanEmail = sanitizeString(input.customerEmail, 150);
  const cleanPhone = sanitizeString(input.customerPhone, 30);

  if (cleanEmail && !validateEmail(cleanEmail)) {
    throw new AppError('Validation Error: Customer email format is invalid.', 400, 'VALIDATION_ERROR', [
      { field: 'customerEmail', message: 'Please enter a valid email address.' }
    ]);
  }

  if (cleanPhone && !validatePhone(cleanPhone)) {
    throw new AppError('Validation Error: Customer phone format is invalid.', 400, 'VALIDATION_ERROR', [
      { field: 'customerPhone', message: 'Please enter a valid phone number.' }
    ]);
  }

  const nowIso = new Date().toISOString();
  const feedbackDocData = {
    businessId: input.businessId.trim(),
    ownerId: input.ownerId?.trim() || '',
    rating: validatedRating,
    comment: cleanComment,
    customerName: cleanCustomerName,
    customerEmail: cleanEmail,
    customerPhone: cleanPhone,
    source: sanitizeString(input.source, 60) || 'public_review_page',
    googleRedirected: !!input.googleRedirected,
    status: 'new' as FeedbackStatus,
    createdAt: nowIso,
  };

  let generatedId = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (db) {
    try {
      const colRef = collection(db, 'feedback');
      const docRef = await addDoc(colRef, {
        ...feedbackDocData,
        createdAt: serverTimestamp(),
      });
      generatedId = docRef.id;
    } catch (err) {
      console.warn('Firestore feedback submission fallback to local storage:', err);
    }
  }

  const createdItem: FeedbackItem = {
    id: generatedId,
    ...feedbackDocData,
    routedToGoogle: !!input.googleRedirected,
    clickedGoogleReview: !!input.googleRedirected,
  };

  // Save in business-scoped local cache
  const localList = getLocalFeedback(input.businessId);
  saveLocalFeedback([createdItem, ...localList], input.businessId);

  // Update aggregated statistics asynchronously
  updateAggregatedStatsOnFeedback(input.businessId, createdItem.rating, input.ownerId, nowIso).catch(console.warn);

  // Trigger instant negative review alert email if rating <= 3
  if (validatedRating <= 3) {
    (async () => {
      try {
        let recipientEmail = '';
        let businessName = '';

        if (db && input.businessId) {
          const bDoc = await getDoc(doc(db, 'businesses', input.businessId));
          if (bDoc.exists()) {
            const bData = bDoc.data();
            recipientEmail = bData.email || '';
            businessName = bData.businessName || bData.name || '';
          }
        }

        if (!recipientEmail && typeof localStorage !== 'undefined') {
          const localBiz = localStorage.getItem('reviewflow_auth_biz');
          if (localBiz) {
            try {
              const parsed = JSON.parse(localBiz);
              recipientEmail = parsed.email || '';
              businessName = businessName || parsed.businessName || parsed.name || '';
            } catch {}
          }
        }

        if (recipientEmail) {
          await sendNegativeReviewAlert({
            to: recipientEmail,
            businessName: businessName || 'Your Business',
            customerName: cleanCustomerName,
            customerEmail: cleanEmail,
            customerPhone: cleanPhone,
            rating: validatedRating,
            comment: cleanComment,
            businessId: input.businessId,
          });
        }
      } catch (emailErr) {
        console.warn('[FeedbackService] Error dispatching negative review alert email:', emailErr);
      }
    })().catch(console.warn);
  }

  return createdItem;
}

/**
 * Record a Google review click event in Firestore 'reviewClicks' collection and increment businessStats
 */
export async function recordGoogleReviewClick(
  businessId: string,
  feedbackId?: string | null,
  ownerId?: string
): Promise<string> {
  if (!businessId?.trim()) {
    throw new AppError('Validation Error: Business ID is required.', 400, 'VALIDATION_ERROR');
  }

  const nowIso = new Date().toISOString();
  const clickData = {
    businessId: businessId.trim(),
    ownerId: ownerId?.trim() || '',
    feedbackId: feedbackId?.trim() || null,
    createdAt: nowIso,
  };

  let clickId = `clk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  if (db) {
    try {
      const colRef = collection(db, 'reviewClicks');
      const docRef = await addDoc(colRef, {
        ...clickData,
        createdAt: serverTimestamp(),
      });
      clickId = docRef.id;
    } catch (err) {
      console.warn('Firestore click tracking fallback to local storage:', err);
    }
  }

  const clickEvent: ReviewClickEvent = {
    id: clickId,
    ...clickData,
  };

  const localClicks = getLocalClicks(businessId);
  saveLocalClicks([clickEvent, ...localClicks], businessId);

  // Update aggregated statistics for click
  updateAggregatedStatsOnClick(businessId, ownerId, nowIso).catch(console.warn);

  return clickId;
}

/**
 * Fetch aggregated statistics document from businessStats/{businessId}.
 * Enforces multi-tenant isolation: requester must own the business or be an admin.
 */
export async function getBusinessAggregatedStats(
  businessId: string,
  requesterUserId?: string,
  ownerId?: string,
  requesterIsAdmin?: boolean
): Promise<BusinessAggregatedStatsDoc | null> {
  if (!businessId?.trim()) return null;

  // Authorization check: If ownerId and requesterUserId are provided, verify ownership
  if (!requesterIsAdmin && requesterUserId && ownerId && requesterUserId !== ownerId) {
    throw new AppError(
      'Forbidden: Access to another business\'s private analytics is denied.',
      403,
      'FORBIDDEN'
    );
  }

  if (db) {
    try {
      const statsDocRef = doc(db, 'businessStats', businessId);
      const snap = await getDoc(statsDocRef);
      if (snap.exists()) {
        const data = snap.data() as BusinessAggregatedStatsDoc;
        saveLocalAggregatedStats(businessId, data);
        return data;
      }
    } catch (e) {
      console.warn('Error reading aggregated stats from Firestore:', e);
    }
  }

  // Fallback to local cached stats
  const localStats = getLocalAggregatedStats(businessId);
  if (localStats) return localStats;

  return null;
}

/**
 * Fetch all feedback for a given business with optional limit.
 * Strictly verifies multi-tenant isolation: a user can NEVER access another business's feedback.
 */
export async function getFeedbackByBusiness(
  businessId: string,
  ownerId?: string,
  maxDocs?: number,
  requesterUserId?: string,
  requesterIsAdmin?: boolean
): Promise<FeedbackItem[]> {
  if (!businessId?.trim()) return [];

  // Multi-Tenant Isolation Enforcement
  if (!requesterIsAdmin) {
    const currentUid = requesterUserId || auth?.currentUser?.uid;
    if (currentUid && ownerId && currentUid !== ownerId) {
      throw new AppError(
        'Forbidden: You are not authorized to view feedback for this business.',
        403,
        'FORBIDDEN'
      );
    }
  }

  const localItems = getLocalFeedback(businessId);

  if (!db) {
    if (localItems.length > 0) return localItems;
    // Only return mock feedback for authorized apex-dental demo user
    return localItems;
  }

  try {
    const colRef = collection(db, 'feedback');
    let q = maxDocs
      ? query(colRef, where('businessId', '==', businessId), limit(maxDocs))
      : query(colRef, where('businessId', '==', businessId));

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const firestoreItems: FeedbackItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let createdAtStr = new Date().toISOString();
        if (data.createdAt) {
          if (typeof data.createdAt.toDate === 'function') {
            createdAtStr = data.createdAt.toDate().toISOString();
          } else if (typeof data.createdAt === 'string') {
            createdAtStr = data.createdAt;
          }
        }

        return {
          id: docSnap.id,
          businessId: data.businessId || businessId,
          ownerId: data.ownerId || '',
          businessName: data.businessName || '',
          customerName: data.customerName || '',
          customerEmail: data.customerEmail || '',
          customerPhone: data.customerPhone || '',
          rating: (Number(data.rating) || 5) as FeedbackRating,
          comment: data.comment || '',
          source: data.source || 'public_review_page',
          status: (data.status || 'new') as FeedbackStatus,
          googleRedirected: !!data.googleRedirected,
          routedToGoogle: !!data.googleRedirected || Number(data.rating) >= 4,
          clickedGoogleReview: !!data.googleRedirected,
          createdAt: createdAtStr,
          internalNotes: data.internalNotes || '',
        };
      });

      // Sort by newest first
      firestoreItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Merge unique with local
      const mergedMap = new Map<string, FeedbackItem>();
      firestoreItems.forEach((item) => mergedMap.set(item.id, item));
      localItems.forEach((item) => {
        if (!mergedMap.has(item.id)) mergedMap.set(item.id, item);
      });

      return Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch (err) {
    const appErr = toAppError(err, 'Error fetching feedback from database.');
    console.warn('Database query notice:', appErr.userMessage);
  }

  return localItems;
}

/**
 * Fetch all click records for a given business with authorization checks.
 */
export async function getReviewClicksByBusiness(
  businessId: string,
  maxDocs?: number,
  requesterUserId?: string,
  ownerId?: string,
  requesterIsAdmin?: boolean
): Promise<ReviewClickEvent[]> {
  if (!businessId?.trim()) return [];

  // Multi-Tenant Isolation Enforcement
  if (!requesterIsAdmin) {
    const currentUid = requesterUserId || auth?.currentUser?.uid;
    if (currentUid && ownerId && currentUid !== ownerId) {
      throw new AppError(
        'Forbidden: You are not authorized to view review clicks for this business.',
        403,
        'FORBIDDEN'
      );
    }
  }

  const localClicks = getLocalClicks(businessId);

  if (!db) {
    return localClicks;
  }

  try {
    const colRef = collection(db, 'reviewClicks');
    const q = maxDocs
      ? query(colRef, where('businessId', '==', businessId), limit(maxDocs))
      : query(colRef, where('businessId', '==', businessId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const firestoreClicks: ReviewClickEvent[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let createdAtStr = new Date().toISOString();
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          createdAtStr = data.createdAt.toDate().toISOString();
        } else if (typeof data.createdAt === 'string') {
          createdAtStr = data.createdAt;
        }

        return {
          id: docSnap.id,
          businessId: data.businessId || businessId,
          ownerId: data.ownerId || '',
          feedbackId: data.feedbackId || null,
          createdAt: createdAtStr,
        };
      });

      const map = new Map<string, ReviewClickEvent>();
      firestoreClicks.forEach((c) => map.set(c.id || '', c));
      localClicks.forEach((c) => {
        if (c.id && !map.has(c.id)) map.set(c.id, c);
      });

      return Array.from(map.values());
    }
  } catch (err) {
    console.warn('Error fetching review clicks from Firestore:', err);
  }

  return localClicks;
}

/**
 * Helper to determine if a date falls within a specific date filter
 */
export function isDateInFilter(dateString: string, filter: DateRangeFilter): boolean {
  if (filter.preset === 'all') return true;

  const itemDate = new Date(dateString);
  if (isNaN(itemDate.getTime())) return true;

  const now = new Date();

  if (filter.preset === 'today') {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return itemDate >= startOfToday;
  }

  if (filter.preset === '7days') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    return itemDate >= sevenDaysAgo;
  }

  if (filter.preset === '30days') {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    return itemDate >= thirtyDaysAgo;
  }

  if (filter.preset === '90days') {
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    ninetyDaysAgo.setHours(0, 0, 0, 0);
    return itemDate >= ninetyDaysAgo;
  }

  if (filter.preset === 'custom') {
    if (filter.startDate) {
      const start = new Date(`${filter.startDate}T00:00:00`);
      if (itemDate < start) return false;
    }
    if (filter.endDate) {
      const end = new Date(`${filter.endDate}T23:59:59.999`);
      if (itemDate > end) return false;
    }
    return true;
  }

  return true;
}

/**
 * Calculate full aggregated statistics for a business
 */
export function calculateBusinessStats(
  feedbackList: FeedbackItem[],
  clicksList: ReviewClickEvent[]
): FeedbackStats {
  const total = feedbackList.length;
  if (total === 0) {
    return {
      totalFeedback: 0,
      averageRating: 5.0,
      fiveStarCount: 0,
      fourStarCount: 0,
      threeStarCount: 0,
      twoStarCount: 0,
      oneStarCount: 0,
      googleClicks: clicksList.length,
      googleClickRate: 0,
    };
  }

  let sum = 0;
  let fiveStar = 0;
  let fourStar = 0;
  let threeStar = 0;
  let twoStar = 0;
  let oneStar = 0;

  feedbackList.forEach((item) => {
    const r = Number(item.rating);
    sum += r;
    if (r === 5) fiveStar++;
    else if (r === 4) fourStar++;
    else if (r === 3) threeStar++;
    else if (r === 2) twoStar++;
    else if (r === 1) oneStar++;
  });

  const avg = Number((sum / total).toFixed(1));
  const googleClicks = clicksList.length;

  const googleClickRate =
    fiveStar > 0 ? Number(((googleClicks / fiveStar) * 100).toFixed(1)) : 0;

  return {
    totalFeedback: total,
    averageRating: avg,
    fiveStarCount: fiveStar,
    fourStarCount: fourStar,
    threeStarCount: threeStar,
    twoStarCount: twoStar,
    oneStarCount: oneStar,
    googleClicks,
    googleClickRate,
  };
}

/**
 * Update feedback status & internal notes in Firestore and local state.
 * Validates input status, sanitizes notes, and authorizes caller ownership.
 */
export async function updateFeedbackItem(
  feedbackId: string,
  updates: { status?: FeedbackStatus; internalNotes?: string },
  requesterUserId?: string,
  businessId?: string,
  requesterIsAdmin?: boolean
): Promise<void> {
  if (!feedbackId?.trim()) {
    throw new AppError('Validation Error: Feedback ID is required.', 400, 'VALIDATION_ERROR');
  }

  // Validate status if provided
  if (updates.status !== undefined) {
    const validStatuses: FeedbackStatus[] = ['new', 'reviewed', 'resolved'];
    if (!validStatuses.includes(updates.status)) {
      throw new AppError(
        `Validation Error: Invalid status "${updates.status}". Valid statuses: ${validStatuses.join(', ')}`,
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  const cleanNotes = updates.internalNotes !== undefined ? sanitizeString(updates.internalNotes, 2000) : undefined;

  const sanitizedPayload: { status?: FeedbackStatus; internalNotes?: string } = {};
  if (updates.status !== undefined) sanitizedPayload.status = updates.status;
  if (cleanNotes !== undefined) sanitizedPayload.internalNotes = cleanNotes;

  if (db) {
    try {
      const docRef = doc(db, 'feedback', feedbackId);
      await updateDoc(docRef, {
        ...sanitizedPayload,
      });
    } catch (e) {
      console.warn('Could not update feedback in Firestore, updating locally:', e);
      toAppError(e, 'Failed to update feedback item.');
    }
  }

  // Update in business-scoped local cache
  const localList = getLocalFeedback(businessId);
  const updated = localList.map((item) =>
    item.id === feedbackId ? { ...item, ...sanitizedPayload } : item
  );
  saveLocalFeedback(updated, businessId);
}
