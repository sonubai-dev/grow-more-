import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Loader2 } from 'lucide-react';

// Protected Route Guard
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Components
import { BusinessOnboardingView } from './components/onboarding/BusinessOnboardingView';

// Lazy Loaded Public Pages
const LandingPage = lazy(() => import('./pages/public/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/public/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/public/SignupPage').then(m => ({ default: m.SignupPage })));
const ForgotPasswordPage = lazy(() => import('./pages/public/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const PublicReviewPage = lazy(() => import('./pages/public/PublicReviewPage').then(m => ({ default: m.PublicReviewPage })));

// Lazy Loaded Legal & Compliance Pages
const LegalHubPage = lazy(() => import('./pages/legal/LegalHubPage').then(m => ({ default: m.LegalHubPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/legal/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import('./pages/legal/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })));
const GoogleGuidelinesPage = lazy(() => import('./pages/legal/GoogleGuidelinesPage').then(m => ({ default: m.GoogleGuidelinesPage })));
const SecurityGdprPage = lazy(() => import('./pages/legal/SecurityGdprPage').then(m => ({ default: m.SecurityGdprPage })));

// Lazy Loaded Business Dashboard Pages
const DashboardOverview = lazy(() => import('./pages/dashboard/DashboardOverview').then(m => ({ default: m.DashboardOverview })));
const FeedbackPage = lazy(() => import('./pages/dashboard/FeedbackPage').then(m => ({ default: m.FeedbackPage })));
const AnalyticsPage = lazy(() => import('./pages/dashboard/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const ReviewPageConfig = lazy(() => import('./pages/dashboard/ReviewPageConfig').then(m => ({ default: m.ReviewPageConfig })));
const BusinessProfilePage = lazy(() => import('./pages/dashboard/BusinessProfilePage').then(m => ({ default: m.BusinessProfilePage })));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Lazy Loaded Admin Pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminBusinessesPage = lazy(() => import('./pages/admin/AdminBusinessesPage').then(m => ({ default: m.AdminBusinessesPage })));
const AdminFeedbackPage = lazy(() => import('./pages/admin/AdminFeedbackPage').then(m => ({ default: m.AdminFeedbackPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading ZellonAI...</span>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/r/:slug" element={<PublicReviewPage />} />
            <Route path="/r" element={<PublicReviewPage />} />

            {/* Security & Legal Pages */}
            <Route path="/legal" element={<LegalHubPage />} />
            <Route path="/security-legal" element={<LegalHubPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/legal/terms" element={<TermsOfServicePage />} />
            <Route path="/google-guidelines" element={<GoogleGuidelinesPage />} />
            <Route path="/google-policy" element={<GoogleGuidelinesPage />} />
            <Route path="/legal/google-guidelines" element={<GoogleGuidelinesPage />} />
            <Route path="/security" element={<SecurityGdprPage />} />
            <Route path="/gdpr" element={<SecurityGdprPage />} />
            <Route path="/legal/security-gdpr" element={<SecurityGdprPage />} />

            {/* Protected Business Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="review-page" element={<ReviewPageConfig />} />
              <Route path="profile" element={<BusinessProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="add-business" element={<BusinessOnboardingView />} />
            </Route>

            {/* Protected Platform Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="businesses" element={<AdminBusinessesPage />} />
              <Route path="feedback" element={<AdminFeedbackPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
