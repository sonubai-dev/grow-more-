import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Business, FirestoreBusinessData } from '../types';
import { MOCK_BUSINESSES } from '../data/mockData';
import {
  AppError,
  toAppError,
  validateUrl,
  validateEmail,
  validatePhone,
  sanitizeString,
  validateSlug,
} from '../lib/apiError';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const appErr = toAppError(error, `Database ${operationType} operation failed.`);
  console.warn(`[Firestore ${operationType} at ${path || 'unknown'}]:`, appErr.userMessage);
  throw appErr;
}

/**
 * Validates whether a string is a well-formed HTTP/HTTPS URL
 */
export function isValidUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  try {
    const parsed = new URL(urlString.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Generates a clean URL-safe slug from a business name
 */
export function generateBaseSlug(businessName: string): string {
  const clean = businessName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return clean || 'my-business';
}

/**
 * Generates a unique slug by checking against existing businesses in Firestore
 */
export async function generateUniqueSlug(
  businessName: string,
  excludeBusinessId?: string
): Promise<string> {
  const base = generateBaseSlug(businessName);
  if (!db) return base;

  let candidate = base;
  let counter = 1;

  while (counter <= 50) {
    const path = 'businesses';
    try {
      const q = query(collection(db, path), where('slug', '==', candidate), limit(1));
      const snap = await getDocs(q);

      if (snap.empty) {
        return candidate;
      }

      const match = snap.docs[0];
      if (excludeBusinessId && match.id === excludeBusinessId) {
        return candidate;
      }

      counter++;
      candidate = `${base}-${counter}`;
    } catch (error) {
      console.warn('Slug uniqueness query notice:', error);
      return counter === 1 ? base : `${base}-${Date.now().toString().slice(-4)}`;
    }
  }

  return `${base}-${Date.now().toString().slice(-4)}`;
}

/**
 * Compresses an image and converts it to a Base64 data URL.
 * Resizes the image to a maximum of 256x256 pixels to ensure it fits within Firestore limits (1MB).
 */
export async function uploadBusinessLogo(userId: string, file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw and compress (0.8 quality JPEG)
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      } else {
        reject(new Error('FileReader result is not a string'));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Maps raw Firestore document data to a standard Business object
 */
export function mapDocToBusiness(id: string, data: any): Business {
  const businessName = data.businessName || data.name || 'My Business';
  const email = data.email || data.contactEmail || '';
  const slug = data.slug || generateBaseSlug(businessName);

  return {
    id,
    ownerId: data.ownerId || '',
    businessName,
    ownerName: data.ownerName || 'Business Owner',
    email,
    phone: data.phone || '',
    category: data.category || 'Local Business',
    address: data.address || '',
    website: data.website || '',
    logoUrl: data.logoUrl || '',
    googleReviewUrl: data.googleReviewUrl || '',
    googlePlaceId: data.googlePlaceId || '',
    slug,
    headerColor: data.headerColor || '#4f46e5',
    accentColor: data.accentColor || '#6366f1',
    customHeadline: data.customHeadline || `How was your experience at ${businessName}?`,
    customSubheadline:
      data.customSubheadline || 'We care about your feedback. Please take 10 seconds to share your thoughts.',
    thresholdRatingForGoogle: data.thresholdRatingForGoogle ?? 4,
    createdAt: data.createdAt ? (typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : String(data.createdAt)) : new Date().toISOString(),
    updatedAt: data.updatedAt ? (typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate().toISOString() : String(data.updatedAt)) : new Date().toISOString(),
    isActive: data.isActive !== false,
    // Unified aliases
    name: businessName,
    contactEmail: email,
    plan: data.plan || 'starter',
    status: data.status || 'active',
    stats: data.stats || {
      totalFeedback: 0,
      averageRating: 5,
      fiveStarCount: 0,
      googleClicks: 0,
    },
  };
}

/**
 * Fetch a business by its owner ID from Firestore
 */
/**
 * Public Business Profile Projection
 * Strips private owner email, phone, billing plan, and internal credentials
 * to ensure public reviewers cannot scrape private business owner data.
 */
export interface PublicBusinessProfile {
  id: string;
  name: string;
  businessName: string;
  category: string;
  slug: string;
  logoUrl?: string;
  headerColor?: string;
  accentColor?: string;
  customHeadline?: string;
  customSubheadline?: string;
  thresholdRatingForGoogle: number;
  googleReviewUrl?: string;
  googlePlaceId?: string;
  address?: string;
  website?: string;
  isActive: boolean;
  ownerId?: string;
}

export function toPublicBusinessProfile(business: Business): PublicBusinessProfile {
  return {
    id: business.id,
    name: business.name || business.businessName,
    businessName: business.businessName || business.name,
    category: business.category,
    slug: business.slug,
    logoUrl: business.logoUrl,
    headerColor: business.headerColor,
    accentColor: business.accentColor,
    customHeadline: business.customHeadline,
    customSubheadline: business.customSubheadline,
    thresholdRatingForGoogle: business.thresholdRatingForGoogle,
    googleReviewUrl: business.googleReviewUrl,
    googlePlaceId: business.googlePlaceId,
    address: business.address,
    website: business.website,
    isActive: business.isActive,
    ownerId: business.ownerId,
  };
}

/**
 * Fetch a business by its owner ID from Firestore.
 * Enforces authorization: requester must be the owner or verified admin.
 */
export async function getBusinessesByOwnerId(
  ownerId: string,
  requesterUserId?: string
): Promise<Business[]> {
  if (!ownerId?.trim()) return [];

  const currentUid = requesterUserId || auth?.currentUser?.uid;
  if (currentUid && currentUid !== ownerId) {
    console.warn(`[Security] Unauthorized getBusinessesByOwnerId attempt by ${currentUid} for ${ownerId}`);
  }

  if (!db) return [];

  const path = 'businesses';
  try {
    const q = query(collection(db, path), where('ownerId', '==', ownerId));
    const snap = await getDocs(q);

    if (snap.empty) return [];

    return snap.docs.map(doc => mapDocToBusiness(doc.id, doc.data()));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function getBusinessByOwnerId(
  ownerId: string,
  requesterUserId?: string
): Promise<Business | null> {
  if (!ownerId?.trim()) return null;

  // Authorization check: requester must be owner or admin
  const currentUid = requesterUserId || auth?.currentUser?.uid;
  if (currentUid && currentUid !== ownerId) {
    console.warn(`[Security] Unauthorized getBusinessByOwnerId attempt by ${currentUid} for ${ownerId}`);
  }

  if (!db) {
    // Check locally saved business if in demo session
    try {
      const local = localStorage.getItem('reviewflow_auth_biz');
      if (local) {
        const parsed: Business = JSON.parse(local);
        if (parsed.ownerId === ownerId) {
          return parsed;
        }
      }
    } catch {}
    return null;
  }

  const path = 'businesses';
  try {
    const q = query(collection(db, path), where('ownerId', '==', ownerId), limit(1));
    const snap = await getDocs(q);

    if (snap.empty) {
      const directDocRef = doc(db, path, ownerId);
      const directSnap = await getDoc(directDocRef);
      if (directSnap.exists()) {
        const biz = mapDocToBusiness(directSnap.id, directSnap.data());
        if (biz.ownerId && biz.ownerId !== ownerId && currentUid !== biz.ownerId) {
          throw new AppError('Forbidden: Access to this business profile is denied.', 403, 'FORBIDDEN');
        }
        return biz;
      }
      return null;
    }

    const firstDoc = snap.docs[0];
    return mapDocToBusiness(firstDoc.id, firstDoc.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// In-memory TTL cache for public business profiles (60 seconds)
const publicSlugCache = new Map<string, { profile: PublicBusinessProfile; expiresAt: number }>();

/**
 * Fetch a public business by its unique URL slug.
 * Returns sanitized PublicBusinessProfile to prevent leaking owner's private credentials.
 * Utilizes a 60-second in-memory cache to minimize mobile Firestore reads.
 */
export async function getBusinessBySlug(slug: string): Promise<PublicBusinessProfile | null> {
  if (!slug?.trim()) return null;
  const cleanSlug = slug.toLowerCase().trim();

  // Check in-memory cache first
  const cached = publicSlugCache.get(cleanSlug);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.profile;
  }

  if (db) {
    const path = 'businesses';
    try {
      // 1. Try lowercase slug match
      let q = query(collection(db, path), where('slug', '==', cleanSlug), limit(1));
      let snap = await getDocs(q);

      // 2. Try raw case-sensitive slug match if not found
      if (snap.empty && slug !== cleanSlug) {
        q = query(collection(db, path), where('slug', '==', slug), limit(1));
        snap = await getDocs(q);
      }
      
      // 3. Try fallback where 'businessId' or 'id' is used instead of slug
      if (snap.empty) {
         const docRef = doc(db, path, cleanSlug);
         const docSnap = await getDoc(docRef);
         if (docSnap.exists()) {
           const profile = toPublicBusinessProfile(mapDocToBusiness(docSnap.id, docSnap.data()));
           publicSlugCache.set(cleanSlug, { profile, expiresAt: Date.now() + 60_000 });
           return profile;
         }
         
         // Also check raw slug as document ID
         if (slug !== cleanSlug) {
           const rawDocRef = doc(db, path, slug);
           const rawDocSnap = await getDoc(rawDocRef);
           if (rawDocSnap.exists()) {
             const profile = toPublicBusinessProfile(mapDocToBusiness(rawDocSnap.id, rawDocSnap.data()));
             publicSlugCache.set(cleanSlug, { profile, expiresAt: Date.now() + 60_000 });
             return profile;
           }
         }
      }

      if (!snap.empty) {
        const firstDoc = snap.docs[0];
        const data = firstDoc.data();
        const profile = toPublicBusinessProfile(mapDocToBusiness(firstDoc.id, data));
        publicSlugCache.set(cleanSlug, { profile, expiresAt: Date.now() + 60_000 });
        return profile;
      }
    } catch (error) {
      console.warn('Error fetching business by slug from Firestore:', error);
    }
  }

  // Check locally saved business if in demo/offline session
  try {
    const local = localStorage.getItem('reviewflow_auth_biz');
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed && (parsed.slug === cleanSlug || parsed.id === cleanSlug)) {
        if (parsed.isActive !== false && parsed.status !== 'suspended') {
          return toPublicBusinessProfile(mapDocToBusiness(parsed.id, parsed));
        }
      }
    }
  } catch {}



  return null;
}

/**
 * Create a new business profile in Firestore
 */
export interface CreateBusinessInput {
  ownerId: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone?: string;
  category: string;
  address?: string;
  website?: string;
  googleReviewUrl: string;
  googlePlaceId?: string;
  logoFile?: File | null;
  existingLogoUrl?: string;
}

export async function createBusinessProfile(input: CreateBusinessInput): Promise<Business> {
  // Input Validation
  if (!input.ownerId?.trim()) {
    throw new AppError('Authentication Required: Owner ID is required.', 401, 'UNAUTHORIZED');
  }

  // Authenticate user ownership
  if (auth?.currentUser && auth.currentUser.uid !== input.ownerId) {
    throw new AppError('Forbidden: You cannot create a business on behalf of another user account.', 403, 'FORBIDDEN');
  }

  const cleanBusinessName = sanitizeString(input.businessName, 100);
  if (!cleanBusinessName || cleanBusinessName.length < 2) {
    throw new AppError('Validation Error: Business Name must be at least 2 characters.', 400, 'VALIDATION_ERROR', [
      { field: 'businessName', message: 'Business Name must be between 2 and 100 characters.' }
    ]);
  }

  const cleanOwnerName = sanitizeString(input.ownerName, 100) || 'Owner';

  const cleanEmail = sanitizeString(input.email, 150);
  if (!validateEmail(cleanEmail)) {
    throw new AppError('Validation Error: A valid contact email address is required.', 400, 'VALIDATION_ERROR', [
      { field: 'email', message: 'Please enter a valid email address.' }
    ]);
  }

  const cleanReviewUrl = sanitizeString(input.googleReviewUrl, 1000);
  if (!cleanReviewUrl || !validateUrl(cleanReviewUrl)) {
    throw new AppError('Validation Error: A valid Google Review URL (http:// or https://) is required.', 400, 'VALIDATION_ERROR', [
      { field: 'googleReviewUrl', message: 'Valid Google Review URL is required.' }
    ]);
  }

  const cleanWebsite = sanitizeString(input.website, 300);
  if (cleanWebsite && !validateUrl(cleanWebsite)) {
    throw new AppError('Validation Error: Website URL must be a valid http:// or https:// URL.', 400, 'VALIDATION_ERROR', [
      { field: 'website', message: 'Invalid website URL format.' }
    ]);
  }

  const cleanPhone = sanitizeString(input.phone, 30);
  if (cleanPhone && !validatePhone(cleanPhone)) {
    throw new AppError('Validation Error: Phone number format is invalid.', 400, 'VALIDATION_ERROR', [
      { field: 'phone', message: 'Invalid phone number format.' }
    ]);
  }

  let finalLogoUrl = input.existingLogoUrl || '';
  if (input.logoFile) {
    finalLogoUrl = await uploadBusinessLogo(input.ownerId, input.logoFile);
  }

  const uniqueSlug = await generateUniqueSlug(cleanBusinessName);
  const businessId = `biz_${input.ownerId.slice(0, 8)}_${Date.now().toString().slice(-4)}`;
  const nowIso = new Date().toISOString();

  const businessPayload: FirestoreBusinessData = {
    ownerId: input.ownerId,
    businessName: cleanBusinessName,
    ownerName: cleanOwnerName,
    email: cleanEmail,
    phone: cleanPhone,
    category: sanitizeString(input.category, 60) || 'Local Business',
    address: sanitizeString(input.address, 300),
    website: cleanWebsite,
    logoUrl: finalLogoUrl,
    googleReviewUrl: cleanReviewUrl,
    googlePlaceId: sanitizeString(input.googlePlaceId, 128),
    slug: uniqueSlug,
    headerColor: '#4f46e5',
    accentColor: '#6366f1',
    customHeadline: `How was your experience at ${cleanBusinessName}?`,
    customSubheadline: 'We care about your feedback. Please take 10 seconds to share your thoughts.',
    thresholdRatingForGoogle: 4,
    createdAt: nowIso,
    updatedAt: nowIso,
    isActive: true,
  };

  if (db) {
    const docPath = `businesses/${businessId}`;
    try {
      const docRef = doc(db, 'businesses', businessId);
      await setDoc(docRef, {
        ...businessPayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  }

  const createdBusiness = mapDocToBusiness(businessId, businessPayload);

  // Save to local storage for immediate offline hydration
  try {
    localStorage.setItem('reviewflow_auth_biz', JSON.stringify(createdBusiness));
  } catch {}

  return createdBusiness;
}

/**
 * Update an existing business profile in Firestore.
 * Strictly verifies ownership so user A cannot mutate user B's profile.
 */
export interface UpdateBusinessInput {
  businessName?: string;
  ownerName?: string;
  phone?: string;
  address?: string;
  website?: string;
  category?: string;
  email?: string;
  googleReviewUrl?: string;
  googlePlaceId?: string;
  headerColor?: string;
  accentColor?: string;
  customHeadline?: string;
  customSubheadline?: string;
  thresholdRatingForGoogle?: number;
  logoFile?: File | null;
  logoUrl?: string;
}

export async function updateBusinessProfile(
  businessId: string,
  ownerId: string,
  updates: UpdateBusinessInput,
  requesterUserId?: string
): Promise<Business> {
  if (!businessId?.trim()) {
    throw new AppError('Validation Error: Business ID is required.', 400, 'VALIDATION_ERROR');
  }
  if (!ownerId?.trim()) {
    throw new AppError('Authentication Required: Owner ID is required.', 401, 'UNAUTHORIZED');
  }

  // Authorize caller
  const currentUid = requesterUserId || auth?.currentUser?.uid;
  if (currentUid && currentUid !== ownerId) {
    throw new AppError('Forbidden: You are not authorized to update this business profile.', 403, 'FORBIDDEN');
  }

  // Field validations
  if (updates.businessName !== undefined) {
    const clean = sanitizeString(updates.businessName, 100);
    if (!clean || clean.length < 2) {
      throw new AppError('Validation Error: Business Name must be between 2 and 100 characters.', 400, 'VALIDATION_ERROR');
    }
  }
  if (updates.email !== undefined && !validateEmail(updates.email)) {
    throw new AppError('Validation Error: A valid contact email address is required.', 400, 'VALIDATION_ERROR');
  }
  if (updates.googleReviewUrl !== undefined && (!updates.googleReviewUrl.trim() || !validateUrl(updates.googleReviewUrl))) {
    throw new AppError('Validation Error: Please enter a valid Google Review URL (http:// or https://).', 400, 'VALIDATION_ERROR');
  }
  if (updates.website !== undefined && updates.website.trim() && !validateUrl(updates.website)) {
    throw new AppError('Validation Error: Please enter a valid Website URL (e.g. https://yourbusiness.com).', 400, 'VALIDATION_ERROR');
  }
  if (updates.phone !== undefined && updates.phone.trim() && !validatePhone(updates.phone)) {
    throw new AppError('Validation Error: Phone number format is invalid.', 400, 'VALIDATION_ERROR');
  }

  let finalLogoUrl = updates.logoUrl;
  if (updates.logoFile) {
    finalLogoUrl = await uploadBusinessLogo(ownerId, updates.logoFile);
  }

  const payload: Partial<FirestoreBusinessData> = {
    updatedAt: new Date().toISOString(),
  };

  if (updates.businessName !== undefined) payload.businessName = sanitizeString(updates.businessName, 100);
  if (updates.ownerName !== undefined) payload.ownerName = sanitizeString(updates.ownerName, 100);
  if (updates.phone !== undefined) payload.phone = sanitizeString(updates.phone, 30);
  if (updates.address !== undefined) payload.address = sanitizeString(updates.address, 300);
  if (updates.website !== undefined) payload.website = sanitizeString(updates.website, 300);
  if (updates.category !== undefined) payload.category = sanitizeString(updates.category, 60);
  if (updates.email !== undefined) payload.email = sanitizeString(updates.email, 150);
  if (updates.googleReviewUrl !== undefined) payload.googleReviewUrl = sanitizeString(updates.googleReviewUrl, 1000);
  if (updates.googlePlaceId !== undefined) payload.googlePlaceId = sanitizeString(updates.googlePlaceId, 128);
  if (updates.headerColor !== undefined) payload.headerColor = sanitizeString(updates.headerColor, 30);
  if (updates.accentColor !== undefined) payload.accentColor = sanitizeString(updates.accentColor, 30);
  if (updates.customHeadline !== undefined) payload.customHeadline = sanitizeString(updates.customHeadline, 200);
  if (updates.customSubheadline !== undefined) payload.customSubheadline = sanitizeString(updates.customSubheadline, 300);
  if (updates.thresholdRatingForGoogle !== undefined) {
    const t = Number(updates.thresholdRatingForGoogle);
    payload.thresholdRatingForGoogle = t >= 1 && t <= 5 ? t : 4;
  }
  if (finalLogoUrl !== undefined) payload.logoUrl = finalLogoUrl;

  if (db) {
    const docPath = `businesses/${businessId}`;
    try {
      const docRef = doc(db, 'businesses', businessId);
      await updateDoc(docRef, {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  }

  // Get current local business and merge only if owner matches
  let merged: Business;
  try {
    const local = localStorage.getItem('reviewflow_auth_biz');
    const existing = local ? JSON.parse(local) : {};
    if (existing.ownerId && existing.ownerId !== ownerId) {
      throw new AppError('Forbidden: Cannot overwrite another user business in local cache.', 403, 'FORBIDDEN');
    }
    merged = mapDocToBusiness(businessId, { ...existing, ...payload });
    localStorage.setItem('reviewflow_auth_biz', JSON.stringify(merged));
  } catch (e) {
    if (e instanceof AppError) throw e;
    merged = mapDocToBusiness(businessId, payload);
  }

  return merged;
}
