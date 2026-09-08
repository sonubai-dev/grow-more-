export type UserRole = 'business' | 'admin' | 'guest';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessId?: string;
  avatarUrl?: string;
}

export interface FirestoreBusinessData {
  ownerId: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone?: string;
  category: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  googleReviewUrl: string;
  googlePlaceId?: string;
  slug: string;
  headerColor?: string;
  accentColor?: string;
  customHeadline?: string;
  customSubheadline?: string;
  thresholdRatingForGoogle?: number;
  createdAt: string | any;
  updatedAt?: string | any;
  isActive: boolean;
}

export interface Business extends FirestoreBusinessData {
  id: string;
  // Aliases for unified UI components
  name: string; // businessName alias
  contactEmail: string; // email alias
  plan?: 'starter' | 'growth' | 'enterprise';
  status?: 'active' | 'trial' | 'suspended';
  stats?: {
    totalFeedback: number;
    averageRating: number;
    fiveStarCount: number;
    googleClicks: number;
  };
}

export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

export type FeedbackStatus = 'new' | 'reviewed' | 'resolved' | 'archived';

export interface FeedbackItem {
  id: string;
  businessId: string;
  ownerId?: string;
  businessName?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  rating: FeedbackRating;
  comment: string;
  source: string; // e.g. 'public_review_page' | 'qr_code' | 'direct_link'
  status?: FeedbackStatus;
  googleRedirected?: boolean;
  routedToGoogle?: boolean;
  clickedGoogleReview?: boolean;
  createdAt: string;
  internalNotes?: string;
}

export interface FeedbackSubmissionInput {
  businessId: string;
  ownerId?: string;
  rating: FeedbackRating;
  comment?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  source?: string;
  googleRedirected?: boolean;
}

export interface ReviewClickEvent {
  id?: string;
  businessId: string;
  ownerId?: string;
  feedbackId?: string | null;
  createdAt: string;
}

export interface BusinessAggregatedStatsDoc {
  businessId: string;
  ownerId?: string;
  totalFeedback: number;
  averageRating: number;
  totalFiveStar: number;
  totalFourStar: number;
  totalThreeStar: number;
  totalTwoStar: number;
  totalOneStar: number;
  googleClicks: number;
  googleClickRate: number;
  updatedAt?: string | any;
  // Daily timeline bucket map (e.g. '2026-08-26': { feedback: 3, clicks: 2, stars: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 2 } })
  dailyStats?: Record<string, {
    feedback: number;
    clicks: number;
    stars?: { 1?: number; 2?: number; 3?: number; 4?: number; 5?: number };
  }>;
}

export type DateFilterPreset = 'today' | '7days' | '30days' | '90days' | 'all' | 'custom';

export interface DateRangeFilter {
  preset: DateFilterPreset;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  googleClicks: number;
  googleClickRate: number; // Google Review Clicks / 5-star Feedback * 100
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  periodText?: string;
  subtitle?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  feedbackCount: number;
  googleClicks: number;
  avgRating: number;
}

export interface RatingDistributionPoint {
  stars: number;
  count: number;
  percentage: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

export interface PlatformSettings {
  platformName: string;
  maintenanceMode: boolean;
  allowSignups: boolean;
  defaultTrialDays: number;
  googleSyncInterval: number;
  supportEmail: string;
  defaultThresholdRating: number;
  requireEmailVerification: boolean;
  updatedAt?: string;
}

export interface AdminDashboardMetrics {
  totalBusinesses: number;
  activeBusinesses: number;
  suspendedBusinesses: number;
  totalFeedback: number;
  totalGoogleClicks: number;
  averagePlatformRating: number;
  fiveStarFeedback: number;
  newBusinesses: Business[];
  recentFeedback: FeedbackItem[];
}
